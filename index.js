/**
 * @format
 */
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

// ─── Background / Killed State Handler ────────────────────────────────────────
// MUST be registered here at module level (outside React) to work when the app
// is in background or completely killed.
//
// IMPORTANT DUPLICATION RULE:
//   • If the FCM payload has a "notification" block → FCM auto-displays it.
//     Do NOT call notifee.displayNotification here or you'll get duplicates.
//     Use setBackgroundMessageHandler only for silent data processing (badge, cache).
//
//   • If the FCM payload has ONLY a "data" block (data-only / silent push) →
//     FCM will NOT auto-display anything. You MUST call notifee.displayNotification.
//
// To stop getting duplicate/blank notifications, ask your backend to send
// data-only payloads (remove the "notification" key). That gives you full
// control over how the notification looks via Notifee on all platforms.
// ──────────────────────────────────────────────────────────────────────────────
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background/killed message received:', remoteMessage);

  // NOTE: If the FCM payload contains a "notification" block, Android FCM SDK
  // will ALSO auto-display a plain system notification (the "blank" one).
  // This cannot be suppressed from JS — it requires the backend to send
  // data-only messages (remove the "notification" key from the payload).
  //
  // Once the backend sends data-only, this will be the only notification shown.

  const title =
    remoteMessage.data?.title ||
    remoteMessage.notification?.title ||
    'Notification';
  const body =
    remoteMessage.data?.message || remoteMessage.notification?.body || '';

  // Ensure channel exists (safe to call multiple times)
  //   await notifee.createChannel({
  //     id: 'default',
  //     name: 'Default Channel',
  //     importance: AndroidImportance.HIGH,
  //   });

  //   await notifee.displayNotification({
  //     title,
  //     body,
  //     data: remoteMessage.data,
  //     android: {
  //       channelId: 'default',
  //       importance: AndroidImportance.HIGH,
  //       pressAction: { id: 'default' },
  //     },
  //   });
});

AppRegistry.registerComponent(appName, () => App);
