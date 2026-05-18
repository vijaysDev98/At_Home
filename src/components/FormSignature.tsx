import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { useDispatch } from 'react-redux';

import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { setLoading } from '../actions/common/commonSlice';
import signatureApi from '../services/signature';
import { SHOW_TOAST } from '../constant';
import { API_BASE_URL } from '../api/apiRoutes';
import NavigationService from '../navigation/NavigationService';

export interface FormSignatureProps {
  title?: string;
  readOnly?: boolean;
  requestData: any;
  onSignatureCompleted?: () => void;
}

const FormSignature: React.FC<FormSignatureProps> = ({
  title = 'Doctor Signature',
  readOnly = false,
  requestData,
  onSignatureCompleted,
}) => {
  const requestId = requestData?._id || requestData?.id;
  const dispatch = useDispatch();

  if (!readOnly || readOnly === null) {
    return null;
  }

  let isSigned = !!requestData?.digitalSignature?.signatureData;

  const openSigningUrl = async (url: string, requestId: string) => {
    try {
      /**
       * IMPORTANT:
       * This must be a deep link registered in Android/iOS
       */
      const redirectUrl = 'athome://docusign/callback';

      const isBrowserAvailable = await InAppBrowser.isAvailable();

      /**
       * Fallback if browser not available
       */
      if (!isBrowserAvailable) {
        await Linking.openURL(url);
        return;
      }

      /**
       * Open DocuSign signing flow
       */
      const authResult = await InAppBrowser.openAuth(url, redirectUrl, {
        dismissButtonStyle: 'close',
        preferredBarTintColor: COLORS.primary,
        preferredControlTintColor: COLORS.white,
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',

        // iOS
        enableBarCollapsing: false,
        ephemeralWebSession: false,

        // Android
        showTitle: true,
        toolbarColor: COLORS.primary,
        secondaryToolbarColor: COLORS.black,
        navigationBarColor: COLORS.black,
        navigationBarDividerColor: COLORS.white,
        enableUrlBarHiding: true,
        enableDefaultShare: false,

        // IMPORTANT
        forceCloseOnRedirection: true,
      });
      /**
       * User closed browser manually
       */
      // if (authResult?.type === 'cancel') {
      //   return;
      // }

      /**
       * Redirect happened successfully
       *
       * Backend should redirect to:
       * athome://docusign/callback
       */
      // if (
      //   authResult?.type === 'success' &&
      //   authResult?.url?.startsWith('athome://docusign/callback')
      // ) {
      dispatch(setLoading(true));

      /**
       * Fetch latest signature status
       */
      const response = await signatureApi.getSignatureStatus(requestId);
      if (!response?.success) {
        SHOW_TOAST(
          response?.message || 'Failed to fetch signature status',
          'error',
        );
        return;
      }

      // const signatureStatus =
      //   response?.data?.signatureMetadata?.signatureStatus;

      const envelopeStatus = response?.data?.envelopeStatus;

      // const signedPdfUrl = response?.data?.signedPdfUrl;

      const isCompleted =
        //   signatureStatus === 'completed' ||
        envelopeStatus === 'completed';
      // ||
      //   !!signedPdfUrl;

      if (isCompleted) {
        isSigned = true;
        SHOW_TOAST('Document signed successfully', 'success');
        setTimeout(() => {
          NavigationService.goBack();
        }, 2000);

        onSignatureCompleted?.();
      } else {
        SHOW_TOAST('Signature is not completed yet', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to open signing page',
        'error',
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSignature = async () => {
    try {
      dispatch(setLoading(true));

      const response = await signatureApi.initiateSignature(requestId);

      if (response?.success) {
        const signingUrl = response?.data?.signingUrl;

        if (signingUrl) {
          await openSigningUrl(signingUrl, requestId);
        } else {
          SHOW_TOAST('Signing URL not found', 'error');
        }
      } else {
        SHOW_TOAST(
          response?.message || 'Failed to initiate signature',
          'error',
        );
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
        'error',
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <AppText
        size={getScaleSize(12)}
        font={FONTS.Inter.SemiBold}
        style={styles.title}
      >
        {title}
      </AppText>

      <View style={styles.card}>
        <View style={styles.signatureContainer}>
          {isSigned ? (
            <Image
              source={{
                uri: requestData?.digitalSignature?.signatureData,
              }}
              resizeMode="contain"
              style={styles.signatureImage}
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignature}
              style={styles.signButton}
            >
              <AppText
                size={getScaleSize(14)}
                color={COLORS.primary}
                font={FONTS.Inter.SemiBold}
              >
                Sign Now
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._6B7280}
            font={FONTS.Inter.Medium}
            numberOfLines={1}
            style={styles.doctorName}
          >
            {requestData?.doctorId?.fullName}
          </AppText>

          <AppText
            size={getScaleSize(13)}
            color={COLORS._6B7280}
            font={FONTS.Inter.Medium}
          >
            {requestData?.digitalSignature?.signedAt || 'Pending'}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},

  title: {
    marginBottom: getScaleSize(14),
    color: COLORS.black,
  },

  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: getScaleSize(22),
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingVertical: getScaleSize(24),
    paddingHorizontal: getScaleSize(18),
  },

  signatureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getScaleSize(110),
  },

  signatureImage: {
    width: getScaleSize(140),
    height: getScaleSize(80),
  },

  signButton: {
    paddingHorizontal: getScaleSize(24),
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(12),
    minWidth: getScaleSize(140),
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E4E4E7',
    marginTop: getScaleSize(18),
    marginBottom: getScaleSize(16),
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  doctorName: {
    flex: 1,
    marginRight: getScaleSize(10),
  },
});

export default FormSignature;
