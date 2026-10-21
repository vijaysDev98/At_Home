import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchLanguage } from '../actions/language/languageAction';
import { changeLanguage } from '../localization/translatation';
import { syncMomentLocale } from '../utils/languageHelper';

export const useLanguageSync = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLanguage, isManualSelection } = useSelector(
    (state: RootState) => state.language,
  );

  useEffect(() => {
    // Fetch stored manual language or detect device language on mount
    dispatch(fetchLanguage());
  }, [dispatch]);

  useEffect(() => {
    // When returning to foreground, if no manual preference was saved, re-check device language
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active' && !isManualSelection) {
          dispatch(fetchLanguage());
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [dispatch, isManualSelection]);

  useEffect(() => {
    // Sync i18n language with Redux language state
    if (currentLanguage) {
      changeLanguage(currentLanguage);
      syncMomentLocale(currentLanguage);
    }
  }, [currentLanguage]);

  return { currentLanguage };
};
