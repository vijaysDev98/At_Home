import { getLocales } from 'react-native-localize';
import { Platform, NativeModules } from 'react-native';

/**
 * Automatically detects the device's preferred language.
 * If the device language is French, returns 'fr'; otherwise, defaults to English ('en').
 *
 * Supported languages:
 * - 'fr' (French)
 * - 'en' (English - default for English and all unsupported languages)
 */
export const getDeviceLanguage = (): 'en' | 'fr' => {
  try {
    const locales = getLocales();
    if (Array.isArray(locales) && locales.length > 0) {
      const primary = locales[0];
      const langCode = (primary?.languageCode || '').toLowerCase();
      const langTag = (primary?.languageTag || '').toLowerCase();
      if (langCode === 'fr' || langTag.startsWith('fr')) {
        return 'fr';
      }
      return 'en';
    }
  } catch (error) {
    console.warn('Could not detect language via react-native-localize:', error);
  }

  // Fallback via Platform / NativeModules if react-native-localize is unavailable
  try {
    let deviceLocale = '';
    if (Platform.OS === 'ios') {
      deviceLocale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        '';
    } else if (Platform.OS === 'android') {
      deviceLocale = NativeModules.I18nManager?.localeIdentifier || '';
    }
    if (!deviceLocale && typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale || '';
    }
    const normalized = (deviceLocale || '').toLowerCase();
    if (normalized.startsWith('fr')) {
      return 'fr';
    }
  } catch (e) {
    console.warn('Fallback language detection error:', e);
  }

  return 'en';
};
