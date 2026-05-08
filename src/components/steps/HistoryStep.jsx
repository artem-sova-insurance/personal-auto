import FormField from '../FormField';
import { VIOLATION_TYPES, INCIDENT_YEARS, MONTHS, FL_INSURERS } from '../../config/formConfig';

const EMPTY_VIOLATION = { month: '', year: '', type: '' };
const EMPTY_ACCIDENT  = { month: '', year: '', atFault: '' };

function IncidentRow({ item, index, onChange, onRemove, typeOptions, typeLabel, atFaultLabel, t }) {
  const upd = (f, v) => onChange({ ...item, [f]: v });
  const monthOptions = MONTHS.map((m) => ({ value: m.value, label: m.label }));
  const yearOptions  = INCIDENT_YEARS.map((y) => ({ value: y.value, label: y.label }));
  const yesNo = [{ value: 'yes', label: t('common.yes') }, { value: 'no', label: t('common.no') }];

  return (
    <div className="border border-gray-200 rounded-xl p-3 mb-3 bg-white animate-slide-down">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <FormField id={`im-${index}`} type="select" label={t('common.month')} value={item.month} onChange={(v) => upd('month', v)} options={monthOptions} />
        <FormField id={`iy-${index}`} type="select" label={t('common.year')}  value={item.year}  onChange={(v) => upd('year', v)}  options={yearOptions} />
        {typeOptions && (
          <FormField id={`it-${index}`} type="select" label={typeLabel} value={item.type} onChange={(v) => upd('type', v)} options={typeOptions} />
        )}
      </div>
      {atFaultLabel && (
        <FormField id={`iaf-${index}`} type="radio" label={atFaultLabel} value={item.atFault} onChange={(v) => upd('atFault', v)} options={yesNo} />
      )}
      <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold">
        {t('common.remove')} ✕
      </button>
    </div>
  );
}

export default function HistoryStep({ t, data, update, onNext, onBack }) {
  const violations = data.violations || [];
  const accidents  = data.accidents  || [];

  const addViolation = () => update('violations', [...violations, { ...EMPTY_VIOLATION }]);
  const updViolation = (i, v) => { const n = [...violations]; n[i] = v; update('violations', n); };
  const remViolation = (i)    => update('violations', violations.filter((_, idx) => idx !== i));

  const addAccident  = () => update('accidents', [...accidents, { ...EMPTY_ACCIDENT }]);
  const updAccident  = (i, v) => { const n = [...accidents]; n[i] = v; update('accidents', n); };
  const remAccident  = (i)    => update('accidents', accidents.filter((_, idx) => idx !== i));

  const violTypeOptions = VIOLATION_TYPES.map((o) => ({ value: o.value, label: t(`history.viol_${o.value}`) || o.label }));
  const yesNo = [{ value: 'yes', label: t('common.yes') }, { value: 'no', label: t('common.no') }];

  const yearsInsuredOptions = [
    { value: 'under1', label: t('history.years_under1') },
    { value: '1to2',   label: t('history.years_1to2') },
    { value: '3to5',   label: t('history.years_3to5') },
    { value: 'over5',  label: t('history.years_over5') },
  ];

  const canProceed = data.hasViolations && data.hasAccidents && data.currentlyInsured;

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('history.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('history.subtitle')}</p>

      {/* Violations */}
      <FormField
        id="hasViolations" type="radio"
        label={t('history.hasViolations')}
        value={data.hasViolations}
        onChange={(v) => {
          update('hasViolations', v);
          if (v === 'yes' && violations.length === 0) update('violations', [{ ...EMPTY_VIOLATION }]);
          if (v === 'no') update('violations', []);
        }}
        options={yesNo}
      />

      {data.hasViolations === 'yes' && (
        <div className="ml-2 mb-4">
          {violations.map((item, i) => (
            <IncidentRow key={i} index={i} item={item} onChange={(v) => updViolation(i, v)} onRemove={() => remViolation(i)}
              typeOptions={violTypeOptions} typeLabel={t('history.violationType')} t={t} />
          ))}
          <button onClick={addViolation} className="text-sm font-semibold text-brand-700 hover:text-brand-900 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
            {t('history.addViolation')}
          </button>
        </div>
      )}

      {/* Accidents */}
      <FormField
        id="hasAccidents" type="radio"
        label={t('history.hasAccidents')}
        value={data.hasAccidents}
        onChange={(v) => {
          update('hasAccidents', v);
          if (v === 'yes' && accidents.length === 0) update('accidents', [{ ...EMPTY_ACCIDENT }]);
          if (v === 'no') update('accidents', []);
        }}
        options={yesNo}
      />

      {data.hasAccidents === 'yes' && (
        <div className="ml-2 mb-4">
          {accidents.map((item, i) => (
            <IncidentRow key={i} index={i} item={item} onChange={(v) => updAccident(i, v)} onRemove={() => remAccident(i)}
              atFaultLabel={t('history.atFault')} t={t} />
          ))}
          <button onClick={addAccident} className="text-sm font-semibold text-brand-700 hover:text-brand-900 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">
            {t('history.addAccident')}
          </button>
        </div>
      )}

      {/* Current Insurance */}
      <FormField
        id="currentlyInsured" type="radio"
        label={t('history.currentlyInsured')}
        value={data.currentlyInsured}
        onChange={(v) => update('currentlyInsured', v)}
        options={yesNo}
      />

      {data.currentlyInsured === 'yes' && (
        <>
          <FormField
            id="currentInsurer" type="select" label={t('history.currentInsurer')}
            value={data.currentInsurer} onChange={(v) => update('currentInsurer', v)}
            options={FL_INSURERS}
          />
          <FormField
            id="yearsInsured" type="select" label={t('history.yearsInsured')}
            value={data.yearsInsured} onChange={(v) => update('yearsInsured', v)}
            options={yearsInsuredOptions}
          />
        </>
      )}

      {data.currentlyInsured === 'no' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
          ⚠️ {t('history.noInsuranceNote')}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
          ← {t('nav.back')}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('nav.next')} →
        </button>
      </div>
    </div>
  );
}
