import moment, { lang } from 'moment';
import store from '../redux/store';

/**
 * Get the current language from Redux store
 * @returns {string} Current language code ('en' or 'fr')
 */
export const getCurrentLanguage = (): string => {
  const state = store.getState();
  const currentLanguage = (state as any)?.language?.currentLanguage || 'en';
  return currentLanguage;
};

export const syncMomentLocale = (language: string) => {
  moment.locale(language === 'fr' ? 'fr' : 'en');
};

/**
 * Get language parameter for API calls
 * @returns {string} Language parameter value
 */
export const getLanguageParam = (): string => {
  return getCurrentLanguage();
};
