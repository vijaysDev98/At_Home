import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Register: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = useMemo(
    () => !name.trim() || !email.trim() || !password.trim() || !role,
    [name, email, password, role],
  );

  const handleSubmit = () => {
    // if (isDisabled || submitting) return;
    // setSubmitting(true);
    // Simulate success flow; in real app, replace with API call
    setTimeout(() => {
      setSubmitting(false);
      navigation.replace('RegisterSuccess');
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right','bottom']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <View style={styles.logoWrap}>
              <Image
                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/b8dc346b0e-dacb1354ad85e642c274.png' }}
                style={styles.logo}
              />
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the At-Home healthcare network</Text>
          </View>

          <View style={styles.card}>
            <Field
              label="Full Name"
              required
              placeholder="John"
              value={name}
              onChangeText={setName}
              icon="👤"
            />
            <Field
              label="Email Address"
              required
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              icon="✉️"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Password"
              required
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              icon="🔒"
              secureTextEntry={!showPassword}
              trailingIcon={showPassword ? '🙈' : '👁️'}
              onTrailingPress={() => setShowPassword((p) => !p)}
              helper="Must be at least 8 characters long."
            />

            <View style={styles.divider} />

            <RoleSelect label="Select Role" required value={role} onSelect={setRole} />
          </View>
        </ScrollView>

        {/* <View style={styles.stickyBar}> */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.submitBtn, 
              // (isDisabled || submitting) && styles.submitBtnDisabled
            ]}
            // disabled={isDisabled || submitting}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Registration'}</Text>
          </TouchableOpacity>
          <Text style={styles.terms}>
            By submitting, you agree to our <Text style={styles.link}>Terms</Text> &{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        {/* </View> */}
      </View>
    </SafeAreaView>
  );
};

interface FieldProps extends React.ComponentProps<typeof TextInput> {
  label: string;
  required?: boolean;
  icon?: string;
  trailingIcon?: string;
  onTrailingPress?: () => void;
  helper?: string;
}

const Field: React.FC<FieldProps> = ({
  label,
  required,
  icon,
  trailingIcon,
  onTrailingPress,
  helper,
  style,
  ...rest
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        {label} {required ? <Text style={styles.required}>*</Text> : null}
      </Text>
      <View style={styles.inputWrapper}>
        {icon ? <Text style={styles.leading}>{icon}</Text> : null}
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor="#9ca3af"
        />
        {trailingIcon ? (
          <TouchableOpacity style={styles.trailing} onPress={onTrailingPress} activeOpacity={0.8}>
            <Text style={styles.trailingText}>{trailingIcon}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
};

const RoleSelect: React.FC<{ label: string; required?: boolean; value: string; onSelect: (v: string) => void; }>
  = ({ label, required, value, onSelect }) => {
    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {label} {required ? <Text style={styles.required}>*</Text> : null}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.select}
          onPress={() => onSelect(value ? '' : 'Doctor')}
        >
          <View style={styles.selectLeft}>
            <Text style={styles.leading}>🩺</Text>
            <Text style={[styles.selectText, !value && styles.placeholderText]}>
              {value || 'Choose your role'}
            </Text>
          </View>
          <Text style={styles.chevron}>⌄</Text>
        </TouchableOpacity>
      </View>
    );
  };

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
  },
  backIcon: {
    fontSize: 18,
    color: '#526674',
    fontWeight: '700',
  },
  logoWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  headerSpacer: {
    width: 40,
  },
  intro: {
    alignItems: 'flex-start',
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#526674',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  required: {
    color: '#ef4444',
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
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  leading: {
    fontSize: 14,
    color: '#94a3b8',
  },
  trailing: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  trailingText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  helper: {
    fontSize: 12,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  select: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 16,
    color: '#94a3b8',
  },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 0,
    backgroundColor: '#526674',
    borderTopWidth: 0,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  submitBtn: {
    // width: '100%',
    height: 54,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal:20,
    borderRadius:12,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  terms: {
    // color: '#e2e8f0',
    fontSize: 11,
    marginTop: 6,
    marginBottom: 6,
    alignItems: 'center',
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});

export default Register;
