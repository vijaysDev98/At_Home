import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant/strings';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import AppText from './AppText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - getScaleSize(36), 390);
const IMAGE_WIDTH = CARD_WIDTH - getScaleSize(24);
// 512 x 290 aspect ratio of the cropped illustration
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH * (290 / 512));

export interface RequestUnderReviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const RequestUnderReviewModal: React.FC<RequestUnderReviewModalProps> = ({
  visible,
  onClose,
}) => {
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
      Animated.timing(animValue, {
        toValue: 0,
        duration: 180,
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
      onClose();
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      hardwareAccelerated
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlayContainer}>
        {/* Semi-transparent backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleDismiss}
          />
        </Animated.View>

        {/* Modal Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
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
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color="#475569"
            >
              ✕
            </AppText>
          </TouchableOpacity>

          <View style={styles.illustrationWrapper}>
            <View style={styles.imageContainer}>
              <Image
                source={IMAGES.request_under_review_ill}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Title */}
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color="#1E2548"
            align="center"
            style={styles.title}
          >
            {t(STRING.weHaveContactedProvider)}
          </AppText>

          {/* Subtitle (Green) */}
          <AppText
            size={getScaleSize(15.5)}
            font={FONTS.Inter.SemiBold}
            color="#16A34A"
            align="center"
            lineHeight={getScaleSize(22)}
            style={styles.subtitle}
          >
            {t(STRING.homeCareRequestUnderReview)}
          </AppText>

          {/* Description */}
          <AppText
            size={getScaleSize(13.5)}
            font={FONTS.Inter.Regular}
            color="#64748B"
            align="center"
            lineHeight={getScaleSize(19)}
            style={styles.description}
          >
            {t(STRING.waitingForProviderResponse)}
          </AppText>

          {/* OK Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.okButton}
            onPress={handleDismiss}
          >
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
              align="center"
            >
              {isFrench ? "D'accord" : (t(STRING.ok) || 'OK')}
            </AppText>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(22),
    paddingHorizontal: getScaleSize(18),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(18),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: getScaleSize(12),
    right: getScaleSize(12),
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
  illustrationWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getScaleSize(6),
    marginBottom: getScaleSize(8),
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(6),
    paddingHorizontal: getScaleSize(8),
  },
  subtitle: {
    marginBottom: getScaleSize(8),
    paddingHorizontal: getScaleSize(10),
  },
  description: {
    marginBottom: getScaleSize(18),
    paddingHorizontal: getScaleSize(12),
  },
  okButton: {
    width: '100%',
    height: getScaleSize(46),
    backgroundColor: '#16A34A',
    borderRadius: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default RequestUnderReviewModal;
