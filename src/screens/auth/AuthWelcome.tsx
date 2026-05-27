import React, { useRef, useEffect } from 'react';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import { AppButton, AppSafeAreaView, AppText, LanguagePickerSheet } from '../../components';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant/strings';
import { SCREENS } from '../../navigation/routes';
import NavigationService from '../../navigation/NavigationService';
import { useTranslation } from 'react-i18next';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateLanguage, fetchLanguage } from '../../actions/language/languageAction';
import { SHOW_TOAST } from '../../constant';

export type AuthWelcomeProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

const AuthWelcome: React.FC<AuthWelcomeProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const languageSheetRef = useRef<ActionSheetRef>(null);

  // Fetch stored language on component mount
  useEffect(() => {
    dispatch(fetchLanguage() as any);
  }, [dispatch]);

  const handleLanguagePicker = () => {
    languageSheetRef.current?.show();
  };

  const handleLanguageSelect = async (language: { key: string; value: string; flag: string }) => {
    const success = await dispatch(updateLanguage(language.key) as any);
    if (success) {
      SHOW_TOAST(`Language changed to ${language.value}`, 'success');
    } else {
      SHOW_TOAST('Failed to change language', 'error');
    }
  };

  return (
    <>
      <AppSafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={handleLanguagePicker}
            activeOpacity={0.8}
          >
            <Image source={IMAGES.language} style={styles.languageIcon} />
          </TouchableOpacity>
          <Image source={IMAGES.logo} style={styles.logo} resizeMode="cover" />
          <AppText
            size={getScaleSize(32)}
            font={FONTS.Inter.SemiBold}
            color={COLORS.primary}
            align="center"
          >
            {t(STRING.welcomeTitle)}
          </AppText>
          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Regular}
            align="center"
            style={styles.subtitle}
            color={COLORS.primaryMuted}
          >
            {t(STRING.welcomeSubtitle)}
          </AppText>
          <View style={styles.actions}>
            <AppButton
              title={t(STRING.signIn)}
              style={styles.signInButton}
              onPress={() => NavigationService.navigate(SCREENS.LOGIN)}
              rightIcon={IMAGES.arrowRight}
            />
            <AppButton
              title={t(STRING.createAccount)}
              onPress={() => NavigationService.navigate(SCREENS.REGISTER)}
              backgroundColor={COLORS._F8F9FA}
              textColor={COLORS.primary}
              style={styles.createAccountButton}
            />
          </View>
        </View>
        <LanguagePickerSheet
          ref={languageSheetRef}
          onLanguageSelect={handleLanguageSelect}
          currentLanguage={currentLanguage}
        />
      </AppSafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 192,
    height: 192,
    alignSelf: 'center',
  },
  subtitle: {
    lineHeight: 25,
    marginTop: getScaleSize(18),
  },
  actions: {
    gap: 16,
    paddingHorizontal: getScaleSize(24),
    marginTop: getScaleSize(32),
  },
  signInButton: {
    height: getScaleSize(56),
    borderRadius: getScaleSize(16),
  },
  createAccountButton: {
    height: getScaleSize(56),
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  languageButton: {
    position: 'absolute',
    top: getScaleSize(20),
    right: getScaleSize(20),
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  languageIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS._526674,
    resizeMode: 'contain',
  },
});

export default AuthWelcome;
