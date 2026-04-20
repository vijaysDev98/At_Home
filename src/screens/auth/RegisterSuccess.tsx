import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

export type RegisterSuccessProps = NativeStackScreenProps<RootStackParamList, 'RegisterSuccess'>;

const RegisterSuccess: React.FC<RegisterSuccessProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.checkWrap}>
            <View style={styles.pulse} />
            <Text style={styles.checkIcon}>✔︎</Text>
          </View>

          <Text style={styles.title}>Registration Successful</Text>
          <Text style={styles.subtitle}>
            Your account has been created and is currently <Text style={styles.highlight}>pending admin approval</Text>. We
            will notify you via email once your account is activated.
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.clock}>⏰</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>What happens next?</Text>
              <Text style={styles.infoBody}>
                Our team reviews all healthcare provider applications within 24-48 business hours to ensure platform
                security.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.primaryText}>Back to Login</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  checkWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },
  pulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    backgroundColor: 'rgba(82, 102, 116, 0.1)',
  },
  checkIcon: {
    fontSize: 32,
    color: '#526674',
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  highlight: {
    color: '#526674',
    fontWeight: '700',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  clock: {
    fontSize: 18,
    color: '#526674',
    marginTop: 2,
  },
  infoTextWrap: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  infoBody: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  ctaContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryBtn: {
    height: 50,
    backgroundColor: '#526674',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  homeIndicatorContainer: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

export default RegisterSuccess;
