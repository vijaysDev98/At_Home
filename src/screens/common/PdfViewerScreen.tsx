import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import {
  AppSafeAreaView,
  AppText,
  AppButton,
  Header,
} from '../../components';
import { IMAGES } from '../../assets/images';
import { getScaleSize } from '../../utils/scaleSize';
import { COLORS, FONTS } from '../../utils';
import { STRING } from '../../constant';
import {
  downloadPdfFromUrl,
  getSignedPdfUrl,
  sharePdfFromUrl,
} from '../../hooks/pdfDownloader';

type PdfViewerRouteParams = {
  pdfUrl?: string;
  signedPdfUrl?: string | null;
  title?: string;
  requestId?: string;
};

const PdfViewerScreen: React.FC = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const params = (route.params || {}) as PdfViewerRouteParams;

  const pdfUrl = useMemo(() => {
    if (params.pdfUrl) return params.pdfUrl;
    return getSignedPdfUrl(params.signedPdfUrl);
  }, [params.pdfUrl, params.signedPdfUrl]);

  const requestId = params.requestId;

  const [isLoading, setIsLoading] = useState(!!pdfUrl);
  const [hasError, setHasError] = useState(!pdfUrl);
  const [reloadKey, setReloadKey] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleRetry = useCallback(() => {
    if (!pdfUrl) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    setHasError(false);
    setIsLoading(true);
    setReloadKey(prev => prev + 1);
  }, [pdfUrl]);

  const handleDownload = useCallback(async () => {
    if (!pdfUrl || isDownloading) return;
    setIsDownloading(true);
    try {
      // Same download implementation used by Service Completed
      await downloadPdfFromUrl(pdfUrl, requestId);
    } finally {
      setIsDownloading(false);
    }
  }, [pdfUrl, requestId, isDownloading]);

  const handleShare = useCallback(async () => {
    if (!pdfUrl || isSharing) return;
    setIsSharing(true);
    try {
      await sharePdfFromUrl(pdfUrl, requestId);
    } finally {
      setIsSharing(false);
    }
  }, [pdfUrl, requestId, isSharing]);

  const renderHeaderActions = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.actionBtn}
        onPress={handleDownload}
        disabled={isDownloading || !pdfUrl}
        accessibilityLabel={t(STRING.downloadPdf)}
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Image
            source={IMAGES.serviceDownloadActionIcon}
            style={styles.actionIcon}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.actionBtn}
        onPress={handleShare}
        disabled={isSharing || !pdfUrl}
        accessibilityLabel={t(STRING.share)}
      >
        {isSharing ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Image source={IMAGES.share} style={styles.actionIcon} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <AppSafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: COLORS.white }}
    >
      <View style={styles.container}>
        <Header
          title={params.title || requestId || t(STRING.viewForm)}
          isBack
          style={styles.header}
          leftContent={renderHeaderActions}
        />

        <View style={styles.content}>
          {hasError ? (
            <View style={styles.stateContainer}>
              <AppText
                font={FONTS.Inter.SemiBold}
                size={getScaleSize(16)}
                color={COLORS._1A1D1F}
                align="center"
              >
                {t(STRING.failedToLoadPdf)}
              </AppText>
              <AppText
                font={FONTS.Inter.Regular}
                size={getScaleSize(13)}
                color={COLORS._6B7280}
                align="center"
                style={styles.errorSubtitle}
              >
                {t(STRING.somethingWentWrong)}
              </AppText>
              {!!pdfUrl && (
                <AppButton
                  title={t(STRING.retry)}
                  onPress={handleRetry}
                  style={styles.retryBtn}
                />
              )}
            </View>
          ) : (
            <>
              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
              <Pdf
                key={reloadKey}
                source={{ uri: pdfUrl, cache: true }}
                style={styles.pdf}
                trustAllCerts={false}
                onLoadComplete={() => {
                  setIsLoading(false);
                  setHasError(false);
                }}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                renderActivityIndicator={() => (
                  <ActivityIndicator size="large" color={COLORS.primary} />
                )}
              />
            </>
          )}
        </View>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  header: {
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(17),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  actionBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    overflow: 'hidden',
  },
  actionIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS._F9FAFB,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS._F9FAFB,
    zIndex: 1,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(24),
    gap: getScaleSize(8),
  },
  errorSubtitle: {
    marginBottom: getScaleSize(12),
  },
  retryBtn: {
    marginTop: getScaleSize(8),
    minWidth: getScaleSize(140),
    height: getScaleSize(48),
    paddingHorizontal: getScaleSize(20),
  },
});

export default PdfViewerScreen;
