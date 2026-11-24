import React, { useState, useRef } from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { COLORS, FONTS } from '../../utils';
import {
  AppButton,
  AppSafeAreaView,
  AppText,
  LanguagePickerSheet,
  LegalDocumentSheet,
} from '../../components';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant/strings';
import { SCREENS } from '../../navigation/routes';
import NavigationService from '../../navigation/NavigationService';
import { useTranslation } from 'react-i18next';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateLanguage } from '../../actions/language/languageAction';
import { SHOW_TOAST } from '../../constant';

export type ProfessionalStatusScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProfessionalStatus'
>;

export type ProfessionalRoleType = 'doctor' | 'medicalResident' | 'careCoordinator';

interface RoleOption {
  key: ProfessionalRoleType;
  titleKey: string;
  subtitleKey: string;
  cardBorderActive: string;
  cardBgActive: string;
  image: any;
}

const ProfessionalStatusScreen: React.FC<ProfessionalStatusScreenProps> = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const [selectedRole, setSelectedRole] = useState<ProfessionalRoleType>('doctor');

  const languageSheetRef = useRef<ActionSheetRef>(null);
  const legalDocSheetRef = useRef<ActionSheetRef>(null);

  const roleOptions: RoleOption[] = [
    {
      key: 'doctor',
      titleKey: STRING.doctorWithRpps,
      subtitleKey: STRING.doctorWithRppsSubtitle,
      cardBorderActive: '#2563EB',
      cardBgActive: '#F8FAFF',
      image: IMAGES.role_doctor,
    },
    {
      key: 'medicalResident',
      titleKey: STRING.medicalStudentInternWithoutRpps,
      subtitleKey: STRING.medicalStudentInternSubtitle,
      cardBorderActive: '#F59E0B',
      cardBgActive: '#FFFDF5',
      image: IMAGES.role_intern,
    },
    {
      key: 'careCoordinator',
      titleKey: STRING.careCoordinator,
      subtitleKey: STRING.careCoordinatorSubtitle,
      cardBorderActive: '#10B981',
      cardBgActive: '#F2FBF7',
      image: IMAGES.role_coordinator,
    },
  ];

  const handleLanguageSelect = async (language: {
    key: string;
    value: string;
    flag: string;
  }) => {
    const success = await dispatch(updateLanguage(language.key) as any);
    if (success) {
      const msg = i18n.t(STRING.languageChanged, { lng: language.key });
      SHOW_TOAST(`${msg} ${language.value}`, 'success');
    }
  };

  const handleProceed = (roleToProceed?: ProfessionalRoleType) => {
    const targetRole = roleToProceed || selectedRole;
    NavigationService.navigate(SCREENS.REGISTER, {
      userType: targetRole,
    });
  };

  return (
    <AppSafeAreaView style={styles.safe}>
      {/* Header bar with Back, Legal & Language */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => NavigationService.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <Image source={IMAGES.backIcon} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => legalDocSheetRef.current?.show()}
            activeOpacity={0.8}
            accessibilityLabel={t(STRING.legalInformation)}
          >
            <Image source={IMAGES.info} style={styles.headerIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => languageSheetRef.current?.show()}
            activeOpacity={0.8}
            accessibilityLabel={t(STRING.selectLanguage)}
          >
            <Image source={IMAGES.language} style={styles.headerIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Headline */}
        <View style={styles.headerContent}>
          <AppText
            size={getScaleSize(26)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={styles.mainTitle}
          >
            {t(STRING.professionalStatus)}
          </AppText>

          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Regular}
            color={COLORS.primaryMuted}
            style={styles.description}
          >
            {t(STRING.professionalStatusDescription)}
          </AppText>
        </View>

        {/* 3 Role Selection Cards */}
        <View style={styles.cardsContainer}>
          {roleOptions.map(option => {
            const isSelected = selectedRole === option.key;

            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.88}
                onPress={() => setSelectedRole(option.key)}
                onLongPress={() => handleProceed(option.key)}
                style={[
                  styles.roleCard,
                  isSelected && {
                    borderColor: option.cardBorderActive,
                    borderWidth: 2,
                    backgroundColor: option.cardBgActive,
                    shadowColor: option.cardBorderActive,
                    shadowOpacity: 0.16,
                    shadowRadius: 10,
                    elevation: 5,
                  },
                ]}
              >
                {/* Visual Avatar Image */}
                <View style={styles.avatarWrapper}>
                  <Image
                    source={option.image}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Role Details */}
                <View style={styles.roleInfo}>
                  <View style={styles.titleRow}>
                    <AppText
                      size={getScaleSize(16.5)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                      style={styles.roleTitle}
                    >
                      {t(option.titleKey)}
                    </AppText>

                    {/* Radio indicator */}
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && {
                          borderColor: option.cardBorderActive,
                          backgroundColor: option.cardBorderActive,
                        },
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>
                  </View>

                  <AppText
                    size={getScaleSize(12.5)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                    lineHeight={getScaleSize(17)}
                    style={styles.roleSubtitle}
                  >
                    {t(option.subtitleKey)}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.footerBar}>
        <AppButton
          title={t(STRING.continue)}
          onPress={() => handleProceed()}
          style={styles.continueButton}
        />
      </View>

      <LanguagePickerSheet
        ref={languageSheetRef}
        onLanguageSelect={handleLanguageSelect}
        currentLanguage={currentLanguage}
      />
      <LegalDocumentSheet
        ref={legalDocSheetRef}
        initialDoc="terms_and_conditions"
      />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(10),
    paddingBottom: getScaleSize(6),
  },
  backButton: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  backIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS._1A1D1F,
    resizeMode: 'contain',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  headerIconButton: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  headerIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS._526674,
    resizeMode: 'contain',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(14),
    paddingBottom: getScaleSize(24),
  },
  headerContent: {
    marginTop: getScaleSize(6),
    marginBottom: getScaleSize(22),
  },
  mainTitle: {
    marginBottom: getScaleSize(8),
    letterSpacing: -0.4,
  },
  description: {
    lineHeight: getScaleSize(20),
  },
  cardsContainer: {
    gap: getScaleSize(14),
  },
  roleCard: {
    flexDirection: 'row',
    padding: getScaleSize(16),
    borderRadius: getScaleSize(18),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: getScaleSize(68),
    height: getScaleSize(68),
    borderRadius: getScaleSize(34),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getScaleSize(14),
  },
  avatarImage: {
    width: getScaleSize(68),
    height: getScaleSize(68),
    borderRadius: getScaleSize(34),
  },
  roleInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(4),
  },
  roleTitle: {
    flex: 1,
    marginRight: getScaleSize(8),
  },
  radioCircle: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    borderRadius: getScaleSize(11),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: COLORS.white,
  },
  roleSubtitle: {
    lineHeight: getScaleSize(17),
  },
  footerBar: {
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(12),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: COLORS.white,
  },
  continueButton: {
    height: getScaleSize(54),
    borderRadius: getScaleSize(16),
  },
});

export default ProfessionalStatusScreen;
