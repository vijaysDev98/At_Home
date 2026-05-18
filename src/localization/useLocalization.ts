import { useMemo } from 'react';
import { STRING } from '../constant';
import { i18nLocale } from './translatation';

type AppStringKey = keyof typeof STRING; // Keys of APP_STRING

export const useLocalization = () => {
  return useMemo(() => {
    const localizedStrings: Record<AppStringKey, string> = {} as Record<
      AppStringKey,
      string
    >;

    (Object.keys(STRING) as AppStringKey[]).forEach(key => {
      localizedStrings[key] = i18nLocale.t(STRING[key]);
    });

    return localizedStrings;
  }, []);
};
