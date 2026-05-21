import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppLoader,
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  PrimaryButton,
} from '../../../components';
import NavigationService from '../../../navigation/NavigationService';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { STRING } from '../../../constant/strings';
import {
  addPatient,
  updatePatient,
} from '../../../actions/patient/patientAction';
import { RootState } from '../../../redux/store';
import { useRoute } from '@react-navigation/native';
import AppBottomSheet from '../../../components/AppBottomSheet';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { CustomDropdown } from '../../../components/CustomDropDown';
import { GENDER } from '../../../constant/constantData';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AppDatePicker = ({
  open,
  date,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}) => {
  return (
    <DatePicker
      modal
      open={open}
      date={date}
      mode="date"
      onConfirm={onConfirm}
      onCancel={onCancel}
      maximumDate={new Date()}
      theme="light"
    />
  );
};

const AddPatient: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { isLoading } = useSelector((state: RootState) => state.common);

  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [dob, setDob] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('FR');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [socialInsuranceNumber, setSocialInsuranceNumber] = useState('');
  const [weight, setWeight] = useState('');

  const route = useRoute<any>();
  const patientToEdit = route.params?.patient;
  console.log('patientToEdit', patientToEdit);

  const isEdit = !!patientToEdit;

  const discardSheetRef = useRef<ActionSheetRef>(null);

  useEffect(() => {
    if (patientToEdit) {
      setFName(patientToEdit.fName || '');
      setLName(patientToEdit.lName || '');
      setPhone(patientToEdit.phoneNumber || '');
      setEmail(patientToEdit.email || '');
      setDob(
        patientToEdit.dateOfBirth
          ? moment(patientToEdit.dateOfBirth).format('YYYY-MM-DD')
          : '',
      );
      if (patientToEdit.dateOfBirth) {
        setSelectedDate(new Date(patientToEdit.dateOfBirth));
      }
      setStreet(patientToEdit.streetAddress || '');
      setCity(patientToEdit.city || '');
      setZip(patientToEdit.zip || '');
      setNotes(patientToEdit.medicalDescription || '');
      setCountry(patientToEdit.country || 'FR');
      setGender(patientToEdit.gender || '');
      setWeight(patientToEdit?.weight?.toString() || '');
      setSocialInsuranceNumber(patientToEdit.socialInsuranceNumber || '');
    }
  }, [patientToEdit]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fName.trim()) {
      newErrors.fName = STRING.fNameRequired;
    }
    if (!lName.trim()) {
      newErrors.lName = STRING.lNameRequired;
    }

    if (!phone.trim()) {
      newErrors.phone = STRING.phoneRequired;
    }

    if (!email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = STRING.invalidEmailAddress;
    }

    if (!dob.trim()) {
      newErrors.dob = STRING.dateOfBirthRequired;
    }

    if (!gender) {
      newErrors.gender = STRING.genderRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const payload = {
        fName: fName.trim(),
        lName: lName.trim(),
        phoneNumber: phone.trim(),
        email: email.trim(),
        dateOfBirth: dob,
        streetAddress: street.trim(),
        city: city.trim(),
        zip: zip.trim(),
        medicalDescription: notes.trim(),
        gender: gender,
        country: country,
        ...(socialInsuranceNumber.trim() && {
          socialInsuranceNumber: socialInsuranceNumber.trim(),
        }),
        ...(weight.trim() && { weight: weight.trim() }),
      };
      if (isEdit) {
        dispatch(updatePatient(patientToEdit._id || patientToEdit.id, payload));
      } else {
        dispatch(addPatient(payload));
      }
    }
  };

  const handleCancel = () => {
    discardSheetRef.current?.show();
  };

  const confirmDiscard = () => {
    discardSheetRef.current?.hide();
    NavigationService.goBack();
  };

  return (
    <>
      <AppLoader visible={isLoading} />
      <AppSafeAreaView edges={true}>
        <Header
          isBack
          title={isEdit ? STRING.editPatient : STRING.addPatientTitle}
          backIcon={IMAGES.arrowLeft}
          style={styles.headerStyle}
          {...(!isEdit && {
            leftContent: () => (
              <TouchableOpacity activeOpacity={0.8} onPress={handleCancel}>
                <AppText
                  size={getScaleSize(15)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                >
                  {STRING.cancel}
                </AppText>
              </TouchableOpacity>
            ),
          })}
        />
        <View style={styles.container}>
          <KeyboardAwareScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid
            extraScrollHeight={getScaleSize(40)}
            enableAutomaticScroll
            extraHeight={getScaleSize(120)}
          >
            {/* <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          > */}
            {/* Personal Information */}
            <View style={styles.section}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._6F767E}
                style={styles.sectionTitle}
              >
                {STRING.personalInformation}
              </AppText>
              <View style={styles.card}>
                <View style={styles.nameRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      value={fName}
                      onChangeText={t => {
                        setFName(t);
                        setErrors(prev => ({ ...prev, fName: '' }));
                      }}
                      placeholder={STRING.enterFName}
                      placeholderTextColor={COLORS._7A7A7A}
                      label={STRING.fName}
                      labelColor={COLORS.black}
                      labelFont={FONTS.Inter.SemiBold}
                      labelSize={getScaleSize(13)}
                      isMandatory={true}
                      error={errors.fName}
                      inputWrapperStyle={[
                        styles.inputWrapperStyle,
                        errors.fName && {
                          borderWidth: 1,
                          borderColor: COLORS.error,
                        },
                      ]}
                      style={styles.inputContainer}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      value={lName}
                      onChangeText={t => {
                        setLName(t);
                        setErrors(prev => ({ ...prev, lName: '' }));
                      }}
                      placeholder={STRING.enterLName}
                      placeholderTextColor={COLORS._7A7A7A}
                      label={STRING.lName}
                      labelColor={COLORS.black}
                      labelFont={FONTS.Inter.SemiBold}
                      labelSize={getScaleSize(13)}
                      isMandatory={true}
                      error={errors.lName}
                      inputWrapperStyle={[
                        styles.inputWrapperStyle,
                        errors.lName && {
                          borderWidth: 1,
                          borderColor: COLORS.error,
                        },
                      ]}
                      style={styles.inputContainer}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Input
                    value={dob}
                    isMandatory
                    onPress={() => setDatePickerOpen(true)}
                    placeholder={STRING.selectDateOfBirth}
                    placeholderTextColor={COLORS._7A7A7A}
                    label={STRING.dateOfBirth}
                    error={errors.dob}
                    style={styles.inputContainer}
                    labelColor={COLORS.black}
                    labelFont={FONTS.Inter.SemiBold}
                    labelSize={getScaleSize(13)}
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.dob && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    editable={false}
                    trailing={
                      <Image
                        source={IMAGES.ic_calender}
                        style={styles.inputIcon}
                      />
                    }
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: getScaleSize(12),
                    flex: 1,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <CustomDropdown
                      labelStyle={{
                        fontFamily: FONTS.Inter.SemiBold,
                        color: COLORS.black,
                        fontSize: getScaleSize(13),
                      }}
                      isMandatory={true}
                      style={{
                        paddingHorizontal: 0,
                        marginBottom: 0,
                      }}
                      labelContainerStyle={{
                        backgroundColor: COLORS._F9FAFB,
                        borderWidth: 0,
                      }}
                      label={STRING.gender}
                      data={GENDER}
                      value={gender}
                      onChange={val => {
                        setGender(val);
                        setErrors(e => ({ ...e, gender: '' }));
                      }}
                      placeholder={STRING.selectGender}
                      leftIcon={IMAGES.ic_gender}
                      error={errors.gender}
                      zIndex={1000}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Input
                      value={weight}
                      onChangeText={text => setWeight(text)}
                      keyboardType="numeric"
                      placeholder="e.g. 70"
                      placeholderTextColor={COLORS._7A7A7A}
                      label="Weight (kg)"
                      labelColor={COLORS.black}
                      labelFont={FONTS.Inter.SemiBold}
                      labelSize={getScaleSize(13)}
                      inputWrapperStyle={styles.inputWrapperStyle}
                      style={styles.inputContainer}
                    />
                  </View>
                </View>
                <Input
                  value={socialInsuranceNumber}
                  onChangeText={t => {
                    setSocialInsuranceNumber(t);
                    setErrors(prev => ({ ...prev, socialInsuranceNumber: '' }));
                  }}
                  placeholder={STRING.enterSocialInsuranceNumber}
                  placeholderTextColor={COLORS._7A7A7A}
                  label={STRING.socialInsuranceNumber}
                  labelColor={COLORS.black}
                  labelFont={FONTS.Inter.SemiBold}
                  leftIcon={IMAGES.ic_insurance}
                  labelSize={getScaleSize(13)}
                  // error={errors.socialInsuranceNumber}
                  inputWrapperStyle={[
                    styles.inputWrapperStyle,
                    errors.socialInsuranceNumber && {
                      borderWidth: 1,
                      borderColor: COLORS.error,
                    },
                  ]}
                  style={styles.inputContainer}
                />
              </View>
            </View>

            {/* Contact Details */}
            <View style={styles.section}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._6B7280}
                style={styles.sectionTitle}
              >
                {STRING.contactDetails}
              </AppText>
              <View style={styles.card}>
                <View style={styles.fieldGroup}>
                  <Input
                    value={phone}
                    isCountryCode
                    countryCode={country}
                    onCountryCodeSelect={code => {
                      setCountry(code);
                    }}
                    onChangeText={t => {
                      setPhone(t);
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    keyboardType="phone-pad"
                    error={errors.phone}
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.phone && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    placeholderTextColor={COLORS._7A7A7A}
                    placeholder={STRING.enterPhoneNumber}
                    label={STRING.phoneNumber}
                    labelColor={COLORS.black}
                    labelFont={FONTS.Inter.SemiBold}
                    labelSize={getScaleSize(13)}
                    isMandatory={true}
                    error={errors.phone}
                    leftIcon={IMAGES.phone}
                    style={styles.inputContainer}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Input
                    value={email}
                    onChangeText={t => {
                      setEmail(t);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    isMandatory
                    keyboardType="email-address"
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.email && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    placeholderTextColor={COLORS._7A7A7A}
                    autoCapitalize="none"
                    placeholder={STRING.enterEmailAddress}
                    labelColor={COLORS.black}
                    labelFont={FONTS.Inter.SemiBold}
                    labelSize={getScaleSize(13)}
                    label={STRING.emailAddress}
                    error={errors.email}
                    leftIcon={IMAGES.email_icon}
                    style={styles.inputContainer}
                  />
                </View>
              </View>
            </View>

            {/* Address */}
            <View style={styles.section}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._6B7280}
                style={styles.sectionTitle}
              >
                {STRING.address}
              </AppText>
              <View style={styles.card}>
                <View style={styles.fieldGroup}>
                  <Input
                    value={street}
                    onChangeText={setStreet}
                    placeholder={STRING.enterStreetAddress}
                    error={errors.street}
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.street && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    placeholderTextColor={COLORS._7A7A7A}
                    labelColor={COLORS.black}
                    labelFont={FONTS.Inter.SemiBold}
                    labelSize={getScaleSize(13)}
                    label={STRING.streetAddress}
                    style={styles.inputContainer}
                  />
                </View>

                <View style={styles.rowGap}>
                  <View style={[styles.fieldGroup, styles.flex1]}>
                    <Input
                      value={city}
                      onChangeText={setCity}
                      error={errors.city}
                      inputWrapperStyle={[
                        styles.inputWrapperStyle,
                        errors.city && {
                          borderWidth: 1,
                          borderColor: COLORS.error,
                        },
                      ]}
                      labelColor={COLORS.black}
                      labelFont={FONTS.Inter.SemiBold}
                      labelSize={getScaleSize(13)}
                      placeholderTextColor={COLORS._7A7A7A}
                      placeholder={STRING.enterCity}
                      label={STRING.city}
                      style={styles.inputContainer}
                    />
                  </View>
                  <View style={[styles.fieldGroup, styles.zipWidth]}>
                    <Input
                      value={zip}
                      onChangeText={setZip}
                      error={errors.zip}
                      inputWrapperStyle={[
                        styles.inputWrapperStyle,
                        errors.zip && {
                          borderWidth: 1,
                          borderColor: COLORS.error,
                        },
                      ]}
                      placeholderTextColor={COLORS._7A7A7A}
                      placeholder={STRING.enterZip}
                      labelColor={COLORS.black}
                      labelFont={FONTS.Inter.SemiBold}
                      labelSize={getScaleSize(13)}
                      label={STRING.zip}
                      style={styles.inputContainer}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Medical Information */}
            <View style={[styles.section, { paddingBottom: getScaleSize(20) }]}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._6B7280}
                style={styles.sectionTitle}
              >
                {STRING.medicalInformation}
              </AppText>
              <View style={styles.card}>
                <View style={styles.fieldGroup}>
                  <Input
                    value={notes}
                    onChangeText={setNotes}
                    error={errors.notes}
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.notes && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    placeholderTextColor={COLORS._7A7A7A}
                    labelColor={COLORS.black}
                    labelFont={FONTS.Inter.SemiBold}
                    labelSize={getScaleSize(13)}
                    multiline
                    numberOfLines={4}
                    placeholder={STRING.notesPlaceholder}
                    label={STRING.initialNotes}
                    helper={STRING.notesHelper}
                    helperStyle={{
                      color: COLORS._6F767E,
                      marginTop: getScaleSize(3),
                    }}
                    // inputWrapperStyle={[
                    //   styles.inputWrapperStyle,
                    //   errors.notes && {
                    //     borderWidth: 1,
                    //     borderColor: COLORS.error,
                    //   },
                    // ]}
                    style={styles.inputContainer}
                    inputStyle={styles.textArea}
                  />
                </View>
              </View>
            </View>
            {isEdit ? (
              <View style={styles.footerActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={handleCancel}
                >
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  activeOpacity={0.8}
                  onPress={handleSave}
                >
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                  >
                    Save
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <PrimaryButton
                title={STRING.savePatient}
                onPress={handleSave}
                style={{ marginHorizontal: getScaleSize(20) }}
              />
            )}
          </KeyboardAwareScrollView>
          {/* Sticky CTA */}
        </View>
      </AppSafeAreaView>

      <AppBottomSheet ref={discardSheetRef}>
        <View style={styles.discardContent}>
          <AppText
            size={getScaleSize(20)}
            font={FONTS.Inter.Bold}
            color={COLORS.black}
            align="center"
            style={{ marginBottom: 24 }}
          >
            Discard changes?
          </AppText>
          <View style={styles.sheetButtons}>
            <TouchableOpacity
              style={styles.noBtn}
              onPress={() => discardSheetRef.current?.hide()}
              activeOpacity={0.7}
            >
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS.black}
              >
                No
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.yesBtn}
              onPress={confirmDiscard}
              activeOpacity={0.8}
            >
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                Yes
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </AppBottomSheet>

      <AppDatePicker
        open={datePickerOpen}
        date={selectedDate}
        onConfirm={date => {
          setDatePickerOpen(false);
          setSelectedDate(date);
          setDob(moment(date).format('YYYY-MM-DD'));
          setErrors(prev => ({ ...prev, dob: '' }));
        }}
        onCancel={() => {
          setDatePickerOpen(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  headerStyle: {
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(24),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
  },
  scroll: {
    flex: 1,
    marginBottom: getScaleSize(10),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: getScaleSize(20),
    // paddingTop: getScaleSize(16),
  },
  section: {
    marginTop: getScaleSize(24),
    paddingHorizontal: getScaleSize(20),
  },
  sectionTitle: {
    marginBottom: getScaleSize(12),
    marginLeft: getScaleSize(4),
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    gap: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: {
    gap: getScaleSize(8),
  },
  inputContainer: {
    paddingHorizontal: 0,
    width: '100%',
    color: COLORS._1A1D1F,
    fontSize: getScaleSize(15),
  },
  inputWrapperStyle: {
    backgroundColor: COLORS._F9FAFB,
    borderWidth: 0,
  },
  inputIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS.slate400,
    resizeMode: 'contain',
  },
  rowGap: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  nameRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  flex1: {
    flex: 1,
  },
  zipWidth: {
    width: getScaleSize(100),
  },
  textAreaWrapper: {
    paddingHorizontal: 0,
  },
  textArea: {
    height: getScaleSize(120),
    textAlignVertical: 'top',
  },
  leadingIcon: {
    fontSize: 16,
    color: COLORS._6B7280,
  },
  footerActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  saveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardContent: {
    paddingVertical: 10,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  noBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  yesBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddPatient;
