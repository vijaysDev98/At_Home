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
  const dispatch = useDispatch();

  if (!readOnly || readOnly === null) {
    return null;
  }

  const isSigned = !!requestData?.digitalSignature?.signatureData;

  const checkSignatureStatus = async () => {
    try {
      const response = await signatureApi.getSignatureStatus(requestData?.id);

      console.log('signature status response', response);

      if (response?.success) {
        const signatureStatus =
          response?.data?.signatureMetadata?.signatureStatus;

        const envelopeStatus = response?.data?.envelopeStatus;

        const signedPdfUrl = response?.data?.signedPdfUrl;

        const isCompleted =
          signatureStatus === 'completed' ||
          envelopeStatus === 'completed' ||
          !!signedPdfUrl;

        return isCompleted;
      }

      return false;
    } catch (error) {
      console.log('check signature status error', error);
      return false;
    }
  };

  const openSigningUrl = async (url: string) => {
    let interval: ReturnType<typeof setInterval> | null = null;

    try {
      const isAvailable = await InAppBrowser.isAvailable();

      if (!isAvailable) {
        Linking.openURL(url);
        return;
      }

      // open browser
      InAppBrowser.open(url, {
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: COLORS.primary,
        preferredControlTintColor: COLORS.white,
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,

        // Android
        showTitle: true,
        toolbarColor: COLORS.primary,
        secondaryToolbarColor: COLORS.black,
        navigationBarColor: COLORS.black,
        navigationBarDividerColor: COLORS.white,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        forceCloseOnRedirection: false,
      }).catch(error => {
        console.log('browser open error => ', error);

        if (interval) {
          clearInterval(interval);
        }

        Alert.alert('Error', 'Unable to open signing browser');
      });

      // polling immediately starts
      interval = setInterval(async () => {
        try {
          console.log('checking signature status...');

          const response = await signatureApi.getSignatureStatus(
            requestData?.id,
          );

          // stop polling if api itself failed
          if (!response?.success) {
            InAppBrowser.close();
            if (interval) {
              clearInterval(interval);
            }

            SHOW_TOAST(
              response?.message || 'Failed to fetch signature status',
              'error',
            );

            return;
          }

          const signatureStatus =
            response?.data?.signatureMetadata?.signatureStatus;

          const envelopeStatus = response?.data?.envelopeStatus;

          const signedPdfUrl = response?.data?.signedPdfUrl;

          const isCompleted =
            signatureStatus === 'completed' ||
            envelopeStatus === 'completed' ||
            !!signedPdfUrl;

          if (isCompleted) {
            if (interval) {
              clearInterval(interval);
            }

            // close browser
            InAppBrowser.close();
            SHOW_TOAST('Document signed successfully', 'success');

            onSignatureCompleted?.();
          }
        } catch (error: any) {
          // stop polling on error
          if (interval) {
            clearInterval(interval);
          }

          // close browser also
          InAppBrowser.close();

          SHOW_TOAST(error?.message || 'Something went wrong', 'error');
        }
      }, 3000);
    } catch (error: any) {
      console.log('open signing url error => ', error);

      if (interval) {
        clearInterval(interval);
      }

      Alert.alert('Error', error?.message || 'Unable to open signing page');
    }
  };

  const handleSignature = async () => {
    try {
      dispatch(setLoading(true));

      const response = await signatureApi.initiateSignature(requestData?.id);
      if (response?.success) {
        const signingUrl = response?.data?.signingUrl;
        if (signingUrl) {
          await openSigningUrl(signingUrl);
        } else {
          SHOW_TOAST('Signing URL not found', 'error');
        }
      } else {
        SHOW_TOAST(response?.message, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message, 'error');
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
            {requestData?.doctorId?.fName}
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
