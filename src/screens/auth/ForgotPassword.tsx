import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import { AppText, Header, Input, PrimaryButton } from '../../components';
import { IMAGES } from '../../assets/images';
import { getScaleSize } from '../../utils/scaleSize';
import NavigationService from '../../navigation/NavigationService';
import { STRING } from '../../constant/strings';

export type ForgotPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  'ForgotPassword'
>;

const LOGO_URI =
  'https://firebasestorage.googleapis.com/v0/b/uxpilot-auth.appspot.com/o/15291b70-179f-4318-ae20-681b9e102f9e.png?alt=media&token=c5602d33-149b-4654-8e4a-4643f8e5d0a6';

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = useMemo(
    () => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.trim()),
    [email],
  );
  const isDisabled = useMemo(
    () => !isValidEmail || submitting,
    [isValidEmail, submitting],
  );

  const onSubmit = () => {
    if (isDisabled) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigation.navigate('OtpVerification', { email });
    }, 1000);
  };

  const showError = touched && email.length > 0 && !isValidEmail;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.container}>
        <Header isBack={true} />

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image source={IMAGES.logo} style={styles.logo} />
        </View>

        <View style={{ gap: getScaleSize(10), marginBottom: getScaleSize(32) }}>
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

        <View>
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
          />
        </View>

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

        {/* Bottom CTA */}
        <PrimaryButton
          title={STRING.sendOTP}
          onPress={onSubmit}
          disabled={isDisabled}
          style={{ marginTop: getScaleSize(80) }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  logo: {
    width: getScaleSize(96),
    height: getScaleSize(96),
    resizeMode: 'contain',
  },
  backToLogin: {
    marginTop: getScaleSize(24),
    alignItems: 'center',
  },
});

export default ForgotPassword;
