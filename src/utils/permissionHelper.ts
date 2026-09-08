import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import i18next from 'i18next';
import { STRING } from '../constant/strings';
import { ImagePickerResponse } from 'react-native-image-picker';

const t = (key: string, fallback?: string): string => {
  return i18next.isInitialized ? i18next.t(key) : fallback || key;
};

/**
 * Prompt user to open settings when permission is permanently denied or required.
 */
export const showSettingsDialog = (
  title: string,
  message: string,
  onCancel?: () => void,
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: t(STRING.cancel, 'Cancel'),
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: t(STRING.openSettings, 'Open Settings'),
        onPress: () => {
          Linking.openSettings().catch(err => {
            console.warn('Unable to open settings:', err);
          });
        },
      },
    ],
    { cancelable: false },
  );
};

/**
 * Request camera permission supporting Android (all API levels) and iOS.
 */
export const requestCameraPermission = async (
  showDialogOnDenied = true,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (isGranted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: t(STRING.cameraPermission, 'Camera Permission'),
          message: t(
            STRING.cameraPermissionMessage,
            'At-Home needs camera access to take a photo of the prescription.',
          ),
          buttonNeutral: t('Ask Me Later', 'Ask Me Later'),
          buttonNegative: t(STRING.cancel, 'Cancel'),
          buttonPositive: 'OK',
        },
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (
        result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
        showDialogOnDenied
      ) {
        showSettingsDialog(
          t(STRING.permissionRequired, 'Permission Required'),
          t(
            STRING.cameraPermissionRequiredDesc,
            'Camera access is disabled. Please enable camera permission in your device settings to take photos.',
          ),
        );
      }

      return false;
    } catch (err) {
      console.warn('Camera permission request error:', err);
      return false;
    }
  }

  // On iOS, permission is requested automatically on camera launch.
  // If denied, react-native-image-picker returns errorCode: 'permission'.
  return true;
};

/**
 * Request gallery / photo library permission supporting multiple Android versions:
 * - Android 13+ (API 33, 34, 35+): System Photo Picker (PickVisualMedia) requires no runtime permissions
 * - Android 12 and below (API <= 32): Requires READ_EXTERNAL_STORAGE
 * - iOS: System prompts automatically; errorCode: 'permission' handled on denial
 */
export const requestGalleryPermission = async (
  showDialogOnDenied = true,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const sdkVersion =
      typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(Platform.Version as string, 10);

    // On Android 13+ (API 33+), the system Photo Picker doesn't require runtime storage permissions
    if (sdkVersion >= 33) {
      return true;
    }

    // On Android 12 and below (API <= 32), READ_EXTERNAL_STORAGE is required
    try {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (isGranted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: t(STRING.galleryPermission, 'Photo Library Permission'),
          message: t(
            STRING.galleryPermissionMessage,
            'At-Home needs access to your photo library to select prescription documents.',
          ),
          buttonNeutral: t('Ask Me Later', 'Ask Me Later'),
          buttonNegative: t(STRING.cancel, 'Cancel'),
          buttonPositive: 'OK',
        },
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (
        result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
        showDialogOnDenied
      ) {
        showSettingsDialog(
          t(STRING.permissionRequired, 'Permission Required'),
          t(
            STRING.galleryPermissionRequiredDesc,
            'Photo library access is disabled. Please enable photo library permission in your device settings to select files.',
          ),
        );
      }

      return false;
    } catch (err) {
      console.warn('Gallery permission request error:', err);
      return false;
    }
  }

  // iOS prompts automatically on image library launch
  return true;
};

/**
 * Request microphone / audio recording permission supporting Android and iOS.
 */
export const requestMicrophonePermission = async (
  showDialogOnDenied = true,
): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (isGranted) return true;

      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: t(STRING.microphonePermission, 'Microphone Permission'),
          message: t(
            STRING.microphonePermissionMessage,
            'At-Home needs access to your microphone to record doctor instructions.',
          ),
          buttonNeutral: t('Ask Me Later', 'Ask Me Later'),
          buttonNegative: t(STRING.cancel, 'Cancel'),
          buttonPositive: 'OK',
        },
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      if (
        result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
        showDialogOnDenied
      ) {
        showSettingsDialog(
          t(STRING.permissionRequired, 'Permission Required'),
          t(
            STRING.microphonePermissionRequiredDesc,
            'Microphone access is disabled. Please enable microphone permission in your device settings to record audio.',
          ),
        );
      }

      return false;
    } catch (err) {
      console.warn('Microphone permission request error:', err);
      return false;
    }
  }

  return true;
};

/**
 * Handles error response from react-native-image-picker.
 * If errorCode is 'permission', displays an alert asking the user to open settings.
 * Returns true if the error was handled as a permission error.
 */
export const handleImagePickerPermissionError = (
  response: ImagePickerResponse,
  source: 'camera' | 'gallery' = 'camera',
): boolean => {
  if (response.errorCode === 'permission') {
    const title = t(STRING.permissionRequired, 'Permission Required');
    const message =
      source === 'camera'
        ? t(
            STRING.cameraPermissionRequiredDesc,
            'Camera access is disabled. Please enable camera permission in your device settings to take photos.',
          )
        : t(
            STRING.galleryPermissionRequiredDesc,
            'Photo library access is disabled. Please enable photo library permission in your device settings to select files.',
          );

    showSettingsDialog(title, message);
    return true;
  }
  return false;
};
