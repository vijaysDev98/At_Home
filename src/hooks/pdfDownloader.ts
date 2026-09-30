import { Linking, PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Share from 'react-native-share';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST, STRING } from '../constant';
import { API_BASE_URL } from '../api/apiRoutes';
import { COLORS } from '../utils';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import i18n from 'i18next';

/** Builds a full PDF URL from a relative or absolute signedPdfUrl. */
export const getSignedPdfUrl = (signedPdfUrl?: string | null): string => {
  if (!signedPdfUrl) return '';
  const trimmed = signedPdfUrl.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
};

export const openPdfInBrowser = async (pdfUrl: string) => {
  if (!pdfUrl) return;

  try {
    const isAvailable = await InAppBrowser.isAvailable();

    if (isAvailable) {
      await InAppBrowser.open(pdfUrl, {
        dismissButtonStyle: 'close',
        preferredBarTintColor: COLORS.white,
        preferredControlTintColor: COLORS.primary,
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        enableBarCollapsing: false,
        showTitle: true,
        toolbarColor: COLORS.white,
        secondaryToolbarColor: COLORS.white,
        navigationBarColor: COLORS.white,
        navigationBarDividerColor: COLORS.slate200,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
      });
    } else {
      Linking.openURL(pdfUrl);
    }
  } catch (error) {
    Linking.openURL(pdfUrl);
  }
};

/**
 * Builds a PDF filename from requestId, with a timestamp fallback.
 * Sanitizes unsafe filesystem characters for Android/iOS paths.
 */
export const getPdfFileName = (requestId?: string | null): string => {
  const safeId = requestId
    ?.trim()
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\.+$/, '');

  if (safeId) {
    return safeId.toLowerCase().endsWith('.pdf')
      ? safeId
      : `${safeId}.pdf`;
  }

  return `document_${Date.now()}.pdf`;
};

/**
 * Opens the signed PDF in the in-app PdfViewerScreen.
 * Shared by Doctor and Provider flows.
 */
export const viewSignedPdf = (
  signedPdfUrl?: string | null,
  title?: string,
  requestId?: string | null,
) => {
  const pdfUrl = getSignedPdfUrl(signedPdfUrl);
  if (!pdfUrl) {
    SHOW_TOAST(STRING.failedToLoadPdf);
    return;
  }

  NavigationService.navigate(SCREENS.PDF_VIEWER, {
    pdfUrl,
    signedPdfUrl: signedPdfUrl || undefined,
    title,
    requestId: requestId || undefined,
  });
};

