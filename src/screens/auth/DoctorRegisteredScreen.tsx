import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  BackHandler,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { PrimaryButton } from '../../components';
import { IMAGES } from '../../assets/images';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import { STRING } from '../../constant';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_ASPECT_RATIO = 1672 / 941;
const IMAGE_HEIGHT = SCREEN_WIDTH * IMAGE_ASPECT_RATIO;

const DoctorRegisteredScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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

  const bottomPadding = insets.bottom > 0 ? insets.bottom + getScaleSize(8) : getScaleSize(24);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: bottomPadding + getScaleSize(68),
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Image
          source={IMAGES.doc_registered}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </ScrollView>

      {/* Floating Continue Button Container with Soft Gradient Backdrop */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.85)',
          '#FFFFFF',
        ]}
        locations={[0, 0.45, 1]}
        style={[
          styles.floatingCtaContainer,
          { paddingBottom: bottomPadding },
        ]}
        pointerEvents="box-none"
      >
        <PrimaryButton
          title={t(STRING.continue) || 'Continue'}
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </LinearGradient>
    </View>
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
  floatingCtaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: getScaleSize(24),
    paddingTop: getScaleSize(32),
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
