import { PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import i18next from 'i18next';
import { SHOW_TOAST } from '../constant';
import { STRING } from '../constant/strings';

const fileNameFromUrl = (url: string): string => {
  const base = url.split('?')[0].split('/').pop() || 'chat-image.jpg';
  return base.includes('.') ? base : `${base}.jpg`;
};

const toFileUri = (path: string): string =>
  path.startsWith('file://') ? path : `file://${path}`;

export type SaveChatImageOptions = {
  /** When false, caller shows feedback (e.g. inside a Modal). Default true. */
  showToast?: boolean;
};

export const saveChatImageToDevice = async (
  url: string,
  options: SaveChatImageOptions = {},
): Promise<boolean> => {
  const showToast = options.showToast !== false;

  if (!url?.trim()) {
    return false;
  }

  const notify = (ok: boolean) => {
    if (!showToast) {
      return;
    }
    SHOW_TOAST(
      i18next.t(
        ok ? STRING.chatSaveImageSuccess : STRING.chatSaveImageFailed,
      ),
      ok ? 'success' : 'error',
    );
  };

  try {
    if (Platform.OS === 'android' && Number(Platform.Version) <= 28) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        notify(false);
        return false;
      }
    }

    const fileName = fileNameFromUrl(url);
    const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: tempPath,
    }).fetch('GET', url);
    const status = res.info().status;
    if (status < 200 || status >= 300) {
      notify(false);
      return false;
    }

    const sourcePath = res.path();
    const mime = fileName.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg';

    if (Platform.OS === 'ios') {
      await CameraRoll.saveAsset(toFileUri(sourcePath), { type: 'photo' });
      notify(true);
      return true;
    }

    if (Number(Platform.Version) >= 29) {
      await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        { name: fileName, parentFolder: '', mimeType: mime },
        'Download',
        sourcePath,
      );
    } else {
      const destPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
      await ReactNativeBlobUtil.fs.cp(sourcePath, destPath);
      await ReactNativeBlobUtil.fs.scanFile([{ path: destPath, mime }]);
    }

    notify(true);
    return true;
  } catch {
    notify(false);
    return false;
  }
};
