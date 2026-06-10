import { useState, useRef } from 'react';
import FormField from '../FormField';
import { RELATIONSHIP_OPTIONS } from '../../config/formConfig';
import { US_STATES } from '../../i18n';
import { readPhotoFile } from '../../utils/image';

const TODAY = new Date().toISOString().slice(0, 10);

const FL_FIRST = ['FL', ...US_STATES.filter((s) => s !== 'FL')];
const STATE_OPTIONS = FL_FIRST.map((s) => ({ value: s, label: s }));
const EMPTY_DRIVER = { firstName: '', lastName: '', dateOfBirth: '', relationship: '', licenseState: '', licenseNumber: '', address: '', isStudent: null, licensePhotoName: '', licensePhotoData: '' };

function getAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function DriverCard({ index, driver, onChange, onRemove, t, errors = {} }) {
  const upd = (field, val) => onChange({ ...driver, [field]: val });
  const relOptions = RELATIONSHIP_OPTIONS.map((o) => ({ value: o.value, label: t(`drivers.rel_${o.value}`) || o.label }));
  const fileRef = useRef(null);
  const age = getAge(driver.dateOfBirth);
  const isYoung = age !== null && age < 25;

  const [photoError, setPhotoError] = useState('');

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try {
      const dataUrl = await readPhotoFile(file);
      onChange({ ...driver, licensePhotoName: file.name, licensePhotoData: dataUrl });
    } catch {
      setPhotoError('This photo is too large. Please use an image under 3 MB.');
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50 relative animate-slide-down">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-brand-800 uppercase tracking-wide">
          {t('drivers.label')} {index + 1}
        </span>
        <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors">
          {t('drivers.removeDriver')}
        </button>
      </div>

      {/* Name */}
      <div className="grid grid-cols-2 gap-3">
        <FormField id={`dfn-${index}`} type="text" label={t('drivers.firstName')} value={driver.firstName} onChange={(v) => upd('firstName', v)} placeholder="Jane" required error={errors.firstName} />
        <FormField id={`dln-${index}`} type="text" label={t('drivers.lastName')}  value={driver.lastName}  onChange={(v) => upd('lastName', v)}  placeholder="Smith" required error={errors.lastName} />
      </div>

      <FormField id={`ddob-${index}`} type="date"   label={t('drivers.dateOfBirth')}  value={driver.dateOfBirth}  onChange={(v) => upd('dateOfBirth', v)}  max={TODAY} required error={errors.dateOfBirth} />
      <FormField id={`drel-${index}`} type="select" label={t('drivers.relationship')} value={driver.relationship} onChange={(v) => upd('relationship', v)} options={relOptions} required error={errors.relationship} />

      {/* License info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <FormField id={`dlnum-${index}`} type="text"   label={t('drivers.licenseNumber')} value={driver.licenseNumber} onChange={(v) => upd('licenseNumber', v)} placeholder="D123-456-78-900-0" required error={errors.licenseNumber} />
        <FormField id={`dlst-${index}`}  type="select" label={t('drivers.licenseState')}  value={driver.licenseState}  onChange={(v) => upd('licenseState', v)}  options={STATE_OPTIONS} required error={errors.licenseState} />
      </div>

      {/* Address */}
      <FormField
        id={`daddr-${index}`} type="text" label={t('drivers.address')}
        value={driver.address} onChange={(v) => upd('address', v)}
        placeholder={t('drivers.addressPlaceholder')}
        helpText={t('drivers.addressHint')}
      />

      {/* License photo upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('drivers.licensePhoto')} <span className="text-xs text-gray-400 font-normal ml-1">({t('drivers.licensePhotoOptional')})</span>
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        >
          <span className="text-2xl">📷</span>
          <div>
            {driver.licensePhotoName ? (
              <p className="text-sm font-semibold text-brand-700">{driver.licensePhotoName}</p>
            ) : (
              <p className="text-sm text-gray-500">{t('drivers.licensePhotoHint')}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{t('drivers.licensePhotoSub')}</p>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        {photoError && <p className="mt-1.5 text-xs text-red-600">{photoError}</p>}
      </div>

      {/* Student discount for under-25 drivers */}
      {isYoung && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-2">
          <p className="text-xs font-bold text-amber-800 mb-2">🎓 {t('drivers.studentQuestion')}</p>
          <div className="flex gap-2">
            {[{ value: 'yes', label: t('drivers.studentYes') }, { value: 'no', label: t('drivers.studentNo') }].map((o) => (
              <label key={o.value} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${driver.isStudent === o.value ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-amber-200 text-amber-800 hover:border-amber-400'}`}>
                <input type="radio" name={`student-${index}`} value={o.value} checked={driver.isStudent === o.value} onChange={() => upd('isStudent', o.value)} className="sr-only" />
                {o.label}
              </label>
            ))}
          </div>
          {driver.isStudent === 'yes' && (
            <p className="mt-2 text-xs text-amber-700">
              ✅ {t('drivers.studentSavings')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DriversStep({ t, data, update, onNext, onBack }) {
  const [driverErrors, setDriverErrors] = useState([]);
  const [listError, setListError] = useState('');
  const yesNo = [{ value: 'yes', label: t('common.yes') }, { value: 'no', label: t('common.no') }];
  const drivers = data.additionalDrivers || [];

  const addDriver    = () => update('additionalDrivers', [...drivers, { ...EMPTY_DRIVER }]);
  const updateDriver = (i, d) => {
    const n = [...drivers]; n[i] = d; update('additionalDrivers', n);
    if (driverErrors[i] && Object.keys(driverErrors[i]).length > 0) {
      const ne = [...driverErrors]; ne[i] = {}; setDriverErrors(ne);
    }
  };
  const removeDriver = (i) => update('additionalDrivers', drivers.filter((_, idx) => idx !== i));

  const handleNext = () => {
    if (data.isOnlyDriver === 'no') {
      if (drivers.length === 0) {
        setListError(t('drivers.addDriver'));
        return;
      }
      const allErrors = drivers.map((d) => {
        const errs = {};
        if (!d.firstName)     errs.firstName     = 'Required';
        if (!d.lastName)      errs.lastName      = 'Required';
        if (!d.dateOfBirth)   errs.dateOfBirth   = 'Required';
        if (!d.relationship)  errs.relationship  = 'Required';
        if (!d.licenseNumber) errs.licenseNumber = 'Required';
        if (!d.licenseState)  errs.licenseState  = 'Required';
        return errs;
      });
      if (allErrors.some((e) => Object.keys(e).length > 0)) {
        setDriverErrors(allErrors);
        setTimeout(() => document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
        return;
      }
    }
    setDriverErrors([]);
    setListError('');
    onNext();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('drivers.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('drivers.subtitle')}</p>

      {/* Is only driver? */}
      <FormField
        id="isOnlyDriver" type="radio"
        label={t('drivers.isOnlyDriver')}
        value={data.isOnlyDriver}
        onChange={(v) => {
          update('isOnlyDriver', v);
          if (v === 'yes') update('additionalDrivers', []);
          else if (v === 'no' && drivers.length === 0) update('additionalDrivers', [{ ...EMPTY_DRIVER }]);
        }}
        options={yesNo}
      />

      {data.isOnlyDriver === 'yes' && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-4 text-sm text-brand-800">
          {t('drivers.onlyDriverNote')}
        </div>
      )}

      {data.isOnlyDriver === 'no' && (
        <>
          {drivers.map((d, i) => (
            <DriverCard
              key={i} index={i} driver={d}
              errors={driverErrors[i] || {}}
              onChange={(v) => updateDriver(i, v)}
              onRemove={() => removeDriver(i)}
              t={t}
            />
          ))}
          <button onClick={() => { addDriver(); setListError(''); }} className={`w-full py-2.5 rounded-xl border-2 border-dashed font-semibold text-sm transition-colors mb-4 ${listError ? 'border-red-400 text-red-600 hover:bg-red-50' : 'border-brand-300 text-brand-700 hover:bg-brand-50'}`}>
            {t('drivers.addDriver')}
          </button>
          {listError && <p data-error="" className="mb-4 -mt-2 text-xs text-red-600">Please add at least one additional driver, or select "Yes" above if you're the only driver.</p>}
        </>
      )}

      <div className="flex items-center justify-between mt-4">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
          ← {t('nav.back')}
        </button>
        <button onClick={handleNext} disabled={!data.isOnlyDriver} className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {t('nav.next')} →
        </button>
      </div>
    </div>
  );
}
