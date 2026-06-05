import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { Storage } from '../constant';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import store from '../redux/store';

export const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
};

export const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.log('Error getting FCM token:', error);
    console.log(error);
    console.log('FCM Token Error:', error);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13+ (API 33) requires explicit POST_NOTIFICATIONS permission
        const existingStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (!existingStatus) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message:
                'This app needs permission to send you notifications about your requests and updates.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            },
          );

          if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission denied');
            return false;
          }
        }
      }
      // Android < 13: POST_NOTIFICATIONS permission is granted by default.
      // Still call messaging().requestPermission() to ensure FCM is initialized.
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL ||
        authStatus === messaging.AuthorizationStatus.NOT_DETERMINED;

      if (enabled) {
        await getFcmToken();
      }
      return enabled;
    }

    // iOS — relies entirely on messaging().requestPermission()
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await getFcmToken();
    }
    return enabled;
  } catch (error) {
    console.log('Permission error:', error);
    return false;
  }
};

export const listenForegroundMessages = (): (() => void) => {
  // In foreground, FCM does NOT auto-show a notification — we must use Notifee
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground message received:', remoteMessage);

    const title =
      remoteMessage.data?.title ||
      remoteMessage.notification?.title ||
      'Notification';
    const body =
      remoteMessage.data?.message ||
      remoteMessage.notification?.body ||
      '';

    await notifee.displayNotification({
      title,
      body,
      data: remoteMessage.data,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
      },
    });
  });
};

// Guard against getInitialNotification firing more than once
let initialNotificationHandled = false;

export const listenBackgroundMessages = (): (() => void) => {
  // NOTE: setBackgroundMessageHandler is intentionally NOT here.
  // It must be registered in index.js at module level to work in
  // background and killed states. See index.js.

  // Handle notification TAP when app is in background
  const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
    handleNotificationTap(remoteMessage);
  });

  // Handle notification TAP when app was completely killed
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage && !initialNotificationHandled) {
        initialNotificationHandled = true;
        console.log('Notification opened from quit state:', remoteMessage);
        setTimeout(() => {
          handleNotificationTap(remoteMessage);
        }, 500);
      }
    });

  // Only onNotificationOpenedApp is unsubscribable
  return unsubscribe;
};

const handleNotificationTap = async () => {
  try {
    const token = await Storage.get(Storage.USER_TOKEN);
    const role = await Storage.get(Storage.USER_ROLE);

    console.log('Notification tap - token:', token, 'role:', role);

    if (token && role) {
      // User is logged in, navigate to appropriate notification screen
      if (role === 'serviceProvider') {
        // Reset to provider bottom tabs (replaces splash), then navigate to alerts tab
        NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);
        // Small delay to ensure bottom tabs are loaded, then navigate to alerts
        setTimeout(() => {
          NavigationService.navigate(SCREENS.PROVIDER_BOTTOM_TABS, {
            screen: 'Alerts',
          });
        }, 100);
      } else {
        // Reset to doctor bottom tabs (replaces splash), then navigate to notifications
        NavigationService.reset(SCREENS.DOCTOR_BOTTOM_TABS);
        // Small delay to ensure bottom tabs are loaded, then navigate to notifications
        setTimeout(() => {
          NavigationService.navigate(SCREENS.DOCTOR_NOTIFICATION);
        }, 100);
      }
    } else {
      // User is not logged in, just open the app to welcome screen
      NavigationService.reset(SCREENS.WELCOME);
    }
  } catch (error) {
    console.log('Error handling notification tap:', error);
    // Fallback to welcome screen
    NavigationService.reset(SCREENS.WELCOME);
  }
};
