import FormField from './FormField';
import { US_STATES } from '../i18n';

const FL_FIRST = ['FL', ...US_STATES.filter((s) => s !== 'FL')];
const STATE_OPTIONS = FL_FIRST.map((s) => ({ value: s, label: s }));

function evalCondition(cond, data) {
  if (!cond || cond === true) return true;
  const { field, equals, notEquals, includesInSet } = cond;
  const val = data[field];
  if (equals        !== undefined) return val === equals;
  if (notEquals     !== undefined) return val !== notEquals;
  if (includesInSet !== undefined) return includesInSet.includes(val);
  return true;
}

function resolveOptions(field, t) {
  if (field.id === 'state' || field.id === 'licenseState') return STATE_OPTIONS;
  if (!field.options) return [];
  return field.options.map((o) => ({
    value: o.value,
    label: (o.labelKey ? t(o.labelKey) : null) || o.label,
  }));
}

function RenderField({ field, data, update, errors, t }) {
  if (field.enabled === false) return null;
  if (!evalCondition(field.showWhen, data)) return null;

  const label    = (field.labelKey ? t(field.labelKey) : null) || field.label;
  const helpText = (field.helpTextKey ? t(field.helpTextKey) : null) || field.helpText;
  const options  = resolveOptions(field, t);

  return (
    <FormField
      label={label}
      id={field.id}
      type={field.type}
      value={data[field.id]}
      onChange={(v) => update(field.id, v)}
      options={options}
      placeholder={field.placeholder}
      required={field.required}
      helpText={helpText}
      error={errors?.[field.id]}
    />
  );
}

export default function DynamicForm({ fields, data, update, errors = {}, t }) {
  return (
    <div>
      {fields.map((field) => {
        if (field._section) {
          const label = (field.labelKey ? t(field.labelKey) : null) || field.label;
          return (
            <h3 key={field._section} className="text-sm font-semibold text-brand-800 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 mt-6">
              {label}
            </h3>
          );
        }

        if (field.type === '_grid') {
          if (!evalCondition(field.showWhen, data)) return null;
          return (
            <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              {field.fields.map((sub) => (
                <RenderField key={sub.id} field={sub} data={data} update={update} errors={errors} t={t} />
              ))}
            </div>
          );
        }

        return <RenderField key={field.id} field={field} data={data} update={update} errors={errors} t={t} />;
      })}
    </div>
  );
}
