import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TextInputKeyPressEvent,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import { AppText, Header, PrimaryButton } from '../../components';
import { IMAGES } from '../../assets/images';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING } from '../../constant/strings';

export type OtpVerificationProps = NativeStackScreenProps<
  RootStackParamList,
  'OtpVerification'
>;

const LOGO_URI =
  'https://firebasestorage.googleapis.com/v0/b/uxpilot-auth.appspot.com/o/15291b70-179f-4318-ae20-681b9e102f9e.png?alt=media&token=c5602d33-149b-4654-8e4a-4643f8e5d0a6';

const OtpVerification: React.FC<OtpVerificationProps> = ({
  navigation,
  route,
}) => {
  const email = route.params?.email ?? 'dr.smith@example.com';
  const [code, setCode] = useState(Array(6).fill(''));
  const [touched, setTouched] = useState(false);
  const [timer, setTimer] = useState(179); // 2:59
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value: string, idx: number) => {
    const sanitized = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = sanitized;
    setCode(next);

    if (sanitized && idx < inputsRef.current.length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (text?: string) => {
    if (!text) return;
    const cleaned = text.replace(/\D/g, '').slice(0, 6).split('');
    const next = Array(6).fill('');
    cleaned.forEach((char, i) => (next[i] = char));
    setCode(next);
    const focusIdx = Math.min(cleaned.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const isComplete = useMemo(() => code.every(c => c.length === 1), [code]);
  const showError = touched && !isComplete;

  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
  const seconds = String(timer % 60).padStart(2, '0');

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.container}>
        {/* Header */}
        <Header isBack />
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image source={IMAGES.logo} style={styles.logo} />
        </View>

        <View style={styles.textBlock}>
          <AppText
            size={getScaleSize(24)}
            color={COLORS._1E293B}
            font={FONTS.Inter.Bold}
            align="center"
          >
            {STRING.verifyEmail}
          </AppText>
          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Regular}
            color={COLORS._64748B}
            align="center"
            style={{ marginTop: getScaleSize(5) }}
          >
            {STRING.varifyEmailMessage}
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
                style={[styles.otpInput, showError && styles.otpError]}
                value={digit}
                onChangeText={val => handleChange(val, idx)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, idx)
                }
                keyboardType="number-pad"
                maxLength={1}
                onBlur={() => setTouched(true)}
                autoFocus={idx === 0}
                contextMenuHidden
                selectTextOnFocus
              />
            ))}
          </View>
          {showError ? (
            <Text style={styles.errorText}>
              Invalid code. Please try again.
            </Text>
          ) : null}
        </View>

        {/* Timer */}
        <View style={styles.timerBlock}>
          <AppText
            size={getScaleSize(14)}
            color={COLORS.primaryMuted}
            font={FONTS.Inter.Regular}
          >
            {STRING.codeExpiresIn + ' '}
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
          >
            {timer == 0 && (
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._64748B}
                align="center"
                style={[styles.resend, timer !== 0 && styles.resendDisabled]}
              >
                {STRING.resendCode}
              </AppText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.flexSpacer} />

        {/* Bottom CTA */}
        <View style={styles.ctaBar}>
          <PrimaryButton
            title={STRING.verify}
            onPress={() => navigation.navigate('ResetPassword')}
            disabled={!isComplete}
            style={{ marginTop: getScaleSize(80) }}
          />
        </View>
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
    paddingHorizontal: getScaleSize(24),
    paddingTop: getScaleSize(28),
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
  },
  backBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: getScaleSize(18),
    color: COLORS.primary,
    fontWeight: '700',
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
  title: {
    fontSize: getScaleSize(22),
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: getScaleSize(14),
    color: COLORS.primaryMuted,
    textAlign: 'center',
  },
  email: {
    fontSize: getScaleSize(15),
    color: COLORS.slate900,
    fontWeight: '700',
    textAlign: 'center',
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
  timerText: {
    fontSize: getScaleSize(14),
    color: COLORS.primaryMuted,
  },
  timerStrong: {
    fontWeight: '700',
    color: COLORS.primary,
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
  flexSpacer: {
    flex: 1,
  },
  ctaBar: {
    paddingVertical: getScaleSize(12),
    paddingBottom: getScaleSize(8),
  },
  ctaButton: {
    height: getScaleSize(52),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS.slate400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: getScaleSize(15),
    fontWeight: '700',
  },
});

export default OtpVerification;
