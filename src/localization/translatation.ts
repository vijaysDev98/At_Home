import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/fr';
import en from './en.json';
import fr from './fr.json';
import { getDeviceLanguage } from '../utils/deviceLanguage';

export type TranslationKeys = keyof typeof en;

const initialDeviceLang = getDeviceLanguage();

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialDeviceLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  // If no translation found for a key, return the key itself as-is
  parseMissingKeyHandler: (key: string) => key,
});

moment.locale(initialDeviceLang);

export const changeLanguage = (language: string) => {
  const lang = language === 'fr' ? 'fr' : 'en';
  i18n.changeLanguage(lang);
  moment.locale(lang);
};

export const i18nLocale = i18n;