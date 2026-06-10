import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from './i18n';
import ProgressBar from './components/ProgressBar';
import LanguageStep from './components/steps/LanguageStep';
import ContactStep from './components/steps/ContactStep';
import VehiclesStep from './components/steps/VehiclesStep';
import DriversStep from './components/steps/DriversStep';
import HistoryStep from './components/steps/HistoryStep';
import CoverageStep from './components/steps/CoverageStep';
import SuccessStep from './components/steps/SuccessStep';

const INITIAL_DATA = {
  language: null,
  _hp: '', // honeypot — must stay empty; bots that fill it are silently dropped
  // Contact
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  maritalStatus: '',
  email: '',
  phone: '',
  state: '',
  zipCode: '',
  homeownerStatus: '',
  address: '',
  occupation: '',
  // Primary driver license
  licenseNumber: '',
  licenseState: '',
  licensePhotoName: '',
  licensePhotoData: '',
  // Vehicles (array managed in VehiclesStep)
  vehicles: [],
  // Drivers
  isOnlyDriver: null,
  additionalDrivers: [],
  // History
  hasViolations: null,
  violations: [],
  hasAccidents: null,
  accidents: [],
  currentlyInsured: null,
  currentInsurer: '',
  yearsInsured: '',
  // Coverage
  liabilityLimit: '',
  hasCollision: null,
  collisionDeductible: '',
  hasComprehensive: null,
  comprehensiveDeductible: '',
  additionalCoverages: [],
  additionalNotes: '',
};

const CONTACT_REQUIRED = ['firstName', 'lastName', 'dateOfBirth', 'maritalStatus', 'email', 'phone', 'address', 'state', 'zipCode', 'licenseNumber', 'licenseState', 'occupation'];

// Steps: 0=Language, 1=Contact, 2=Vehicles, 3=Drivers, 4=History, 5=Coverage, 6=Success
const TOTAL_STEPS = 5; // shown in progress bar (steps 1–5)

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const startedAt = useRef(Date.now());

  const { t } = useTranslation(data.language);

  // Auto-resize iframe height for WordPress embedding
  useEffect(() => {
    const send = () => {
      requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight;
        window.parent.postMessage({ type: 'iframeResize', height: h }, '*');
      });
    };
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [step]);

  const update = useCallback((field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) { const n = { ...prev }; delete n[field]; return n; }
      return prev;
    });
  }, []);

  const goToStep = (n) => {
    setErrors({});
    setSubmitError('');
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateContact = () => {
    const errs = {};
    for (const f of CONTACT_REQUIRED) {
      if (!data[f]) errs[f] = t('common.required');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = t('common.invalidEmail');
    }
    if (data.phone && String(data.phone).replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number';
    }
    if (data.zipCode && !/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
      errs.zipCode = 'Invalid ZIP code';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setTimeout(() => document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _elapsedMs: Date.now() - startedAt.current }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Server error');
      }
      goToStep(6);
    } catch (err) {
      setSubmitError(t('error.submit'));
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => { setData(INITIAL_DATA); setErrors({}); setSubmitError(''); setStep(0); };

  const showProgress = step >= 1 && step <= 5;
  const commonProps = { t, data, update, errors };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <img
              src="https://sovainsurance.com/wp-content/uploads/2025/07/Logo-Ocean-Pine-White-Background-2048x753.png"
              alt="Sova Insurance"
              className="h-8 w-auto rounded"
            />
            <p className="text-white/50 text-xs">Personal Auto Insurance Quote</p>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Honeypot — invisible to humans; bots that fill it are silently dropped */}
          <input
            type="text" name="website" value={data._hp}
            onChange={(e) => update('_hp', e.target.value)}
            autoComplete="off" tabIndex={-1} aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
          />

          {showProgress && <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} t={t} />}

          {step === 0 && (
            <LanguageStep onSelect={(lang) => { update('language', lang); setStep(1); }} />
          )}

          {step === 1 && (
            <ContactStep
              {...commonProps}
              onBack={() => setStep(0)}
              onNext={() => { if (validateContact()) goToStep(2); }}
            />
          )}

          {step === 2 && (
            <VehiclesStep
              {...commonProps}
              onBack={() => goToStep(1)}
              onNext={() => goToStep(3)}
            />
          )}

          {step === 3 && (
            <DriversStep
              {...commonProps}
              onBack={() => goToStep(2)}
              onNext={() => goToStep(4)}
            />
          )}

          {step === 4 && (
            <HistoryStep
              {...commonProps}
              onBack={() => goToStep(3)}
              onNext={() => goToStep(5)}
            />
          )}

          {step === 5 && (
            <CoverageStep
              {...commonProps}
              onBack={() => goToStep(4)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}

          {step === 6 && <SuccessStep t={t} data={data} onReset={reset} />}
        </div>

        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-400">Your information is secure and used only to prepare your quote.</p>
        </div>
      </div>
    </div>
  );
}
