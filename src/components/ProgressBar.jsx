export default function ProgressBar({ currentStep, totalSteps, t }) {
  const pct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          {t('nav.step')} {currentStep} {t('nav.of')} {totalSteps}
        </span>
        <span className="text-xs font-semibold text-brand-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-brand-600 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
