import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import {
  Input,
  PrimaryButton,
  AppLoader,
  AppBottomSheet,
  AppSafeAreaView,
} from '../../components';
import { ImagePickerContent } from '../../components/ImagePickerContent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRING } from '../../constant/strings';
import NavigationService from '../../navigation/NavigationService';
import { doctorSpecialities } from '../../utils/dummyData';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { userRegister } from '../../actions/auth/authAction';
import { updateProfile } from '../../actions/profile/profileAction';
import { AppDispatch } from '../../redux/store';
import { useRoute } from '@react-navigation/native';
import { useSimpleImagePicker } from '../../hooks/useSimpleImagePicker';
import { uploadImageToS3 } from '../../services/uploadService';
import { IMAGE_BASE_URL } from '../../api/apiRoutes';
import { SHOW_TOAST } from '../../constant';
import { CustomDropdown } from '../../components/CustomDropDown';

// --- Sub-components ---

interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
}

interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onToggle }) => {
  return (
    <View style={styles.checkboxContainer}>
      <CheckBox
        disabled={false}
        value={checked}
        onValueChange={onToggle}
        tintColors={{ true: COLORS.primary, false: COLORS.slate200 }}
        boxType="square" // iOS specific
        onTintColor={COLORS.primary} // iOS specific
        onCheckColor={COLORS.white} // iOS specific
        onFillColor={COLORS.primary} // iOS specific
        style={styles.checkboxLib}
      />
      {label && (
        <View style={styles.checkboxLabelWrapper}>
          <Text style={styles.checkboxLabel}>{label}</Text>
        </View>
      )}
    </View>
  );
};

const practiceOptions = [
  { label: 'Hospital', value: 'hospital' },
  { label: 'Office', value: 'office' },
];

