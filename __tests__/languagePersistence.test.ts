import * as RNLocalize from 'react-native-localize';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceLanguage } from '../src/utils/deviceLanguage';
import { fetchLanguage, updateLanguage } from '../src/actions/language/languageAction';
import { Storage } from '../src/constant/storage';
import { changeLanguage, i18nLocale } from '../src/localization/translatation';
import moment from 'moment';

describe('Language Selection & Persistence', () => {
  let mockDispatch: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    mockDispatch = jest.fn();
  });

  describe('1. Device Language Detection (getDeviceLanguage)', () => {
    it('returns "fr" when device locale is French (languageCode: "fr")', () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'fr', languageTag: 'fr-FR', countryCode: 'FR', isRTL: false },
      ]);
      expect(getDeviceLanguage()).toBe('fr');
    });

    it('returns "fr" when device locale is Canadian French (languageTag: "fr-CA")', () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'fr', languageTag: 'fr-CA', countryCode: 'CA', isRTL: false },
      ]);
      expect(getDeviceLanguage()).toBe('fr');
    });

    it('returns "en" when device locale is English', () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en', languageTag: 'en-US', countryCode: 'US', isRTL: false },
      ]);
      expect(getDeviceLanguage()).toBe('en');
    });

    it('returns "en" when device locale is an unsupported language (e.g. Spanish, German)', () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'de', languageTag: 'de-DE', countryCode: 'DE', isRTL: false },
      ]);
      expect(getDeviceLanguage()).toBe('en');

      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'es', languageTag: 'es-ES', countryCode: 'ES', isRTL: false },
      ]);
      expect(getDeviceLanguage()).toBe('en');
    });

    it('defaults to "en" when getLocales returns empty array or throws', () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([]);
      expect(getDeviceLanguage()).toBe('en');

      (RNLocalize.getLocales as jest.Mock).mockImplementation(() => {
        throw new Error('Native module error');
      });
      expect(getDeviceLanguage()).toBe('en');
    });
  });

  describe('2. First App Launch (No manual preference saved)', () => {
    it('automatically detects French device language and sets app to "fr"', async () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'fr', languageTag: 'fr-FR', countryCode: 'FR', isRTL: false },
      ]);

      const result = await fetchLanguage()(mockDispatch);

      expect(result).toBe('fr');
      expect(i18nLocale.language).toBe('fr');
      expect(moment.locale()).toBe('fr');

      // Crucially: it should NOT have saved to persistent storage!
      const stored = await AsyncStorage.getItem(Storage.LANGUAGE_KEY);
      expect(stored).toBeNull();
    });

    it('automatically defaults to "en" on English device', async () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en', languageTag: 'en-US', countryCode: 'US', isRTL: false },
      ]);

      const result = await fetchLanguage()(mockDispatch);

      expect(result).toBe('en');
      expect(i18nLocale.language).toBe('en');
      expect(moment.locale()).toBe('en');

      const stored = await AsyncStorage.getItem(Storage.LANGUAGE_KEY);
      expect(stored).toBeNull();
    });

    it('automatically defaults to "en" on unsupported device language (e.g. Japanese)', async () => {
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'ja', languageTag: 'ja-JP', countryCode: 'JP', isRTL: false },
      ]);

      const result = await fetchLanguage()(mockDispatch);

      expect(result).toBe('en');
      expect(i18nLocale.language).toBe('en');

      const stored = await AsyncStorage.getItem(Storage.LANGUAGE_KEY);
      expect(stored).toBeNull();
    });
  });

  describe('3. Manual Language Selection & Persistence', () => {
    it('saves manual preference to storage when user manually switches to French', async () => {
      const success = await updateLanguage('fr')(mockDispatch);
      expect(success).toBe(true);

      const stored = await AsyncStorage.getItem(Storage.LANGUAGE_KEY);
      expect(stored).toBe('fr');
      expect(i18nLocale.language).toBe('fr');
      expect(moment.locale()).toBe('fr');
    });

    it('saves manual preference to storage when user manually switches to English', async () => {
      const success = await updateLanguage('en')(mockDispatch);
      expect(success).toBe(true);

      const stored = await AsyncStorage.getItem(Storage.LANGUAGE_KEY);
      expect(stored).toBe('en');
      expect(i18nLocale.language).toBe('en');
      expect(moment.locale()).toBe('en');
    });

    it('subsequent launches use manual French preference even if device language changes to English', async () => {
      // User manually selected French
      await updateLanguage('fr')(mockDispatch);

      // Now device language is English
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'en', languageTag: 'en-US', countryCode: 'US', isRTL: false },
      ]);

      // App relaunches / re-fetches language
      const result = await fetchLanguage()(mockDispatch);

      expect(result).toBe('fr');
      expect(i18nLocale.language).toBe('fr');
      expect(moment.locale()).toBe('fr');
    });

    it('subsequent launches use manual English preference even if device language changes to French', async () => {
      // User manually selected English
      await updateLanguage('en')(mockDispatch);

      // Now device language is French
      (RNLocalize.getLocales as jest.Mock).mockReturnValue([
        { languageCode: 'fr', languageTag: 'fr-FR', countryCode: 'FR', isRTL: false },
      ]);

      // App relaunches / re-fetches language
      const result = await fetchLanguage()(mockDispatch);

      expect(result).toBe('en');
      expect(i18nLocale.language).toBe('en');
      expect(moment.locale()).toBe('en');
    });
  });

  describe('4. Storage.clear Preservation', () => {
    it('preserves user manual language preference across Storage.clear (e.g. logout)', async () => {
      await updateLanguage('fr')(mockDispatch);
      await Storage.save(Storage.USER_TOKEN, 'test-token');

      // Perform clear (e.g. on logout)
      await Storage.clear();

      // Auth token should be cleared
      const token = await Storage.get(Storage.USER_TOKEN);
      expect(token).toBeNull();

      // Language preference MUST remain preserved
      const savedLang = await Storage.get(Storage.LANGUAGE_KEY);
      expect(savedLang).toBe('fr');
    });
  });
});
