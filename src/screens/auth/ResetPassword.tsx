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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { resetPassword } from '../../actions/auth/authAction';
import { AppLoader } from '../../components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export type ResetPasswordProps = NativeStackScreenProps<
  RootStackParamList,
  'ResetPassword'
>;

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigation, route }) => {
  const resetToken = route.params?.resetToken ?? '';

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.common);

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
    if (!canSubmit || isLoading) return;

    dispatch(
      resetPassword({
        resetToken,
        newPassword: password,
        confirmPassword: confirm,
      }),
    );
  };

  return (
    <AppSafeAreaView edges style={styles.safe}>
      <AppLoader visible={isLoading} />
      <Header isBack style={{ paddingHorizontal: getScaleSize(16) }} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        {/* <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      > */}
        <View style={styles.container}>
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
              placeholder={STRING.enterNewPassword}
              // secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              leftIcon={IMAGES.lock}
              isPasswordVisible={showPass}
              secureTextEntry={true}
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
              placeholder={STRING.enterConfirmPassword}
              secureTextEntry={true}
              value={confirm}
              onChangeText={setConfirm}
              leftIcon={IMAGES.lock} // Fallback for help_icon
              isPasswordVisible={showConfirm}
              handlePasswordVisibility={() => setShowConfirm(p => !p)}
              containerBackgroundColor={COLORS._F8F9FA}
              style={styles.inputField}
              error={
                !isMatch && confirm.length > 0
                  ? STRING.passwordsDoNotMatch
                  : undefined
              }
            />
          </View>

          <View style={styles.ctaBar}>
            <PrimaryButton
              title={STRING.resetPassword}
              onPress={onSubmit}
              disabled={!canSubmit || isLoading}
              style={{ marginTop: getScaleSize(40) }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      {/* </ScrollView> */}
    </AppSafeAreaView>
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
    // paddingTop: getScaleSize(20),
  },
  logoWrap: {
    alignItems: 'center',
    // marginTop: getScaleSize(32),
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
