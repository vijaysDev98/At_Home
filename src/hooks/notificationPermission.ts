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
    messaging().onMessage(async remoteMessage => {
        console.log('Foreground message received:', remoteMessage);
        const title = remoteMessage.notification?.title ?? 'Notification';
        const body = remoteMessage.notification?.body ?? '';

        // Display notification using Notifee for consistent experience
        // await notifee.displayNotification({
        //     title,
        //     body,
        //     android: {
        //         channelId: 'default',
        //         pressAction: { id: 'default' },
        //         // Set importance to high to ensure it shows in foreground
        //         importance: AndroidImportance.HIGH,
        //     },
        // });
    });
};

export const listenBackgroundMessages = () => {
    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background message received:', remoteMessage);

        // Display notification when app is in background
        const title = remoteMessage.notification?.title ?? 'Notification';
        const body = remoteMessage.notification?.body ?? '';

        // await notifee.displayNotification({
        //     title,
        //     body,
        //     android: {
        //         channelId: 'default',
        //         pressAction: { id: 'default' },
        //     },
        // });
    });

    // Handle notification press when app is in background or quit
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification pressed when app in background:', remoteMessage);
        handleNotificationTap();
    });

    // Handle notification press when app is completely closed
    messaging().getInitialNotification().then(remoteMessage => {
        console.log('Notification pressed when app was closed:', remoteMessage);
        if (remoteMessage) {
            handleNotificationTap();
        }
    });
};

const handleNotificationTap = async () => {
    try {
        const token = await Storage.get(Storage.USER_TOKEN);
        const role = await Storage.get(Storage.USER_ROLE);

        console.log("Notification tap - token:", token, "role:", role);

        if (token && role) {
            // User is logged in, navigate to appropriate notification screen
            if (role === 'serviceProvider') {
                // Reset to provider bottom tabs (replaces splash), then navigate to alerts tab
                NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);
                // Small delay to ensure bottom tabs are loaded, then navigate to alerts
                setTimeout(() => {
                    NavigationService.navigate(SCREENS.PROVIDER_BOTTOM_TABS, { screen: 'Alerts' });
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