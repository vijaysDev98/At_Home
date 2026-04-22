import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import { AppButton, AppSafeAreaView, AppText } from '../../components';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant/strings';

export type AuthWelcomeProps = NativeStackScreenProps<
  RootStackParamList,
  'Welcome'
>;

const AuthWelcome: React.FC<AuthWelcomeProps> = ({ navigation }) => {
  return (
    <AppSafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image source={IMAGES.logo} style={styles.logo} resizeMode="cover" />
        <AppText
          size={getScaleSize(32)}
          font={FONTS.Inter.SemiBold}
          color={COLORS.primary}
          align="center"
        >
          {STRING.welcomeTitle}
        </AppText>
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Regular}
          align="center"
          style={styles.subtitle}
          color={COLORS.primaryMuted}
        >
          {STRING.welcomeSubtitle}
        </AppText>
        <View style={styles.actions}>
          <AppButton
            title={STRING.signIn}
            style={styles.signInButton}
            onPress={() => navigation.navigate('Login')}
            rightIcon={IMAGES.arrowRight}
          />
          <AppButton
            title={STRING.createAccount}
            onPress={() => navigation.navigate('Register')}
            backgroundColor={COLORS._F8F9FA}
            textColor={COLORS.primary}
            style={styles.createAccountButton}
          />
        </View>
      </View>
    </AppSafeAreaView>
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
});

export default AuthWelcome;
