import React from 'react';
import { Image, StyleSheet, View, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../redux/store';
import { AppSafeAreaView, AppText, PrimaryButton } from '../../components';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import { STRING } from '../../constant';
import { useTranslation } from 'react-i18next';

export type RegisterSuccessProps = NativeStackScreenProps<
  RootStackParamList,
  'RegisterSuccess'
>;

const RegisterSuccess: React.FC<RegisterSuccessProps> = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');
  const imageSource = isFrench
    ? IMAGES.overlay_profile_review_fr
    : IMAGES.overlay_profile_review_en;

  return (
    <AppSafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Illustration Image (with baked-in completion and review message) */}
          <View style={styles.imageWrapper}>
            <Image
              source={imageSource}
              style={[
                styles.illustrationImage,
                { aspectRatio: isFrench ? 1024 / 764 : 1024 / 682 },
              ]}
              resizeMode="contain"
            />
          </View>

          {/* Info Card: What Happens Next */}
          <View style={styles.infoCard}>
            <Image
              source={IMAGES.ic_clock}
              style={styles.clockIcon}
              resizeMode="contain"
            />
            <View style={styles.infoTextWrap}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS.slate900}
              >
                {t(STRING.whatHappensNext)}
              </AppText>
              <AppText
                size={getScaleSize(13.5)}
                font={FONTS.Inter.Regular}
                color={COLORS.slate700}
                style={styles.infoSubtext}
              >
                {t(STRING.yourRegDes)}
              </AppText>
            </View>
          </View>
        </ScrollView>

        {/* CTA Container */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title={t(STRING.backToLogin)}
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
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(20),
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: '100%',
    maxHeight: getScaleSize(320),
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
  clockIcon: {
    height: getScaleSize(24),
    width: getScaleSize(24),
    marginTop: getScaleSize(2),
  },
  infoTextWrap: {
    flex: 1,
  },
  infoSubtext: {
    marginTop: getScaleSize(4),
    lineHeight: getScaleSize(19),
  },
  ctaContainer: {
    width: '100%',
    paddingHorizontal: getScaleSize(24),
    paddingBottom: getScaleSize(24),
    paddingTop: getScaleSize(8),
    backgroundColor: COLORS.white,
  },
});

export default RegisterSuccess;
