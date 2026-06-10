import { useRef, useState } from 'react';
import DynamicForm from '../DynamicForm';
import FormField from '../FormField';
import { CONTACT_FIELDS } from '../../config/formConfig';
import { US_STATES } from '../../i18n';
import { readPhotoFile } from '../../utils/image';

const FL_FIRST = ['FL', ...US_STATES.filter((s) => s !== 'FL')];
const STATE_OPTIONS = FL_FIRST.map((s) => ({ value: s, label: s }));

export default function ContactStep({ t, data, update, errors, onNext, onBack }) {
  const fileRef = useRef(null);
  const [photoError, setPhotoError] = useState('');

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

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('sections.contact')}</h2>
      <p className="text-sm text-gray-500 mb-6">{t('contact.subtitle')}</p>

      <DynamicForm fields={CONTACT_FIELDS} data={data} update={update} errors={errors} t={t} />

      {/* Driver License Section */}
      <div className="border-t border-gray-100 pt-5 mt-2 mb-4">
        <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-4">{t('contact.licenseSection')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField
            id="licenseNumber" type="text" label={t('contact.licenseNumber')}
            value={data.licenseNumber} onChange={(v) => update('licenseNumber', v)}
            placeholder="D123-456-78-900-0" required
            error={errors.licenseNumber}
          />
          <FormField
            id="licenseState" type="select" label={t('contact.licenseState')}
            value={data.licenseState} onChange={(v) => update('licenseState', v)}
            options={STATE_OPTIONS} required
            error={errors.licenseState}
          />
        </div>

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

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          ← {t('nav.back')}
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors shadow-sm"
        >
          {t('nav.next')} →
        </button>
      </div>
    </div>
  );
}
