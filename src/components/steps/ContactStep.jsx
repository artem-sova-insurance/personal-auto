import { useEffect, useRef, useState } from 'react';
import DynamicForm from '../DynamicForm';
import FormField from '../FormField';
import { CONTACT_FIELDS } from '../../config/formConfig';
import { US_STATES } from '../../i18n';
import { readPhotoFile } from '../../utils/image';

const FL_FIRST = ['FL', ...US_STATES.filter((s) => s !== 'FL')];
const STATE_OPTIONS = FL_FIRST.map((s) => ({ value: s, label: s }));

const LICENSE_TYPE_OPTIONS = [
  { value: 'us',      label: 'U.S. driver license' },
  { value: 'foreign', label: 'Foreign driver license' },
  { value: 'permit',  label: "Learner's permit" },
];

const YEARS_US_LICENSED_OPTIONS = [
  { value: 'under1', label: 'Less than 1 year' },
  { value: '1to2',   label: '1–2 years' },
  { value: '3to5',   label: '3–5 years' },
  { value: 'over5',  label: 'More than 5 years' },
];

// This step used to be one 23-field screen, which is where most people gave up.
// It is now five short parts. `ids` are the CONTACT_FIELDS entries each part
// renders (grid containers by their own id); `owns` is every data key the part is
// responsible for, used to jump back to the right part when the final gate fails.
const PARTS = [
  {
    key: 'about', titleKey: 'contact.partAbout',
    ids: ['nameGrid', 'dateOfBirth', 'gender', 'maritalStatus'],
    owns: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus'],
  },
  {
    key: 'reach', titleKey: 'contact.partReach',
    ids: ['emailPhoneGrid', 'preferredContact', 'bestTimeToContact'],
    owns: ['email', 'phone', 'preferredContact', 'bestTimeToContact'],
  },
  {
    key: 'home', titleKey: 'contact.partHome',
    ids: ['address', 'cityStateGrid', 'zipCode', 'yearsAtAddress', 'priorAddress', 'priorCityStateGrid', 'priorZipCode', 'homeownerStatus'],
    owns: ['address', 'city', 'state', 'zipCode', 'yearsAtAddress', 'priorAddress', 'priorCity', 'priorState', 'priorZipCode', 'homeownerStatus'],
  },
  {
    key: 'work', titleKey: 'contact.partWork',
    ids: ['occupation', 'industry', 'education', 'militaryStatus'],
    owns: ['occupation', 'industry', 'education', 'militaryStatus'],
  },
  {
    key: 'license', titleKey: 'contact.licenseSection',
    ids: [],
    owns: ['licenseNumber', 'licenseState', 'licenseType', 'ageLicensed', 'yearsLicensedUS', 'defensiveDriving', 'goodStudent'],
  },
];

// Mirrors App.validateContact, but only for the part on screen, so people are
// told about a problem on the screen where they can still see the field.
function validatePart(index, data, t) {
  const e = {};
  const required = (...ids) => ids.forEach((f) => { if (!data[f]) e[f] = t('common.required'); });

  if (index === 0) required('firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus');

  if (index === 1) {
    required('email', 'phone');
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = t('common.invalidEmail');
    if (data.phone && String(data.phone).replace(/\D/g, '').length < 10) e.phone = 'Please enter a valid 10-digit phone number';
  }

  if (index === 2) {
    required('address', 'city', 'state', 'zipCode', 'yearsAtAddress');
    if (['under1', '1to2'].includes(data.yearsAtAddress)) required('priorAddress', 'priorCity', 'priorState', 'priorZipCode');
    if (data.zipCode && !/^\d{5}(-\d{4})?$/.test(data.zipCode)) e.zipCode = 'Invalid ZIP code';
  }

  if (index === 3) required('occupation', 'industry', 'education', 'militaryStatus');

  if (index === 4) {
    required('licenseNumber', 'licenseState', 'licenseType', 'ageLicensed');
    if (data.licenseType === 'foreign' && !data.yearsLicensedUS) e.yearsLicensedUS = t('common.required');
  }

  return e;
}