// --- Main Screen ---

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isEdit = route.params?.isEdit || false;
  const userData = route.params?.userData || {};

  const { isLoading } = useSelector((state: RootState) => state.common);

  const [fName, setFName] = useState(userData.fName || '');
  const [lName, setLName] = useState(userData.lName || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rpps, setRpps] = useState(userData.rppsNumber || '');
  const [finess, setFiness] = useState(userData.finessNumber || '');
  const [specialty, setSpecialty] = useState(userData.specialty || null);
  const [placeOfPractice, setPlaceOfPractice] = useState(
    userData.practiceType || '',
  );
  const [address, setAddress] = useState(userData.businessAddress || '');
  const [facilityName, setFacilityName] = useState(userData.facilityName || '');
  const [agreed, setAgreed] = useState(isEdit); // Auto-agreed if editing

  const [userAvatar, setUserAvatar] = useState<string | null>(
    userData.profileImg || null,
  );
  const [pendingImage, setPendingImage] = useState<{
    uri: string;
    type: string;
    fileName: string;
  } | null>(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);

  const imagePickerSheetRef = useRef<any>(null);

  const { onImageGalleryClick, onCameraPress } = useSimpleImagePicker({
    onImageSelected: async (uri: string, type: string, fileName: string) => {
      setUserAvatar(uri);
      setPendingImage({ uri, type, fileName });
      setHasImageChanged(true);
    },
    onError: (error: string) => {
      SHOW_TOAST(error, 'error');
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!fName.trim()) {
      newErrors.fName = STRING.fNameRequired;
    }
    if (!lName.trim()) {
      newErrors.lName = STRING.lNameRequired;
    }
    if (!isEdit) {
      if (!email.trim()) {
        newErrors.email = STRING.emailRequired;
      } else if (!EMAIL_REGEX.test(email.trim())) {
        newErrors.email = STRING.enterValidEmail;
      }
      if (!password) {
        newErrors.password = STRING.passwordRequired;
      } else if (!PASSWORD_REGEX.test(password)) {
        newErrors.password =
          STRING.passwordMustBe8To16CharactersWithAtLeast1Uppercase1LowercaseAnd1Number;
      }
      if (!rpps.trim()) {
        newErrors.rpps = STRING.rppsNumberRequired;
      } else if (!/^\d{11}$/.test(rpps.trim())) {
        newErrors.rpps = STRING.rppsNumberMustBe11Digits;
      }
      if (!finess.trim()) {
        newErrors.finess = STRING.finessNumberRequired;
      } else if (!/^\d{9}$/.test(finess.trim())) {
        newErrors.finess = STRING.finessNumberMustBe9Digits;
      }
    }
    if (!specialty) {
      newErrors.specialty = STRING.pleaseSelectYourSpecialty;
    }
    if (!placeOfPractice.trim()) {
      newErrors.placeOfPractice = STRING.placeOfPracticeRequired;
    }
    if (!address.trim()) {
      newErrors.address = STRING.addressRequired;
    }
    if (!isEdit && !agreed) {
      newErrors.agreed = STRING.youMustAcceptTheTermsToContinue;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    if (isEdit) {
      return !!(fName && lName && specialty && address && placeOfPractice);
    }
    return !!(
      fName &&
      lName &&
      email &&
      password &&
      rpps &&
      finess &&
      specialty &&
      address &&
      placeOfPractice &&
      agreed
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isEdit) {
      let profileImageUrl = userData.profileImg || '';

      if (hasImageChanged && pendingImage) {
        try {
          const uploadResponse = await uploadImageToS3(
            pendingImage.uri,
            pendingImage.type,
            pendingImage.fileName,
          );
          profileImageUrl = uploadResponse.data.filePath;
        } catch (error) {
          SHOW_TOAST(STRING.failedToUploadProfileImage, 'error');
          return;
        }
      }

      const updateData = {
        fName: fName.trim(),
        lName: lName.trim(),
        phoneNumber: phone.trim(),
        specialty: specialty,
        businessAddress: address.trim(),
        facilityName: facilityName.trim(),
        practiceType: placeOfPractice.trim(),
        profileImg: profileImageUrl,
      };
      const isSuccess = await dispatch(updateProfile(updateData));
      if (isSuccess) {
        navigation.goBack();
      }
      return;
    }

    const registerData = {
      fName: fName.trim(),
      lName: lName.trim(),
      email: email.trim(),
      password: password.trim(),
      phoneNumber: phone.trim(),
      role: 'doctor',
      country: 'France',
      rppsNumber: rpps.trim(),
      finessNumber: finess.trim(),
      specialty: specialty,
      facilityName: facilityName.trim(),
      businessAddress: address.trim(),
      practiceType: placeOfPractice.trim(),
    };
    await dispatch(userRegister(registerData));
  };

  return (
    <AppSafeAreaView edges style={styles.container}>
      <AppLoader visible={isLoading} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Frame Container (Matching Screenshot Border) */}
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isEdit ? STRING.updateYourProfile : STRING.createYourAccount}
              </Text>
              <Text style={styles.subtitle}>
                {isEdit
                  ? STRING.updateYourProfessionalDetails
                  : STRING.createAccountSubtitle}
              </Text>
            </View>
            {/* Profile Image Section (Only in Edit mode) */}
            {isEdit && (
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
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
                  <TouchableOpacity
                    style={styles.cameraBtn}
                    activeOpacity={0.8}
                    onPress={() => imagePickerSheetRef.current?.show()}
                  >
                    <Image source={IMAGES.ic_edit} style={styles.cameraIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Form Fields */}
            <Input
              label={STRING.fName}
              isMandatory
              placeholder={STRING.enterFName}
              value={fName}
              leftIcon={IMAGES.person}
              style={{ marginBottom: getScaleSize(errors.fName ? 4 : 20) }}
              onChangeText={t => {
                setFName(t);
                setErrors(e => ({ ...e, fName: '' }));
              }}
              error={errors.fName}
            />

            <Input
              label={STRING.lName}
              isMandatory
              leftIcon={IMAGES.person}
              style={{ marginBottom: getScaleSize(errors.lName ? 4 : 20) }}
              placeholder={STRING.enterLName}
              value={lName}
              onChangeText={t => {
                setLName(t);
                setErrors(e => ({ ...e, lName: '' }));
              }}
              error={errors.lName}
            />

            {!isEdit && (
              <>
                <Input
                  label={STRING.emailAddress}
                  isMandatory
                  placeholder={STRING.enterEmailAddress}
                  leftIcon={IMAGES.mail}
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    setErrors(e => ({ ...e, email: '' }));
                  }}
                  keyboardType="email-address"
                  error={errors.email}
                  helper={
                    errors.email
                      ? undefined
                      : STRING.weWillSendVerificationToThisEmail
                  }
                  style={{ marginBottom: getScaleSize(errors.email ? 4 : 20) }}
                  helperStyle={{ marginTop: getScaleSize(8) }}
                />

                <Input
                  label={STRING.password}
                  isMandatory
                  placeholder={STRING.createPassword}
                  leftIcon={IMAGES.lock}
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    setErrors(e => ({ ...e, password: '' }));
                  }}
                  secureTextEntry={true}
                  isPasswordVisible={showPassword}
                  handlePasswordVisibility={() =>
                    setShowPassword(!showPassword)
                  }
                  error={errors.password}
                  style={{
                    marginBottom: getScaleSize(errors.password ? 4 : 20),
                  }}
                />

                <Input
                  label={STRING.rppsNumber}
                  isMandatory
                  placeholder={`${STRING.enterRppsNumber} (${STRING.elevenDigit})`}
                  leftIcon={IMAGES.card}
                  value={rpps}
                  onChangeText={t => {
                    setRpps(t);
                    setErrors(e => ({ ...e, rpps: '' }));
                  }}
                  keyboardType="numeric"
                  error={errors.rpps}
                  helper={errors.rpps ? undefined : STRING.rppsNumber}
                  style={{ marginBottom: getScaleSize(errors.rpps ? 4 : 20) }}
                  helperStyle={{ marginTop: getScaleSize(8) }}
                />

                <Input
                  label={STRING.phoneNumber}
                  isMandatory
                  placeholder={`${STRING.enterPhoneNumber}`}
                  leftIcon={IMAGES.phone}
                  value={phone}
                  onChangeText={t => {
                    setPhone(t);
                    setErrors(e => ({ ...e, phone: '' }));
                  }}
                  keyboardType="numeric"
                  error={errors.phone}
                  style={{ marginBottom: getScaleSize(errors.phone ? 4 : 20) }}
                />

                <Input
                  label={STRING.finessNumber}
                  isMandatory
                  placeholder={`${STRING.enterFinessNumber} (${STRING.nineDigit})`}
                  leftIcon={IMAGES.hospital}
                  value={finess}
                  onChangeText={t => {
                    setFiness(t);
                    setErrors(e => ({ ...e, finess: '' }));
                  }}
                  keyboardType="numeric"
                  error={errors.finess}
                  helper={
                    errors.finess
                      ? undefined
                      : STRING.facilityIdentificationNumber
                  }
                  style={{ marginBottom: getScaleSize(errors.finess ? 4 : 20) }}
                  helperStyle={{ marginTop: getScaleSize(8) }}
                />
              </>
            )}

            {/* Specialty Dropdown */}
            <CustomDropdown
              label={STRING.specialty}
              data={doctorSpecialities}
              value={specialty}
              onChange={val => {
                setSpecialty(val);
                setErrors(e => ({ ...e, specialty: '' }));
              }}
              placeholder={STRING.selectYourSpecialty}
              leftIcon={IMAGES.stethoscope}
              error={errors.specialty}
              zIndex={1000}
            />

            {/* Place of Practice Dropdown */}
            <CustomDropdown
              label={STRING.placeOfPractice}
              data={practiceOptions}
              value={placeOfPractice}
              onChange={val => {
                setPlaceOfPractice(val);
                setErrors(e => ({ ...e, placeOfPractice: '' }));
              }}
              placeholder={STRING.placeOfPractice}
              leftIcon={IMAGES.hospital}
              error={errors.placeOfPractice}
              zIndex={900}
            />

            <Input
              label={STRING.facilityName}
              placeholder={STRING.enterFacilityName}
              leftIcon={IMAGES.hospital}
              value={facilityName}
              onChangeText={t => {
                setFacilityName(t);
                setErrors(e => ({ ...e, facilityName: '' }));
              }}
              error={errors.facilityName}
              style={{ marginBottom: getScaleSize(errors.address ? 4 : 20) }}
            />

            <Input
              label={STRING.businessAddress}
              isMandatory
              placeholder={STRING.streetAddressCityPostalCode}
              leftIcon={IMAGES.location_pin}
              value={address}
              onChangeText={t => {
                setAddress(t);
                setErrors(e => ({ ...e, address: '' }));
              }}
              error={errors.address}
              style={{ marginBottom: getScaleSize(errors.address ? 4 : 20) }}
            />

            {/* Terms Agreement */}
            {!isEdit && (
              <>
                <Checkbox
                  checked={agreed}
                  onToggle={() => setAgreed(!agreed)}
                  label={
                    <Text>
                      {STRING.iAgreeToThe}{' '}
                      <Text style={styles.link}>{STRING.privacyPolicy}</Text>{' '}
                      {STRING.and}{' '}
                      <Text style={styles.link}>{STRING.termsOfService}</Text>
                    </Text>
                  }
                />
                {!!errors.agreed && (
                  <Text
                    style={[
                      styles.errorText,
                      {
                        paddingHorizontal: getScaleSize(24),
                        marginBottom: getScaleSize(8),
                      },
                    ]}
                  >
                    {errors.agreed}
                  </Text>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {/* Sticky Footer Section */}
        <View style={styles.footer}>
          {isEdit ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelAction}
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelActionText}>{STRING.cancel}</Text>
              </TouchableOpacity>
              <PrimaryButton
                title={STRING.saveChanges}
                onPress={() => handleSubmit()}
                disabled={!isFormValid()}
                style={styles.saveAction}
              />
            </View>
          ) : (
            <>
              <PrimaryButton
                title={STRING.submitRegistration}
                icon={IMAGES.arrowRight}
                onPress={() => handleSubmit()}
                disabled={!isFormValid()}
              />

              <TouchableOpacity
                style={styles.signInContainer}
                onPress={() => NavigationService.navigate('Login')}
              >
                <Text style={styles.signInText}>
                  {STRING.alreadyHaveAnAccount}{' '}
                  <Text style={styles.signInLink}>{STRING.signIn}</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      <AppBottomSheet ref={imagePickerSheetRef}>
        <ImagePickerContent
          onCameraPress={onCameraPress}
          onGalleryPress={onImageGalleryClick}
          onHide={() => imagePickerSheetRef.current?.hide()}
        />
      </AppBottomSheet>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    paddingBottom: getScaleSize(100),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(20),
  },
  backBtn: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    tintColor: COLORS.primary,
  },
  headerLogo: {
    width: getScaleSize(100),
    height: getScaleSize(40),
  },
  header: {
    marginBottom: getScaleSize(24),
    paddingHorizontal: getScaleSize(24),
  },
  title: {
    fontSize: getScaleSize(20),
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.slate900,
    marginTop: getScaleSize(8),
  },
  subtitle: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.slate700,
  },
  nameRow: {
    // flexDirection: 'row',
    marginBottom: getScaleSize(20),
    // gap: getScaleSize(12),
    // paddingHorizontal: getScaleSize(24),
  },
  label: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate900,
    marginBottom: getScaleSize(8),
  },
  required: {
    color: COLORS.error,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(32),
    paddingHorizontal: getScaleSize(24),
  },
  checkboxLib: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    marginRight: getScaleSize(12),
  },
  checkboxLabelWrapper: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: getScaleSize(13),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate700,
  },
  link: {
    color: COLORS._526674,
    fontFamily: FONTS.Inter.SemiBold,
  },
  footer: {
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(16),
    paddingHorizontal: getScaleSize(24),
  },

  signInContainer: {
    marginTop: getScaleSize(20),
    alignItems: 'center',
  },
  signInText: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate700,
  },
  signInLink: {
    color: COLORS.primary,
    fontFamily: FONTS.Inter.Bold,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  cancelAction: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.slate200,
  },
  cancelActionText: {
    fontSize: getScaleSize(16),
    fontFamily: FONTS.Inter.SemiBold,
    color: COLORS.slate600,
  },
  saveAction: {
    flex: 2,
  },
  errorText: {
    fontSize: getScaleSize(12),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.error,
    marginTop: getScaleSize(4),
    marginBottom: getScaleSize(12),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: getScaleSize(32),
    marginTop: getScaleSize(8),
  },
  avatarWrapper: {
    width: getScaleSize(100),
    height: getScaleSize(100),
    borderRadius: getScaleSize(50),
    backgroundColor: COLORS.slate200,
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: getScaleSize(50),
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cameraIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  avatarTip: {
    fontSize: getScaleSize(12),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate400,
    marginTop: getScaleSize(12),
  },
});

export default Register;
