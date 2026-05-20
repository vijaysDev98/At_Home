import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { AppSafeAreaView, AppText, PrimaryButton } from '../../components';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import { STRING } from '../../constant';

export type RegisterSuccessProps = NativeStackScreenProps<
  RootStackParamList,
  'RegisterSuccess'
>;

const RegisterSuccess: React.FC<RegisterSuccessProps> = ({ navigation }) => {
  return (
    <AppSafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.heroSection}>
          {/* Check icon circle */}
          <Image
            source={IMAGES.ic_register_done}
            style={{ height: getScaleSize(96), width: getScaleSize(96) }}
            resizeMode="contain"
          />

          <AppText
            size={getScaleSize(24)}
            font={FONTS.Inter.Bold}
            color={COLORS.slate900}
            align="center"
          >
            {STRING.registrationSuccessful}
          </AppText>

          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Regular}
            color={COLORS.slate700}
            align="center"
            style={{ maxWidth: getScaleSize(320) }}
          >
            {STRING.yourAccountHasBeenCreatedAndIsCurrently}{' '}
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.primary}
            >
              {STRING.pendingAdminApproval}
            </AppText>
            . {STRING.weWillNotifyYouViaEmailOnceYourAccountIsActivated}
          </AppText>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Image
              source={IMAGES.ic_clock}
              style={{ height: getScaleSize(25), width: getScaleSize(25) }}
            />
            <View style={styles.infoTextWrap}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS.slate900}
              >
                {STRING.whatHappensNext}
              </AppText>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Regular}
                color={COLORS.slate700}
                style={{ marginTop: getScaleSize(4) }}
              >
                {STRING.yourRegDes}
              </AppText>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title={STRING.backToLogin}
            onPress={() => NavigationService.reset(SCREENS.LOGIN)}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    paddingHorizontal: getScaleSize(32),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(20),
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS._F8F9FA,
    borderRadius: getScaleSize(14),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'flex-start',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTextWrap: {
    flex: 1,
  },
  ctaContainer: {
    width: '100%',
    paddingHorizontal: getScaleSize(24),
    paddingBottom: getScaleSize(24),
  },
});

export default RegisterSuccess;