function getAge(dob) {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

// `part` lives in App so stepping forward and pressing Back returns to the last
// part of this step instead of restarting it.
export default function ContactStep({ t, data, update, errors, onNext, onBack, part = 0, setPart = () => {} }) {
  const fileRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const [partErrors, setPartErrors] = useState({});

  const yesNo = [{ value: 'yes', label: t('common.yes') }, { value: 'no', label: t('common.no') }];
  const age = getAge(data.dateOfBirth);
  const isYoung = age !== null && age < 25;

  // Clamped: an out-of-range index would otherwise blank the whole form.
  const safePart = Math.min(Math.max(Number(part) || 0, 0), PARTS.length - 1);
  const current = PARTS[safePart];
  const shown = { ...errors, ...partErrors };
  const err = (field) => shown[field];

  // The final gate in App re-checks every part. If it rejects a field from an
  // earlier part, move back to it so the message isn't on an invisible screen.
  useEffect(() => {
    const keys = Object.keys(errors || {});
    if (keys.length === 0) return;
    const target = PARTS.findIndex((p) => p.owns.some((f) => keys.includes(f)));
    if (target >= 0 && target !== safePart) setPart(target);
  }, [errors]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each part is a new screen. Ask the WordPress parent to scroll up, since the
  // iframe is sized to its content and cannot scroll the page itself.
  const toTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try { window.parent.postMessage({ type: 'formScrollTop' }, '*'); } catch { /* not embedded */ }
  };

  const upd = (field, value) => {
    setPartErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    update(field, value);
  };

  const handleNext = () => {
    const found = validatePart(safePart, data, t);
    if (Object.keys(found).length > 0) {
      setPartErrors(found);
      setTimeout(() => document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    setPartErrors({});
    if (safePart < PARTS.length - 1) { setPart(safePart + 1); toTop(); return; }
    onNext();
  };

  const handleBack = () => {
    if (safePart > 0) { setPartErrors({}); setPart(safePart - 1); toTop(); return; }
    onBack();
  };

  const handlePhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoError('');
    try {
      const dataUrl = await readPhotoFile(f);
      update('licensePhotoName', f.name);
      update('licensePhotoData', dataUrl);
    } catch {
      setPhotoError('This photo is too large. Please use an image under 3 MB.');
    }
  };

  const partFields = CONTACT_FIELDS.filter((f) => current.ids.includes(f.id));

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="text-xl font-bold text-gray-900">{t(current.titleKey)}</h2>
        <span className="text-xs font-semibold text-brand-700 whitespace-nowrap">
          {safePart + 1} / {PARTS.length}
        </span>
      </div>
      <div className="flex gap-1 mb-5" aria-hidden="true">
        {PARTS.map((p, i) => (
          <span key={p.key} className={`h-1 flex-1 rounded-full transition-colors ${i <= safePart ? 'bg-brand-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      {safePart === 0 && <p className="text-sm text-gray-500 mb-5">{t('contact.subtitle')}</p>}

      {partFields.length > 0 && (
        <DynamicForm fields={partFields} data={data} update={upd} errors={shown} t={t} />
      )}

      {current.key === 'license' && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <FormField
              id="licenseNumber" type="text" label={t('contact.licenseNumber')}
              value={data.licenseNumber} onChange={(v) => upd('licenseNumber', v)}
              placeholder="D123-456-78-900-0" required
              error={err('licenseNumber')}
            />
            <FormField
              id="licenseState" type="select" label={t('contact.licenseState')}
              value={data.licenseState} onChange={(v) => upd('licenseState', v)}
              options={STATE_OPTIONS} required
              error={err('licenseState')}
            />
            <FormField
              id="ageLicensed" type="number" label={t('contact.ageLicensed')}
              value={data.ageLicensed} onChange={(v) => upd('ageLicensed', v)}
              placeholder="16" min="14" max="100" required
              error={err('ageLicensed')}
            />
            <FormField
              id="licenseType" type="select" label={t('contact.licenseType')}
              value={data.licenseType} onChange={(v) => upd('licenseType', v)}
              options={LICENSE_TYPE_OPTIONS} required
              error={err('licenseType')}
            />
          </div>

          {data.licenseType === 'foreign' && (
            <FormField
              id="yearsLicensedUS" type="select" label={t('contact.yearsLicensedUS')}
              value={data.yearsLicensedUS} onChange={(v) => upd('yearsLicensedUS', v)}
              options={YEARS_US_LICENSED_OPTIONS} required
              helpText={t('contact.yearsLicensedUSHint')}
              error={err('yearsLicensedUS')}
            />
          )}

          <FormField
            id="defensiveDriving" type="radio" label={t('contact.defensiveDriving')}
            value={data.defensiveDriving} onChange={(v) => upd('defensiveDriving', v)}
            options={yesNo} helpText={t('contact.defensiveDrivingHint')}
            error={err('defensiveDriving')}
          />

          {isYoung && (
            <FormField
              id="goodStudent" type="radio" label={t('contact.goodStudent')}
              value={data.goodStudent} onChange={(v) => upd('goodStudent', v)}
              options={yesNo} helpText={t('contact.goodStudentHint')}
              error={err('goodStudent')}
            />
          )}

          {/* License photo upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('contact.licensePhoto')} <span className="text-xs text-gray-400 font-normal ml-1">({t('contact.licensePhotoOptional')})</span>
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-3 border-2 border-dashed border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
            >
              <span className="text-2xl">📷</span>
              <div>
                {data.licensePhotoName ? (
                  <p className="text-sm font-semibold text-brand-700">{data.licensePhotoName}</p>
                ) : (
                  <p className="text-sm text-gray-500">{t('contact.licensePhotoHint')}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{t('contact.licensePhotoSub')}</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            {photoError && <p className="mt-1.5 text-xs text-red-600">{photoError}</p>}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleBack}
          className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
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
