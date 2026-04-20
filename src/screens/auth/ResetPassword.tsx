import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

export type ResetPasswordProps = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const LOGO_URI = 'https://firebasestorage.googleapis.com/v0/b/uxpilot-auth.appspot.com/o/15291b70-179f-4318-ae20-681b9e102f9e.png?alt=media&token=c5602d33-149b-4654-8e4a-4643f8e5d0a6';

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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoWrap}>
          <Image source={{ uri: LOGO_URI }} style={styles.logo} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Create a new, strong password for your account.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.leading}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPass((p) => !p)} activeOpacity={0.8}>
              <Text style={styles.toggle}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.strengthRow}>
            <Text style={styles.strengthLabel}>Password Strength</Text>
            <View style={styles.meterRow}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.meterBar,
                    strengthLevel > i ? { backgroundColor: meterColors[i] } : null,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.requirements}>
            {[
              { text: 'At least 8 characters', met: reqs.hasLength },
              { text: 'Contains uppercase letter', met: reqs.hasUpper },
              { text: 'Contains number', met: reqs.hasNumber },
              { text: 'Contains special character', met: reqs.hasSpecial },
            ].map((item) => (
              <View key={item.text} style={styles.reqRow}>
                <Text style={[styles.reqDot, item.met ? styles.reqMetDot : null]}>•</Text>
                <Text style={[styles.reqText, item.met ? styles.reqMetText : null]}>{item.text}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.label, styles.confirmLabel]}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.leading}>🛡️</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} activeOpacity={0.8}>
              <Text style={styles.toggle}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {!isMatch && confirm.length > 0 ? (
            <Text style={styles.errorText}>Passwords do not match.</Text>
          ) : null}
        </View>

        <View style={styles.flexSpacer} />

        <View style={styles.ctaBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.ctaButton, !canSubmit && styles.ctaDisabled]}
            disabled={!canSubmit}
            onPress={onSubmit}
          >
            <Text style={styles.ctaText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#526674',
    fontWeight: '700',
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  textBlock: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#526674',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  confirmLabel: {
    marginTop: 8,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  leading: {
    fontSize: 16,
    color: '#94a3b8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  toggle: {
    fontSize: 15,
    color: '#94a3b8',
  },
  strengthRow: {
    marginTop: 6,
    marginBottom: 6,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: 6,
  },
  meterRow: {
    flexDirection: 'row',
    gap: 6,
    height: 6,
  },
  meterBar: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  requirements: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reqDot: {
    fontSize: 12,
    color: '#94a3b8',
  },
  reqText: {
    fontSize: 13,
    color: '#475569',
  },
  reqMetDot: {
    color: '#10b981',
  },
  reqMetText: {
    color: '#0f172a',
    fontWeight: '700',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  flexSpacer: {
    flex: 1,
  },
  ctaBar: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  ctaButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ResetPassword;
