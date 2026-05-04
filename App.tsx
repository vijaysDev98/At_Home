/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor="#fff"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Provider store={store}>
        <RootNavigation />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;