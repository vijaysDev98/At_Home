/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  StatusBar,
  useColorScheme,
} from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Toast from 'react-native-toast-message';
import { I18nextProvider } from 'react-i18next';
import { i18nLocale } from './src/localization/translatation';
import { useLanguageSync } from './src/hooks/useLanguageSync';
import {
  requestNotificationPermission,
  setupForegroundHandler,
  setupNotificationOpenHandler,
  handleInitialNotification,
  setupTokenRefreshListener,
} from './src/hooks/notificationPermission';
import { createNotificationChannels } from './src/services/notificationChannels';
import { COLORS } from './src/utils';
import { toastConfig } from './src/constant/toastConfig';
import notifee, { AndroidImportance } from '@notifee/react-native';

const AppContent = () => {
  // Sync language between Redux and i18n
  useLanguageSync();

  return (
    <>
      <RootNavigation />
      <Toast config={toastConfig} />
    </>
  );
};

function App() {
  useEffect(() => {
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeBackground: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const init = async () => {
      // Create notification channels for Android
      await createNotificationChannels();

      // Request notification permissions
      await requestNotificationPermission();

      // Setup foreground message handler
      unsubscribeForeground = setupForegroundHandler();

      // Setup background notification open handler
      unsubscribeBackground = setupNotificationOpenHandler();

      // Setup token refresh listener
      unsubscribeTokenRefresh = setupTokenRefreshListener();

      // Handle initial notification (when app opened from quit state)
      await handleInitialNotification();
    };

    init();

    // Cleanup listeners on unmount to prevent duplicates
    return () => {
      unsubscribeForeground?.();
      unsubscribeBackground?.();
      unsubscribeTokenRefresh?.();
    };
  }, []);

  useEffect(() => {
    const clearBadge = async () => {
      try {
        await notifee.setBadgeCount(0);
      } catch (error) {
        console.error('Failed to clear badge count:', error);
      }
    };

    // Clear on app launch
    clearBadge();

    // Clear whenever app becomes active
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          clearBadge();
        }
      },
    );

    return () => {
      subscription.remove();
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
