import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import { AppButton, AppSafeAreaView, AppText } from '../../components';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';

export type AuthWelcomeProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const AuthWelcome: React.FC<AuthWelcomeProps> = ({ navigation }) => {
  return (
    <AppSafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={IMAGES.logo}
          style={styles.logo}
          resizeMode='cover'
        />
        <AppText
          size={getScaleSize(32)}
          font={FONTS.Inter.SemiBold}
          color={COLORS.primary}
          align='center'
        >{"Welcome to\nAt-Home"}</AppText>
        <AppText
          size={getScaleSize(15)}
          align='center'
          style={styles.subtitle}
          color={COLORS.primaryMuted}
        >{"Seamless healthcare management for\n providers and patients."}</AppText>
        <View
          style={styles.actions}
        >
          <AppButton
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            rightIcon={IMAGES.arrowRight}

          />
          <AppButton
            title="Create Account"
            onPress={() => navigation.navigate('Register')}
            backgroundColor={COLORS.backgroundAlt}
            rightIcon={IMAGES.arrowRight}
            textColor={COLORS.primary}
          />

        </View>
      </View>

    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS._E5E7EB,
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
});

export default AuthWelcome;
