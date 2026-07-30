import { Linking, PermissionsAndroid, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Share from 'react-native-share';
import { SHOW_TOAST, STRING } from '../constant';
import { API_BASE_URL } from '../api/apiRoutes';
import { COLORS } from '../utils';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';

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

    if (Platform.OS === 'android' && Number(Platform.Version) < 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        SHOW_TOAST(STRING.downloadFailed);
        return;
      }
    }

    const fileName = getPdfFileName(requestId);

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
    SHOW_TOAST(STRING.downloadFailed);
  }
};

/** Downloads the signed PDF with platform-native save/share behavior. */
export const downloadSignedPdf = async (
  signedPdfUrl?: string | null,
  requestId?: string | null,
) => {
  const url = getSignedPdfUrl(signedPdfUrl);
  if (!url) {
    SHOW_TOAST(STRING.failedToLoadPdf);
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

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path,
    }).fetch('GET', url);

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
      SHOW_TOAST(STRING.shareFailed);
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
    SHOW_TOAST(STRING.failedToLoadPdf);
    return;
  }
  await sharePdfFromUrl(url, requestId);
};
