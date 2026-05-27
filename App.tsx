/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Toast from 'react-native-toast-message';
import { I18nextProvider } from 'react-i18next';
import { i18nLocale } from './src/localization/translatation';
import { useLanguageSync } from './src/hooks/useLanguageSync';
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
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <I18nextProvider i18n={i18nLocale}>
      <SafeAreaProvider>
        <StatusBar
          backgroundColor="#fff"
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default App;
