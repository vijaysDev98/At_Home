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

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="#fff"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Provider store={store}>
        <RootNavigation />
        <Toast />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;