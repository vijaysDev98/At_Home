import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { Storage } from '../constant';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { createNotificationChannels } from '../services/notificationChannels';
import { uploadFcmToken } from '../utils/fcmTokenHelper';
import { ROLES } from '../constant/getRole';
import store from '../redux/store';
import { showNotificationOverlay } from '../actions/common/notificationOverlaySlice';
import {
  resolveOverlayKey,
  extractNotificationInfo,
} from '../constant/notificationOverlayConfig';
import {
  navigateFromNotification,
  setPendingNotification,
} from '../utils/notificationRouter';

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

    // Persist so login can register the device even after logout clears storage,
    // or when onTokenRefresh never fires because the token is already stable.
    if (token) {
      await Storage.save(Storage.FCM_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

// Foreground handler - displays rich action overlay for supported types, otherwise Notifee
export function setupForegroundHandler(): () => void {
  const unsubscribe = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      console.log(
        'Foreground message DATA:',
        JSON.stringify(remoteMessage?.data, null, 2),
      );
      console.log(
        'Foreground message NOTIFICATION:',
        JSON.stringify(remoteMessage?.notification, null, 2),
      );

      const { notification, data, messageId } = remoteMessage;

      // Custom animated action overlays are strictly for doctors
      const state = store.getState();
      const userRoles =
        state.profile?.profileData?.roles ||
        state.login?.userData?.roles ||
        [];
      const storedRole = await Storage.get(Storage.USER_ROLE);

      const isDoctor =
        userRoles.includes(ROLES.DOCTOR) ||
        userRoles.includes('doctor') ||
        storedRole === ROLES.DOCTOR ||
        storedRole === 'doctor';

      // Extract parsed info from notification data payload
      const info = extractNotificationInfo(data);
      const overlayKey = resolveOverlayKey(data);
      console.log(
        'Resolved overlayKey:',
        overlayKey,
        'Extracted info:',
        info,
        'isDoctor:',
        isDoctor,
      );

      if (overlayKey && isDoctor) {
        store.dispatch(
          showNotificationOverlay({
            type: overlayKey,
            title: notification?.title || info.type,
            message: notification?.body || '',
            payload: {
              requestId: info.requestId,
              formId: info.formId,
              patientName: info.patientName,
              referenceId: (data as any)?.referenceId || info.requestId,
              referenceType: (data as any)?.referenceType,
              submitForReview: info.isSubmitForReview,
              metadata: info.metadata,
            },
          }),
        );
        return;
      }

      const notifTitle = notification?.title || (data as any)?.title;
      const notifBody =
        notification?.body ||
        (data as any)?.message ||
        (data as any)?.body;

      if (notifTitle || notifBody) {
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        // Display the notification
        await notifee.displayNotification({
          id: messageId,
          title: notifTitle,
          body: notifBody,
          data: data,
          android: {
            channelId,
            importance: AndroidImportance.HIGH,
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
    },
  );

  return unsubscribe;
}

// Guard against getInitialNotification firing more than once
let initialNotificationHandled = false;

// Background and foreground banner notification open handler
export function setupNotificationOpenHandler(): () => void {
  // 1. Handle notification opened from background state via Firebase
  const unsubscribeMessaging = messaging().onNotificationOpenedApp(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('App opened from background by Firebase notification:', remoteMessage);
      navigateFromNotification(remoteMessage);
    },
  );

  // 2. Handle foreground notification press via Notifee
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification) {
      console.log('Notifee notification pressed in foreground:', detail.notification);
      navigateFromNotification(detail.notification);
    }
  });

  return () => {
    unsubscribeMessaging();
    unsubscribeNotifee();
  };
}

// Handle notification when app is opened from quit state
export async function handleInitialNotification(): Promise<void> {
  if (initialNotificationHandled) return;

  try {
    // Check Firebase initial notification
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      initialNotificationHandled = true;
      console.log('App opened from quit state by Firebase notification:', remoteMessage);
      setPendingNotification(remoteMessage);
      return;
    }

    // Check Notifee initial notification (e.g. on Android / iOS)
    const notifeeInitial = await notifee.getInitialNotification();
    if (notifeeInitial?.notification) {
      initialNotificationHandled = true;
      console.log('App opened from quit state by Notifee notification:', notifeeInitial.notification);
      setPendingNotification(notifeeInitial.notification);
      return;
    }
  } catch (error) {
    console.log('Error checking initial notification:', error);
  }
}

// Token refresh listener
export function setupTokenRefreshListener(): () => void {
  const unsubscribe = messaging().onTokenRefresh(token => {
    uploadFcmToken(token);
    // Send token to backend if needed
  });

  return unsubscribe;
}
