import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import {
  AppLoader,
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  PrimaryButton,
} from '../../components';
import { IMAGES } from '../../assets/images';
import { getScaleSize } from '../../utils/scaleSize';
import NavigationService from '../../navigation/NavigationService';
import { STRING } from '../../constant/strings';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { forgotPassword } from '../../actions/auth/authAction';

export type ForgotPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPassword'
>;

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { isLoading } = useSelector((state: RootState) => state.common);

  const isValidEmail = useMemo(
    () => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.trim()),
    [email],
  );

  const isDisabled = useMemo(
    () => !isValidEmail || isLoading,
    [isValidEmail, isLoading],
  );

  const onSubmit = () => {
    if (isDisabled) return;

    dispatch(forgotPassword(email));
  };

  const showError = touched && email.length > 0 && !isValidEmail;

  return (
    <AppSafeAreaView edges style={styles.safe}>
      <AppLoader visible={isLoading} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={20}
        enableOnAndroid
      >
        <View style={styles.container}>
          {/* Top Content */}
          <View>
            <Header isBack={true} />

            {/* Logo */}
            <View style={styles.logoWrap}>
              <Image source={IMAGES.logo} style={styles.logo} />
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <AppText
                size={getScaleSize(24)}
                font={FONTS.Inter.Bold}
                color={COLORS._1E293B}
                align="center"
              >
                {STRING.forgotPassword}
              </AppText>

              <AppText
                align="center"
                size={getScaleSize(15)}
                lineHeight={25}
                color={COLORS._64748B}
              >
                {STRING.forgetPasswordMessage}
              </AppText>
            </View>

            {/* Email Input */}
            <Input
              label={STRING.emailAddress}
              placeholder={STRING.enterEmailAddress}
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(true)}
              leftIcon={IMAGES.email_icon}
              containerBackgroundColor={COLORS._F8F9FA}
              style={{ paddingHorizontal: 0 }}
              error={showError ? STRING.invalidEmail : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Back To Login */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => NavigationService.navigate('Login')}
              style={styles.backToLogin}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.primary}
              >
                {STRING.backToLogin}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Bottom Button */}
          <PrimaryButton
            title={STRING.sendOTP}
            onPress={onSubmit}
            disabled={isDisabled}
            style={styles.button}
          />
        </View>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  flex: {
    flex: 1,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(24),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(20),
  },

  logoWrap: {
    alignItems: 'center',
    marginTop: getScaleSize(32),
    marginBottom: getScaleSize(32),
  },

  logo: {
    width: getScaleSize(96),
    height: getScaleSize(96),
    resizeMode: 'contain',
  },

  titleContainer: {
    gap: getScaleSize(10),
    marginBottom: getScaleSize(32),
  },

  backToLogin: {
    marginTop: getScaleSize(24),
    alignItems: 'center',
  },

  button: {
    marginTop: getScaleSize(40),
  },
});

export default ForgotPassword;
