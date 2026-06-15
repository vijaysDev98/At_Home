import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { Storage } from '../constant';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { createNotificationChannels } from '../services/notificationChannels';
import { uploadFcmToken } from '../utils/fcmTokenHelper';
import { ROLES } from '../constant/getRole';

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
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

export const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

// Foreground handler - using Notifee for better UX
export function setupForegroundHandler(): () => void {
  const unsubscribe = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground message received:', remoteMessage);

      const { notification, data, messageId } = remoteMessage;

      if (notification) {
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        // Display the notification
        await notifee.displayNotification({
          id: messageId,
          title: notification.title,
          body: notification.body,
          data: data,
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
          ios: {
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
        });
      }
    }
  );

  return unsubscribe;
}

// Guard against getInitialNotification firing more than once
let initialNotificationHandled = false;

// Background notification open handler
export function setupNotificationOpenHandler(): () => void {
  // Handle notification opened from background state
  const unsubscribe = messaging().onNotificationOpenedApp(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('App opened from background by notification:', remoteMessage);
      handleNotificationTap();
    }
  );

  return unsubscribe;
}

// Handle notification when app is opened from quit state
export async function handleInitialNotification(): Promise<void> {
  const remoteMessage = await messaging().getInitialNotification();

  if (remoteMessage && !initialNotificationHandled) {
    initialNotificationHandled = true;
    console.log('App opened from quit state by notification:', remoteMessage);
    handleNotificationTap();
  }
}

const handleNotificationTap = async () => {
  try {
    const token = await Storage.get(Storage.USER_TOKEN);
    const role = await Storage.get(Storage.USER_ROLE);

    if (token && role) {
      // User is logged in, navigate to appropriate notification screen
      if (role === ROLES.PROVIDER) {
        // Reset to provider bottom tabs (replaces splash), then navigate to alerts tab
        NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);
        // Small delay to ensure bottom tabs are loaded, then navigate to alerts
        setTimeout(() => {
          NavigationService.navigate(SCREENS.ALERTS);
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

// Token refresh listener
export function setupTokenRefreshListener(): () => void {
  const unsubscribe = messaging().onTokenRefresh(token => {
    uploadFcmToken(token);
    // Send token to backend if needed
  });

  return unsubscribe;
}

