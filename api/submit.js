/**
 * Vercel Serverless Function: POST /api/submit
 * Personal Auto Insurance form submission handler
 *
 * Required env vars:
 *   RESEND_API_KEY, EMAIL_FROM
 *   SLACK_WEBHOOK_URL
 *   HUBSPOT_ACCESS_TOKEN (Private App token, pat-na1-...)
 *   ZAPIER_WEBHOOK_URL
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

// Escape user-supplied values before interpolating into HTML emails / notes
function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const OCCUPATION_LABELS = {
  accountant: 'Accountant / CPA', attorney: 'Attorney / Lawyer', business_owner: 'Business Owner',
  construction: 'Construction Worker', customer_service: 'Customer Service', delivery_driver: 'Delivery Driver',
  doctor: 'Doctor / Physician', commercial_driver: 'Driver (Truck / Commercial)', engineer: 'Engineer',
  farmer: 'Farmer / Agricultural Worker', financial_advisor: 'Financial Advisor', firefighter: 'Firefighter',
  government: 'Government Employee', homemaker: 'Homemaker', it: 'IT / Technology Professional',
  insurance: 'Insurance Professional', manager: 'Manager / Supervisor', marketing_sales: 'Marketing / Sales',
  military: 'Military / Veteran', nurse: 'Nurse / Healthcare Worker', office: 'Office / Administrative Staff',
  law_enforcement: 'Police / Law Enforcement', real_estate: 'Real Estate Agent', retiree: 'Retired',
  self_employed: 'Self-Employed / Freelancer', student: 'Student', teacher: 'Teacher / Educator',
  tradesperson: 'Tradesperson (Electrician / Plumber / HVAC)', warehouse: 'Warehouse / Logistics Worker',
  other: 'Other',
};
const occLabel = (v) => OCCUPATION_LABELS[v] || v || '—';

// Human-readable label maps
const LIABILITY_LABELS = {
  state_min: 'State Minimum', '10_20_10': '$10k / $20k / $10k',
  '25_50_25': '$25k / $50k / $25k', '50_100_50': '$50k / $100k / $50k',
  '100_300_100': '$100k / $300k / $100k', '250_500_250': '$250k / $500k / $250k',
};
const USAGE_LABELS = {
  commute: 'Commute', pleasure: 'Pleasure / Personal', business: 'Business',
  rideshare: 'Rideshare (Uber/Lyft)', turo: 'Turo',
};
const MILES_LABELS = {
  under5k: 'Under 5,000', '5to7k': '5,000–7,000', '7to15k': '7,000–15,000',
  '15to20k': '15,000–20,000', over20k: 'Over 20,000',
};
const OWNERSHIP_LABELS = { owned: 'Owned', financed: 'Financed', leased: 'Leased' };
const COV_LABELS = {
  uninsured_motorist: 'Uninsured / Underinsured Motorist',
  medical_payments: 'Medical Payments / PIP',
  roadside: 'Roadside Assistance',
  rental: 'Rental Car Reimbursement',
  towing: 'Towing & Labor',
};
const fmtDeductible = (v) => v ? `$${Number(v).toLocaleString()}` : '—';

// HTML note for HubSpot
function buildHubSpotNote(data) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || '—';

  const h = (text) => `<h3 style="margin:16px 0 6px;font-size:13px;color:#374151;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${text}</h3>`;
  const row = (label, value) => `<tr><td style="padding:3px 12px 3px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:3px 0;font-size:13px;color:#111827;font-weight:500;">${value || '—'}</td></tr>`;
  const table = (rows) => `<table style="border-collapse:collapse;width:100%;">${rows}</table>`;

  // Vehicles
  const vehicleRows = (data.vehicles || []).map((v, i) => {
    const label = `Vehicle ${i + 1}`;
    const val = [
      `<strong>${esc(v.year)} ${esc(v.make)} ${esc(v.model)}</strong>`,
      v.vin ? `VIN: <code>${esc(v.vin)}</code>` : null,
      v.usage ? `Use: ${esc(USAGE_LABELS[v.usage] || v.usage)}` : null,
      v.annualMiles ? `Miles: ${esc(MILES_LABELS[v.annualMiles] || v.annualMiles)}` : null,
      v.ownership ? `Ownership: ${esc(OWNERSHIP_LABELS[v.ownership] || v.ownership)}` : null,
      v.lienholder ? `Lender: ${esc(v.lienholder)}` : null,
      v.garagingSameAsHome === 'yes' ? 'Garaged: Same as home' : v.garagingSameAsHome === 'no' ? `Garaged: ${esc(v.garagingAddress) || '?'}` : null,
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');
    return row(label, val);
  }).join('');

  // Additional drivers
  const additionalDrivers = data.additionalDrivers || [];
  const driverRows = data.isOnlyDriver === 'no' && additionalDrivers.length
    ? additionalDrivers.map((d, i) =>
        row(`Driver ${i + 1}`, `<strong>${esc(d.firstName)} ${esc(d.lastName)}</strong> &nbsp;·&nbsp; DOB: ${esc(d.dateOfBirth) || '—'} &nbsp;·&nbsp; ${esc(d.relationship)} &nbsp;·&nbsp; License: ${esc(d.licenseNumber) || '—'} (${esc(d.licenseState) || '—'})`)
      ).join('')
    : row('Drivers', 'Primary driver only');

  // Violations
  const violRows = data.hasViolations === 'yes' && (data.violations || []).length
    ? data.violations.map((v, i) => row(`Violation ${i + 1}`, `${v.month}/${v.year} — ${v.type || '—'}`)).join('')
    : row('Violations', 'None');

  // Accidents
  const accRows = data.hasAccidents === 'yes' && (data.accidents || []).length
    ? data.accidents.map((a, i) => row(`Accident ${i + 1}`, `${a.month}/${a.year} — At fault: ${a.atFault || '—'}`)).join('')
    : row('Accidents', 'None');

  // Additional coverages
  const addlCov = (data.additionalCoverages || []).map((c) => COV_LABELS[c] || c).join(', ') || 'None';

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:600px;">

${h('👤 Contact Information')}
${table([
  row('Name', `<strong>${esc(name)}</strong>`),
  row('Email', esc(data.email)),
  row('Phone', esc(data.phone)),
  row('Date of Birth', esc(data.dateOfBirth)),
  row('Marital Status', data.maritalStatus ? esc(data.maritalStatus.charAt(0).toUpperCase() + data.maritalStatus.slice(1)) : '—'),
  row('Address', esc(data.address) || '—'),
  row('State / ZIP', `${esc(data.state) || '—'} ${esc(data.zipCode)}`),
  row('Homeowner', esc(data.homeownerStatus) || '—'),
  row('Occupation', esc(occLabel(data.occupation))),
  row('License #', esc(data.licenseNumber) || '—'),
  row('License State', esc(data.licenseState) || '—'),
].join(''))}

${h('🚙 Vehicles')}
${table(vehicleRows || row('Vehicles', 'None listed'))}

${h('👥 Drivers')}
${table(driverRows)}

${h('📋 Driving History')}
${table([
  violRows,
  accRows,
  row('Currently Insured', data.currentlyInsured === 'yes' ? `Yes — ${esc(data.currentInsurer) || '?'} (${esc(data.yearsInsured) || '?'})` : 'No'),
].join(''))}

${h('🛡️ Coverage Preferences')}
${table([
  row('Liability Limit', LIABILITY_LABELS[data.liabilityLimit] || data.liabilityLimit || '—'),
  row('Collision', data.hasCollision === 'yes' ? `Yes — Deductible: ${fmtDeductible(data.collisionDeductible)}` : 'No'),
  row('Comprehensive', data.hasComprehensive === 'yes' ? `Yes — Deductible: ${fmtDeductible(data.comprehensiveDeductible)}` : 'No'),
  row('Additional Coverages', addlCov),
  data.additionalNotes ? row('Notes', esc(data.additionalNotes)) : '',
].join(''))}

</div>`;
}

function buildSummary(data) {
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || '—';
  const addlCov = (data.additionalCoverages || []).map((c) => COV_LABELS[c] || c).join(', ') || 'None';

  const vehicleLines = (data.vehicles || []).map((v, i) =>
    `  Vehicle ${i + 1}: ${v.year || '—'} ${v.make || '—'} ${v.model || '—'}${v.vin ? ` | VIN: ${v.vin}` : ''} | Use: ${USAGE_LABELS[v.usage] || v.usage || '—'} | Miles: ${MILES_LABELS[v.annualMiles] || v.annualMiles || '—'} | Ownership: ${OWNERSHIP_LABELS[v.ownership] || v.ownership || '—'}${v.lienholder ? ` | Lender: ${v.lienholder}` : ''} | Garaged: ${v.garagingSameAsHome === 'yes' ? 'Same as home' : v.garagingSameAsHome === 'no' ? (v.garagingAddress || '—') : '—'}`
  ).join('\n') || '  None listed';

  const driverLines = data.isOnlyDriver === 'no' && (data.additionalDrivers || []).length
    ? data.additionalDrivers.map((d, i) =>
        `  Driver ${i + 1}: ${d.firstName || ''} ${d.lastName || ''} | DOB: ${d.dateOfBirth || '—'} | ${d.relationship || '—'} | License: ${d.licenseNumber || '—'} (${d.licenseState || '—'})`
      ).join('\n')
    : '  Primary driver only';

  const violationLines = data.hasViolations === 'yes' && (data.violations || []).length
    ? data.violations.map((v, i) => `  ${i + 1}. ${v.month}/${v.year} — ${v.type || '—'}`).join('\n')
    : '  None';

  const accidentLines = data.hasAccidents === 'yes' && (data.accidents || []).length
    ? data.accidents.map((a, i) => `  ${i + 1}. ${a.month}/${a.year} — At fault: ${a.atFault || '—'}`).join('\n')
    : '  None';

  return [
    `CONTACT\nName: ${name} | Email: ${fmt(data.email)} | Phone: ${fmt(data.phone)}\nDOB: ${fmt(data.dateOfBirth)} | Marital: ${fmt(data.maritalStatus)} | Occupation: ${occLabel(data.occupation)}\nState: ${fmt(data.state)} ${fmt(data.zipCode)} | Address: ${fmt(data.address)}\nLicense: ${fmt(data.licenseNumber)} (${fmt(data.licenseState)})`,
    `VEHICLES\n${vehicleLines}`,
    `DRIVERS\nOnly Driver: ${fmt(data.isOnlyDriver)}\n${driverLines}`,
    `HISTORY\nViolations: ${fmt(data.hasViolations)}\n${violationLines}\nAccidents: ${fmt(data.hasAccidents)}\n${accidentLines}\nInsured: ${fmt(data.currentlyInsured)} — ${fmt(data.currentInsurer)} (${fmt(data.yearsInsured)})`,
    `COVERAGE\nLiability: ${LIABILITY_LABELS[data.liabilityLimit] || data.liabilityLimit || '—'}\nCollision: ${fmt(data.hasCollision)}${data.hasCollision === 'yes' ? ` | Ded: ${fmtDeductible(data.collisionDeductible)}` : ''}\nComprehensive: ${fmt(data.hasComprehensive)}${data.hasComprehensive === 'yes' ? ` | Ded: ${fmtDeductible(data.comprehensiveDeductible)}` : ''}\nAdditional: ${addlCov}\nNotes: ${fmt(data.additionalNotes)}`,
  ].join('\n\n──────────────────────────────────\n\n');
}

// ── Internal notification email ───────────────────────────────────────────────

function buildEmailHtml(data) {
  const summary = buildSummary(data);
  const escaped = summary.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || '—';
  const vehicles = (data.vehicles || []);

  const metaItem = (label, value) =>
    `<td style="padding:10px 14px;vertical-align:top;border-right:1px solid #e5f0ef;">
      <div style="font-size:11px;color:#3e6d6a;text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:3px;">${label}</div>
      <div style="font-size:14px;color:#1c3534;font-weight:600;">${esc(value) || '—'}</div>
    </td>`;

  const vehicleRows = vehicles.map((v) =>
    `<span style="display:inline-block;background:#daeeed;color:#1c3534;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${esc(v.year)} ${esc(v.make)} ${esc(v.model)}</span>`
  ).join('');

  const addlCovPills = (data.additionalCoverages || []).map((c) =>
    `<span style="display:inline-block;background:#dcfce7;color:#166534;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${c.replace(/_/g, ' ')}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:24px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;">

      <tr>
        <td style="background:linear-gradient(135deg,#1c3534,#3e6d6a);padding:24px 28px;">
          <div style="font-size:22px;font-weight:700;color:#fff;margin-bottom:4px;">🚗 New Auto Insurance Lead</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.6);">Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</div>
        </td>
      </tr>

      <tr>
        <td style="padding:0;border-bottom:1px solid #e5f0ef;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${metaItem('Name', name)}
              ${metaItem('Phone', data.phone)}
              ${metaItem('State', data.state)}
            </tr>
            <tr style="border-top:1px solid #e5f0ef;">
              ${metaItem('Email', data.email)}
              ${metaItem('DOB', data.dateOfBirth)}
              ${metaItem('Marital', data.maritalStatus)}
            </tr>
            <tr style="border-top:1px solid #e5f0ef;">
              ${metaItem('Address', data.address)}
              ${metaItem('License #', data.licenseNumber ? `${data.licenseNumber} (${data.licenseState || '—'})` : '—')}
              ${metaItem('ZIP', data.zipCode)}
            </tr>
            <tr style="border-top:1px solid #e5f0ef;">
              ${metaItem('Occupation', occLabel(data.occupation))}
              ${metaItem('Homeowner', data.homeownerStatus || '—')}
              ${metaItem('Language', data.language || 'en')}
            </tr>
            <tr style="border-top:1px solid #e5f0ef;">
              ${metaItem('Liability', (data.liabilityLimit || '—').replace(/_/g, '/'))}
              ${metaItem('Collision', data.hasCollision === 'yes' ? `Yes ($${data.collisionDeductible})` : 'No')}
              ${metaItem('Comprehensive', data.hasComprehensive === 'yes' ? `Yes ($${data.comprehensiveDeductible})` : 'No')}
            </tr>
          </table>
        </td>
      </tr>

      ${vehicleRows ? `
      <tr>
        <td style="padding:14px 24px;border-bottom:1px solid #f0f0f0;background:#f9fffe;">
          <div style="font-size:11px;color:#3e6d6a;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:8px;">🚙 Vehicles</div>
          <div>${vehicleRows}</div>
        </td>
      </tr>` : ''}

      ${addlCovPills ? `
      <tr>
        <td style="padding:14px 24px;border-bottom:1px solid #f0f0f0;">
          <div style="font-size:11px;color:#3e6d6a;text-transform:uppercase;letter-spacing:.5px;font-weight:700;margin-bottom:8px;">✅ Additional Coverages Requested</div>
          <div>${addlCovPills}</div>
        </td>
      </tr>` : ''}

      <tr>
        <td style="padding:20px 24px;">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;font-weight:600;margin-bottom:10px;">Full Submission Details</div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
            <pre style="margin:0;font-family:'SFMono-Regular',Consolas,monospace;font-size:12px;color:#374151;white-space:pre-wrap;line-height:1.6;">${escaped}</pre>
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:14px 24px;background:#f8f9fa;border-top:1px solid #f0f0f0;text-align:center;">
          <span style="font-size:11px;color:#9ca3af;">Sova Insurance · sovainsurance.com</span>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Lead confirmation email ────────────────────────────────────────────────────

function buildLeadEmailHtml(data) {
  const firstName = esc(data.firstName) || 'there';
  const vehicleCount = (data.vehicles || []).length;
  const vehicleSummaryRaw = vehicleCount === 1
    ? `${data.vehicles?.[0]?.year || ''} ${data.vehicles?.[0]?.make || ''} ${data.vehicles?.[0]?.model || ''}`.trim()
    : `${vehicleCount} vehicles`;
  const vehicleSummary = esc(vehicleSummaryRaw);
  const escapedSummary = buildSummary(data).replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 16px;font-size:12px;color:#6b7280;font-weight:600;width:40%;border-bottom:1px solid #e5eeec;background:#f6fafa;">${label}</td>
      <td style="padding:10px 16px;font-size:13px;color:#1c3534;font-weight:600;border-bottom:1px solid #e5eeec;">${esc(value) || '—'}</td>
    </tr>`;

  const nextSteps = [
    { n: 1, title: 'Agent Review', desc: 'We review your submission and shop multiple carriers for the best personal auto rates in your state.' },
    { n: 2, title: 'Personalized Quote', desc: 'We prepare a tailored comparison of coverage options and pricing across top-rated carriers.' },
    { n: 3, title: 'We Contact You', desc: 'An agent will reach out within 1 business day to walk you through your options.' },
  ];

  const stepHtml = nextSteps.map(({ n, title, desc }) => `
    <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
      <div style="min-width:28px;height:28px;background:#3e6d6a;border-radius:50%;color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:28px;">${n}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#1c3534;margin-bottom:2px;">${title}</div>
        <div style="font-size:13px;color:#6b7280;line-height:1.5;">${desc}</div>
      </div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f0f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f3;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#1c3534 0%,#3e6d6a 100%);padding:36px 40px 32px;">
          <div style="display:inline-block;background:#ffffff;border-radius:10px;padding:10px 18px;margin-bottom:28px;">
            <img src="https://sovainsurance.com/wp-content/uploads/2025/07/Logo-Ocean-Pine-White-Background-2048x753.png" alt="Sova Insurance" width="120" style="display:block;height:auto;"/>
          </div>
          <div style="font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;margin-bottom:6px;mso-color-alttext:#ffffff;">We&#8217;ve received your auto insurance quote request!</div>
          <div style="font-size:14px;color:#c8dedd;line-height:1.5;">Our team will be in touch within 1 business day.</div>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:36px 40px 0;">
          <p style="margin:0 0 6px;font-size:16px;color:#1c3534;font-weight:600;">Hi ${firstName},</p>
          <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.7;">
            Thank you for choosing <strong style="color:#3e6d6a;">Sova Insurance</strong>. We've successfully received your personal auto insurance quote request${vehicleSummary ? ` for your <strong>${vehicleSummary}</strong>` : ''}. Our licensed agents will review your submission and reach out with the best coverage options for your needs.
          </p>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:28px 40px 0;"><div style="border-top:1px solid #e5eeec;"></div></td></tr>

      <!-- Summary -->
      <tr>
        <td style="padding:24px 40px 0;">
          <div style="font-size:11px;font-weight:700;color:#3e6d6a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px;">Your Submission</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5eeec;">
            ${row('Vehicle(s)', vehicleSummaryRaw)}
            ${row('State', data.state)}
            ${row('Phone', data.phone)}
            ${row('Liability Limit', (data.liabilityLimit || '').replace(/_/g, '/').replace('state/min', 'State Minimum'))}
          </table>
        </td>
      </tr>

      <!-- Full submission details -->
      <tr>
        <td style="padding:24px 40px 0;">
          <div style="font-size:11px;font-weight:700;color:#3e6d6a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px;">Details You Provided</div>
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
            <pre style="margin:0;font-family:'SFMono-Regular',Consolas,monospace;font-size:12px;color:#374151;white-space:pre-wrap;line-height:1.6;">${escapedSummary}</pre>
          </div>
        </td>
      </tr>

      <!-- What happens next -->
      <tr>
        <td style="padding:28px 40px 0;">
          <div style="font-size:11px;font-weight:700;color:#3e6d6a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:16px;">What Happens Next</div>
          ${stepHtml}
        </td>
      </tr>

      <!-- Contact -->
      <tr>
        <td style="padding:24px 40px 0;">
          <div style="background:#f0f7f6;border:1px solid #daeeed;border-radius:12px;padding:20px 24px;">
            <div style="font-size:11px;font-weight:700;color:#3e6d6a;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">Questions? Contact Us</div>
            <div style="font-size:14px;color:#1c3534;line-height:2;">
              📞 <a href="tel:9547806667" style="color:#3e6d6a;font-weight:600;text-decoration:none;">954-780-6667</a><br/>
              ✉️ <a href="mailto:info@sovainsurance.com" style="color:#3e6d6a;font-weight:600;text-decoration:none;">info@sovainsurance.com</a><br/>
              📍 <span style="color:#6b7280;">3440 Hollywood Blvd Suite 415, Hollywood, FL 33021</span>
            </div>
          </div>
        </td>
      </tr>

      <!-- Disclaimer -->
      <tr>
        <td style="padding:24px 40px;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;font-style:italic;">
            This email confirms receipt of your quote request only and does not constitute a binding insurance policy or coverage offer. All coverage is subject to underwriting review and approval. Sova Insurance is a licensed insurance agency.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:16px 40px 24px;text-align:center;border-top:1px solid #f0f0f0;background:#f8f9fa;">
          <img src="https://sovainsurance.com/wp-content/uploads/2025/07/Logo-Ocean-Pine-White-Background-2048x753.png" alt="Sova Insurance" width="80" style="display:inline-block;height:auto;opacity:0.35;margin-bottom:8px;"/>
          <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} Sova Insurance. All rights reserved.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ── Send emails via Resend ────────────────────────────────────────────────────

async function sendEmail(data) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const from = process.env.EMAIL_FROM || 'Sova Insurance <noreply@sovainsurance.com>';
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Lead';

  // Collect license photo attachments
  const attachments = [];
  const addAttachment = (dataUrl, filename) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) return;
    const [meta, b64] = dataUrl.split(',');
    const mimeMatch = meta.match(/data:([^;]+)/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const ext = mimeType.split('/')[1] || 'jpg';
    attachments.push({ filename: filename || `license.${ext}`, content: b64 });
  };
  addAttachment(data.licensePhotoData, data.licensePhotoName || 'primary-license.jpg');
  (data.additionalDrivers || []).forEach((d, i) => {
    addAttachment(d.licensePhotoData, d.licensePhotoName || `driver-${i + 1}-license.jpg`);
  });

  // Internal notification
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: ['info@sovainsurance.com'],
      subject: `🚗 New Auto Insurance Lead — ${name} (${data.state || '?'})`,
      html: buildEmailHtml(data),
      ...(attachments.length > 0 && { attachments }),
    }),
  }).then(async (r) => {
    if (!r.ok) { const b = await r.json().catch(() => ({})); throw new Error(`Resend internal: ${JSON.stringify(b)}`); }
  });

  // Lead confirmation
  if (data.email) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [data.email],
        subject: `Your Auto Insurance Quote Request — Sova Insurance`,
        html: buildLeadEmailHtml(data),
        text: `Hi ${data.firstName || 'there'},\n\nThank you for choosing Sova Insurance! We've received your personal auto insurance quote request and will be in touch within 1 business day.\n\nHere is what you submitted:\n\n${buildSummary(data)}\n\nQuestions? Call us at 954-780-6667 or email info@sovainsurance.com.\n\n— The Sova Insurance Team`,
      }),
    }).then(async (r) => {
      if (!r.ok) { const b = await r.json().catch(() => ({})); console.warn('Lead email failed:', JSON.stringify(b)); }
    });
  }
}

// ── Slack notification ────────────────────────────────────────────────────────

async function notifySlack(data) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) throw new Error('SLACK_WEBHOOK_URL is not set');

  const name     = [data.firstName, data.lastName].filter(Boolean).join(' ') || '—';
  const vehicles = (data.vehicles || []);
  const vehicleLines = vehicles.map((v, i) => {
    const parts = [`*${i + 1}.* ${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()];
    if (v.vin)        parts.push(`VIN: \`${v.vin}\``);
    if (v.usage)      parts.push(`Use: ${v.usage}`);
    if (v.annualMiles) parts.push(`Miles: ${v.annualMiles}`);
    if (v.ownership)  parts.push(`Ownership: ${v.ownership}`);
    if (v.garagingSameAsHome === 'yes') parts.push('Garaged: Same as home');
    else if (v.garagingSameAsHome === 'no') parts.push(`Garaged: ${v.garagingAddress || '?'}`);
    return parts.join(' · ');
  }).join('\n') || '—';

  const addlDrivers = (data.additionalDrivers || []);
  const driverLines = addlDrivers.length
    ? addlDrivers.map((d) => `• ${d.firstName || ''} ${d.lastName || ''} (DOB: ${d.dateOfBirth || '—'}, ${d.relationship || ''}) · License: ${d.licenseNumber || '—'} (${d.licenseState || '—'})`).join('\n')
    : 'Primary driver only';

  const collision     = data.hasCollision     === 'yes' ? `Yes ($${data.collisionDeductible})` : 'No';
  const comprehensive = data.hasComprehensive === 'yes' ? `Yes ($${data.comprehensiveDeductible})` : 'No';
  const addlCov       = (data.additionalCoverages || []).map((c) => c.replace(/_/g, ' ')).join(', ') || 'None';

  const flags = [];
  if (data.hasViolations   === 'yes') flags.push(`⚠️ Violations: ${(data.violations || []).length}`);
  if (data.hasAccidents    === 'yes') flags.push(`🚨 Accidents: ${(data.accidents || []).length}`);
  if (data.currentlyInsured === 'no') flags.push('❌ No current insurance');
  if (addlDrivers.length > 0)        flags.push(`👥 ${addlDrivers.length} additional driver(s)`);
  if (vehicles.some((v) => v.usage === 'rideshare')) flags.push('🚕 Rideshare use');
  if (vehicles.some((v) => v.usage === 'turo'))      flags.push('🔑 Turo use');

  const f = (label, value) => ({ type: 'mrkdwn', text: `*${label}:*\n${value || '—'}` });

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: '🚗 New Auto Insurance Lead', emoji: true } },

    // Contact info
    { type: 'section', fields: [
      f('Name',       name),
      f('Phone',      data.phone),
      f('Email',      data.email),
      f('DOB',        data.dateOfBirth),
      f('State / ZIP', `${data.state || '—'} ${data.zipCode || ''}`),
      f('Marital',    data.maritalStatus),
      f('Occupation', occLabel(data.occupation)),
      f('Address',    data.address),
      f('License #',  data.licenseNumber ? `${data.licenseNumber} (${data.licenseState || '—'})` : '—'),
    ]},
    { type: 'divider' },

    // Vehicles
    { type: 'section', text: { type: 'mrkdwn', text: `*🚙 Vehicles:*\n${vehicleLines}` } },
    { type: 'divider' },

    // Coverage
    { type: 'section', fields: [
      f('Liability',     (data.liabilityLimit || '—').replace(/_/g, '/').replace('state/min', 'State Min')),
      f('Collision',     collision),
      f('Comprehensive', comprehensive),
      f('Add-ons',       addlCov),
    ]},
    { type: 'divider' },

    // Drivers & History
    { type: 'section', fields: [
      f('Drivers',          driverLines),
      f('Currently Insured', data.currentlyInsured === 'yes' ? `Yes — ${data.currentInsurer || '?'} (${data.yearsInsured || '?'})` : 'No'),
    ]},
  ];

  if (flags.length > 0) {
    blocks.push({ type: 'divider' });
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*🚩 Flags:*\n${flags.join('  ·  ')}` } });
  }

  if (data.additionalNotes) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*📝 Notes:*\n${data.additionalNotes}` } });
  }

  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Submitted ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET · Language: ${data.language || 'en'}` }] });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });
  if (!res.ok) throw new Error(`Slack error: ${res.status}`);
}

// ── HubSpot ───────────────────────────────────────────────────────────────────

// Convert a date string (YYYY-MM-DD) to epoch ms at midnight UTC for HubSpot date fields
function toHsDate(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr + 'T00:00:00Z');
  return isNaN(d.getTime()) ? undefined : String(d.getTime());
}

// ── HubSpot option value maps (form value → HubSpot slugified value) ──────────
// These align form dropdown values with the slugified option values created by
// create-hubspot-personal-auto-properties.js (opts() lower-slugifies each label).

const HS_HOMEOWNER = {
  own: 'yes', rent: 'no', renting: 'no', other: 'no',
};
const HS_ANNUAL_MILES = {
  under5k:  'under_5_000',
  '5to7k':  '5_000_7_500',
  '7to15k': '12_000_15_000',   // closest bin in HS property
  '15to20k':'15_000_20_000',
  over20k:  'over_20_000',
};
const HS_PRIMARY_USE = {
  commute:  'commute',
  pleasure: 'pleasure',
  business: 'business',
  rideshare:'commute',          // HS has no rideshare option; map to commute
  turo:     'pleasure',         // HS has no turo option; map to pleasure
};
const HS_BI_LIMITS = {
  state_min:    'state_minimum',
  '10_20_10':   'state_minimum',  // no direct match; round down
  '25_50_25':   '25_000_50_000',
  '50_100_50':  '50_000_100_000',
  '100_300_100':'100_000_300_000',
  '250_500_250':'250_000_500_000',
};
const HS_YEARS_CARRIER = {
  under1: 'less_than_1_year',
  '1to2': '1_year',
  '3to5': '3_years',
  over5:  '5_years',            // HS max is "5+ years" → value "5_years"
};
// HubSpot deductible slugs: $1,000 → "1_000", $2,500 → "2_500", etc.
const HS_DEDUCTIBLE = {
  '100': '100', '250': '250', '500': '500', '1000': '1_000', '2500': '2_500',
};

// Build pa_* custom properties from form submission data
function buildPaProperties(data) {
  const v = (val) => (val !== undefined && val !== null && val !== '') ? String(val) : undefined;
  const vehicles = data.vehicles || [];
  const drivers  = data.additionalDrivers || [];

  const mapDeductible = (raw, noValKey) => {
    if (!raw) return undefined;
    return HS_DEDUCTIBLE[String(raw)] ?? v(raw);
  };

  const vProps = (veh, n) => !veh ? {} : {
    [`pa_v${n}_year`]:          v(veh.year),
    [`pa_v${n}_make`]:          v(veh.make),
    [`pa_v${n}_model`]:         v(veh.model),
    [`pa_v${n}_vin`]:           v(veh.vin),
    [`pa_v${n}_ownership`]:     v(veh.ownership),
    [`pa_v${n}_lienholder`]:    v(veh.lienholder),
    [`pa_v${n}_annual_mileage`]:HS_ANNUAL_MILES[veh.annualMiles] ?? v(veh.annualMiles),
    [`pa_v${n}_primary_use`]:   HS_PRIMARY_USE[veh.usage]        ?? v(veh.usage),
  };

  const dProps = (drv, n) => !drv ? {} : {
    [`pa_d${n}_first_name`]:    v(drv.firstName),
    [`pa_d${n}_last_name`]:     v(drv.lastName),
    [`pa_d${n}_dob`]:           toHsDate(drv.dateOfBirth),
    [`pa_d${n}_relationship`]:  v(drv.relationship),
    [`pa_d${n}_license_number`]:v(drv.licenseNumber),
    [`pa_d${n}_license_state`]: v(drv.licenseState?.toLowerCase()),
  };

  const raw = {
    // ── Primary driver ────────────────────────────────────────────
    pa_dob:                    toHsDate(data.dateOfBirth),
    pa_marital_status:         v(data.maritalStatus),
    pa_is_homeowner:           HS_HOMEOWNER[data.homeownerStatus] ?? (data.homeownerStatus ? 'no' : undefined),
    pa_license_number:         v(data.licenseNumber),
    pa_license_state:          v(data.licenseState?.toLowerCase()),
    // ── Vehicles ──────────────────────────────────────────────────
    ...vProps(vehicles[0], 1),
    ...vProps(vehicles[1], 2),
    ...vProps(vehicles[2], 3),
    // ── Additional drivers ────────────────────────────────────────
    ...dProps(drivers[0], 2),
    ...dProps(drivers[1], 3),
    // ── Driving history ───────────────────────────────────────────
    pa_has_violations:         v(data.hasViolations === 'yes' || data.hasAccidents === 'yes' ? 'yes' : (data.hasViolations === 'no' && data.hasAccidents === 'no' ? 'no' : undefined)),
    // ── Current insurance ─────────────────────────────────────────
    pa_has_current_insurance:  v(data.currentlyInsured),
    pa_current_carrier:        v(data.currentInsurer),
    pa_years_with_carrier:     HS_YEARS_CARRIER[data.yearsInsured] ?? v(data.yearsInsured),
    // ── Coverage requested ────────────────────────────────────────
    pa_desired_bi_limits:      HS_BI_LIMITS[data.liabilityLimit]  ?? v(data.liabilityLimit),
    pa_coll_deductible:        data.hasCollision     === 'no' ? 'no_collision'     : mapDeductible(data.collisionDeductible),
    pa_comp_deductible:        data.hasComprehensive === 'no' ? 'no_comprehensive' : mapDeductible(data.comprehensiveDeductible),
  };

  // Strip undefined values before returning
  return Object.fromEntries(Object.entries(raw).filter(([, val]) => val !== undefined));
}

async function saveToHubspot(data) {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) throw new Error('HUBSPOT_ACCESS_TOKEN env var is not set');

  const hsHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const properties = {
    // Standard contact fields
    email:          data.email,
    firstname:      data.firstName || '',
    lastname:       data.lastName  || '',
    phone:          data.phone     || '',
    address:        data.address   || '',
    state:          data.state     || '',
    zip:            data.zipCode   || '',
    lifecyclestage: 'lead',
    // Custom personal auto fields
    ...buildPaProperties(data),
  };

  const createRes  = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST', headers: hsHeaders, body: JSON.stringify({ properties }),
  });
  const createBody = await createRes.json().catch(() => ({}));
  console.log('HubSpot create status:', createRes.status, createBody?.id || '');

  let contactId;

  if (createRes.status === 409) {
    const searchRes  = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST', headers: hsHeaders,
      body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: data.email }] }], properties: ['email'], limit: 1 }),
    });
    const searchBody = await searchRes.json().catch(() => ({}));
    contactId = searchBody.results?.[0]?.id;
    if (contactId) {
      const { lifecyclestage: _drop, ...updateProps } = properties;
      const patchRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH', headers: hsHeaders, body: JSON.stringify({ properties: updateProps }),
      });
      if (!patchRes.ok) { const b = await patchRes.json().catch(() => ({})); throw new Error(`HubSpot patch: ${JSON.stringify(b)}`); }
      console.log('HubSpot: contact updated, id =', contactId);
    }
  } else if (!createRes.ok) {
    throw new Error(`HubSpot create error ${createRes.status}: ${JSON.stringify(createBody)}`);
  } else {
    contactId = createBody.id;
    console.log('HubSpot: contact created, id =', contactId);
  }

  if (contactId) {
    // Create note and deal in parallel
    const [noteRes, dealRes] = await Promise.all([
      // Note
      fetch('https://api.hubapi.com/crm/v3/objects/notes', {
        method: 'POST', headers: hsHeaders,
        body: JSON.stringify({
          properties: { hs_note_body: buildHubSpotNote(data).slice(0, 65000), hs_timestamp: String(Date.now()) },
          associations: [{ to: { id: contactId }, types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }] }],
        }),
      }),
      // Deal
      createHubSpotDeal(contactId, hsHeaders, data),
    ]);

    const noteBody = await noteRes.json().catch(() => ({}));
    console.log('HubSpot note status:', noteRes.status, noteBody?.id || '');
  }
}

// ── HubSpot Deal creation ─────────────────────────────────────────────────────

async function createHubSpotDeal(contactId, hsHeaders, data = {}) {
  // Fetch deal pipelines to find "Sales Pipeline" → "Quoting" stage
  let pipelineId = 'default';
  let stageId = null;

  try {
    // Try /crm/v3/pipelines/deals which should return pipelines with embedded stages
    const plRes  = await fetch('https://api.hubapi.com/crm/v3/pipelines/deals', { headers: hsHeaders });
    const plBody = await plRes.json().catch(() => ({}));
    const pipelines = plBody.results || [];

    const preferred = pipelines.find((p) => p.label?.toLowerCase().includes('sales'))
      || pipelines.find((p) => p.id === 'default')
      || pipelines[0];

    if (preferred) {
      pipelineId = preferred.id;
      // Stages may be nested as .stages or .stageOrder — log what we get
      const stages = preferred.stages || preferred.stageOrder || [];
      console.log(`HubSpot pipeline stages (list): ${JSON.stringify(stages).slice(0, 200)}`);
      const quotingStage = stages.find((s) => (s.label || s.displayName || '').toLowerCase().includes('quot'));
      stageId = (quotingStage || stages[0])?.id ?? null;
    }

    // If stages weren't in the list, fetch the single pipeline record
    if (!stageId) {
      const spRes  = await fetch(`https://api.hubapi.com/crm/v3/pipelines/deals/${pipelineId}`, { headers: hsHeaders });
      const spBody = await spRes.json().catch(() => ({}));
      // HubSpot sometimes nests stages under .stages, sometimes under .stageOrder
      const stages = spBody.stages || spBody.stageOrder || [];
      console.log(`HubSpot pipeline stages (single): ${JSON.stringify(stages).slice(0, 200)}`);
      const quotingStage = stages.find((s) => (s.label || s.displayName || '').toLowerCase().includes('quot'));
      stageId = (quotingStage || stages[0])?.id ?? null;
    }

    console.log(`HubSpot deal: pipeline=${pipelineId}, stage=${stageId}`);
  } catch (e) {
    console.warn('HubSpot pipeline lookup failed:', e.message);
  }

  // If pipeline lookup returned no stages (happens on some HS accounts),
  // fall back to the first known stage ID for the default pipeline.
  if (!stageId) {
    stageId = '1802529492'; // first stage of default pipeline (confirmed from deal records)
    console.log(`HubSpot deal: using hardcoded fallback stage ${stageId}`);
  }

  // Close date: 14 days from now at midnight UTC
  const closeDate = new Date();
  closeDate.setDate(closeDate.getDate() + 14);
  closeDate.setUTCHours(0, 0, 0, 0);

  // Map current insurer slug → readable label for deal card
  const CARRIER_LABELS = {
    state_farm: 'State Farm', geico: 'GEICO', progressive: 'Progressive',
    allstate: 'Allstate', usaa: 'USAA', farmers: 'Farmers',
    liberty_mutual: 'Liberty Mutual', nationwide: 'Nationwide',
    aaa: 'AAA', travelers: 'Travelers', other: 'Other', dont_know: 'Unknown',
  };

  // Map current insurance status → prior_insurance enum
  const priorInsurance = data.currentlyInsured === 'yes'
    ? 'Yes - Continuous'
    : data.currentlyInsured === 'no'
      ? 'No Prior Insurance'
      : undefined;

  const driverCount  = 1 + (data.additionalDrivers?.length || 0);
  const vehicleCount = data.vehicles?.length || 0;

  const dealRes = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
    method: 'POST',
    headers: hsHeaders,
    body: JSON.stringify({
      properties: {
        dealname:          `Personal Auto Quote — ${data.firstName || ''} ${data.lastName || ''}`.trim(),
        pipeline:          pipelineId,
        dealstage:         stageId,
        closedate:         String(closeDate.getTime()),
        dealtype:          'newbusiness',
        hs_priority:       'medium',
        // Deal card fields
        policy_type:       'Personal Auto',
        current_carrier:   CARRIER_LABELS[data.currentInsurer] || data.currentInsurer || undefined,
        prior_insurance:   priorInsurance,
        drivers_on_policy: driverCount,
        vehicles_on_policy:vehicleCount,
        sr22_required:     'false',
      },
      associations: [{
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
      }],
    }),
  });

  const dealBody = await dealRes.json().catch(() => ({}));
  console.log('HubSpot deal status:', dealRes.status, dealBody?.id || '');
  if (!dealRes.ok) throw new Error(`HubSpot deal error ${dealRes.status}`);
  return dealBody.id;
}

// ── Zapier → EZLynx webhook ───────────────────────────────────────────────────

async function notifyZapier(data) {
  const url = process.env.ZAPIER_WEBHOOK_URL;
  if (!url) throw new Error('ZAPIER_WEBHOOK_URL is not set');

  const name    = [data.firstName, data.lastName].filter(Boolean).join(' ') || '';
  const vehicles = (data.vehicles || []);
  const drivers  = (data.additionalDrivers || []);

  // Build a flat, clearly-named payload so Zapier mapping to EZLynx is easy
  const payload = {
    // ── Applicant (primary insured) ──────────────────────────────────────────
    applicant_first_name:   data.firstName  || '',
    applicant_last_name:    data.lastName   || '',
    applicant_full_name:    name,
    applicant_dob:          data.dateOfBirth || '',
    applicant_email:        data.email      || '',
    applicant_phone:        data.phone      || '',
    applicant_address:      data.address    || '',
    applicant_state:        data.state      || '',
    applicant_zip:          data.zipCode    || '',
    applicant_marital:      data.maritalStatus || '',
    applicant_occupation:   data.occupation    || '',
    applicant_homeowner:    data.homeownerStatus || '',
    applicant_license_num:  data.licenseNumber  || '',
    applicant_license_state:data.licenseState   || '',
    currently_insured:      data.currentlyInsured || '',
    current_insurer:        data.currentInsurer  || '',
    years_insured:          data.yearsInsured    || '',

    // ── Vehicles ─────────────────────────────────────────────────────────────
    vehicle_count: vehicles.length,

    vehicle_1_year:      vehicles[0]?.year      || '',
    vehicle_1_make:      vehicles[0]?.make      || '',
    vehicle_1_model:     vehicles[0]?.model     || '',
    vehicle_1_vin:       vehicles[0]?.vin       || '',
    vehicle_1_use:       vehicles[0]?.usage     || '',
    vehicle_1_miles:     vehicles[0]?.annualMiles || '',
    vehicle_1_ownership: vehicles[0]?.ownership  || '',
    vehicle_1_lienholder:vehicles[0]?.lienholder || '',

    vehicle_2_year:      vehicles[1]?.year      || '',
    vehicle_2_make:      vehicles[1]?.make      || '',
    vehicle_2_model:     vehicles[1]?.model     || '',
    vehicle_2_vin:       vehicles[1]?.vin       || '',
    vehicle_2_use:       vehicles[1]?.usage     || '',
    vehicle_2_miles:     vehicles[1]?.annualMiles || '',
    vehicle_2_ownership: vehicles[1]?.ownership  || '',

    vehicle_3_year:      vehicles[2]?.year  || '',
    vehicle_3_make:      vehicles[2]?.make  || '',
    vehicle_3_model:     vehicles[2]?.model || '',
    vehicle_3_vin:       vehicles[2]?.vin   || '',

    // ── Primary driver license / history ─────────────────────────────────────
    driver_1_first_name:    data.firstName   || '',
    driver_1_last_name:     data.lastName    || '',
    driver_1_dob:           data.dateOfBirth || '',
    driver_1_license_num:   data.licenseNumber  || '',
    driver_1_license_state: data.licenseState   || '',
    driver_1_marital:       data.maritalStatus  || '',

    // ── Additional drivers ────────────────────────────────────────────────────
    driver_2_first_name:    drivers[0]?.firstName    || '',
    driver_2_last_name:     drivers[0]?.lastName     || '',
    driver_2_dob:           drivers[0]?.dateOfBirth  || '',
    driver_2_license_num:   drivers[0]?.licenseNumber  || '',
    driver_2_license_state: drivers[0]?.licenseState   || '',
    driver_2_relationship:  drivers[0]?.relationship   || '',

    driver_3_first_name:    drivers[1]?.firstName    || '',
    driver_3_last_name:     drivers[1]?.lastName     || '',
    driver_3_dob:           drivers[1]?.dateOfBirth  || '',
    driver_3_license_num:   drivers[1]?.licenseNumber  || '',
    driver_3_license_state: drivers[1]?.licenseState   || '',
    driver_3_relationship:  drivers[1]?.relationship   || '',

    // ── Driving history ───────────────────────────────────────────────────────
    has_violations: data.hasViolations || '',
    has_accidents:  data.hasAccidents  || '',

    // ── Coverage preferences ──────────────────────────────────────────────────
    liability_limit:           data.liabilityLimit        || '',
    has_collision:             data.hasCollision          || '',
    collision_deductible:      data.collisionDeductible   || '',
    has_comprehensive:         data.hasComprehensive      || '',
    comprehensive_deductible:  data.comprehensiveDeductible || '',
    additional_coverages:      (data.additionalCoverages || []).join(', '),
    uninsured_motorist:        (data.additionalCoverages || []).includes('uninsured_motorist') ? 'yes' : 'no',
    roadside_assistance:       (data.additionalCoverages || []).includes('roadside') ? 'yes' : 'no',
    rental_reimbursement:      (data.additionalCoverages || []).includes('rental')   ? 'yes' : 'no',
    towing:                    (data.additionalCoverages || []).includes('towing')   ? 'yes' : 'no',
    medical_payments:          (data.additionalCoverages || []).includes('medical_payments') ? 'yes' : 'no',

    // ── Meta ──────────────────────────────────────────────────────────────────
    notes:          data.additionalNotes || '',
    language:       data.language || 'en',
    submitted_at:   new Date().toISOString(),
    source:         'Sova Auto Insurance Form',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Zapier webhook error: ${res.status}`);
  console.log('Zapier webhook sent successfully');
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://sovainsurance.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')    return res.status(405).json({ message: 'Method not allowed' });

  const data = req.body;
  if (!data?.email || !data?.firstName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Anti-spam: honeypot filled or form submitted suspiciously fast (< 3s).
  // Respond OK without processing so bots can't tell they were filtered.
  if (data._hp || (typeof data._elapsedMs === 'number' && data._elapsedMs < 3000)) {
    console.warn('Spam filter triggered: hp =', Boolean(data._hp), 'elapsedMs =', data._elapsedMs);
    return res.status(200).json({ ok: true });
  }

  const [emailErr, slackErr, hubspotErr, zapierErr] = await Promise.all([
    sendEmail(data).catch((e) => e),
    notifySlack(data).catch((e) => e),
    saveToHubspot(data).catch((e) => e),
    notifyZapier(data).catch((e) => e),
  ]);

  // Log failures server-side only — never expose internals to the client
  if (emailErr)   console.error('Email failed:', emailErr);
  if (slackErr)   console.error('Slack failed:', slackErr);
  if (hubspotErr) console.error('HubSpot failed:', hubspotErr);
  if (zapierErr)  console.error('Zapier failed:', zapierErr);

  if (emailErr && slackErr && hubspotErr && zapierErr) {
    return res.status(500).json({ message: 'Submission failed. Please try again.' });
  }

  return res.status(200).json({ ok: true });
}
