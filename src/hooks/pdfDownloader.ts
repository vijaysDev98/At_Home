import { Alert, PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

export const downloadPdfFromUrl = async (url: string) => {
    try {
        if (!url) return;

        if (Platform.OS === 'android' && Platform.Version < 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );

            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                return;
            }
        }

        const fileName = `document_${Date.now()}.pdf`;

        const path =
            Platform.OS === 'ios'
                ? `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`
                : `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;

        const res = await ReactNativeBlobUtil.config(
            Platform.OS === 'android'
                ? {
                    fileCache: true,
                    path,
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        title: fileName,
                        mime: 'application/pdf',
                        path,
                    },
                }
                : {
                    fileCache: true,
                    path,
                },
        ).fetch('GET', url);

        if (Platform.OS === 'ios') {
            ReactNativeBlobUtil.ios.previewDocument(res.path());
        } else {
            ReactNativeBlobUtil.android.actionViewIntent(
                res.path(),
                'application/pdf',
            );
        }
    } catch (error) {
        console.log('PDF download error:', error);
        Alert.alert('Download failed');
    }
};