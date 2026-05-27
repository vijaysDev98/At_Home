import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fr from './fr.json';

export type TranslationKeys = keyof typeof en;

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  // If no translation found for a key, return the key itself as-is
  parseMissingKeyHandler: (key: string) => key,
});

export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
};

export const i18nLocale = i18n;