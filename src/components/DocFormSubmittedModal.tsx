import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  StatusBar,
  BackHandler,
  ScrollView,
  Dimensions,
  Modal,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import PrimaryButton from './PrimaryButton';
import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { STRING } from '../constant';
import { COLORS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { setDocFormSubmittedModal } from '../actions/common/commonSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_ASPECT_RATIO = 1672 / 941;
const IMAGE_HEIGHT = SCREEN_WIDTH * IMAGE_ASPECT_RATIO;

const DocFormSubmittedModal: React.FC = () => {
  const dispatch = useDispatch();
  const visible = useSelector(
    (state: RootState) => state.common.docFormSubmittedModalVisible,
  );
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');
  const imageSource = isFrench
    ? IMAGES.doc_form_submitted_fr
    : IMAGES.doc_form_submitted;

  const handleContinue = () => {
    dispatch(setDocFormSubmittedModal(false));
    NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
      screen: SCREENS.DOCTOR_REQUEST,
    });
  };

  useEffect(() => {
    if (!visible) return;
    const onBackPress = () => {
      handleContinue();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => backHandler.remove();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      hardwareAccelerated
      onRequestClose={handleContinue}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.white}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Image
            source={imageSource}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </ScrollView>

        {/* Continue Button Container */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title={t(STRING.continue) || 'Continue'}
            onPress={handleContinue}
            style={styles.continueBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  ctaContainer: {
    paddingHorizontal: getScaleSize(24),
    paddingTop: getScaleSize(12),
    paddingBottom: getScaleSize(16),
    backgroundColor: COLORS.white,
  },
  continueBtn: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default DocFormSubmittedModal;
