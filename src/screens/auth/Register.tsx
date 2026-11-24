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
  Dimensions,
  ActivityIndicator,
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
  AppText,
} from '../../components';
import { ImagePickerContent } from '../../components/ImagePickerContent';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
import {
  getPrivacyPolicy,
  getTermsOfService,
  IMAGE_BASE_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
} from '../../api/apiRoutes';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../constant';
import { userApi } from '../../services/userApi';
import { CustomDropdown } from '../../components/CustomDropDown';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useTranslation } from 'react-i18next';
import { openInBrowser } from '../../hooks/openBrowser';
import { ROLES } from '../../constant/getRole';
import FastImage from 'react-native-fast-image';
import { setLoading } from '../../actions/common/commonSlice';

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
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useSelector((state: RootState) => state.language);

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
  const userType: 'doctor' | 'medicalResident' | 'careCoordinator' =
    route.params?.userType ||
    (userData.isMedicalResident
      ? 'medicalResident'
      : userData.isCareCoordinator || userData.roles?.includes('careCoordinator')
      ? 'careCoordinator'
      : 'doctor');

  const [isMedicalResident, setIsMedicalResident] = useState(
    userType === 'medicalResident' || Boolean(userData.isMedicalResident),
  );
  const isCareCoordinator =
    userType === 'careCoordinator' ||
    Boolean(userData.isCareCoordinator) ||
    Boolean(userData.roles?.includes('careCoordinator'));

  const [headOfDepartmentFirstName, setHeadOfDepartmentFirstName] = useState(
    userData.headOfDepartmentFirstName || '',
  );
  const [headOfDepartmentLastName, setHeadOfDepartmentLastName] = useState(
    userData.headOfDepartmentLastName || '',
  );
  const [headOfDepartmentRpps, setHeadOfDepartmentRpps] = useState(
    userData.headOfDepartmentRppsNumber || '',
  );
  const [finess, setFiness] = useState(userData.finessNumber || '');
  const [specialty, setSpecialty] = useState(userData.specialty || null);
  const [placeOfPractice, setPlaceOfPractice] = useState(
    userData.practiceType || '',
  );
  const [address, setAddress] = useState(userData.businessAddress || '');
  const [facilityName, setFacilityName] = useState(userData.facilityName || '');
  const [agreed, setAgreed] = useState(isEdit); // Auto-agreed if editing

  const [isSearchingDoctor, setIsSearchingDoctor] = useState(false);
  const [foundDoctor, setFoundDoctor] = useState<any>(null);
  const [doctorImageError, setDoctorImageError] = useState(false);
  const [isDoctorConfirmed, setIsDoctorConfirmed] = useState(
    Boolean(
      userData.headOfDepartmentFirstName &&
        userData.headOfDepartmentRppsNumber,
    ),
  );

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
        newErrors.password = t(
          STRING.passwordMustBe8To16CharactersWithAtLeast1Uppercase1LowercaseAnd1Number,
        );
      }
      if (isCareCoordinator) {
        // Care Coordinator: No RPPS, no HoD RPPS. FINESS optional.
        if (finess.trim() && !/^\d{9}$/.test(finess.trim())) {
          newErrors.finess = t(STRING.finessNumberMustBe9Digits);
        }
      } else if (isMedicalResident) {
        if (!headOfDepartmentRpps.trim()) {
          newErrors.headOfDepartmentRpps = t(
            STRING.headOfDepartmentRppsRequired,
          );
        } else if (!/^\d{11}$/.test(headOfDepartmentRpps.trim())) {
          newErrors.headOfDepartmentRpps = t(STRING.rppsNumberMustBe11Digits);
        } else if (!isDoctorConfirmed || !headOfDepartmentFirstName.trim()) {
          newErrors.headOfDepartmentRpps = t(
            STRING.pleaseConfirmSupervisingDoctor,
          );
        }
        if (!headOfDepartmentFirstName.trim()) {
          newErrors.headOfDepartmentFirstName = t(
            STRING.headOfDepartmentFirstNameRequired,
          );
        }
        if (!headOfDepartmentLastName.trim()) {
          newErrors.headOfDepartmentLastName = t(
            STRING.headOfDepartmentLastNameRequired,
          );
        }
        if (!finess.trim()) {
          newErrors.finess = t(STRING.headOfDepartmentFinessRequired);
        } else if (!/^\d{9}$/.test(finess.trim())) {
          newErrors.finess = t(STRING.finessNumberMustBe9Digits);
        }
      } else {
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
    }
    if (!isCareCoordinator && !specialty) {
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
        (isCareCoordinator || specialty) &&
        address &&
        placeOfPractice &&
        facilityName
      );
    }
    const rppsValid = isCareCoordinator
      ? true
      : isMedicalResident
      ? !!(
          headOfDepartmentFirstName.trim() &&
          headOfDepartmentLastName.trim() &&
          headOfDepartmentRpps.trim()
        )
      : !!rpps.trim();

    return !!(
      fName &&
      lName &&
      email &&
      password &&
      rppsValid &&
      (isCareCoordinator || finess) &&
      (isCareCoordinator || specialty) &&
      address &&
      placeOfPractice &&
      facilityName &&
      agreed
    );
  };

  const handleFindDoctor = async () => {
    const cleanRpps = headOfDepartmentRpps.trim();
    if (!cleanRpps || cleanRpps.length !== 11) {
      setErrors(e => ({
        ...e,
        headOfDepartmentRpps:
          t(STRING.pleaseEnter11DigitRpps) ||
          'Please enter an 11-digit RPPS number to find your doctor',
      }));
      SHOW_TOAST(
        t(STRING.pleaseEnter11DigitRpps) ||
          'Please enter an 11-digit RPPS number',
        'error',
      );
      return;
    }

    try {
      setIsSearchingDoctor(true);
      const res = await userApi.lookupDoctorByRpps(cleanRpps);
      if (res.success && res.data) {
        const raw = res.data;
        const doctorData =
          raw?.data !== undefined ? raw.data : raw;
        setFoundDoctor(doctorData);
        setDoctorImageError(false);
        setIsDoctorConfirmed(false);
        setErrors(e => ({ ...e, headOfDepartmentRpps: '' }));
      } else {
        setFoundDoctor(null);
        setDoctorImageError(false);
        SHOW_TOAST(
          res.message ||
            t(STRING.doctorNotFoundWithRpps) ||
            'No licensed doctor found with this RPPS number',
          'error',
        );
      }
    } catch (err: any) {
      setFoundDoctor(null);
      setDoctorImageError(false);
      SHOW_TOAST(
        err?.message ||
          t(STRING.doctorNotFoundWithRpps) ||
          'Failed to lookup doctor',
        'error',
      );
    } finally {
      setIsSearchingDoctor(false);
    }
  };

  const handleConfirmDoctor = () => {
    if (!foundDoctor) return;
    const doc =
      foundDoctor?.data !== undefined ? foundDoctor.data : foundDoctor;
    const firstName =
      doc.fName || doc.firstName || doc.first_name || '';
    const lastName =
      doc.lName || doc.lastName || doc.last_name || '';
    const finessNum =
      doc.finessNumber || doc.finess || doc.headOfDepartmentFinessNumber || '';
    const facility =
      doc.facilityName || doc.facility || '';
    const practice =
      doc.practiceType || doc.placeOfPractice || '';
    const spec =
      doc.specialty || '';
    const busAddress =
      doc.businessAddress || doc.address || '';

    setHeadOfDepartmentFirstName(firstName);
    setHeadOfDepartmentLastName(lastName);
    if (finessNum) {
      setFiness(finessNum);
    }
    if (facility) {
      setFacilityName(facility);
    }
    if (practice) {
      setPlaceOfPractice(practice);
    }
    if (spec) {
      setSpecialty(spec);
    }
    if (busAddress) {
      setAddress(busAddress);
    }
    setIsDoctorConfirmed(true);
    setFoundDoctor(null);
    setDoctorImageError(false);
    setErrors(e => ({
      ...e,
      headOfDepartmentFirstName: '',
      headOfDepartmentLastName: '',
      headOfDepartmentRpps: '',
      finess: '',
      facilityName: '',
      specialty: '',
      placeOfPractice: '',
      address: '',
    }));
    SHOW_SUCCESS_TOAST(
      t(STRING.doctorConfirmedSuccess) || 'Supervising doctor confirmed',
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    dispatch(setLoading(true));

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
          dispatch(setLoading(false));
          SHOW_TOAST(t(STRING.failedToUploadProfileImage), 'error');
          return;
        }
      }

      const updateData: any = {
        fName: fName.trim(),
        lName: lName.trim(),
        phoneNumber: phone.trim(),
        specialty: specialty,
        businessAddress: address.trim(),
        facilityName: facilityName.trim(),
        practiceType: placeOfPractice.trim(),
        profileImg: profileImageUrl,
      };
      if (isMedicalResident) {
        updateData.headOfDepartmentFirstName =
          headOfDepartmentFirstName.trim();
        updateData.headOfDepartmentLastName =
          headOfDepartmentLastName.trim();
        updateData.headOfDepartmentRppsNumber =
          headOfDepartmentRpps.trim();
        updateData.headOfDepartmentFinessNumber =
          finess.trim();
      }
      const isSuccess = await dispatch(updateProfile(updateData));
      if (isSuccess) {
        navigation.goBack();
      }
      dispatch(setLoading(false));

      return;
    }

    const effectiveRpps = isCareCoordinator
      ? ''
      : isMedicalResident
      ? headOfDepartmentRpps.trim()
      : rpps.trim();

    const registerData: any = {
      fName: fName.trim(),
      lName: lName.trim(),
      email: email.trim(),
      password: password.trim(),
      phoneNumber: phone.trim(),
      role: isCareCoordinator ? ROLES.CARE_COORDINATOR : ROLES.DOCTOR,
      country: country,
      rppsNumber: effectiveRpps,
      isMedicalResident: Boolean(isMedicalResident),
      isCareCoordinator: Boolean(isCareCoordinator),
      finessNumber: finess.trim(),
      specialty: specialty || (isCareCoordinator ? 'generalPractice' : ''),
      facilityName: facilityName.trim(),
      businessAddress: address.trim(),
      practiceType: placeOfPractice.trim(),
    };

    if (isMedicalResident) {
      registerData.headOfDepartmentFirstName =
        headOfDepartmentFirstName.trim();
      registerData.headOfDepartmentLastName = headOfDepartmentLastName.trim();
      registerData.headOfDepartmentRppsNumber = headOfDepartmentRpps.trim();
      registerData.headOfDepartmentFinessNumber = finess.trim();
    }

    await dispatch(userRegister(registerData));
  };

  return (
    <AppSafeAreaView style={styles.container}>
      <AppLoader visible={isLoading} />
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 16 }, // ← bottom safe area here
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        style={{ flex: 1 }}
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
            style={{
              marginHorizontal: getScaleSize(16),
              marginBottom: getScaleSize(10),
            }}
            isBack={true}
            title={
              isEdit ? t(STRING.updateYourProfile) : t(STRING.createYourAccount)
            }
            subTitle={
              isEdit
                ? t(STRING.updateYourProfessionalDetails)
                : t(STRING.createAccountSubtitle)
            }
          />
          {/* Profile Image Section (Only in Edit mode) */}
          {isEdit && (
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <FastImage
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
                    // ...(!userAvatar ? [{ resizeMode: 'center' }] : []),
                  ]}
                  resizeMode={!userAvatar ? "center" : "cover"}
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

              {/* Selected Profile Banner */}
              <View style={styles.roleHeaderCard}>
                <View style={styles.roleBadgeRow}>
                  <Image
                    source={
                      isCareCoordinator
                        ? IMAGES.role_coordinator
                        : isMedicalResident
                        ? IMAGES.role_intern
                        : IMAGES.role_doctor
                    }
                    style={styles.roleHeaderAvatar}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {isCareCoordinator
                        ? t(STRING.careCoordinator)
                        : isMedicalResident
                        ? t(STRING.medicalStudentInternWithoutRpps)
                        : t(STRING.doctorWithRpps)}
                    </AppText>
                  </View>
                  {!isEdit && (
                    <TouchableOpacity
                      onPress={() => navigation.goBack()}
                      style={styles.changeRoleBtn}
                      activeOpacity={0.7}
                    >
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.SemiBold}
                        color={COLORS.primary}
                      >
                        {t(STRING.edit) || 'Change'}
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>

                {isCareCoordinator && (
                  <View style={styles.coordinatorNoticeBox}>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._526674}
                      lineHeight={getScaleSize(17)}
                    >
                      {t(STRING.careCoordinatorRoleNotice)}
                    </AppText>
                  </View>
                )}
              </View>

              {isMedicalResident ? (
                <>
                  <View style={styles.sectionHeaderWrap}>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS.slate900}
                    >
                      {t(STRING.supervisingDoctorInfo)}
                    </AppText>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                      style={{ marginTop: getScaleSize(2) }}
                    >
                      {t(STRING.supervisingDoctorInfoDesc)}
                    </AppText>
                  </View>

                  {/* Supervising Doctor RPPS Number with Find Button */}
                  <Input
                    label={t(STRING.headOfDepartmentRppsNumber)}
                    isMandatory
                    isNumberOnly
                    maxLength={11}
                    placeholder={t(STRING.enterRppsNumber)}
                    leftIcon={IMAGES.card}
                    value={headOfDepartmentRpps}
                    onChangeText={t => {
                      setHeadOfDepartmentRpps(t);
                      setErrors(e => ({ ...e, headOfDepartmentRpps: '' }));
                      if (foundDoctor) {
                        setFoundDoctor(null);
                      }
                      if (isDoctorConfirmed) {
                        setIsDoctorConfirmed(false);
                        setHeadOfDepartmentFirstName('');
                        setHeadOfDepartmentLastName('');
                        setFiness('');
                      }
                    }}
                    keyboardType="number-pad"
                    error={errors.headOfDepartmentRpps}
                    helper={
                      errors.headOfDepartmentRpps
                        ? undefined
                        : t(STRING.headOfDepartmentRppsNumber)
                    }
                    style={{
                      marginBottom: getScaleSize(
                        errors.headOfDepartmentRpps
                          ? 4
                          : foundDoctor || isDoctorConfirmed
                          ? 10
                          : 16,
                      ),
                    }}
                    helperStyle={{ marginTop: getScaleSize(8) }}
                    trailing={
                      <TouchableOpacity
                        style={[
                          styles.findDoctorBtn,
                          isSearchingDoctor && styles.findDoctorBtnDisabled,
                        ]}
                        onPress={handleFindDoctor}
                        disabled={isSearchingDoctor}
                        activeOpacity={0.7}
                      >
                        {isSearchingDoctor ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.white}
                          />
                        ) : (
                          <View style={styles.findDoctorBtnContent}>
                            <Image
                              source={IMAGES.search}
                              style={styles.findDoctorIcon}
                            />
                            <AppText
                              size={getScaleSize(12)}
                              font={FONTS.Inter.SemiBold}
                              color={COLORS.white}
                            >
                              {t(STRING.find) || 'Find'}
                            </AppText>
                          </View>
                        )}
                      </TouchableOpacity>
                    }
                  />

                  {/* Found Doctor Preview Card */}
                  {foundDoctor && !isDoctorConfirmed && (
                    <View style={styles.doctorFoundCard}>
                      <View style={styles.doctorFoundHeader}>
                        <View style={styles.doctorAvatarContainer}>
                          {foundDoctor?.profileImg && !doctorImageError ? (
                            <Image
                              source={{
                                uri: foundDoctor.profileImg.startsWith('http')
                                  ? foundDoctor.profileImg
                                  : `${IMAGE_BASE_URL}${foundDoctor.profileImg}`,
                              }}
                              style={styles.doctorFoundAvatar}
                              resizeMode="cover"
                              onError={() => setDoctorImageError(true)}
                            />
                          ) : (
                            <Image
                              source={IMAGES.role_doctor}
                              style={styles.doctorFoundAvatar}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                        <View style={styles.doctorFoundInfo}>
                          <View style={styles.doctorFoundBadge}>
                            <Image
                              source={IMAGES.serviceCompletedCheck}
                              style={styles.badgeCheckIcon}
                            />
                            <AppText
                              size={getScaleSize(10)}
                              font={FONTS.Inter.SemiBold}
                              color="#16A34A"
                            >
                              {t(STRING.supervisingDoctorFound) ||
                                'Supervising Doctor Found'}
                            </AppText>
                          </View>
                          <AppText
                            size={getScaleSize(15)}
                            font={FONTS.Inter.Bold}
                            color={COLORS.slate900}
                            numberOfLines={1}
                          >
                            {foundDoctor?.fullName
                              ? (foundDoctor.fullName.startsWith('Dr.')
                                  ? foundDoctor.fullName
                                  : `Dr. ${foundDoctor.fullName}`)
                              : (foundDoctor?.fName || foundDoctor?.lName)
                              ? `Dr. ${[foundDoctor?.fName, foundDoctor?.lName].filter(Boolean).join(' ')}`
                              : ''}
                          </AppText>
                          {foundDoctor?.specialty ? (
                            <AppText
                              size={getScaleSize(12)}
                              font={FONTS.Inter.Medium}
                              color={COLORS._6F767E}
                              numberOfLines={1}
                            >
                              {t(foundDoctor.specialty) ||
                                foundDoctor.specialty}
                            </AppText>
                          ) : null}
                        </View>
                      </View>

                      {(foundDoctor?.facilityName ||
                        foundDoctor?.finessNumber) && (
                        <View style={styles.doctorDetailsRow}>
                          {foundDoctor?.facilityName ? (
                            <View style={styles.doctorDetailItem}>
                              <Image
                                source={IMAGES.hospital}
                                style={styles.doctorDetailIcon}
                              />
                              <AppText
                                size={getScaleSize(11)}
                                font={FONTS.Inter.Regular}
                                color={COLORS._6F767E}
                                numberOfLines={1}
                              >
                                {foundDoctor.facilityName}
                              </AppText>
                            </View>
                          ) : null}
                          {foundDoctor?.finessNumber ? (
                            <View style={styles.doctorDetailItem}>
                              <Image
                                source={IMAGES.card}
                                style={styles.doctorDetailIcon}
                              />
                              <AppText
                                size={getScaleSize(11)}
                                font={FONTS.Inter.Regular}
                                color={COLORS._6F767E}
                              >
                                FINESS: {foundDoctor.finessNumber}
                              </AppText>
                            </View>
                          ) : null}
                        </View>
                      )}

                      <View style={styles.doctorActionRow}>
                        <TouchableOpacity
                          style={styles.doctorCancelBtn}
                          onPress={() => {
                            setFoundDoctor(null);
                            setDoctorImageError(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.Medium}
                            color={COLORS._6F767E}
                          >
                            {t(STRING.cancel) || 'Cancel'}
                          </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.doctorConfirmBtn}
                          onPress={handleConfirmDoctor}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={IMAGES.serviceCompletedCheck}
                            style={styles.confirmCheckIcon}
                          />
                          <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.SemiBold}
                            color={COLORS.white}
                          >
                            {t(STRING.confirm) || 'Confirm'}
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Confirmed Doctor Banner */}
                  {isDoctorConfirmed && (
                    <View style={styles.confirmedDoctorBadge}>
                      <View style={styles.confirmedDoctorLeft}>
                        <Image
                          source={IMAGES.serviceCompletedCheck}
                          style={styles.confirmedCheckIcon}
                        />
                        <View style={{ flex: 1, marginLeft: getScaleSize(8) }}>
                          <AppText
                            size={getScaleSize(11)}
                            font={FONTS.Inter.SemiBold}
                            color="#16A34A"
                          >
                            {t(STRING.verifiedDoctor) ||
                              'Verified Supervising Doctor'}
                          </AppText>
                          <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.Bold}
                            color={COLORS.slate900}
                          >
                            {`Dr. ${[headOfDepartmentFirstName, headOfDepartmentLastName].filter(Boolean).join(' ')}`}
                          </AppText>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setIsDoctorConfirmed(false);
                          setHeadOfDepartmentFirstName('');
                          setHeadOfDepartmentLastName('');
                          setFiness('');
                        }}
                        style={styles.changeDoctorBtn}
                        activeOpacity={0.7}
                      >
                        <AppText
                          size={getScaleSize(11)}
                          font={FONTS.Inter.SemiBold}
                          color={COLORS.primary}
                        >
                          {t(STRING.changeDoctor) || 'Change'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Auto-filled Head fields (only shown when doctor is confirmed) */}
                  {isDoctorConfirmed && (
                    <>
                      <Input
                        label={t(STRING.headOfDepartmentFirstName)}
                        isMandatory
                        isLocked={true}
                        placeholder={t(STRING.enterFName)}
                        leftIcon={IMAGES.person}
                        value={headOfDepartmentFirstName}
                        style={{
                          marginBottom: getScaleSize(20),
                        }}
                      />

                      <Input
                        label={t(STRING.headOfDepartmentLastName)}
                        isMandatory
                        isLocked={true}
                        placeholder={t(STRING.enterLName)}
                        leftIcon={IMAGES.person}
                        value={headOfDepartmentLastName}
                        style={{
                          marginBottom: getScaleSize(20),
                        }}
                      />

                      <Input
                        label={t(STRING.headOfDepartmentFinessNumber)}
                        isMandatory
                        isLocked={true}
                        maxLength={9}
                        placeholder={`${t(STRING.enterFinessNumber)} (${t(
                          STRING.nineDigit,
                        )})`}
                        leftIcon={IMAGES.hospital}
                        value={finess}
                        helper={t(STRING.headOfDepartmentFinessHelper)}
                        style={{
                          marginBottom: getScaleSize(20),
                        }}
                        helperStyle={{ marginTop: getScaleSize(8) }}
                      />
                    </>
                  )}
                </>
              ) : isCareCoordinator ? null : (
                <Input
                  label={t(STRING.rppsNumber)}
                  isMandatory
                  isNumberOnly
                  maxLength={11}
                  placeholder={t(STRING.enterRppsNumber)}
                  leftIcon={IMAGES.card}
                  value={rpps}
                  onChangeText={t => {
                    setRpps(t);
                    setErrors(e => ({ ...e, rpps: '' }));
                  }}
                  keyboardType="number-pad"
                  error={errors.rpps}
                  helper={errors.rpps ? undefined : t(STRING.rppsNumber)}
                  style={{ marginBottom: getScaleSize(errors.rpps ? 4 : 20) }}
                  helperStyle={{ marginTop: getScaleSize(8) }}
                />
              )}

              <Input
                label={t(STRING.phoneNumber)}
                isMandatory
                maxLength={15}
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

              {!isMedicalResident && (
                <Input
                  label={t(STRING.finessNumber)}
                  isMandatory={!isCareCoordinator}
                  placeholder={`${t(STRING.enterFinessNumber)} (${t(
                    STRING.nineDigit,
                  )})`}
                  leftIcon={IMAGES.hospital}
                  value={finess}
                  onChangeText={t => {
                    setFiness(t);
                    setErrors(e => ({ ...e, finess: '' }));
                  }}
                  maxLength={9}
                  // isFiness={true}
                  keyboardType="number-pad"
                  error={errors.finess}
                  helper={
                    errors.finess
                      ? undefined
                      : t(STRING.facilityIdentificationNumber)
                  }
                  style={{ marginBottom: getScaleSize(errors.finess ? 4 : 20) }}
                  helperStyle={{ marginTop: getScaleSize(8) }}
                />
              )}
            </>
          )}

          {/* Specialty Dropdown */}
          {!isCareCoordinator && (
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
          )}

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
            leftIcon={IMAGES.ic_pin}
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
                  <AppText
                    // style={{ color: COLORS.primary }}
                    color={COLORS.primaryMuted}
                  >
                    {t(STRING.iAgreeToThe)}{' '}
                    <AppText
                      font={FONTS.Inter.SemiBold}
                      style={styles.link}
                      color={COLORS.primary}
                      onPress={() =>
                        openInBrowser(getPrivacyPolicy(currentLanguage))
                      }
                    >
                      {t(STRING.privacyPolicy)}
                    </AppText>{' '}
                    {t(STRING.and)}{' '}
                    <AppText
                      font={FONTS.Inter.SemiBold}
                      style={styles.link}
                      color={COLORS.primary}
                      onPress={() =>
                        openInBrowser(getTermsOfService(currentLanguage))
                      }
                    >
                      {t(STRING.termsOfService)}.
                    </AppText>
                  </AppText>
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
  roleHeaderCard: {
    marginHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(20),
    padding: getScaleSize(14),
    borderRadius: getScaleSize(14),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  roleHeaderAvatar: {
    width: getScaleSize(46),
    height: getScaleSize(46),
    borderRadius: getScaleSize(23),
  },
  changeRoleBtn: {
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(8),
    backgroundColor: '#EFF6FF',
  },
  coordinatorNoticeBox: {
    marginTop: getScaleSize(10),
    padding: getScaleSize(10),
    backgroundColor: '#F1F5F9',
    borderRadius: getScaleSize(8),
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
  },
  sectionHeaderWrap: {
    paddingHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(14),
  },
  residentQuestionContainer: {
    marginBottom: getScaleSize(16),
    paddingHorizontal: getScaleSize(24),
  },
  residentQuestionTitle: {
    marginBottom: getScaleSize(8),
  },
  residentOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(28),
  },
  residentRadioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    paddingVertical: getScaleSize(4),
  },
  radioCircle: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    borderRadius: getScaleSize(9),
    borderWidth: 1.8,
    borderColor: COLORS.slate400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerDot: {
    width: getScaleSize(9),
    height: getScaleSize(9),
    borderRadius: getScaleSize(4.5),
    backgroundColor: COLORS.primary,
  },
  findDoctorBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(8),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: getScaleSize(64),
    height: getScaleSize(34),
  },
  findDoctorBtnDisabled: {
    opacity: 0.7,
  },
  findDoctorBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
  findDoctorIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  doctorFoundCard: {
    marginHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(18),
    padding: getScaleSize(14),
    backgroundColor: '#F0FDF4',
    borderRadius: getScaleSize(14),
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  doctorFoundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatarContainer: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(24),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  doctorFoundAvatar: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(24),
    resizeMode: 'cover',
  },
  doctorFoundInfo: {
    flex: 1,
    marginLeft: getScaleSize(12),
  },
  doctorFoundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
    marginBottom: getScaleSize(2),
  },
  badgeCheckIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: '#16A34A',
    resizeMode: 'contain',
  },
  doctorDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: getScaleSize(12),
    marginTop: getScaleSize(10),
    paddingTop: getScaleSize(8),
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  doctorDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
  doctorDetailIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    tintColor: COLORS._6F767E,
    resizeMode: 'contain',
  },
  doctorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: getScaleSize(10),
    marginTop: getScaleSize(12),
  },
  doctorCancelBtn: {
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(8),
    backgroundColor: '#F1F5F9',
  },
  doctorConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(8),
    backgroundColor: COLORS.primary,
  },
  confirmCheckIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  confirmedDoctorBadge: {
    marginHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(16),
    padding: getScaleSize(12),
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmedDoctorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  confirmedCheckIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: '#16A34A',
    resizeMode: 'contain',
  },
  changeDoctorBtn: {
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(5),
    borderRadius: getScaleSize(6),
    backgroundColor: '#EFF6FF',
    marginLeft: getScaleSize(8),
  },
});

export default Register;
