import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';

import {
  AppText,
  Header,
  PrimaryButton,
  AppLoader,
  AppSafeAreaView,
} from '../../components';

import { IMAGES } from '../../assets/images';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING } from '../../constant/strings';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';

import {
  verifyOtp,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
  resendLoginOtp,
} from '../../actions/auth/authAction';
import { useTranslation } from 'react-i18next';
import { getFcmToken } from '../../hooks/notificationPermission';

export type OtpVerificationProps = NativeStackScreenProps<
  RootStackParamList,
  'OtpVerification'
>;

const OtpVerification: React.FC<OtpVerificationProps> = ({ route }) => {
  const email = route.params?.email || '';
  const isForgotPassword = route.params?.isForgotPassword ?? false;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading } = useSelector((state: RootState) => state.common);

  const [code, setCode] = useState(Array(6).fill(''));
  const [otpError, setOtpError] = useState(false);
  const [timer, setTimer] = useState(179);

  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const verifyOtpCode = async (otpCode: string) => {
    let token = await getFcmToken();
    try {
      let result;

      if (isForgotPassword) {
        result = await dispatch(
          verifyForgotPasswordOtp({
            email,
            otp: otpCode,
          }),
        );
      } else {
        result = await dispatch(
          verifyOtp({
            email,
            otp: otpCode,
            fcmToken: token,
          }),
        );
      }

      // The auth actions now return structured error information
      console.log("OTP verification result:", result);

      // Check if verification failed and if it's specifically an invalid OTP error
      if (result && result.success === false) {
        // Only show UI error for invalid OTP, not for network errors
        if (result.error?.isInvalidOtp) {
          setOtpError(true);
        } else {
          setOtpError(false);
        }
      } else {
        setOtpError(false);
      }
    } catch (error) {
      // Don't show generic OTP error for other exceptions
      setOtpError(false);
    }
  };

  const handleChange = async (value: string, idx: number) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);

    if (otpError) {
      setOtpError(false);
    }

    const next = [...code];
    next[idx] = sanitized;

    setCode(next);

    if (sanitized && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }

    const isFull = next.every(c => c !== '');

    if (isFull) {
      Keyboard.dismiss();

      const otpCode = next.join('');

      await verifyOtpCode(otpCode);
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const isComplete = useMemo(() => code.every(c => c.length === 1), [code]);

  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');

  const seconds = String(timer % 60).padStart(2, '0');

  return (
    <AppSafeAreaView style={styles.safe}>
      <AppLoader visible={isLoading} />

      <KeyboardAvoidingView style={styles.flex} behavior={undefined}>
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
              {/* Header */}
              <Header isBack />

              {/* Logo */}
              <View style={styles.logoWrap}>
                <Image source={IMAGES.logo} style={styles.logo} />
              </View>

              {/* Text */}
              <View style={styles.textBlock}>
                <AppText
                  size={getScaleSize(24)}
                  color={COLORS._1E293B}
                  font={FONTS.Inter.Bold}
                  align="center"
                >
                  {t(STRING.verifyEmail)}
                </AppText>

                <AppText
                  size={getScaleSize(15)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._64748B}
                  align="center"
                  style={{
                    marginTop: getScaleSize(5),
                  }}
                >
                  {t(STRING.varifyEmailMessage)}
                </AppText>

                <AppText
                  size={getScaleSize(15)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1E293B}
                  align="center"
                >
                  {email}
                </AppText>
              </View>

              {/* OTP Inputs */}
              <View style={styles.otpWrap}>
                <View style={styles.otpRow}>
                  {code.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={el => {
                        inputsRef.current[idx] = el;
                      }}
                      style={[styles.otpInput, otpError && styles.otpError]}
                      value={digit}
                      onChangeText={val => handleChange(val, idx)}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(nativeEvent.key, idx)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={idx === 0}
                      contextMenuHidden
                      selectTextOnFocus
                    />
                  ))}
                </View>

                {otpError ? (
                  <Text style={styles.errorText}>{t(STRING.invalidCode)}</Text>
                ) : null}
              </View>

              {/* Timer */}
              <View style={styles.timerBlock}>
                <AppText
                  size={getScaleSize(14)}
                  color={COLORS.primaryMuted}
                  font={FONTS.Inter.Regular}
                >
                  {t(STRING.codeExpiresIn) + ' '}

                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._64748B}
                    align="center"
                  >
                    {minutes}:{seconds}
                  </AppText>
                </AppText>

                <TouchableOpacity
                  activeOpacity={timer === 0 ? 0.7 : 1}
                  disabled={timer !== 0}
                  onPress={() => {
                    if (timer !== 0) {
                      return;
                    }

                    setOtpError(false);

                    if (isForgotPassword) {
                      dispatch(resendForgotPasswordOtp(email));
                    } else {
                      dispatch(resendLoginOtp(email));
                    }

                    setTimer(179);
                    setCode(Array(6).fill(''));

                    inputsRef.current[0]?.focus();
                  }}
                >
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._64748B}
                    align="center"
                    style={[
                      styles.resend,
                      timer !== 0 && styles.resendDisabled,
                    ]}
                  >
                    {t(STRING.resendCode)}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom CTA */}
            <View style={styles.ctaBar}>
              <PrimaryButton
                title={t(STRING.verify)}
                disabled={!isComplete || isLoading}
                onPress={async () => {
                  if (!isComplete) {
                    return;
                  }

                  Keyboard.dismiss();

                  await verifyOtpCode(code.join(''));
                }}
              />
            </View>
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: getScaleSize(28),
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
    resizeMode: 'cover',
  },

  textBlock: {
    gap: getScaleSize(5),
    marginBottom: getScaleSize(32),
  },

  otpWrap: {
    alignItems: 'center',
    gap: getScaleSize(10),
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: getScaleSize(10),
    marginBottom: getScaleSize(12),
  },

  otpInput: {
    flex: 1,
    maxWidth: getScaleSize(52),
    height: getScaleSize(60),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.backgroundAlt,
    textAlign: 'center',
    fontSize: getScaleSize(20),
    fontWeight: '700',
    color: COLORS.slate900,
  },

  otpError: {
    borderColor: COLORS.error,
    color: COLORS.error,
  },

  errorText: {
    fontSize: getScaleSize(12),
    color: COLORS.error,
    fontWeight: '600',
    marginTop: getScaleSize(4),
  },

  timerBlock: {
    marginTop: getScaleSize(16),
    alignItems: 'center',
    gap: getScaleSize(6),
  },

  resend: {
    fontSize: getScaleSize(14),
    fontWeight: '700',
    color: COLORS.primary,
  },

  resendDisabled: {
    color: COLORS.slate400,
    opacity: 0.6,
  },

  ctaBar: {
    paddingTop: getScaleSize(40),
  },
});

export default OtpVerification;
