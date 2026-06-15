import { Storage } from '../constant';
import { API } from '../api';
import messaging from '@react-native-firebase/messaging';

/**
 * Upload FCM token to backend
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const uploadFcmToken = async (token?: string): Promise<boolean> => {
  try {
    // Get fresh FCM token from Firebase
    const fcmToken = token || (await messaging().getToken());

    if (!fcmToken) {
      console.log('No FCM token found');
      return false;
    }

    // Store the token locally
    await Storage.save(Storage.FCM_TOKEN_KEY, fcmToken);

    const response: any = await API.Instance.post(API.API_ROUTES.updateFcm, {
      fcmToken: fcmToken,
    });

    if (response?.status && response?.code === 200) {
      console.log('FCM token uploaded successfully');
      return true;
    } else {
      console.log('FCM token upload failed with status:', response?.code);
      return false;
    }
  } catch (error) {
    console.log('FCM token upload error:', error);
    return false;
  }
};
