import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { useDispatch } from 'react-redux';

import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { setLoading } from '../actions/common/commonSlice';
import signatureApi from '../services/signature';
import { serviceRequestApi } from '../services/serviceRequestApi';
import { FORM_STATUS, SHOW_TOAST, STRING } from '../constant';
import NavigationService from '../navigation/NavigationService';
import { IMAGES } from '../assets/images';
import moment from 'moment';
import { capitalizeFirstLetter } from '../constant/smallFunctions';
import { useTranslation } from 'react-i18next';

export interface FormSignatureProps {
  title?: string;
  readOnly?: boolean;
  requestData: any;
  onSignatureCompleted?: () => void;
  onSigningStart?: () => void;
  onSigningEnd?: () => void;
}

const FormSignature: React.FC<FormSignatureProps> = ({
  title = 'Doctor Signature',
  readOnly = false,
  requestData,
  onSignatureCompleted,
  onSigningStart,
  onSigningEnd,
}) => {
  const { t } = useTranslation();
  const requestId = requestData?._id || requestData?.id;
  const dispatch = useDispatch();

  if (!readOnly || readOnly === null) {
    return null;
  }

  const isSigned = !!requestData?.digitalSignature?.signatureData;

  /**
   * Poll signature status until document is signed or an error occurs.
   * Loader stays ON for the entire duration of this function.
   * Returns true only when signing is confirmed complete.
   */
  const pollSignatureStatus = async (
    id: string,
    maxAttempts: number = 60,
  ): Promise<boolean> => {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await signatureApi.getSignatureStatus(id);

        if (!response?.success) {
          SHOW_TOAST(
            response?.message || 'Failed to fetch signature status',
            'error',
          );
          return false;
        }

        const data = response?.data;
        const isCompleted =
          data?.formStatus === FORM_STATUS.SIGNED;

        if (isCompleted) {
          return true;
        }

        await new Promise<void>(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error: any) {
        SHOW_TOAST(
          error?.response?.data?.message ||
          error?.message ||
          'Error checking signature status',
          'error',
        );
        return false;
      }
    }

    SHOW_TOAST('Signature timeout - please try again', 'error');
    return false;
  };

  const openSigningUrl = async (url: string, id: string) => {
    onSigningStart?.();

    const isBrowserAvailable = await InAppBrowser.isAvailable();

    // Fallback if browser not available — open externally and stop,
    // we can't poll reliably after handing off to an external browser
    if (!isBrowserAvailable) {
      await Linking.openURL(url);
      onSigningEnd?.();
      return;
    }

    const redirectUrl = 'athome://docusign/callback';

    // Open DocuSign — loader is already ON (set by handleSignature)
    // InAppBrowser.openAuth resolves only when the browser is closed/redirected
    const authResult = await InAppBrowser.openAuth(url, redirectUrl, {
      dismissButtonStyle: 'close',
      preferredBarTintColor: COLORS.primary,
      preferredControlTintColor: COLORS.white,
      readerMode: false,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'coverVertical',
      enableBarCollapsing: false,
      ephemeralWebSession: false,
      showTitle: true,
      toolbarColor: COLORS.primary,
      secondaryToolbarColor: COLORS.black,
      navigationBarColor: COLORS.black,
      navigationBarDividerColor: COLORS.white,
      enableUrlBarHiding: true,
      enableDefaultShare: false,
      forceCloseOnRedirection: true,
    });

    // type === 'cancel'  → user manually closed the browser before completing
    // type === 'dismiss' → browser dismissed without a redirect (treat same as cancel)
    // type === 'success' → DocuSign redirected back to athome://docusign/callback,
    //                      meaning the user finished the DocuSign flow (signed or declined).
    //                      The webhook may not have fired yet — poll until server confirms.

    if (authResult?.type === 'cancel') {
      onSigningEnd?.();
      dispatch(setLoading(false));
      SHOW_TOAST('Signing cancelled', 'info');
      return;
    }

    // Redirect landed (type === 'success') — loader stays ON while we wait
    // for the webhook to mark the request as signed on the server
    const isCompleted = await pollSignatureStatus(id);

    if (isCompleted) {
      try {
        await serviceRequestApi.releaseFormLock(id);
      } catch {
        // Non-fatal — proceed with navigation even if lock release fails
      }
      SHOW_TOAST('Document signed successfully', 'success');
      onSignatureCompleted?.();
      // Navigate back first, then turn off the loader so it doesn't
      // flash off before the screen transition completes
      NavigationService.goBack();
      setTimeout(() => {
        onSigningEnd?.();
        dispatch(setLoading(false));
      }, 500);
    } else {
      // Polling failed or timed out — just close the loader, stay on screen
      onSigningEnd?.();
      dispatch(setLoading(false));
    }
  };

  const handleSignature = async () => {
    // Turn loader ON once here — it stays on until openSigningUrl explicitly turns it off
    dispatch(setLoading(true));
    try {
      const response = await signatureApi.initiateSignature(requestId);

      if (!response?.success) {
        SHOW_TOAST(
          response?.message || 'Failed to initiate signature',
          'error',
        );
        onSigningEnd?.();
        dispatch(setLoading(false));
        return;
      }

      const signingUrl = response?.data?.signingUrl;
      if (!signingUrl) {
        SHOW_TOAST('Signing URL not found', 'error');
        onSigningEnd?.();
        dispatch(setLoading(false));
        return;
      }

      // openSigningUrl owns the loader from this point forward
      await openSigningUrl(signingUrl, requestId);
    } catch (error: any) {
      SHOW_TOAST(
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong',
        'error',
      );
      onSigningEnd?.();
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
        {t(title)}
      </AppText>

      <View style={styles.card}>
        <View style={styles.signatureContainer}>
          {isSigned ? (
            <>
              <Image
                source={IMAGES.serviceCompletedCheck}
                resizeMode="contain"
                style={styles.signatureImage}
              />
              <AppText
                size={getScaleSize(14)}
                color={COLORS.completed}
                style={{ marginTop: getScaleSize(10) }}
                font={FONTS.Inter.SemiBold}
              >
                {t(STRING.signed)}
              </AppText>
            </>
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
                {t(STRING.signNow)}
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
            {capitalizeFirstLetter(
              requestData?.doctorId?.fullName ||
              capitalizeFirstLetter(
                requestData?.doctorId?.fName +
                ' ' +
                requestData?.doctorId?.lName,
              ),
            )}
          </AppText>

          {requestData?.digitalSignature?.signedAt && (
            <AppText
              size={getScaleSize(13)}
              color={COLORS._6B7280}
              font={FONTS.Inter.Medium}
            >
              {moment(requestData?.digitalSignature?.signedAt).format(
                'DD MMM YYYY, h:mm A',
              )}
            </AppText>
          )}
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
    backgroundColor: COLORS._F8F8F8,
    borderRadius: getScaleSize(22),
    borderWidth: 1,
    borderColor: COLORS._E7E7E7,
    paddingVertical: getScaleSize(24),
    paddingHorizontal: getScaleSize(18),
  },

  signatureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getScaleSize(110),
  },

  signatureImage: {
    width: getScaleSize(50),
    height: getScaleSize(50),
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
    backgroundColor: COLORS._E4E4E7,
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
