// index.js (your app's entry point)
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

import notifee, { EventType } from '@notifee/react-native';

// Register background handler BEFORE AppRegistry.registerComponent
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message received:', remoteMessage);

  const { data } = remoteMessage;

  if (data?.type === 'sync') {
    await performBackgroundSync();
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Notifee background event:', type, detail);
});

async function performBackgroundSync(): Promise<void> {
  console.log('Performing background sync...');
}

AppRegistry.registerComponent(appName, () => App);