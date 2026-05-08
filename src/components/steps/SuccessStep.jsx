export default function SuccessStep({ t, data = {}, onReset }) {
  const firstName = data.firstName || '';
  const state     = data.state     || '—';
  const phone     = data.phone     || '—';
  const email     = data.email     || '';
  const vehicleCount = (data.vehicles || []).length;
  const vehicleSummary = vehicleCount === 1
    ? `${data.vehicles[0]?.year || ''} ${data.vehicles[0]?.make || ''} ${data.vehicles[0]?.model || ''}`.trim() || '—'
    : `${vehicleCount} vehicles`;

  const steps = [
    { n: '1', title: 'Agent Review',       desc: 'We review your submission and shop multiple carriers for the best personal auto rates.' },
    { n: '2', title: 'Personalized Quote', desc: 'We prepare a tailored quote comparing coverage options and pricing across top carriers.' },
    { n: '3', title: 'We Contact You',     desc: 'An agent will reach out within 1 business day to walk you through your options.' },
  ];

  return (
    <div className="py-2">

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-brand-700 -mx-6 -mt-6 px-6 pt-8 pb-8 mb-6 text-white rounded-b-2xl">
        <div className="flex items-center justify-center w-12 h-12 bg-white/15 rounded-2xl mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-1">We've received your quote request!</h2>
        <p className="text-white/65 text-sm">Our team will be in touch within 1 business day.</p>
      </div>

      {/* Greeting */}
      <p className="text-sm text-gray-600 leading-relaxed mb-5">
        {firstName && <><span className="font-semibold text-gray-900">Hi {firstName},</span> </>}
        Thank you for choosing <span className="font-semibold text-brand-700">Sova Insurance</span>.
        {' '}We've successfully received your personal auto insurance quote request.
        Our licensed agents will review your submission and reach out with the best coverage options.
      </p>

      {/* Summary table */}
      <div className="mb-5">
        <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-2">Your Submission</p>
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {[
            ['Vehicle(s)', vehicleSummary],
            ['State',      state],
            ['Phone',      phone],
            ['Liability',  data.liabilityLimit?.replace(/_/g, '/').replace('state/min', 'State Minimum') || '—'],
          ].map(([label, value], i) => (
            <div key={label} className={`flex items-center px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${i < 3 ? 'border-b border-gray-100' : ''}`}>
              <span className="text-gray-400 font-medium w-28 flex-shrink-0">{label}</span>
              <span className="text-gray-900 font-semibold">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="mb-5">
        <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-3">What Happens Next</p>
        <div className="space-y-3">
          {steps.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact card */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-4 mb-5">
        <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-3">Questions? Contact Us</p>
        <div className="space-y-1.5 text-sm">
          <a href="tel:9547806667" className="flex items-center gap-2 text-brand-700 font-semibold hover:underline">
            <span>📞</span> 954-780-6667
          </a>
          <a href="mailto:info@sovainsurance.com" className="flex items-center gap-2 text-brand-700 font-semibold hover:underline">
            <span>✉️</span> info@sovainsurance.com
          </a>
          <p className="flex items-start gap-2 text-gray-500">
            <span>📍</span> 3440 Hollywood Blvd Suite 415, Hollywood, FL 33021
          </p>
        </div>
      </div>

      {email && (
        <p className="text-xs text-gray-400 text-center mb-5">
          A confirmation email has been sent to <span className="font-semibold text-gray-600">{email}</span>
        </p>
      )}

      <p className="text-xs text-gray-400 italic leading-relaxed mb-6">
        This confirms receipt of your quote request only and does not constitute a binding insurance policy or quote. Coverage terms are subject to underwriting approval.
      </p>

      <div className="text-center">
        <button onClick={onReset} className="px-6 py-2.5 rounded-xl border-2 border-brand-200 text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors">
          Submit another quote
        </button>
      </div>
    </div>
  );
}
