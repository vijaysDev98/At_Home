// index.js (your app's entry point)
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Register background handler BEFORE AppRegistry.registerComponent
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message received:', remoteMessage);

  // Perform any background processing here
  // Note: You have limited time to process the message

  const { data } = remoteMessage;

  if (data?.type === 'sync') {
    // Trigger a background sync
    await performBackgroundSync();
  }
});

async function performBackgroundSync(): Promise<void> {
  // Implement your sync logic
  console.log('Performing background sync...');
}

AppRegistry.registerComponent(appName, () => App);