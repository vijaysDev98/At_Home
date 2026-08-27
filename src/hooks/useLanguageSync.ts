import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchLanguage } from '../actions/language/languageAction';
import { changeLanguage } from '../localization/translatation';
import { syncMomentLocale } from '../utils/languageHelper';

export const useLanguageSync = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  useEffect(() => {
    // Fetch stored language on mount
    dispatch(fetchLanguage());
  }, [dispatch]);

  useEffect(() => {
    // Sync i18n language with Redux language state
    if (currentLanguage) {
      changeLanguage(currentLanguage);
      syncMomentLocale(currentLanguage);
    }
  }, [currentLanguage]);

  return { currentLanguage };
};
