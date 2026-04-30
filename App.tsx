/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigation from './src/navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    // <GestureHandlerRootView style={styles.container}>
    //   <BottomSheetModalProvider>
    //     <SafeAreaProvider>
    //       <StatusBar
    //         backgroundColor="#fff"
    //         barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    //       <RootNavigation />
    //     </SafeAreaProvider>
    //   </BottomSheetModalProvider>
    // </GestureHandlerRootView>
    <GestureHandlerRootView style={{ flex: 1 }}>
  <BottomSheetModalProvider>
    <SafeAreaProvider>
        <RootNavigation />
    </SafeAreaProvider>
  </BottomSheetModalProvider>
</GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});