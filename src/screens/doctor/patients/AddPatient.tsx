import React, { useRef, useState } from 'react';
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
import { addPatient, updatePatient } from '../../../actions/patient/patientAction';
import { RootState } from '../../../redux/store';
import { useRoute } from '@react-navigation/native';
import AppBottomSheet from '../../../components/AppBottomSheet';
import { ActionSheetRef } from 'react-native-actions-sheet';

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
  const sheetRef = useRef<any>(null);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const route = useRoute<any>();
  const patientToEdit = route.params?.patient;
  const isEdit = !!patientToEdit;

  const discardSheetRef = useRef<ActionSheetRef>(null);

  React.useEffect(() => {
    if (patientToEdit) {
      setFullName(patientToEdit.fullName || '');
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
    }
  }, [patientToEdit]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = STRING.fullNameRequired;
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = STRING.fullNameMinLength;
    }

    if (!phone.trim()) {
      newErrors.phone = STRING.phoneRequired;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = STRING.invalidEmailAddress;
    }

    if (dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      newErrors.dob = STRING.invalidDateFormat;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const payload = {
        fullName: fullName.trim(),
        phoneNumber: phone.trim(),
        email: email.trim(),
        dateOfBirth: dob,
        streetAddress: street.trim(),
        city: city.trim(),
        zip: zip.trim(),
        medicalDescription: notes.trim(),
      };
      if (isEdit) {
        dispatch(updatePatient(patientToEdit.id, payload));
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
          leftContent={() => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => NavigationService.goBack()}
            >
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
              >
                {STRING.cancel}
              </AppText>
            </TouchableOpacity>
          )}
        />
        <View style={styles.container}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
                <View style={styles.fieldGroup}>
                  <Input
                    value={fullName}
                    onChangeText={t => {
                      setFullName(t);
                      setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    placeholder={STRING.enterFullName}
                    placeholderTextColor={COLORS._7A7A7A}
                    label={STRING.fullName}
                    labelColor={COLORS.black}
                    labelFont={FONTS.Inter.SemiBold}
                    labelSize={getScaleSize(13)}
                    isMandatory={true}
                    error={errors.fullName}
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.fullName && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    style={styles.inputContainer}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Input
                    value={dob}
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
            <View style={styles.section}>
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
                    inputWrapperStyle={[
                      styles.inputWrapperStyle,
                      errors.notes && {
                        borderWidth: 1,
                        borderColor: COLORS.error,
                      },
                    ]}
                    style={styles.inputContainer}
                    inputStyle={styles.textArea}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Sticky CTA */}
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
  },
  scrollContent: {
    paddingBottom: getScaleSize(100),
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
