import React, { useEffect, useRef } from 'react';
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
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../redux/store';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant/strings';
import { COLORS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - getScaleSize(32), 440);
const IMAGE_WIDTH = CARD_WIDTH - getScaleSize(24);
// 1024 x 682 aspect ratio (3:2)
const IMAGE_HEIGHT = Math.round(IMAGE_WIDTH / (1024 / 682));

export interface DocuSignRedirectModalProps {
  visible: boolean;
  onContinue: () => void;
  onClose: () => void;
}

const DocuSignRedirectModal: React.FC<DocuSignRedirectModalProps> = ({
  visible,
  onContinue,
  onClose,
}) => {
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const { t, i18n } = useTranslation();
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

  const handleContinuePress = () => {
    Animated.timing(animValue, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onContinue();
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

  const imageOpacity = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.5, 1],
  });

  const imageScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const imageSource =
    isFrench && IMAGES.docusign_redirect_fr
      ? IMAGES.docusign_redirect_fr
      : IMAGES.docusign_redirect_en;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlayContainer}>
        {/* Semi-transparent backdrop */}
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
            onPress={handleDismiss}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* DocuSign redirect illustration image with fade & subtle scale */}
          <View style={styles.imageContainer}>
            <Animated.Image
              source={imageSource}
              style={[
                styles.illustrationImage,
                {
                  opacity: imageOpacity,
                  transform: [{ scale: imageScale }],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Continue button at bottom of photo */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinuePress}
            activeOpacity={0.88}
          >
            <Text style={styles.continueButtonText}>
              {t(STRING.continue) || 'Continue'}
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
    marginBottom: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  continueButton: {
    width: '100%',
    height: getScaleSize(48),
    backgroundColor: COLORS._2ECA7F, // Green CTA matching notification popup and illustration
    borderRadius: getScaleSize(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS._2ECA7F,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: getScaleSize(15),
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default DocuSignRedirectModal;
