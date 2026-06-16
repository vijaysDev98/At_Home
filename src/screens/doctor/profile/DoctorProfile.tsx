import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import NavigationService from '../../../navigation/NavigationService';
import {
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  AppLoader,
  ProfileAvatar,
  LogoutConfirmationSheet,
  DeleteAccountConfirmationSheet,
  LanguagePickerSheet,
} from '../../../components';
import { ActionSheetRef } from 'react-native-actions-sheet';
import AppBottomSheet from '../../../components/AppBottomSheet';
import { ImagePickerContent } from '../../../components/ImagePickerContent';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { AppDispatch, RootState } from '../../../redux/store';
import { userLogout, deleteAccount } from '../../../actions/auth/authAction';
import { updateProfile } from '../../../actions/profile/profileAction';
import { setLoading } from '../../../actions/common/commonSlice';
import {
  updateLanguage,
  fetchLanguage,
} from '../../../actions/language/languageAction';
import { SHOW_TOAST } from '../../../constant';
import { STRING } from '../../../constant/strings';
import { useSimpleImagePicker } from '../../../hooks/useSimpleImagePicker';
import { uploadImageToS3 } from '../../../services/uploadService';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { SCREENS } from '../../../navigation/routes';
import { capitalizeFirstLetter } from '../../../constant/smallFunctions';

