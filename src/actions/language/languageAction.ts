import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from '../../redux/store';
import { setLanguage, setManualSelection, setLoading } from './languageSlice';
import { changeLanguage } from '../../localization/translatation';
import { syncMomentLocale } from '../../utils/languageHelper';
import { getDeviceLanguage } from '../../utils/deviceLanguage';
import { Storage } from '../../constant/storage';

const LANGUAGE_STORAGE_KEY = Storage.LANGUAGE_KEY || '@app_language';

/**
 * Fetches the application language.
 *
 * Requirements:
 * 1. If the user has manually selected a language previously (stored in LANGUAGE_STORAGE_KEY),
 *    always use the manually selected language and do not detect device language.
 * 2. If no manual preference has been saved, use automatic device-language detection:
 *    If the device language is French, use 'fr'; otherwise, default to English ('en').
 * 3. Keep automatic device detection transient (do NOT save to persistent storage),
 *    so automatic detection continues to reflect device language until the user explicitly saves a preference.
 */
export const fetchLanguage = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && (storedLanguage === 'fr' || storedLanguage === 'en')) {
      // Use saved manual preference
      changeLanguage(storedLanguage);
      syncMomentLocale(storedLanguage);
      dispatch(setLanguage(storedLanguage));
      dispatch(setManualSelection(true));
      return storedLanguage;
    } else {
      // No manual preference saved -> automatic device language detection
      const deviceLang = getDeviceLanguage();
      changeLanguage(deviceLang);
      syncMomentLocale(deviceLang);
      dispatch(setLanguage(deviceLang));
      dispatch(setManualSelection(false));
      return deviceLang;
    }
  } catch (error) {
    console.error('Error fetching language:', error);
    const fallbackLang = getDeviceLanguage();
    changeLanguage(fallbackLang);
    syncMomentLocale(fallbackLang);
    dispatch(setLanguage(fallbackLang));
    return fallbackLang;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Persistently saves and sets the user's manual language selection.
 * Once saved, subsequent app launches will honor this manual preference.
 */
export const updateLanguage = (language: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const lang = language === 'fr' ? 'fr' : 'en';
    changeLanguage(lang);
    syncMomentLocale(lang);
    dispatch(setLanguage(lang));
    dispatch(setManualSelection(true));
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    return true;
  } catch (error) {
    console.error('Error updating language:', error);
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};
