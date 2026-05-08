export default function FormField({ label, id, type = 'text', value, onChange, options, placeholder, required, helpText, error, className = '' }) {
  const base = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors bg-white';
  const errCls = 'border-red-400 focus:ring-red-400 focus:border-red-400';
  const cls = `${base} ${error ? errCls : ''} ${className}`;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === 'select' && (
        <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} className={cls} data-error={error ? true : undefined}>
          <option value="">{placeholder || '— Select —'}</option>
          {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}

      {type === 'radio' && (
        <div className="flex flex-wrap gap-2 mt-1" data-error={error ? true : undefined}>
          {options?.map((o) => (
            <label key={o.value} className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-all ${value === o.value ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:bg-brand-50'}`}>
              <input type="radio" name={id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      )}

      {type === 'checkbox-group' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {options?.map((o) => {
            const checked = Array.isArray(value) && value.includes(o.value);
            return (
              <label key={o.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm transition-all ${checked ? 'bg-brand-50 border-brand-600 text-brand-900' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400'}`}>
                <input type="checkbox" checked={checked} onChange={() => { const cur = Array.isArray(value) ? value : []; onChange(checked ? cur.filter((v) => v !== o.value) : [...cur, o.value]); }} className="accent-brand-600 w-4 h-4 flex-shrink-0" />
                {o.label}
              </label>
            );
          })}
        </div>
      )}

      {type === 'textarea' && (
        <textarea id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-y`} data-error={error ? true : undefined} />
      )}

      {['text', 'email', 'tel', 'number', 'date'].includes(type) && (
        <input id={id} type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} data-error={error ? true : undefined} />
      )}

      {helpText && !error && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
