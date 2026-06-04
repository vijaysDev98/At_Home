import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Storage } from '../constant';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';

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
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
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

export const listenForegroundMessages = () => {
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground message received:', remoteMessage);

    await notifee.displayNotification({
      title:
        remoteMessage.data?.title ||
        remoteMessage.notification?.title ||
        'Notification',
      body:
        remoteMessage.data?.message || remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      android: {
        channelId: 'default',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  });
};

export const listenBackgroundMessages = () => {
  // Background -> App opened from notification
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);

    handleNotificationTap(remoteMessage);
  });

  // App killed -> Opened from notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification opened from quit state:', remoteMessage);

        handleNotificationTap(remoteMessage);
      }
    });

  // Foreground Notifee notification press
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      console.log('Foreground notification pressed');

      handleNotificationTap({
        data: detail.notification?.data,
      });
    }
  });
};

// Required for data processing in background.
// DO NOT display notification here because FCM already does it.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);
});

const handleNotificationTap = async (remoteMessage?: any) => {
  try {
    const token = await Storage.get(Storage.USER_TOKEN);
    const role = await Storage.get(Storage.USER_ROLE);

    console.log('Notification tap data:', remoteMessage?.data);
    console.log('Notification tap - token:', token, 'role:', role);

    if (token && role) {
      if (role === 'serviceProvider') {
        NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);

        setTimeout(() => {
          NavigationService.navigate(SCREENS.PROVIDER_BOTTOM_TABS, {
            screen: 'Alerts',
          });
        }, 300);
      } else {
        NavigationService.reset(SCREENS.DOCTOR_BOTTOM_TABS);

        setTimeout(() => {
          NavigationService.navigate(SCREENS.DOCTOR_NOTIFICATION);
        }, 300);
      }
    } else {
      NavigationService.reset(SCREENS.WELCOME);
    }
  } catch (error) {
    console.log('Error handling notification tap:', error);
    NavigationService.reset(SCREENS.WELCOME);
  }
};
