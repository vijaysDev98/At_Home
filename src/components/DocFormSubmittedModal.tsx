import React, { useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  BackHandler,
  Dimensions,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { STRING } from '../constant';
import { COLORS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { setDocFormSubmittedModal } from '../actions/common/commonSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - getScaleSize(32), 440);
const IMAGE_WIDTH = CARD_WIDTH - getScaleSize(24);
// Aspect ratio of the new illustration is 1024 / 467
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH / (1024 / 467));

const DocFormSubmittedModal: React.FC = () => {
  const dispatch = useDispatch();
  const visible = useSelector(
    (state: RootState) => state.common.docFormSubmittedModalVisible,
  );
  const target = useSelector(
    (state: RootState) => state.common.docFormSubmittedModalTarget,
  );
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        damping: 16,
        stiffness: 110,
        mass: 0.9,
      }).start();
    } else {
      animValue.setValue(0);
    }
  }, [visible, animValue]);

  // "Sign Later" -> Go back to request listing screen
  const handleSignLater = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      dispatch(setDocFormSubmittedModal(false));
      NavigationService.resetTo([
        {
          name: SCREENS.DOCTOR_BOTTOM_TABS,
          params: { screen: SCREENS.DOCTOR_REQUEST },
        },
      ]);
    });
  };

  // "Sign Now" -> Same as previous continue button: navigates to review/signing screen
  const handleSignNow = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      dispatch(setDocFormSubmittedModal(false));
      if (target?.routes && target.routes.length > 0) {
        NavigationService.resetTo(target.routes);
      } else {
        NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
          screen: SCREENS.DOCTOR_REQUEST,
        });
      }
    });
  };

  useEffect(() => {
    if (!visible) return;
    const onBackPress = () => {
      handleSignLater();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => backHandler.remove();
  }, [visible, target]);

  if (!visible) return null;

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1],
  });

  const cardOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const imageSource =
    isFrench && IMAGES.overlay_care_secured_fr
      ? IMAGES.overlay_care_secured_fr
      : IMAGES.overlay_care_secured;

  const rawPatientName = target?.patientName || '';
  const cleanPatientName = rawPatientName ? String(rawPatientName).trim() : '';

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleSignLater}
    >
      <View style={styles.overlayContainer}>
        {/* Semi-transparent backdrop (backdrop click disabled) */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />

        {/* Centered animated card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Top-right close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleSignLater}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Illustration image container */}
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>

          {/* Thank You Doctor Message */}
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

          {/* Sign Now Primary CTA */}
          <TouchableOpacity
            style={styles.signNowBtn}
            onPress={handleSignNow}
            activeOpacity={0.88}
          >
            <Text style={styles.signNowBtnText}>
              {t(STRING.signNow) || 'Sign Now'}
            </Text>
          </TouchableOpacity>

          {/* Sign Later Touchable Text */}
          <TouchableOpacity
            style={styles.signLaterBtn}
            onPress={handleSignLater}
            activeOpacity={0.7}
          >
            <Text style={styles.signLaterText}>
              {t(STRING.signLater) || 'Sign Later'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
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
    paddingBottom: getScaleSize(16),
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
    borderColor: '#E2E8F0',
  },
  closeButtonText: {
    fontSize: getScaleSize(12),
    color: '#475569',
    fontWeight: '700',
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginTop: getScaleSize(6),
    marginBottom: getScaleSize(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  messageBox: {
    width: '100%',
    paddingHorizontal: getScaleSize(8),
    marginTop: getScaleSize(4),
    marginBottom: getScaleSize(14),
    alignItems: 'center',
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
  signNowBtn: {
    width: '100%',
    height: getScaleSize(48),
    backgroundColor: COLORS._2ECA7F,
    borderRadius: getScaleSize(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS._2ECA7F,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  signNowBtnText: {
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

export default DocFormSubmittedModal;