const DoctorProfile: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { profileData } = useSelector((state: RootState) => state.profile);
  const { isLoading } = useSelector((state: RootState) => state.common);
  const { currentLanguage } = useSelector((state: RootState) => state.language);

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const doctorSpecialities = [
    { label: t(STRING.generalPractitioner), value: 'generalPractice' },
    { label: t(STRING.cardiology), value: 'cardiology' },
    { label: t(STRING.pediatrician), value: 'pediatrics' },
    { label: t(STRING.dermatologist), value: 'dermatology' },
    { label: t(STRING.ophthalmologist), value: 'orthopedics' },
    { label: t(STRING.neurology), value: 'neurology' },
    { label: t(STRING.other), value: 'other' },
  ];

  // Update userAvatar when profileData changes
  useEffect(() => {
    if (profileData?.profileImg) {
      setUserAvatar(profileData.profileImg);
    }
  }, [profileData?.profileImg]);

  // Fetch stored language on component mount
  useEffect(() => {
    dispatch(fetchLanguage());
  }, [dispatch]);

  const logoutSheetRef = useRef<ActionSheetRef>(null);
  const deleteAccountSheetRef = useRef<ActionSheetRef>(null);
  const languageSheetRef = useRef<ActionSheetRef>(null);

  const handleLogout = () => {
    logoutSheetRef.current?.show();
  };

  const confirmLogout = () => {
    dispatch(userLogout());
  };

  const handleDeleteAccount = () => {
    deleteAccountSheetRef.current?.show();
  };

  const confirmDeleteAccount = () => {
    dispatch(deleteAccount());
  };

  const handleLanguagePicker = () => {
    languageSheetRef.current?.show();
  };

  const handleLanguageSelect = async (language: {
    key: string;
    value: string;
    flag: string;
  }) => {
    const success = await dispatch(updateLanguage(language.key));
    if (success) {
      SHOW_TOAST(`${t(STRING.languageChanged)} ${language.value}`, 'success');
    } else {
      SHOW_TOAST(t(STRING.failedToChangeLanguage), 'error');
    }
  };

  const handleEditProfile = () => {
    navigation.navigate(SCREENS.REGISTER, {
      isEdit: true,
      userData: {
        fName: profileData?.fName,
        lName: profileData?.lName,
        email: profileData?.email,
        rppsNumber: profileData?.rppsNumber,
        phoneNumber: profileData?.phoneNumber,
        finessNumber: profileData?.finessNumber,
        specialty: profileData?.specialty,
        practiceType: profileData?.practiceType,
        businessAddress: profileData?.businessAddress,
        profileImg: profileData?.profileImg,
        roles: profileData?.roles,
        facilityName: profileData?.facilityName,
      },
    });
  };

  const fName = profileData?.fName || '';
  const lName = profileData?.lName || '';
  const fullName = `${capitalizeFirstLetter(fName)} ${capitalizeFirstLetter(
    lName,
  )}`.trim();
  const userEmail = profileData?.email;
  const userPhone = profileData?.phoneNumber;
  const userSpecialty =
    doctorSpecialities.find(spec => spec.value === profileData?.specialty)
      ?.label || profileData?.specialty;
  const userRpps = profileData?.rppsNumber;
  const userFiness = profileData?.finessNumber;
  const userAddress = profileData?.businessAddress;
  const userPracticeType = profileData?.practiceType;
  const userFacilityName = profileData?.facilityName;

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }} edges={['top']}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          title={t(STRING.profile)}
          leftContent={() => (
            <View style={styles.headerAvatar}>
              <Image source={IMAGES.person} style={styles.headerAvatarImage} />
            </View>
          )}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            {userAvatar ? (
              <View style={styles.avatarWrap}>
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
              </View>
            ) : (
              <View style={{ marginBottom: getScaleSize(10) }}>
                <ProfileAvatar size="large" name={fullName} />
              </View>
            )}
            <View style={styles.avatarInfo}>
              <View>
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                >
                  {`Dr. ${fullName}`}
                </AppText>
                <AppText
                  size={getScaleSize(14)}
                  align="center"
                  style={{ marginVertical: getScaleSize(5) }}
                  color={COLORS._6B7280}
                >
                  {capitalizeFirstLetter(userSpecialty || '')}
                </AppText>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.85}
                onPress={handleEditProfile}
              >
                <Image source={IMAGES.ic_edit} style={styles.editBtnIcon} />
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._526674}
                >
                  {t(STRING.editProfile)}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}
            >
              {t(STRING.personalInformation)}
            </AppText>

            {/* <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.fName)}
                style={styles.inputContainer}
                value={capitalizeFirstLetter(fName)}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.person}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.lName)}
                style={styles.inputContainer}
                value={capitalizeFirstLetter(lName)}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.person}
              />
            </View> */}
            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.emailAddress)}
                style={styles.inputContainer}
                isLocked={false}
                editable={false}
                value={userEmail}
                leftIcon={IMAGES.email_icon}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.phoneNumber)}
                value={userPhone}
                isCountryCode
                countryCode={
                  profileData?.country?.length &&
                    profileData?.country?.length > 3
                    ? profileData?.country?.slice(0, 2).toUpperCase()
                    : profileData?.country
                }
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.phone}
                style={styles.inputContainer}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.businessAddress)}
                value={capitalizeFirstLetter(userAddress || '')}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.ic_pin}
                multiline
                style={styles.inputContainer}
              />
            </View>
          </View>

          <View style={styles.card}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}
            >
              {t(STRING.professionalCredentials)}
            </AppText>
            <View style={styles.fieldBlock}>
              {/* <AppText size={getScaleSize(12)} font={FONTS.Inter.SemiBold} color={COLORS._6F767E}>RPPS Number</AppText> */}
              <Input
                label={t(STRING.rppsNumber)}
                style={styles.inputContainer}
                value={userRpps}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.card}
              />
            </View>
            <View style={styles.fieldBlock}>
              {/* <AppText size={getScaleSize(12)} font={FONTS.Inter.SemiBold} color={COLORS._6F767E}>FINESS Number</AppText> */}
              <Input
                label={t(STRING.finessNumber)}
                style={styles.inputContainer}
                value={userFiness}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.card}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.specialty)}
                value={capitalizeFirstLetter(userSpecialty || '')}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.stethoscope}
                style={styles.inputContainer}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.placeOfPractice)}
                value={capitalizeFirstLetter(userPracticeType || '')}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.hospital}
                style={styles.inputContainer}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={t(STRING.facilityName)}
                value={capitalizeFirstLetter(userFacilityName || '')}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.hospital}
                style={styles.inputContainer}
              />
            </View>
          </View>

          {/* <View style={styles.card}>
            <RowItem label={STRING.appVersion} value={STRING.appVersionValue} />
            <Divider />
            <RowItem label={STRING.termsOfService} chevron />
            <Divider />
            <RowItem label={STRING.privacyPolicy} chevron />
          </View> */}

          <View style={styles.card}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}
            >
              {t(STRING.accountSetting)}
            </AppText>

            <TouchableOpacity style={styles.settingRow} onPress={handleLanguagePicker}>
              <View style={styles.settingLeft}>
                <Image source={IMAGES.language} style={styles.settingIcon} />
                <AppText font={FONTS.Inter.Regular} size={getScaleSize(14)}>{t(STRING.language)}</AppText>
              </View>
              <AppText font={FONTS.Inter.SemiBold} color={COLORS._6B7280}>{currentLanguage.toUpperCase()}</AppText>
            </TouchableOpacity>
            <View style={styles.settingDivider} />


            <TouchableOpacity
              style={styles.settingRow}
              onPress={() =>
                navigation.navigate(SCREENS.RESET_PASSWORD, {
                  isChangePassword: true,
                })
              }
            >
              <View style={styles.settingLeft}>
                <Image source={IMAGES.lock} style={styles.settingIcon} />
                <AppText font={FONTS.Inter.Regular} size={getScaleSize(14)}>{t(STRING.changePassword)}</AppText>
              </View>
              {/* <Image source={IMAGES.back} style={styles.chevronIcon} /> */}
            </TouchableOpacity>
            <View style={styles.settingDivider} />


            <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <Image source={IMAGES.arrow_back} style={[styles.settingIcon]} />
                <AppText font={FONTS.Inter.Regular} size={getScaleSize(14)}>{t(STRING.logOut)}</AppText>
              </View>
            </TouchableOpacity>
            <View style={styles.settingDivider} />

            <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <Image source={IMAGES.trash} style={[styles.settingIcon, { tintColor: COLORS.error }]} />
                <AppText font={FONTS.Inter.Regular} size={getScaleSize(14)} color={COLORS.error}>{t(STRING.deleteAccount)}</AppText>
              </View>
            </TouchableOpacity>
          </View>

          {/* <TouchableOpacity
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
            onPress={() =>
              navigation.navigate(SCREENS.RESET_PASSWORD, {
                isChangePassword: true,
              })
            }
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

          <TouchableOpacity
            style={styles.deleteAccountBtn}
            activeOpacity={0.85}
            onPress={handleDeleteAccount}
          >
            <Image source={IMAGES.arrow_back} style={styles.logoutIcon} />
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.error}
            >
              {t(STRING.deleteAccount)}
            </AppText>
          </TouchableOpacity> */}
        </ScrollView>
        <LogoutConfirmationSheet
          ref={logoutSheetRef}
          onLogout={confirmLogout}
        />
        <DeleteAccountConfirmationSheet
          ref={deleteAccountSheetRef}
          onDeleteAccount={confirmDeleteAccount}
        />
        <LanguagePickerSheet
          ref={languageSheetRef}
          onLanguageSelect={handleLanguageSelect}
          currentLanguage={currentLanguage}
        />
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  settingDivider: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
    marginLeft: getScaleSize(30),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getScaleSize(7),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS._526674,
    marginRight: getScaleSize(12),
  },
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(20),
    backgroundColor: COLORS.white,
  },
  statusBar: {
    height: 44,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusIcon: {
    fontSize: 12,
  },
  headerAvatar: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    backgroundColor: COLORS._E4E9EE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarImage: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  avatarSection: {
    backgroundColor: COLORS.white,
    paddingVertical: getScaleSize(24),
    paddingHorizontal: getScaleSize(20),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
  },
  avatarWrap: {
    width: getScaleSize(96),
    height: getScaleSize(96),
    borderRadius: getScaleSize(48),
    overflow: 'hidden',
    position: 'relative',
    marginBottom: getScaleSize(12),
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    // borderRadius:"50%"
  },
  cameraBtn: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1,
  },
  cameraIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.white,
  },
  name: {
    fontSize: getScaleSize(18),
    fontWeight: '700',
    color: COLORS._1A1D1F,
  },
  subhead: {
    fontSize: getScaleSize(14),
    color: COLORS._6B7280,
  },
  card: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    gap: getScaleSize(12),
  },
  sectionLabel: {
    fontSize: getScaleSize(12),
    fontWeight: '700',
    color: COLORS._6B7280,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldBlock: {
    gap: getScaleSize(6),
  },
  label: {
    fontSize: getScaleSize(12),
    color: COLORS._6F767E,
    fontWeight: '600',
    marginLeft: getScaleSize(4),
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getScaleSize(10),
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
    fontWeight: '600',
    flex: 1,
  },
  rowValue: {
    fontSize: getScaleSize(14),
    color: COLORS._6B7280,
  },
  chevron: {
    fontSize: getScaleSize(16),
    color: COLORS._6F767E,
    marginLeft: getScaleSize(6),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
    marginVertical: getScaleSize(4),
  },
  logoutBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(20),
    paddingVertical: getScaleSize(14),
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
  deleteAccountBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(10),
    paddingVertical: getScaleSize(14),
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
  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  saveBtn: {
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS._526674,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  saveIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS.white,
  },
  saveText: {
    fontSize: getScaleSize(15),
    fontWeight: '700',
    color: COLORS.white,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  chevronIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  editProfileBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(20),
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
  editIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS._526674,
  },
  editBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  actionBtn: {
    flex: 1,
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cancelBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  avatarInfo: {
    alignItems: 'center',
    flex: 1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(8),
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    marginTop: getScaleSize(8),
  },
  editBtnIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    tintColor: COLORS._526674,
  },
  changePasswordBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(20),
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
    resizeMode: 'contain',
  },
  languageBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(20),
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
    resizeMode: 'contain',
  },
});

export default DoctorProfile;
