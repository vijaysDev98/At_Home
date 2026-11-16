import React, { useCallback, useEffect } from 'react';
import {
  BackHandler,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../redux/store';
import { PrimaryButton } from '../../components';
import { IMAGES } from '../../assets/images';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import { STRING } from '../../constant';
import { getScaleSize } from '../../utils/scaleSize';
import { ROLES } from '../../constant/getRole';

export type PostLoginWelcomeProps = NativeStackScreenProps<
  RootStackParamList,
  any
>;

const PostLoginWelcomeScreen: React.FC<PostLoginWelcomeProps> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );
  const userData = useSelector((state: RootState) => state.login.userData);
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');
  const imageSource = isFrench
    ? IMAGES.post_login_welcome_fr
    : IMAGES.post_login_welcome_en;

  const handleContinue = useCallback(() => {
    const paramTarget = (route?.params as any)?.targetScreen;
    if (paramTarget) {
      NavigationService.reset(paramTarget);
      return;
    }

    const role =
      profileData?.roles?.[0] ||
      (userData as any)?.role ||
      (userData as any)?.roles?.[0];
    const isProvider =
      role === ROLES.PROVIDER ||
      role === 'nurse' ||
      role === 'serviceProvider';

    const target = isProvider
      ? SCREENS.PROVIDER_BOTTOM_TABS
      : SCREENS.DOCTOR_BOTTOM_TABS;

    NavigationService.reset(target);
  }, [route?.params, profileData, userData]);

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
  }, [handleContinue]);

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Seamless background gradient to match image edges */}
      <LinearGradient
        colors={['#ACD8FD', '#D6ECFE', '#B0DAFD', '#6FB5FD']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Full screen fit image without any cropping */}
      <Image
        source={imageSource}
        style={styles.fullImage}
        resizeMode="contain"
      />

      {/* Floating Bottom Button */}
      <View
        style={[
          styles.floatingBtnContainer,
          {
            bottom: Math.max(insets.bottom, getScaleSize(16)) + getScaleSize(8),
          },
        ]}
      >
        <PrimaryButton
          title={t(STRING.continue) || 'Continue'}
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ACD8FD',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  floatingBtnContainer: {
    position: 'absolute',
    left: getScaleSize(20),
    right: getScaleSize(20),
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  continueBtn: {
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
  },
});

export default PostLoginWelcomeScreen;
