const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English',    flag: '🇺🇸' },
  { code: 'es', label: 'Spanish',    native: 'Español',    flag: '🇪🇸' },
  { code: 'ru', label: 'Russian',    native: 'Русский',    flag: '🇷🇺' },
  { code: 'uk', label: 'Ukrainian',  native: 'Українська', flag: '🇺🇦' },
];

export default function LanguageStep({ onSelect }) {
  return (
    <div className="py-4 animate-fade-in">
      <div className="text-center mb-8">
        <p className="text-2xl font-bold text-gray-900 mb-2">Get a FREE Auto Insurance Quote</p>
        <p className="text-gray-500 text-sm">Please select your language to proceed</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {LANGUAGES.map(({ code, label, native, flag }) => (
          <button
            key={code}
            onClick={() => onSelect(code)}
            className="flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border-2 border-gray-100 bg-white hover:border-brand-500 hover:bg-brand-50 transition-all font-medium text-gray-700 hover:text-brand-800 shadow-sm"
          >
            <span className="text-3xl">{flag}</span>
            <span className="text-lg font-bold text-gray-900">{native}</span>
            {native !== label && <span className="text-xs text-gray-400">{label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