export const downloadPdfFromUrl = async (
  url: string,
  requestId?: string | null,
) => {
  try {
    if (!url) return;

    // Only request WRITE_EXTERNAL_STORAGE on Android <= 28 (Android 9 and below).
    // On Android 10+ (API >= 29, including Android 13/14), Scoped Storage & MediaStore are used.
    // Calling request(WRITE_EXTERNAL_STORAGE) on API >= 29 returns DENIED automatically
    // because AndroidManifest specifies android:maxSdkVersion="28".
    if (Platform.OS === 'android' && Number(Platform.Version) <= 28) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        SHOW_TOAST(STRING.downloadFailed);
        return;
      }
    }

    const fileName = getPdfFileName(requestId);

    if (Platform.OS === 'ios') {
      const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${fileName}`;
      const res = await ReactNativeBlobUtil.config({
        fileCache: true,
        path,
      }).fetch('GET', url);

      const status = res.info().status;
      if (status < 200 || status >= 300) {
        console.log('PDF download failed with HTTP status:', status);
        SHOW_TOAST(i18n.isInitialized ? i18n.t(STRING.downloadFailed) : STRING.downloadFailed);
        return;
      }

      ReactNativeBlobUtil.ios.previewDocument(res.path());
      return;
    }

    // Android:
    // 1. Download to app's cache directory first (requires no permissions, works reliably across all Android versions)
    const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
    if (await ReactNativeBlobUtil.fs.exists(tempPath)) {
      try {
        await ReactNativeBlobUtil.fs.unlink(tempPath);
      } catch {}
    }

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: tempPath,
    }).fetch('GET', url);

    const status = res.info().status;
    if (status < 200 || status >= 300) {
      console.log('PDF download failed with HTTP status:', status);
      SHOW_TOAST(i18n.isInitialized ? i18n.t(STRING.downloadFailed) : STRING.downloadFailed);
      return;
    }

    const sourcePath = res.path();

    // 2. Save into the user-accessible Downloads folder
    if (Number(Platform.Version) >= 29) {
      try {
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: '',
            mimeType: 'application/pdf',
          },
          'Download',
          sourcePath,
        );
      } catch (mediaErr) {
        console.log('copyToMediaStore error, attempting direct DownloadDir copy:', mediaErr);
        try {
          const destPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
          await ReactNativeBlobUtil.fs.cp(sourcePath, destPath);
          await ReactNativeBlobUtil.fs.scanFile([
            { path: destPath, mime: 'application/pdf' },
          ]);
        } catch (cpErr) {
          console.log('DownloadDir copy error:', cpErr);
        }
      }
    } else {
      // Android <= 9 (API <= 28)
      try {
        const destPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
        await ReactNativeBlobUtil.fs.cp(sourcePath, destPath);
        await ReactNativeBlobUtil.fs.scanFile([
          { path: destPath, mime: 'application/pdf' },
        ]);
      } catch (cpErr) {
        console.log('Legacy DownloadDir copy error:', cpErr);
      }
    }

    const successMsg = i18n.isInitialized
      ? i18n.t(STRING.pdfDownloadedSuccessfully)
      : STRING.pdfDownloadedSuccessfully;
    SHOW_SUCCESS_TOAST(successMsg);

    // 3. Attempt to open in an external viewer if available (without failing download if viewer is not installed)
    try {
      await ReactNativeBlobUtil.android.actionViewIntent(
        sourcePath,
        'application/pdf',
      );
    } catch (viewError) {
      console.log('Cannot open PDF with actionViewIntent:', viewError);
    }
  } catch (error) {
    console.log('Download PDF error:', error);
    const failMsg = i18n.isInitialized
      ? i18n.t(STRING.downloadFailed)
      : STRING.downloadFailed;
    SHOW_TOAST(failMsg);
  }
};

/** Downloads the signed PDF with platform-native save/share behavior. */
export const downloadSignedPdf = async (
  signedPdfUrl?: string | null,
  requestId?: string | null,
) => {
  const url = getSignedPdfUrl(signedPdfUrl);
  if (!url) {
    const errorMsg = i18n.isInitialized
      ? i18n.t(STRING.failedToLoadPdf)
      : STRING.failedToLoadPdf;
    SHOW_TOAST(errorMsg);
    return;
  }
  await downloadPdfFromUrl(url, requestId);
};

export const isShareCancelled = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : '';
  return (
    message.includes('User did not share') ||
    message.includes('User cancelled') ||
    message.includes('canceled') ||
    message.includes('cancelled')
  );
};

/** Shares a PDF via the platform native share sheet. */
export const sharePdfFromUrl = async (
  url: string,
  requestId?: string | null,
) => {
  try {
    if (!url) return;

    const fileName = getPdfFileName(requestId);
    const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;

    if (await ReactNativeBlobUtil.fs.exists(path)) {
      try {
        await ReactNativeBlobUtil.fs.unlink(path);
      } catch {}
    }

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path,
    }).fetch('GET', url);

    const status = res.info().status;
    if (status < 200 || status >= 300) {
      console.log('PDF share failed with HTTP status:', status);
      SHOW_TOAST(i18n.isInitialized ? i18n.t(STRING.failedToLoadPdf) : STRING.failedToLoadPdf);
      return;
    }

    const filePath = res.path();
    const shareUrl = filePath.startsWith('file://')
      ? filePath
      : `file://${filePath}`;

    await Share.open({
      url: shareUrl,
      type: 'application/pdf',
      filename: fileName,
      failOnCancel: false,
    });
  } catch (error) {
    if (!isShareCancelled(error)) {
      const shareFailMsg = i18n.isInitialized
        ? i18n.t(STRING.shareFailed)
        : STRING.shareFailed;
      SHOW_TOAST(shareFailMsg);
    }
  }
};

/** Shares the signed PDF via the platform native share sheet. */
export const shareSignedPdf = async (
  signedPdfUrl?: string | null,
  requestId?: string | null,
) => {
  const url = getSignedPdfUrl(signedPdfUrl);
  if (!url) {
    const errorMsg = i18n.isInitialized
      ? i18n.t(STRING.failedToLoadPdf)
      : STRING.failedToLoadPdf;
    SHOW_TOAST(errorMsg);
    return;
  }
  await sharePdfFromUrl(url, requestId);
};
