/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
        <SafeAreaProvider>
          <StatusBar
            backgroundColor="#fff"
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigation />
        </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});