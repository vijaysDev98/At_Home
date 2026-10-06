import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  StatusBar,
  BackHandler,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { PrimaryButton } from '../../components';
import { IMAGES } from '../../assets/images';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import { STRING } from '../../constant';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const DoctorRegisteredScreen: React.FC = () => {
  const { width: screenWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');
  const imageSource = isFrench
    ? IMAGES.overlay_profile_review_fr || IMAGES.doc_registered_fr
    : IMAGES.overlay_profile_review_en || IMAGES.doc_registered;
  const imageAspectRatio = isFrench ? 764 / 1024 : 682 / 1024;
  const imageHeight = screenWidth * imageAspectRatio;

  const handleContinue = () => {
    NavigationService.replace(SCREENS.REGISTER_SUCCESS);
  };

  useEffect(() => {
    const onBackPress = () => {
      handleContinue();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );
    return () => backHandler.remove();
  }, []);

  return (
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
          style={[styles.fullImage, { height: imageHeight }]}
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
    width: '100%',
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

export default DoctorRegisteredScreen;
