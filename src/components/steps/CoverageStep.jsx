import { useEffect, useRef } from 'react';
import DynamicForm from '../DynamicForm';
import { COVERAGE_FIELDS } from '../../config/formConfig';

// ── Smart recommendations based on selections ─────────────────────────────────
function SmartRecommendations({ data }) {
  const additionalCoverages = data.additionalCoverages || [];
  const hasUninsured  = additionalCoverages.includes('uninsured_motorist');
  const hasMedical    = additionalCoverages.includes('medical_payments');
  const hasRoadside   = additionalCoverages.includes('roadside');
  const isFinancedOrLeased = (data.vehicles || []).some((v) => v.ownership === 'financed' || v.ownership === 'leased');
  const isStateMin    = data.liabilityLimit === 'state_min';
  const noCollision   = data.hasCollision  !== 'yes';
  const noComprehensive = data.hasComprehensive !== 'yes';
  const hasRideshare  = (data.vehicles || []).some((v) => v.usage === 'rideshare' || v.usage === 'turo');

  const tips = [];

  if (!hasUninsured) {
    tips.push({
      id: 'uninsured',
      icon: '🛡️',
      color: 'red',
      title: 'Uninsured Motorist — Strongly Recommended in Florida',
      message: 'Florida has one of the highest rates of uninsured drivers in the US (26%+). If an uninsured driver hits you, UM coverage pays for your injuries and damages. Without it, you could be left paying out of pocket.',
    });
  }

  if (!hasMedical) {
    tips.push({
      id: 'medical',
      icon: '🏥',
      color: 'amber',
      title: 'Medical Payments (MedPay) / PIP',
      message: "Florida is a no-fault state — PIP is required, but additional MedPay helps cover medical bills regardless of who's at fault. Especially important if you don't have strong health insurance.",
    });
  }

  if (isStateMin) {
    tips.push({
      id: 'liability',
      icon: '⚠️',
      color: 'amber',
      title: 'State Minimum May Not Be Enough',
      message: "Florida's minimum is only $10k property damage / $10k PIP. A single accident can easily exceed this. If you're found at fault for more, you pay the difference personally. We recommend at least $50k/$100k/$50k.",
    });
  }

  if (!hasRoadside) {
    tips.push({
      id: 'roadside',
      icon: '🔧',
      color: 'gray',
      title: 'Roadside Assistance — Only ~$5–10/month',
      message: 'Covers towing, flat tires, dead battery, lockouts, and fuel delivery. Much cheaper through insurance than calling a tow truck directly.',
    });
  }

  if (hasRideshare && noCollision) {
    tips.push({
      id: 'rideshare_collision',
      icon: '🚗',
      color: 'red',
      title: 'Collision Required for Rideshare/Turo',
      message: 'Rideshare and rental platforms require collision coverage. Without it, you may have no coverage while the vehicle is in service.',
    });
  }

  if (noCollision || noComprehensive) {
    const curYear = new Date().getFullYear();
    const newVehicles = (data.vehicles || []).filter((v) => v.year && (curYear - parseInt(v.year)) <= 7);
    if (newVehicles.length > 0) {
      tips.push({
        id: 'full_coverage',
        icon: '🚘',
        color: 'blue',
        title: `Full Coverage Recommended for Your ${newVehicles[0].year} ${newVehicles[0].make}`,
        message: 'Vehicles under 7–8 years old typically benefit from both collision and comprehensive. Without them, a total loss means you walk away with nothing from your insurer.',
      });
    }
  }

  if (tips.length === 0) return null;

  const colorMap = {
    red:   { bg: 'bg-red-50',   border: 'border-red-200',   icon: 'bg-red-100',   title: 'text-red-800',   text: 'text-red-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100', title: 'text-amber-800', text: 'text-amber-700' },
    blue:  { bg: 'bg-blue-50',  border: 'border-blue-200',  icon: 'bg-blue-100',  title: 'text-blue-800',  text: 'text-blue-700' },
    gray:  { bg: 'bg-gray-50',  border: 'border-gray-200',  icon: 'bg-gray-100',  title: 'text-gray-800',  text: 'text-gray-600' },
  };

  return (
    <div className="mb-6">
      <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-3">💬 Our Recommendations</p>
      <div className="space-y-3">
        {tips.map(({ id, icon, color, title, message }) => {
          const c = colorMap[color];
          return (
            <div key={id} className={`flex gap-3 ${c.bg} border ${c.border} rounded-xl px-4 py-3`}>
              <div className={`flex-shrink-0 w-8 h-8 ${c.icon} rounded-lg flex items-center justify-center text-lg`}>
                {icon}
              </div>
              <div>
                <p className={`text-sm font-semibold ${c.title} mb-0.5`}>{title}</p>
                <p className={`text-xs ${c.text} leading-relaxed`}>{message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CoverageStep({ t, data, update, errors, onBack, onSubmit, isSubmitting, submitError }) {
  // Suggest collision + comprehensive with $1,000 deductible once, the first time
  // a non-minimum liability limit is picked — never override an explicit user choice after that
  const hasAutoApplied = useRef(false);
  useEffect(() => {
    if (hasAutoApplied.current) return;
    if (data.liabilityLimit && data.liabilityLimit !== 'state_min') {
      hasAutoApplied.current = true;
      if (data.hasCollision !== 'yes') update('hasCollision', 'yes');
      if (!data.collisionDeductible)   update('collisionDeductible', '1000');
      if (data.hasComprehensive !== 'yes') update('hasComprehensive', 'yes');
      if (!data.comprehensiveDeductible)   update('comprehensiveDeductible', '1000');
    }
  }, [data.liabilityLimit]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('coverage.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('coverage.subtitle')}</p>

      <DynamicForm fields={COVERAGE_FIELDS} data={data} update={update} errors={errors} t={t} />

      {/* Recommendations shown after user has made some selections */}
      {(data.liabilityLimit || data.hasCollision || data.hasComprehensive) && (
        <SmartRecommendations data={data} />
      )}

      {submitError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={onBack} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
          ← {t('nav.back')}
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !data.liabilityLimit}
          className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('nav.submitting') : t('nav.submit')}
        </button>
      </div>
    </div>
  );
}
