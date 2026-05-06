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
import NavigationService from '../../../navigation/NavigationService';
import {
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  AppLoader,
} from '../../../components';
import AppBottomSheet from '../../../components/AppBottomSheet';
import { ImagePickerContent } from '../../../components/ImagePickerContent';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { AppDispatch, RootState } from '../../../redux/store';
import { userLogout } from '../../../actions/auth/authAction';
import { updateProfile } from '../../../actions/profile/profileAction';
import { setLoading } from '../../../actions/common/commonSlice';
import { SHOW_TOAST } from '../../../constant';
import { STRING } from '../../../constant/strings';
import { useSimpleImagePicker } from '../../../hooks/useSimpleImagePicker';
import { uploadImageToS3 } from '../../../services/uploadService';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';

const DoctorProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { profileData } = useSelector((state: RootState) => state.profile);
  const { isLoading } = useSelector((state: RootState) => state.common);
  console.log('profileData', profileData);

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Update userAvatar when profileData changes
  useEffect(() => {
    if (profileData?.profileImg) {
      setUserAvatar(profileData.profileImg);
    }
  }, [profileData?.profileImg]);

  const handleLogout = () => {
    dispatch(userLogout());
  };

  const handleEditProfile = () => {
    navigation.navigate('Register', {
      isEdit: true,
      userData: {
        fullName: profileData?.fullName,
        email: profileData?.email,
        rppsNumber: profileData?.rppsNumber,
        finessNumber: profileData?.finessNumber,
        specialty: profileData?.specialty,
        practiceType: profileData?.practiceType,
        businessAddress: profileData?.businessAddress,
        profileImg: profileData?.profileImg,
      },
    });
  };

  const fullName = profileData?.fullName || '';
  const userEmail = profileData?.email;
  const userSpecialty = profileData?.specialty;
  const userRpps = profileData?.rppsNumber;
  const userFiness = profileData?.finessNumber;
  const userAddress = profileData?.businessAddress;
  const userPracticeType = profileData?.practiceType;

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          title={STRING.profile}
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
            <View>
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
              {/* <TouchableOpacity
                  style={styles.cameraBtn}
                  activeOpacity={0.85}
                  onPress={handleEditProfile}
                >
                  <Image source={IMAGES.ic_edit} style={styles.cameraIcon} />
                </TouchableOpacity> */}
            </View>
            <View style={styles.avatarInfo}>
              <View>
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                >
                  {fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName}`}
                </AppText>
                <AppText
                  size={getScaleSize(14)}
                  align="center"
                  style={{ marginVertical: getScaleSize(5) }}
                  color={COLORS._6B7280}
                >
                  {userSpecialty}
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
                  {STRING.editProfile}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}
            >
              {STRING.personalInformation}
            </AppText>
            <View style={styles.fieldBlock}>
              <Input
                label={STRING.fullName}
                style={styles.inputContainer}
                value={fullName}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.ic_profile}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={STRING.emailAddress}
                style={styles.inputContainer}
                isLocked={false}
                editable={false}
                value={userEmail}
                leftIcon={IMAGES.email_icon}
              />
            </View>
          </View>

          <View style={styles.card}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}
            >
              {STRING.professionalCredentials}
            </AppText>
            <View style={styles.fieldBlock}>
              {/* <AppText size={getScaleSize(12)} font={FONTS.Inter.SemiBold} color={COLORS._6F767E}>RPPS Number</AppText> */}
              <Input
                label={STRING.rppsNumber}
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
                label={STRING.finessNumber}
                style={styles.inputContainer}
                value={userFiness}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.hospital}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={STRING.businessAddress}
                value={userAddress}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.location_pin}
                multiline
                style={styles.inputContainer}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={STRING.specialty}
                value={userSpecialty}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.stethoscope}
                style={styles.inputContainer}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label={STRING.placeOfPractice}
                value={userPracticeType}
                isLocked={false}
                editable={false}
                leftIcon={IMAGES.hospital}
                style={styles.inputContainer}
              />
            </View>
          </View>

          <View style={styles.card}>
            <RowItem label={STRING.appVersion} value={STRING.appVersionValue} />
            <Divider />
            <RowItem label={STRING.termsOfService} chevron />
            <Divider />
            <RowItem label={STRING.privacyPolicy} chevron />
          </View>

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
              {STRING.logOut}
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AppSafeAreaView>
  );
};

const RowItem = ({
  label,
  value,
  chevron,
}: {
  label: string;
  value?: string;
  chevron?: boolean;
}) => (
  <View style={styles.rowItem}>
    <AppText
      size={getScaleSize(14)}
      font={FONTS.Inter.SemiBold}
      color={COLORS._1A1D1F}
    >
      {label}
    </AppText>
    {value ? (
      <AppText size={getScaleSize(14)} color={COLORS._6B7280}>
        {value}
      </AppText>
    ) : null}
    {chevron ? (
      <Image source={IMAGES.forwardIcon} style={styles.chevronIcon} />
    ) : null}
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
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
});

export default DoctorProfile;
