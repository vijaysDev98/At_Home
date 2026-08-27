import moment from 'moment';
import 'moment/locale/fr';
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
  const lang = language === 'fr' ? 'fr' : 'en';
  moment.locale(lang);
};

/**
 * Formats a date string or Date object with localized moment formatting
 * @param date date string or Date object
 * @param formatStr moment format string, defaults to 'DD MMM YYYY'
 * @param explicitLang optional language code
 * @returns formatted date string
 */
export const formatLocalizedDate = (
  date?: string | Date | null,
  formatStr: string = 'DD MMM YYYY',
  explicitLang?: string,
): string => {
  if (!date) return '';
  const lang = explicitLang || getCurrentLanguage();
  return moment(date).locale(lang === 'fr' ? 'fr' : 'en').format(formatStr);
};

/**
 * Get language parameter for API calls
 * @returns {string} Language parameter value
 */
export const getLanguageParam = (): string => {
  return getCurrentLanguage();
};
