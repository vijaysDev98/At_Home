import React, { useEffect, useState, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../../utils';
import { AppText, Input, LogoutConfirmationSheet, LanguagePickerSheet } from '../../../components';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { STRING } from '../../../constant';
import { userLogout } from '../../../actions/auth/authAction';
import { updateLanguage, fetchLanguage } from '../../../actions/language/languageAction';
import { countryCodes } from 'react-native-country-codes-picker';

const ProviderProfile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.profileImg) {
      setUserAvatar(profileData.profileImg);
    }
  }, [profileData?.profileImg]);

  // Fetch stored language on component mount
  useEffect(() => {
    dispatch(fetchLanguage());
  }, [dispatch]);

  const providerName = profileData?.providerName;
  const providerEmail = profileData?.email;
  const providerPhone = profileData?.phoneNumber;
  const providerAssignedServices = profileData?.assignedServices || [];

  const logoutSheetRef = useRef<ActionSheetRef>(null);
  const languageSheetRef = useRef<ActionSheetRef>(null);

  const handleLogout = () => {
    logoutSheetRef.current?.show();
  };

  const handleLanguagePicker = () => {
    languageSheetRef.current?.show();
  };

  const handleLanguageSelect = async (language: { key: string; value: string; flag: string }) => {
    const { SHOW_TOAST } = require('../../../constant');
    const success = await dispatch(updateLanguage(language.key));
    if (success) {
      SHOW_TOAST(`${t(STRING.languageChanged)} ${language.value}`, 'success');
    } else {
      SHOW_TOAST(t(STRING.failedToChangeLanguage), 'error');
    }
  };

  const confirmLogout = () => {
    dispatch(userLogout());
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {t(STRING.profile)}
          </AppText>
          <TouchableOpacity
            onPress={() => {
              NavigationService.navigate(SCREENS.EDIT_PROVIDER_PROFILE);
            }}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              {t(STRING.edit)}
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Image
              source={
                userAvatar
                  ? userAvatar.startsWith('file://') ||
                    userAvatar.startsWith('content://') ||
                    userAvatar.startsWith('data:')
                    ? { uri: userAvatar }
                    : { uri: IMAGE_BASE_URL + userAvatar }
                  : IMAGES.person
              }
              style={styles.avatar}
            />
            <AppText
              size={getScaleSize(20)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {providerName}
            </AppText>
            {/* <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              Registered Nurse (RN)
            </AppText> */}
            {/* <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color="#15803d"
              >
                Active
              </AppText>
            </View> */}
          </View>

          {/* Contact Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              {/* <View style={styles.sectionIconWrap}> */}
              <Image
                source={IMAGES.ic_contactInfo}
                style={styles.sectionIcon}
              />
              {/* </View> */}
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.contactInformation)}
              </AppText>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldGroup}>
              <Input
                label={t(STRING.emailAddress)}
                value={providerEmail}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.email_icon}
                style={styles.inputContainer}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Input
                label={t(STRING.phoneNumber)}
                value={providerPhone}
                isCountryCode
                countryCode={profileData?.country?.length && profileData?.country?.length > 3 ? profileData?.country?.slice(0, 2).toUpperCase() : profileData?.country}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.phone}
                style={styles.inputContainer}
              />
            </View>
          </View>

          {/* Eligible Services */}
          {providerAssignedServices.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.servicesHeaderRow}>
                <View style={styles.servicesHeaderLeft}>
                  {/* <View style={styles.sectionIconWrap}> */}
                  <Image source={IMAGES.ic_medKit} style={styles.sectionIcon} />
                  {/* </View> */}
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(STRING.eligibleServices)}
                  </AppText>
                </View>
                <View style={styles.activeBadge}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    {providerAssignedServices?.length} {t(STRING.active)}
                  </AppText>
                </View>
              </View>
              {/* <View style={styles.divider} /> */}
              {providerAssignedServices.map((item, idx, arr) => (
                <View key={item.title}>
                  <View style={styles.serviceItem}>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {item.serviceName}
                    </AppText>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                      style={{ marginTop: getScaleSize(4) }}
                    >
                      {item.description}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity
            style={styles.languageBtn}
            activeOpacity={0.85}
            onPress={handleLanguagePicker}
          >
            <Image source={IMAGES.language} style={styles.languageIcon} />
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._526674}
            >
              {t(STRING.language)}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changePasswordBtn}
            activeOpacity={0.85}
            onPress={() => NavigationService.navigate(SCREENS.RESET_PASSWORD, { isChangePassword: true })}
          >
            <Image source={IMAGES.lock} style={styles.changePasswordIcon} />
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._526674}
            >
              {t(STRING.changePassword)}
            </AppText>
          </TouchableOpacity>



          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Image source={IMAGES.arrow_back} style={styles.logoutIcon} />
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.error}
            >
              {t(STRING.logOut)}
            </AppText>
          </TouchableOpacity>
        </ScrollView>
        <LogoutConfirmationSheet
          ref={logoutSheetRef}
          onLogout={confirmLogout}
        />
        <LanguagePickerSheet
          ref={languageSheetRef}
          onLanguageSelect={handleLanguageSelect}
          currentLanguage={currentLanguage}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProviderProfile;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  logoutBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(10),
    paddingVertical: getScaleSize(10),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logoutIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.error,
  },
  logoutText: {
    fontSize: getScaleSize(14),
    fontWeight: '700',
    color: COLORS.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._EFEFEF,
    borderWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  scroll: {
    // paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(40),
    // paddingTop: getScaleSize(16),
    gap: getScaleSize(12),
  },
  profileCard: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: getScaleSize(24),
    gap: getScaleSize(6),
  },
  avatar: {
    width: getScaleSize(84),
    height: getScaleSize(84),
    borderRadius: getScaleSize(42),
    marginBottom: getScaleSize(4),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(5),
    marginTop: getScaleSize(2),
  },
  statusDot: {
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: '#22c55e',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    gap: getScaleSize(12),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  sectionIconWrap: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(8),
    backgroundColor: COLORS.backgroundAlt,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    width: getScaleSize(16),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
  },
  fieldGroup: {
    gap: getScaleSize(4),
  },
  serviceItem: {
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS._F8F9FA,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(13),
    borderWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(10),
  },
  activeBadge: {
    backgroundColor: COLORS._F3F4F6,
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(6),
  },
  changePasswordBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(10),
    paddingVertical: getScaleSize(14),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._526674,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  changePasswordIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS._526674,
    resizeMode: 'contain'
  },
  languageBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(10),
    paddingVertical: getScaleSize(14),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._526674,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  languageIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS._526674,
    resizeMode: 'contain'
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
});
