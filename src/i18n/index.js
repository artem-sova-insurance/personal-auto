import en from './en';
import ru from './ru';
import uk from './uk';
import es from './es';

const translations = { en, ru, uk, es };

export function useTranslation(language) {
  const lang = language || 'en';
  const dict = translations[lang] || translations.en;

  const t = (key) => {
    const keys = key.split('.');
    let value = dict;
    for (const k of keys) value = value?.[k];
    if (value === undefined) {
      let fallback = translations.en;
      for (const k of keys) fallback = fallback?.[k];
      return fallback ?? key;
    }
    return value;
  };

  return { t };
}

export const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];
