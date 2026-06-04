/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Toast from 'react-native-toast-message';
import { I18nextProvider } from 'react-i18next';
import messaging from '@react-native-firebase/messaging';
import { i18nLocale } from './src/localization/translatation';
import { useLanguageSync } from './src/hooks/useLanguageSync';
import {
  createNotificationChannel,
  listenForegroundMessages,
  listenBackgroundMessages,
  requestNotificationPermission,
} from './src/hooks/notificationPermission';
import { COLORS } from './src/utils';
const AppContent = () => {
  // Sync language between Redux and i18n
  useLanguageSync();

  return (
    <>
      <RootNavigation />
      <Toast />
    </>
  );
};

function App() {
  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined;

    const init = async () => {
      await createNotificationChannel();
      await requestNotificationPermission();

      unsubscribeForeground = listenForegroundMessages();
      listenBackgroundMessages();
    };

    init();

    return () => {
      unsubscribeForeground?.();
    };
  }, []);

  return (
    <I18nextProvider i18n={i18nLocale}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <StatusBar backgroundColor={COLORS.white} barStyle={'dark-content'} />
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default App;
