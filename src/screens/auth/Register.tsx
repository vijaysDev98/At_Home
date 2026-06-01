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
  Linking,
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
  Header,
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
import { IMAGE_BASE_URL, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../../api/apiRoutes';
import { SHOW_TOAST } from '../../constant';
import { CustomDropdown } from '../../components/CustomDropDown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { openInBrowser } from '../../hooks/openBrowser';

// --- Sub-components ---

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



// --- Main Screen ---

const Register: React.FC = () => {



  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isEdit = route.params?.isEdit || false;
  const userData = route.params?.userData || {};
  const { t } = useTranslation();
  const { isLoading } = useSelector((state: RootState) => state.common);

  const [fName, setFName] = useState(userData.fName || '');
  const [lName, setLName] = useState(userData.lName || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [country, setCountry] = useState(userData.country || 'FR');
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

  const doctorSpecialities = [
    { label: t(STRING.generalPractitioner), value: 'generalPractice' },
    { label: t(STRING.cardiology), value: 'cardiology' },
    { label: t(STRING.pediatrician), value: 'pediatrics' },
    { label: t(STRING.dermatologist), value: 'dermatology' },
    { label: t(STRING.ophthalmologist), value: 'orthopedics' },
    { label: t(STRING.neurology), value: 'neurology' },
    { label: t(STRING.other), value: 'other' },
  ];

  const practiceOptions = [
    { label: t(STRING.hospital), value: 'hospital' },
    { label: t(STRING.office), value: 'office' },
  ];

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
      newErrors.fName = t(STRING.fNameRequired);
    }
    if (!lName.trim()) {
      newErrors.lName = t(STRING.lNameRequired);
    }
    if (!isEdit) {
      if (!email.trim()) {
        newErrors.email = t(STRING.emailRequired);
      } else if (!EMAIL_REGEX.test(email.trim())) {
        newErrors.email = t(STRING.enterValidEmail);
      }
      if (!password) {
        newErrors.password = t(STRING.passwordRequired);
      } else if (!PASSWORD_REGEX.test(password)) {
        newErrors.password =
          t(STRING.passwordMustBe8To16CharactersWithAtLeast1Uppercase1LowercaseAnd1Number);
      }
      if (!rpps.trim()) {
        newErrors.rpps = t(STRING.rppsNumberRequired);
      } else if (!/^\d{11}$/.test(rpps.trim())) {
        newErrors.rpps = t(STRING.rppsNumberMustBe11Digits);
      }
      if (!finess.trim()) {
        newErrors.finess = t(STRING.finessNumberRequired);
      } else if (!/^\d{9}$/.test(finess.trim())) {
        newErrors.finess = t(STRING.finessNumberMustBe9Digits);
      }
    }
    if (!specialty) {
      newErrors.specialty = t(STRING.pleaseSelectYourSpecialty);
    }
    if (!placeOfPractice.trim()) {
      newErrors.placeOfPractice = t(STRING.placeOfPracticeRequired);
    }

    if (!facilityName.trim()) {
      newErrors.facilityName = t(STRING.facilityNameRequired);
    }

    if (!address.trim()) {
      newErrors.address = t(STRING.addressRequired);
    }
    if (!isEdit && !agreed) {
      newErrors.agreed = t(STRING.youMustAcceptTheTermsToContinue);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    if (isEdit) {
      return !!(
        fName &&
        lName &&
        specialty &&
        address &&
        placeOfPractice &&
        facilityName
      );
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
          SHOW_TOAST(t(STRING.failedToUploadProfileImage), 'error');
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
      country: country,
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
    <AppSafeAreaView style={styles.container}>
      <AppLoader visible={isLoading} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        {/* <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        > */}
        {/* Frame Container (Matching Screenshot Border) */}
        <View>
          {/* Header */}
          <Header
            style={{ marginHorizontal: getScaleSize(16), marginBottom: getScaleSize(10) }}
            isBack={true}
            title={isEdit ? t(STRING.updateYourProfile) : t(STRING.createYourAccount)}
            subTitle={isEdit
              ? t(STRING.updateYourProfessionalDetails)
              : t(STRING.createAccountSubtitle)}
          />
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
                  style={[
                    styles.avatar,
                    ...(!userAvatar ? [{ resizeMode: 'center' }] : []),
                  ]}
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
            label={t(STRING.fName)}
            isMandatory
            placeholder={t(STRING.enterFName)}
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
            label={t(STRING.lName)}
            isMandatory
            leftIcon={IMAGES.person}
            style={{ marginBottom: getScaleSize(errors.lName ? 4 : 20) }}
            placeholder={t(STRING.enterLName)}
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
                label={t(STRING.emailAddress)}
                isMandatory
                placeholder={t(STRING.enterEmailAddress)}
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
                    : t(STRING.weWillSendVerificationToThisEmail)
                }
                style={{ marginBottom: getScaleSize(errors.email ? 4 : 20) }}
                helperStyle={{ marginTop: getScaleSize(8) }}
              />

              <Input
                label={t(STRING.password)}
                isMandatory
                placeholder={t(STRING.createPassword)}
                leftIcon={IMAGES.lock}
                value={password}
                onChangeText={t => {
                  setPassword(t);
                  setErrors(e => ({ ...e, password: '' }));
                }}
                secureTextEntry={true}
                isPasswordVisible={showPassword}
                handlePasswordVisibility={() => setShowPassword(!showPassword)}
                error={errors.password}
                style={{
                  marginBottom: getScaleSize(errors.password ? 4 : 20),
                }}
              />

              <Input
                label={t(STRING.rppsNumber)}
                isMandatory
                placeholder={`${t(STRING.enterRppsNumber)} (${t(STRING.elevenDigit)})`}
                leftIcon={IMAGES.card}
                value={rpps}
                onChangeText={t => {
                  setRpps(t);
                  setErrors(e => ({ ...e, rpps: '' }));
                }}
                keyboardType="numeric"
                error={errors.rpps}
                helper={errors.rpps ? undefined : t(STRING.rppsNumber)}
                style={{ marginBottom: getScaleSize(errors.rpps ? 4 : 20) }}
                helperStyle={{ marginTop: getScaleSize(8) }}
              />

              <Input
                label={t(STRING.phoneNumber)}
                isMandatory
                placeholder={t(STRING.enterPhoneNumber)}
                isCountryCode
                countryCode={country}
                onCountryCodeSelect={code => {
                  setCountry(code);
                }}
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
                label={t(STRING.finessNumber)}
                isMandatory
                placeholder={`${t(STRING.enterFinessNumber)} (${t(STRING.nineDigit)})`}
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
                    : t(STRING.facilityIdentificationNumber)
                }
                style={{ marginBottom: getScaleSize(errors.finess ? 4 : 20) }}
                helperStyle={{ marginTop: getScaleSize(8) }}
              />
            </>
          )}

          {/* Specialty Dropdown */}
          <CustomDropdown
            label={t(STRING.specialty)}
            isMandatory
            data={doctorSpecialities}
            value={specialty}
            onChange={val => {
              setSpecialty(val);
              setErrors(e => ({ ...e, specialty: '' }));
            }}
            placeholder={t(STRING.selectYourSpecialty)}
            leftIcon={IMAGES.stethoscope}
            error={errors.specialty}
            zIndex={1000}
          />

          {/* Place of Practice Dropdown */}
          <CustomDropdown
            label={t(STRING.placeOfPractice)}
            isMandatory
            data={practiceOptions}
            value={placeOfPractice}
            onChange={val => {
              setPlaceOfPractice(val);
              setErrors(e => ({ ...e, placeOfPractice: '' }));
            }}
            placeholder={t(STRING.placeOfPractice)}
            leftIcon={IMAGES.hospital}
            error={errors.placeOfPractice}
            zIndex={900}
          />

          <Input
            label={t(STRING.facilityName)}
            placeholder={t(STRING.enterFacilityName)}
            leftIcon={IMAGES.hospital}
            isMandatory
            value={facilityName}
            onChangeText={t => {
              setFacilityName(t);
              setErrors(e => ({ ...e, facilityName: '' }));
            }}
            error={errors.facilityName}
            style={{ marginBottom: getScaleSize(errors.address ? 4 : 20) }}
          />

          <Input
            label={t(STRING.businessAddress)}
            isMandatory
            placeholder={t(STRING.streetAddressCityPostalCode)}
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
                    {t(STRING.iAgreeToThe)}{' '}
                    <Text
                      style={styles.link}
                      onPress={() => openInBrowser(PRIVACY_POLICY_URL)}
                    >
                      {t(STRING.privacyPolicy)}
                    </Text>{' '}
                    {t(STRING.and)}{' '}
                    <Text
                      style={styles.link}
                      onPress={() => openInBrowser(TERMS_OF_SERVICE_URL)}
                    >
                      {t(STRING.termsOfService)}
                    </Text>
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

        {/* Footer Section - Inside ScrollView */}
        <View style={styles.footer}>
          {isEdit ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelAction}
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelActionText}>{t(STRING.cancel)}</Text>
              </TouchableOpacity>
              <PrimaryButton
                title={t(STRING.saveChanges)}
                onPress={() => handleSubmit()}
                disabled={!isFormValid()}
                style={styles.saveAction}
              />
            </View>
          ) : (
            <>
              <PrimaryButton
                title={t(STRING.submitRegistration)}
                icon={IMAGES.arrowRight}
                onPress={() => handleSubmit()}
                disabled={!isFormValid()}
              />

              <TouchableOpacity
                style={styles.signInContainer}
                onPress={() => NavigationService.navigate('Login')}
              >
                <Text style={styles.signInText}>
                  {t(STRING.alreadyHaveAnAccount)}{' '}
                  <Text style={styles.signInLink}>{t(STRING.signIn)}</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* </ScrollView> */}
      </KeyboardAwareScrollView>

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
    // paddingBottom: getScaleSize(100),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(20),
  },
  title: {
    fontSize: getScaleSize(20),
    fontFamily: FONTS.Inter.Bold,
    color: COLORS._1E293B,
  },
  subtitle: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS._64748B,
    lineHeight: 20,
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
