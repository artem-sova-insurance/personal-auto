import { useEffect, useState } from 'react';
import FormField from '../FormField';
import { VEHICLE_YEARS, USAGE_OPTIONS, ANNUAL_MILES_OPTIONS, OWNERSHIP_OPTIONS, CAR_MAKES, CAR_MODELS } from '../../config/formConfig';

const EMPTY_VEHICLE = { year: '', make: '', model: '', vin: '', usage: '', annualMiles: '', ownership: '', lienholder: '' };

const newId = () => (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
const newVehicle = () => ({ ...EMPTY_VEHICLE, _id: newId() });

async function lookupVin(vin) {
  const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
  if (!res.ok) throw new Error('API error');
  const json = await res.json();
  const get = (name) => (json.Results || []).find((r) => r.Variable === name)?.Value || '';
  return { year: get('Model Year'), make: get('Make'), model: get('Model') };
}

function matchMake(nhtsaMake) {
  if (!nhtsaMake) return '';
  const lower = nhtsaMake.toLowerCase();
  return CAR_MAKES.find((m) => m.toLowerCase() === lower) || 'Other';
}

function matchModel(make, nhtsaModel) {
  if (!nhtsaModel || !make) return 'Other';
  const models = CAR_MODELS[make] || [];
  const lower = nhtsaModel.toLowerCase();
  return models.find((m) => m.toLowerCase() === lower) || 'Other';
}

function VehicleCard({ index, vehicle, onChange, onRemove, canRemove, t, errors = {} }) {
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');

  const upd = (field, val) => onChange({ ...vehicle, [field]: val });

  const yearOptions  = VEHICLE_YEARS;
  const makeOptions  = CAR_MAKES.map((m) => ({ value: m, label: m }));
  const modelOptions = vehicle.make && CAR_MODELS[vehicle.make]
    ? CAR_MODELS[vehicle.make].map((m) => ({ value: m, label: m }))
    : [{ value: 'Other', label: 'Other' }];

  const handleMakeChange = (make) => onChange({ ...vehicle, make, model: '' });

  const handleVinChange = (raw) => {
    const vin = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
    upd('vin', vin);
    setVinError('');
  };

  const handleVinLookup = async () => {
    if (vehicle.vin.length !== 17) { setVinError(t('vehicle.vinError')); return; }
    setVinLoading(true);
    setVinError('');
    try {
      const { year, make, model } = await lookupVin(vehicle.vin);
      if (!year && !make) { setVinError(t('vehicle.vinNotFound')); return; }
      const matchedMake  = matchMake(make);
      const matchedModel = matchModel(matchedMake, model);
      const yearStr = String(year);
      const validYear = VEHICLE_YEARS.find((y) => y.value === yearStr) ? yearStr : '';
      onChange({ ...vehicle, year: validYear, make: matchedMake, model: matchedModel });
    } catch {
      setVinError(t('vehicle.vinFailed'));
    } finally {
      setVinLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50 relative animate-slide-down">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-brand-800 uppercase tracking-wide">
          {t('vehicle.label')} {index + 1}
        </span>
        {canRemove && (
          <button onClick={onRemove} className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors">
            {t('vehicle.removeVehicle')}
          </button>
        )}
      </div>

      {/* VIN with lookup */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('vehicle.vin')} <span className="text-red-500 ml-1">*</span>
          <span className="text-xs text-gray-400 font-normal ml-2">{t('vehicle.vinChars')}</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={vehicle.vin}
            onChange={(e) => handleVinChange(e.target.value)}
            placeholder="1HGBH41JXMN109186"
            maxLength={17}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white"
          />
          <button
            type="button"
            onClick={handleVinLookup}
            disabled={vinLoading || vehicle.vin.length !== 17}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {vinLoading ? t('vehicle.vinLooking') : t('vehicle.vinAutofill')}
          </button>
        </div>
        {(vinError || errors.vin) && <p data-error="" className="mt-1.5 text-xs text-red-600">{vinError || errors.vin}</p>}
        {!vinError && !errors.vin && <p className="mt-1 text-xs text-gray-400">{t('vehicle.vinHint')}</p>}
      </div>

      {/* Year */}
      <FormField id={`year-${index}`} type="select" label={t('vehicle.year')} value={vehicle.year} onChange={(v) => upd('year', v)} options={yearOptions} required error={errors.year} />

      {/* Make & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <FormField
          id={`make-${index}`} type="select" label={t('vehicle.make')}
          value={vehicle.make} onChange={handleMakeChange}
          options={makeOptions} placeholder={t('vehicle.makePlaceholder')} required
          error={errors.make}
        />
        <FormField
          id={`model-${index}`} type="select" label={t('vehicle.model')}
          value={vehicle.model} onChange={(v) => upd('model', v)}
          options={modelOptions} placeholder={vehicle.make ? t('vehicle.modelPlaceholder') : t('vehicle.modelFirst')}
          required
          error={errors.model}
        />
      </div>

      {/* Primary Use */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('vehicle.usage')} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {USAGE_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                vehicle.usage === o.value
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:bg-brand-50'
              }`}
            >
              <input type="radio" name={`usage-${index}`} value={o.value} checked={vehicle.usage === o.value} onChange={() => upd('usage', o.value)} className="sr-only" />
              {o.labelKey ? t(o.labelKey) : o.label}
            </label>
          ))}
        </div>
        {errors.usage && <p data-error="" className="mt-1.5 text-xs text-red-600">{errors.usage}</p>}
        {(vehicle.usage === 'rideshare' || vehicle.usage === 'turo') && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ {vehicle.usage === 'rideshare' ? t('vehicle.rideshareWarn') : t('vehicle.turoWarn')}
          </p>
        )}
      </div>

      {/* Annual Miles */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('vehicle.annualMiles')} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {ANNUAL_MILES_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                vehicle.annualMiles === o.value
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:bg-brand-50'
              }`}
            >
              <input type="radio" name={`miles-${index}`} value={o.value} checked={vehicle.annualMiles === o.value} onChange={() => upd('annualMiles', o.value)} className="sr-only" />
              {o.labelKey ? t(o.labelKey) : o.label}
            </label>
          ))}
        </div>
        {errors.annualMiles && <p data-error="" className="mt-1.5 text-xs text-red-600">{errors.annualMiles}</p>}
      </div>

      {/* Ownership */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('vehicle.ownership')} <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {OWNERSHIP_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${
                vehicle.ownership === o.value
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:bg-brand-50'
              }`}
            >
              <input type="radio" name={`own-${index}`} value={o.value} checked={vehicle.ownership === o.value} onChange={() => upd('ownership', o.value)} className="sr-only" />
              {t(`vehicle.ownership_${o.value}`) || o.label}
            </label>
          ))}
        </div>
        {errors.ownership && <p data-error="" className="mt-1.5 text-xs text-red-600">{errors.ownership}</p>}
        {vehicle.ownership === 'financed' && (
          <p className="mt-2 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            💡 {t('vehicle.financedNote')}
          </p>
        )}
        {vehicle.ownership === 'leased' && (
          <p className="mt-2 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            💡 {t('vehicle.leasedNote')}
          </p>
        )}
      </div>

      {(vehicle.ownership === 'financed' || vehicle.ownership === 'leased') && (
        <FormField id={`lienholder-${index}`} type="text" label={t('vehicle.lienholder')} value={vehicle.lienholder} onChange={(v) => upd('lienholder', v)} placeholder={t('vehicle.lienholderPlaceholder')} />
      )}
    </div>
  );
}

export default function VehiclesStep({ t, data, update, onNext, onBack }) {
  const [vehicleErrors, setVehicleErrors] = useState([]);

  useEffect(() => {
    if (!data.vehicles || data.vehicles.length === 0) {
      update('vehicles', [newVehicle()]);
    }
  }, []);

  const vehicles = data.vehicles || [];
  const updateVehicle = (i, v) => {
    const n = [...vehicles]; n[i] = v; update('vehicles', n);
    if (vehicleErrors[i] && Object.keys(vehicleErrors[i]).length > 0) {
      const ne = [...vehicleErrors]; ne[i] = {}; setVehicleErrors(ne);
    }
  };
  const addVehicle    = () => update('vehicles', [...vehicles, newVehicle()]);
  const removeVehicle = (i) => update('vehicles', vehicles.filter((_, idx) => idx !== i));

  const handleNext = () => {
    const allErrors = vehicles.map((v) => {
      const errs = {};
      if (!v.year)             errs.year        = t('common.required') || 'Required';
      if (!v.make)             errs.make        = t('common.required') || 'Required';
      if (!v.model)            errs.model       = t('common.required') || 'Required';
      if (!v.vin)              errs.vin         = t('common.required') || 'Required';
      else if (v.vin.length !== 17) errs.vin    = t('vehicle.vinError') || 'VIN must be 17 characters';
      if (!v.usage)            errs.usage       = t('common.required') || 'Required';
      if (!v.annualMiles)      errs.annualMiles = t('common.required') || 'Required';
      if (!v.ownership)        errs.ownership   = t('common.required') || 'Required';
      return errs;
    });
    if (vehicles.length === 0 || allErrors.some((e) => Object.keys(e).length > 0)) {
      setVehicleErrors(allErrors);
      setTimeout(() => document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setVehicleErrors([]);
    onNext();
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('vehicle.title')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('vehicle.subtitle')}</p>

      {vehicles.map((vehicle, i) => (
        <VehicleCard key={vehicle._id || i} index={i} vehicle={vehicle} errors={vehicleErrors[i] || {}} onChange={(v) => updateVehicle(i, v)} onRemove={() => removeVehicle(i)} canRemove={vehicles.length > 1} t={t} />
      ))}

      <button onClick={addVehicle} className="w-full py-2.5 rounded-xl border-2 border-dashed border-brand-300 text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-colors mb-6">
        {t('vehicle.addVehicle')}
      </button>

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
          ← {t('nav.back')}
        </button>
        <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm">
          {t('nav.next')} →
        </button>
      </div>
    </div>
  );
}
