import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from '../../redux/store';
import { setLanguage, setLoading } from './languageSlice';
import { changeLanguage } from '../../localization/translatation';
import { syncMomentLocale } from '../../utils/languageHelper';

const LANGUAGE_STORAGE_KEY = '@app_language';

export const fetchLanguage = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      changeLanguage(storedLanguage);
      syncMomentLocale(storedLanguage);
      dispatch(setLanguage(storedLanguage));
    }
  } catch (error) {
    console.error('Error fetching language:', error);
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateLanguage = (language: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    changeLanguage(language);
    syncMomentLocale(language);
    dispatch(setLanguage(language));
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch (error) {
    console.error('Error updating language:', error);
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};
