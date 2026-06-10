import { useState } from 'react';
import FormField from '../FormField';
import { VIOLATION_TYPES, INCIDENT_YEARS, MONTHS, FL_INSURERS } from '../../config/formConfig';

const EMPTY_VIOLATION = { month: '', year: '', type: '' };
const EMPTY_ACCIDENT  = { month: '', year: '', atFault: '' };

function IncidentRow({ item, index, onChange, onRemove, typeOptions, typeLabel, atFaultLabel, t, errors = {} }) {
  const upd = (f, v) => onChange({ ...item, [f]: v });
  const monthOptions = MONTHS.map((m) => ({ value: m.value, label: m.label }));
  const yearOptions  = INCIDENT_YEARS.map((y) => ({ value: y.value, label: y.label }));
  const yesNo = [{ value: 'yes', label: t('common.yes') }, { value: 'no', label: t('common.no') }];

  return (
    <div className="border border-gray-200 rounded-xl p-3 mb-3 bg-white animate-slide-down">
      <div className="grid grid-cols-3 gap-2 mb-2">
        <FormField id={`im-${index}`} type="select" label={t('common.month')} value={item.month} onChange={(v) => upd('month', v)} options={monthOptions} error={errors.month} />
        <FormField id={`iy-${index}`} type="select" label={t('common.year')}  value={item.year}  onChange={(v) => upd('year', v)}  options={yearOptions} error={errors.year} />
        {typeOptions && (
          <FormField id={`it-${index}`} type="select" label={typeLabel} value={item.type} onChange={(v) => upd('type', v)} options={typeOptions} error={errors.type} />
        )}
      </div>
      {atFaultLabel && (
        <FormField id={`iaf-${index}`} type="radio" label={atFaultLabel} value={item.atFault} onChange={(v) => upd('atFault', v)} options={yesNo} error={errors.atFault} />
      )}
      <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold">
        {t('common.remove')} ✕
      </button>
    </div>
  );
}

export default function HistoryStep({ t, data, update, onNext, onBack }) {
  const [localErrors, setLocalErrors] = useState({});
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

  const req = t('common.required') || 'Required';

  const handleNext = () => {
    const errs = {};
    if (!data.hasViolations)    errs.hasViolations    = req;
    if (!data.hasAccidents)     errs.hasAccidents     = req;
    if (!data.currentlyInsured) errs.currentlyInsured = req;

    const violationErrors = data.hasViolations === 'yes'
      ? violations.map((v) => {
          const e = {};
          if (!v.month) e.month = req;
          if (!v.year)  e.year  = req;
          if (!v.type)  e.type  = req;
          return e;
        })
      : [];

    const accidentErrors = data.hasAccidents === 'yes'
      ? accidents.map((a) => {
          const e = {};
          if (!a.month)   e.month   = req;
          if (!a.year)    e.year    = req;
          if (!a.atFault) e.atFault = req;
          return e;
        })
      : [];

    if (data.currentlyInsured === 'yes') {
      if (!data.currentInsurer) errs.currentInsurer = req;
      if (!data.yearsInsured)   errs.yearsInsured   = req;
    }

    const hasRowErrors = violationErrors.some((e) => Object.keys(e).length > 0)
      || accidentErrors.some((e) => Object.keys(e).length > 0);

    if (Object.keys(errs).length > 0 || hasRowErrors) {
      setLocalErrors({ ...errs, violationErrors, accidentErrors });
      setTimeout(() => document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setLocalErrors({});
    onNext();
  };

  const clearErr = (key) => setLocalErrors((p) => { const n = { ...p }; delete n[key]; return n; });
  const violationErrors = localErrors.violationErrors || [];
  const accidentErrors  = localErrors.accidentErrors  || [];

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
          clearErr('hasViolations');
          if (v === 'yes' && violations.length === 0) update('violations', [{ ...EMPTY_VIOLATION }]);
          if (v === 'no') update('violations', []);
        }}
        options={yesNo}
        error={localErrors.hasViolations}
      />

      {data.hasViolations === 'yes' && (
        <div className="ml-2 mb-4">
          {violations.map((item, i) => (
            <IncidentRow key={i} index={i} item={item} errors={violationErrors[i] || {}}
              onChange={(v) => {
                updViolation(i, v);
                if (violationErrors[i]) { const ne = [...violationErrors]; ne[i] = {}; setLocalErrors((p) => ({ ...p, violationErrors: ne })); }
              }}
              onRemove={() => remViolation(i)}
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
          clearErr('hasAccidents');
          if (v === 'yes' && accidents.length === 0) update('accidents', [{ ...EMPTY_ACCIDENT }]);
          if (v === 'no') update('accidents', []);
        }}
        options={yesNo}
        error={localErrors.hasAccidents}
      />

      {data.hasAccidents === 'yes' && (
        <div className="ml-2 mb-4">
          {accidents.map((item, i) => (
            <IncidentRow key={i} index={i} item={item} errors={accidentErrors[i] || {}}
              onChange={(v) => {
                updAccident(i, v);
                if (accidentErrors[i]) { const ne = [...accidentErrors]; ne[i] = {}; setLocalErrors((p) => ({ ...p, accidentErrors: ne })); }
              }}
              onRemove={() => remAccident(i)}
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
        onChange={(v) => { update('currentlyInsured', v); clearErr('currentlyInsured'); }}
        options={yesNo}
        error={localErrors.currentlyInsured}
      />

      {data.currentlyInsured === 'yes' && (
        <>
          <FormField
            id="currentInsurer" type="select" label={t('history.currentInsurer')}
            value={data.currentInsurer} onChange={(v) => { update('currentInsurer', v); clearErr('currentInsurer'); }}
            options={FL_INSURERS}
            error={localErrors.currentInsurer}
          />
          <FormField
            id="yearsInsured" type="select" label={t('history.yearsInsured')}
            value={data.yearsInsured} onChange={(v) => { update('yearsInsured', v); clearErr('yearsInsured'); }}
            options={yearsInsuredOptions}
            error={localErrors.yearsInsured}
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
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm"
        >
          {t('nav.next')} →
        </button>
      </div>
    </div>
  );
}
