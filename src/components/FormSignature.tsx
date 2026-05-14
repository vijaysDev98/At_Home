import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { API } from '../api';
import { FORM_STATUS } from '../constant';

export interface FormSignatureProps {
  title?: string;
  // requestId: string;
  // doctorName?: string;
  // signedAt?: string;
  // signatureImage?: string;
  readOnly?: boolean;
  requestData: any;
}

const FormSignature: React.FC<FormSignatureProps> = ({
  title = 'Doctor Signature',
  // requestId,
  // doctorName,
  // signedAt = '',
  // signatureImage,
  readOnly = false,
  requestData,
}) => {
  if (requestData.formStatus !== FORM_STATUS.AWAITING_SIGNATURE) {
    return;
  }

  const [loading, setLoading] = useState(false);

  const isSigned = !!requestData?.digitalSignature?.signatureData;

  const openSigningUrl = async (url: string) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          // iOS
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
        });
      } else {
        Linking.openURL(url);
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Unable to open signing page');
    }
  };

  const handleSignature = async () => {
    try {
      setLoading(true);

      const response: any = await API.Instance.post(
        `/digital-signature/${requestData?._id}/sign`,
      );

      console.log('signature response', response?.data);

      if (response?.data?.status === 200) {
        const signingUrl = response?.data?.data?.signingUrl;

        if (signingUrl) {
          await openSigningUrl(signingUrl);
        }
      } else {
        Alert.alert(
          'Error',
          response?.data?.message || 'Failed to initiate signature process',
        );
      }
    } catch (error: any) {
      console.log('signature api error', error);

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Something went wrong while initiating signature',
      );
    } finally {
      setLoading(false);
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
              source={{ uri: requestData?.digitalSignature?.signatureData }}
              resizeMode="contain"
              style={styles.signatureImage}
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={readOnly || loading}
              onPress={handleSignature}
              style={styles.signButton}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <AppText
                  size={getScaleSize(14)}
                  color={COLORS.primary}
                  font={FONTS.Inter.SemiBold}
                >
                  Sign Now
                </AppText>
              )}
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
  container: {
    marginTop: getScaleSize(12),
  },

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
    // backgroundColor: COLORS.primary,
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
