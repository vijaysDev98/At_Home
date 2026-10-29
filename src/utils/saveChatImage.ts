import { PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import i18next from 'i18next';
import { SHOW_TOAST } from '../constant';
import { STRING } from '../constant/strings';

const fileNameFromUrl = (url: string): string => {
  const base = url.split('?')[0].split('/').pop() || 'chat-image.jpg';
  return base.includes('.') ? base : `${base}.jpg`;
};

export const saveChatImageToDevice = async (url: string): Promise<boolean> => {
  if (!url?.trim()) {
    return false;
  }

  try {
    if (Platform.OS === 'android' && Number(Platform.Version) <= 28) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        SHOW_TOAST(i18next.t(STRING.chatSaveImageFailed), 'error');
        return false;
      }
    }

    const fileName = fileNameFromUrl(url);
    const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;

    const res = await ReactNativeBlobUtil.config({ fileCache: true, path: tempPath }).fetch(
      'GET',
      url,
    );
    const status = res.info().status;
    if (status < 200 || status >= 300) {
      SHOW_TOAST(i18next.t(STRING.chatSaveImageFailed), 'error');
      return false;
    }

    const sourcePath = res.path();
    const mime = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    if (Platform.OS === 'ios') {
      await ReactNativeBlobUtil.ios.previewDocument(sourcePath);
      SHOW_TOAST(i18next.t(STRING.chatSaveImageSuccess), 'success');
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

    SHOW_TOAST(i18next.t(STRING.chatSaveImageSuccess), 'success');
    return true;
  } catch {
    SHOW_TOAST(i18next.t(STRING.chatSaveImageFailed), 'error');
    return false;
  }
};
