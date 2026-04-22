import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import {
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  PrimaryButton,
} from '../../components';
import { IMAGES } from '../../assets/images';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING } from '../../constant/strings';
import { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ResetPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  'ResetPassword'
>;

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const reqs = useMemo(() => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    return { hasLength, hasUpper, hasNumber, hasSpecial };
  }, [password]);

  const strengthLevel = useMemo(() => {
    const count = Object.values(reqs).filter(Boolean).length;
    if (!password) return 0;
    return count;
  }, [reqs, password]);

  const isMatch = confirm.length > 0 && confirm === password;
  const canSubmit = strengthLevel === 4 && isMatch;

  const onSubmit = () => {
    if (!canSubmit) return;
    navigation.replace('Login');
  };

  const meterColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Header isBack />

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
              {STRING.resetPassword}
            </AppText>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Regular}
              color={COLORS._64748B}
              align="center"
              style={{ marginTop: getScaleSize(10) }}
            >
              {STRING.resetPasswordMessage}
            </AppText>
          </View>

          <View style={styles.form}>
            <Input
              label={STRING.newPassword}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              leftIcon={IMAGES.lock}
              isPasswordVisible={showPass}
              handlePasswordVisibility={() => setShowPass(p => !p)}
              containerBackgroundColor={COLORS._F8F9FA}
              style={styles.inputField}
            />

            <View style={styles.meterRow}>
              {[0, 1, 2, 3].map(i => (
                <View
                  key={i}
                  style={[
                    styles.meterBar,
                    strengthLevel > i
                      ? { backgroundColor: COLORS.primary }
                      : null,
                  ]}
                />
              ))}
            </View>

            <View style={styles.strengthHeader}>
              <AppText
                size={12}
                color={COLORS.primaryMuted}
                font={FONTS.Inter.SemiBold}
              >
                {STRING.passwordStrength}
              </AppText>
            </View>

            <View style={styles.requirements}>
              {[
                { text: STRING.atLeast8Chars, met: reqs.hasLength },
                { text: STRING.containsUpper, met: reqs.hasUpper },
                { text: STRING.containsNumber, met: reqs.hasNumber },
                { text: STRING.containsSpecial, met: reqs.hasSpecial },
              ].map(item => (
                <View key={item.text} style={styles.reqRow}>
                  <View
                    style={[styles.reqDot, item.met ? styles.reqMetDot : null]}
                  />
                  <AppText
                    size={13}
                    font={item.met ? FONTS.Inter.SemiBold : FONTS.Inter.Regular}
                    color={item.met ? COLORS._1E293B : COLORS._64748B}
                  >
                    {item.text}
                  </AppText>
                </View>
              ))}
            </View>

            <Input
              label={STRING.confirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
              leftIcon={IMAGES.securityIcon} // Fallback for help_icon
              isPasswordVisible={showConfirm}
              handlePasswordVisibility={() => setShowConfirm(p => !p)}
              containerBackgroundColor={COLORS._F8F9FA}
              style={styles.inputField}
              error={
                !isMatch && confirm.length > 0
                  ? 'Passwords do not match.'
                  : undefined
              }
            />
          </View>

          <View style={styles.ctaBar}>
            <PrimaryButton
              title={STRING.resetPassword}
              onPress={onSubmit}
              disabled={!canSubmit}
              style={{ marginTop: getScaleSize(40) }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(24),
    paddingTop: getScaleSize(20),
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
  textBlock: {
    alignItems: 'center',
    marginBottom: getScaleSize(32),
  },
  form: {
    gap: getScaleSize(16),
  },
  inputField: {
    paddingHorizontal: 0,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: getScaleSize(-8),
    marginTop: getScaleSize(8),
  },
  meterRow: {
    flexDirection: 'row',
    gap: getScaleSize(8),
    height: getScaleSize(6),
  },
  meterBar: {
    flex: 1,
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS._E5E7EB,
  },
  requirements: {
    backgroundColor: COLORS._F8F9FA,
    borderRadius: getScaleSize(12),
    padding: getScaleSize(16),
    gap: getScaleSize(12),
    marginBottom: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  reqDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS._64748B,
  },
  reqMetDot: {
    backgroundColor: COLORS.primary,
  },
  ctaBar: {
    marginTop: 'auto',
    paddingBottom: getScaleSize(32),
  },
});

export default ResetPassword;
