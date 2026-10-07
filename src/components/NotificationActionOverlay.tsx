import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from '../redux/store';
import { hideNotificationOverlay } from '../actions/common/notificationOverlaySlice';
import { NOTIFICATION_OVERLAY_CONFIG } from '../constant/notificationOverlayConfig';
import { serviceRequestApi } from '../services/serviceRequestApi';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { FORM_STATUS, REQUEST_STATUS } from '../constant/RequestStatus';
import { ROLES } from '../constant/getRole';
import { STRING } from '../constant/strings';
import { COLORS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - getScaleSize(32), 440);
const IMAGE_WIDTH = CARD_WIDTH - getScaleSize(24);
const IMAGE_HEIGHT = IMAGE_WIDTH / (1024 / 682); // 3:2 aspect ratio of illustrations

const NotificationActionOverlay: React.FC = () => {
  const dispatch = useDispatch();
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');

  const { visible, type, payload } = useSelector(
    (state: RootState) => state.notificationOverlay,
  );

  const userRoles = useSelector(
    (state: RootState) =>
      state.profile.profileData?.roles ||
      state.login.userData?.roles ||
      [],
  );
  const userRole = useSelector(
    (state: RootState) =>
      state.profile.profileData?.roles?.[0] ||
      state.login.userData?.roles?.[0] ||
      '',
  );
  const isProvider =
    userRole === ROLES.PROVIDER ||
    userRole === 'serviceProvider' ||
    userRoles.includes(ROLES.PROVIDER) ||
    userRoles.includes('serviceProvider');

  const [isLoading, setIsLoading] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  // Resolve config based on notification type with fallback
  const config = type
    ? NOTIFICATION_OVERLAY_CONFIG[type] ||
    NOTIFICATION_OVERLAY_CONFIG.formSignature
    : null;

  useEffect(() => {
    if (visible && isProvider) {
      dispatch(hideNotificationOverlay());
    }
  }, [visible, isProvider, dispatch]);

  useEffect(() => {
    if (visible && !isProvider) {
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 110,
        mass: 0.9,
      }).start();
    } else {
      Animated.timing(animValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animValue]);

  const handleDismiss = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      dispatch(hideNotificationOverlay());
    });
  };

  useEffect(() => {
    if (!visible) return;
    const onBackPress = () => {
      handleDismiss();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => backHandler.remove();
  }, [visible]);

  const handleAction = async () => {
    if (!config) {
      handleDismiss();
      return;
    }

    const notificationType = type || '';
    const metadata = payload?.metadata || {};

    // Exact requestId resolution order matching DoctorNotification.tsx
    const targetRequestId =
      metadata?.requestId ||
      metadata?.serviceRequestId ||
      (metadata?.referenceType === 'serviceRequest'
        ? metadata?.referenceId
        : '') ||
      (payload?.referenceType === 'serviceRequest'
        ? payload?.referenceId
        : '') ||
      payload?.requestId ||
      payload?.serviceRequestId ||
      payload?.referenceId ||
      '';

    setIsLoading(true);
    try {
      let reqData: any = null;

      // Only attempt to fetch if targetRequestId is present and not a dummy test ID
      if (
        targetRequestId &&
        targetRequestId !== 'test_request_123' &&
        !targetRequestId.startsWith('test_')
      ) {
        try {
          reqData = await serviceRequestApi.getServiceRequestDetails(
            targetRequestId,
          );
        } catch (fetchErr) {
          console.log(
            'NotificationActionOverlay: Error fetching live request details:',
            fetchErr,
          );
        }
      }

      // If live details were not fetched (e.g. testing mode), prepare fallback request object
      const effectiveRequest =
        reqData || (targetRequestId ? { id: targetRequestId, ...payload } : null);

      Animated.timing(animValue, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => {
        dispatch(hideNotificationOverlay());

        // 1. Doctor Registration / Profile Under Review
        if (
          notificationType === 'profileUnderReview' ||
          notificationType === 'doctorRegistration'
        ) {
          NavigationService.resetTo([
            { name: SCREENS.DOCTOR_BOTTOM_TABS },
            { name: SCREENS.REGISTER_SUCCESS },
          ]);
          return;
        }

        // 2. Contact Provider
        if (notificationType === 'contactProvider') {
          if (payload?.phoneNumber) {
            Linking.openURL(`tel:${payload.phoneNumber}`).catch(() => {
              console.log('Unable to open phone dialer');
            });
          } else {
            NavigationService.navigate(SCREENS.PROVIDERS_CALL_LIST);
          }
          return;
        }

        // 3. Home Care Secured (Doc Form Submitted)
        if (
          notificationType === 'careSecured' ||
          notificationType === 'docFormSubmitted'
        ) {
          if (payload?.routes && payload.routes.length > 0) {
            NavigationService.resetTo(payload.routes);
          } else {
            NavigationService.resetTo([
              {
                name: SCREENS.DOCTOR_BOTTOM_TABS,
                params: { screen: SCREENS.DOCTOR_REQUEST },
              },
              {
                name: SCREENS.FORM_REVIEW_SCREEN,
                params: {
                  request: effectiveRequest,
                  fromCreate: true,
                },
              },
            ]);
          }
          return;
        }

        // 4. Pre-request Accepted
        if (
          effectiveRequest?.isPreRequest === true ||
          notificationType === 'preRequestAccepted'
        ) {
          const isAccepted =
            effectiveRequest?.preRequestStatus === 'accepted' ||
            notificationType === 'preRequestAccepted';
          NavigationService.resetTo([
            { name: SCREENS.DOCTOR_BOTTOM_TABS },
            {
              name: SCREENS.CREATE_DISCHARGE_REQUEST,
              params: {
                request: effectiveRequest,
                requestId: effectiveRequest?.id || targetRequestId,
                isEdit: true,
                isAccepted,
                isRejected: false,
              },
            },
          ]);
          return;
        }

        // 5. Completed request
        if (effectiveRequest?.status === REQUEST_STATUS.COMPLETED) {
          NavigationService.resetTo([
            { name: SCREENS.DOCTOR_BOTTOM_TABS },
            {
              name: SCREENS.SERVICE_COMPLETED,
              params: { request: effectiveRequest },
            },
          ]);
          return;
        }

        // 6. Form Review / Signing
        const isFormSignAction =
          Boolean(payload?.submitForReview) ||
          String(payload?.submitForReview) === 'true' ||
          metadata?.submitForReview === true ||
          metadata?.submitForReview === 'true' ||
          effectiveRequest?.formStatus === FORM_STATUS.AWAITING_SIGNATURE ||
          effectiveRequest?.formStatus === 'awaitingSignature' ||
          notificationType === 'formSignature' ||
          notificationType === 'signForm' ||
          notificationType === 'awaitingSignature';

        if (isFormSignAction) {
          NavigationService.resetTo([
            { name: SCREENS.DOCTOR_BOTTOM_TABS },
            {
              name: SCREENS.FORM_REVIEW_SCREEN,
              params: {
                request: effectiveRequest,
                action: 'edit',
              },
            },
          ]);
          return;
        }

        // 7. Care Started / Default Forms Screen
        const actionType =
          notificationType === 'requestClaimed' ||
            notificationType === 'careStarted'
            ? 'read'
            : 'edit';

        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.FORMS_SCREEN,
            params: {
              request: effectiveRequest,
              requestId: effectiveRequest?.id || targetRequestId,
              action: actionType,
            },
          },
        ]);
      });
    } catch (error) {
      console.log('NotificationActionOverlay: navigation error', error);
      handleDismiss();
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible || !config || isProvider) return null;

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const isCentered =
    type === 'contactProvider' ||
    type === 'careSecured' ||
    type === 'docFormSubmitted' ||
    (payload as any)?.position === 'center';

  // For centered modals (contactProvider, careSecured), animate scale + subtle rise.
  // For top notification overlays (e.g. formSignature), slide down from top (-450 to 0).
  const cardTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: isCentered ? [40, 0] : [-450, 0],
  });

  const cardScale = isCentered
    ? animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.88, 1],
    })
    : 1;

  const cardOpacity = isCentered
    ? animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })
    : 1;

  const ctaButtonText = t(config.ctaLabel) || config.ctaLabel;
  const isPortraitImage = false;

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'ios' ? 44 : 20,
  );

  const handleSignLater = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      dispatch(hideNotificationOverlay());
      NavigationService.resetTo([
        {
          name: SCREENS.DOCTOR_BOTTOM_TABS,
          params: { screen: SCREENS.DOCTOR_REQUEST },
        },
      ]);
    });
  };

  const renderDynamicMessage = () => {
    const isCareAccepted = type === 'preRequestAccepted';
    const isCareStarted = type === 'careStarted' || type === 'requestClaimed';
    const isCareSecured = type === 'careSecured' || type === 'docFormSubmitted';

    if (!isCareAccepted && !isCareStarted && !isCareSecured) return null;

    const rawPatientName =
      payload?.patientName ||
      payload?.patient_name ||
      payload?.patientFullName ||
      payload?.metadata?.patientName ||
      payload?.metadata?.patient_name ||
      payload?.metadata?.patientFullName ||
      (typeof payload?.patient === 'object'
        ? payload?.patient?.fullName || payload?.patient?.name
        : typeof payload?.patient === 'string'
          ? payload?.patient
          : '') ||
      '';

    const cleanPatientName = rawPatientName ? String(rawPatientName).trim() : '';

    if (isCareAccepted) {
      return (
        <View style={styles.messageBox}>
          <Text style={styles.dynamicMessageText}>
            {isFrench ? (
              <>
                Le professionnel de santé{' '}
                <Text style={styles.dynamicAcceptedHighlight}>a accepté</Text>{' '}
                la prise en charge du patient
              </>
            ) : (
              <>
                The healthcare provider{' '}
                <Text style={styles.dynamicAcceptedHighlight}>has accepted</Text>{' '}
                the care of the patient
              </>
            )}
          </Text>
        </View>
      );
    }

    if (isCareStarted) {
      if (cleanPatientName) {
        const prefix =
          t(STRING.careStartedPatient) ||
          (isFrench
            ? 'Votre professionnel de santé a commencé la prise en charge du patient'
            : 'Your healthcare provider has started the care for');
        return (
          <View style={styles.messageBox}>
            <Text style={styles.dynamicMessageText}>
              {prefix}{' '}
              <Text style={styles.dynamicPatientNameText}>{cleanPatientName}</Text>
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.messageBox}>
          <Text style={styles.dynamicMessageText}>
            {t(STRING.careStartedDefault) ||
              (isFrench
                ? 'Votre professionnel de santé a commencé la prise en charge de votre patient.'
                : 'Your healthcare provider has started the care for your patient.')}
          </Text>
        </View>
      );
    }

    if (isCareSecured) {
      return (
        <View style={styles.messageBox}>
          <Text style={styles.thankYouTitle}>
            {t(STRING.thankYouDoctorTitle) || 'Thank you Doctor,'}
          </Text>
          <Text style={styles.thankYouBody}>
            {cleanPatientName ? (
              <>
                {t(STRING.thankYouDoctorForChoosing) ||
                  (isFrench
                    ? "d'avoir choisi l'application AT-Home pour organiser les soins à domicile pour"
                    : 'for choosing the AT-Home application to organize home care for')}{' '}
                <Text style={styles.patientNameHighlight}>
                  {cleanPatientName}
                </Text>
              </>
            ) : (
              t(STRING.thankYouDoctorDefault) ||
              (isFrench
                ? "d'avoir choisi l'application AT-Home pour organiser les soins à domicile de votre patient."
                : 'for choosing the AT-Home application to organize home care for your patient.')
            )}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View
        style={
          isCentered
            ? styles.overlayContainerCenter
            : styles.overlayContainerTop
        }
      >
        {/* Semi-transparent backdrop (backdrop click disabled) */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />

        {/* Animated card */}
        <Animated.View
          style={[
            styles.card,
            {
              marginTop: isCentered ? 0 : topInset + getScaleSize(8),
              opacity: cardOpacity,
              transform: [
                { translateY: cardTranslateY },
                { scale: cardScale },
              ],
            },
          ]}
        >
          {/* Close button at top right */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleDismiss}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Illustration image ONLY (no extra text) */}
          <View
            style={[
              styles.imageContainer,
              type === 'contactProvider' && styles.contactProviderImageContainer,
              (type === 'preRequestAccepted' ||
                type === 'careStarted' ||
                type === 'requestClaimed') &&
              styles.careAcceptedImageContainer,
              (type === 'careSecured' || type === 'docFormSubmitted') &&
              styles.careSecuredImageContainer,
              (type === 'profileUnderReview' ||
                type === 'doctorRegistration') &&
              isFrench &&
              styles.profileReviewFrImageContainer,
            ]}
          >
            <Image
              source={
                isFrench && config.imageFr ? config.imageFr : config.image
              }
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Dynamic text for cropped illustrations (e.g. preRequestAccepted) */}
          {renderDynamicMessage()}

          {/* Related Action Button ONLY */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isLoading && styles.actionButtonDisabled,
            ]}
            onPress={handleAction}
            activeOpacity={0.88}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.actionButtonText}>{ctaButtonText}</Text>
            )}
          </TouchableOpacity>

          {/* Sign Later Touchable Text */}
          {(type === 'careSecured' || type === 'docFormSubmitted') && (
            <TouchableOpacity
              style={styles.signLaterBtn}
              onPress={handleSignLater}
              activeOpacity={0.7}
            >
              <Text style={styles.signLaterText}>
                {t(STRING.signLater) || 'Sign Later'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainerTop: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
  },
  overlayContainerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(22),
    paddingHorizontal: getScaleSize(14),
    paddingTop: getScaleSize(12),
    paddingBottom: getScaleSize(14),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: getScaleSize(10),
    right: getScaleSize(10),
    zIndex: 10,
    width: getScaleSize(28),
    height: getScaleSize(28),
    borderRadius: getScaleSize(14),
    backgroundColor: 'rgba(241, 245, 249, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  closeButtonText: {
    fontSize: getScaleSize(12),
    color: COLORS.slate600,
    fontWeight: '700',
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginTop: getScaleSize(6),
    marginBottom: getScaleSize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitImageContainer: {
    height: getScaleSize(260),
  },
  contactProviderImageContainer: {
    height: Math.round(IMAGE_WIDTH / (1024 / 563)),
  },
  careAcceptedImageContainer: {
    height: Math.round(IMAGE_WIDTH / (1024 / 492)),
    marginBottom: getScaleSize(6),
  },
  careSecuredImageContainer: {
    height: Math.round(IMAGE_WIDTH / (1024 / 467)),
    marginBottom: getScaleSize(6),
  },
  profileReviewFrImageContainer: {
    height: Math.round(IMAGE_WIDTH / (1024 / 764)),
  },
  messageBox: {
    width: '100%',
    paddingHorizontal: getScaleSize(10),
    marginTop: getScaleSize(4),
    marginBottom: getScaleSize(12),
  },
  thankYouTitle: {
    fontSize: getScaleSize(16),
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: getScaleSize(4),
  },
  thankYouBody: {
    fontSize: getScaleSize(13.5),
    color: '#334155',
    textAlign: 'center',
    lineHeight: getScaleSize(19),
    fontWeight: '500',
  },
  patientNameHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  dynamicMessageText: {
    fontSize: getScaleSize(14),
    color: '#334155',
    textAlign: 'center',
    lineHeight: getScaleSize(20),
    fontWeight: '500',
  },
  dynamicPatientNameText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  dynamicAcceptedHighlight: {
    color: COLORS._2ECA7F,
    fontWeight: '700',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  actionButton: {
    width: '100%',
    height: getScaleSize(48),
    backgroundColor: COLORS._2ECA7F, // Green CTA matching illustrations
    borderRadius: getScaleSize(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS._2ECA7F,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    fontSize: getScaleSize(15),
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  signLaterBtn: {
    marginTop: getScaleSize(10),
    paddingVertical: getScaleSize(6),
    paddingHorizontal: getScaleSize(16),
  },
  signLaterText: {
    fontSize: getScaleSize(13.5),
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default NotificationActionOverlay;
