import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
  AppText,
  Input,
  WarningSheet,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppButton,
  AppCheckBox,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING } from '../../../constant';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

const AntibiotherapyInfusionForm: React.FC = () => {
  const selectedPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const warningSheetRef = useRef<ActionSheetRef>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<{
    type: string;
    index?: number;
  } | null>(null);

  const [state, setState] = useState({
    // Prescription Details
    prescription_date: moment().format('DD/MM/YYYY'),
    therapy_type: '',

    // Patient Information
    patient_last_name: '',
    patient_first_name: selectedPatient?.fullName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    weight: '',
    nir: '',
    ald_condition: false,

    // Prescriber Identification (Auto-filled from doctor profile)
    prescriber_last_name: profileData?.fullName || '',
    prescriber_first_name: '',
    prescriber_phone: profileData?.phoneNumber || '',
    rpps_id: profileData?.rppsNumber || '',

    // Facility Information
    hospital_name: profileData?.businessAddress || '',
    hospital_address: '',
    finess_number: profileData?.finessNumber || '',

    // Signature
    physician_signature: '',

    // Infusion Products (Repeatable)
    infusion_products: [
      {
        product_name: '',
        strength: '',
        diluent_type: '',
        diluent_volume_ml: '',
        duration_hours: '',
        duration_minutes: '',
        frequency_per_day: '',
        route_of_access: '',
        mode_of_administration: '',
        ambulatory_required: false,
        prepared_in_facility: false,
        start_date: '',
        end_date: '',
        treatment_duration_days: '',
        tni: '',
        infuse_alone: false,
      },
    ],
  });

  const addProduct = () => {
    setState(prev => ({
      ...prev,
      infusion_products: [
        ...prev.infusion_products,
        {
          product_name: '',
          strength: '',
          diluent_type: '',
          diluent_volume_ml: '',
          duration_hours: '',
          duration_minutes: '',
          frequency_per_day: '',
          route_of_access: '',
          mode_of_administration: '',
          ambulatory_required: false,
          prepared_in_facility: false,
          start_date: '',
          end_date: '',
          treatment_duration_days: '',
          tni: '',
          infuse_alone: false,
        },
      ],
    }));
  };

  const removeProduct = (index: number) => {
    setState(prev => ({
      ...prev,
      infusion_products: prev.infusion_products.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      infusion_products: prev.infusion_products.map((product: any, i: number) =>
        i === index ? { ...product, [field]: value } : product,
      ),
    }));
  };

  const renderSectionHeader = (title: string, icon?: any) => (
    <View style={styles.sectionHeader}>
      {icon && <Image source={icon} style={styles.sectionIcon} />}
      <AppText
        size={getScaleSize(15)}
        font={FONTS.Inter.Bold}
        color={COLORS._1A1D1F}
      >
        {title}
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerTextContainer}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {STRING.antibiotherapyInfusionForm}
          </AppText>
        </View>

        {/* PRESCRIPTION DETAILS */}
        <FormPrescriptionDetails state={state} setState={setState} />

        {/* PATIENT INFORMATION */}
        <FormPatientSection
          state={{
            patient_first_name: state.patient_first_name,
            patient_last_name: state.patient_last_name,
            dob: state.dob,
            weight: state.weight,
            nir: state.nir,
            ald_condition: state.ald_condition,
          }}
          setState={updates => setState(prev => ({ ...prev, ...updates }))}
        />

        {/* PRESCRIBER IDENTIFICATION */}
        <FormPrescriberSection
          state={{
            prescriberLastName: state.prescriber_last_name,
            prescriberFirstName: state.prescriber_first_name,
            prescriberPhone: state.prescriber_phone,
            prescriberRPPS: state.rpps_id,
          }}
          setState={updates => setState(prev => ({ ...prev, ...updates }))}
        />

        {/* FACILITY INFORMATION */}
        <FormFacilitySection
          state={{
            hospitalName: state.hospital_name,
            hospitalAddress: state.hospital_address,
            finessNo: state.finess_number,
          }}
          setState={updates => setState(prev => ({ ...prev, ...updates }))}
        />

        {/* INFUSION PRODUCTS */}
        {/* {renderSectionHeader(STRING.infusionProducts, IMAGES.testTubeIcon)} */}
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
        >
          {STRING.infusionProducts}
        </AppText>
        <View style={styles.card}>
          {state.infusion_products.map((product: any, index: number) => (
            <View>
              <View style={[styles.productHeader]}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1A1D1F}
                >
                  {STRING.product}
                  {index + 1}
                </AppText>
                {state.infusion_products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(index)}>
                    <Text style={{ color: COLORS.error }}>remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label={STRING.productName}
                value={product.product_name}
                onChangeText={value =>
                  updateProduct(index, 'product_name', value)
                }
                placeholder={STRING.enterProductName}
                style={styles.inputField}
              />
              <Input
                label={STRING.strength}
                value={product.strength}
                onChangeText={value => updateProduct(index, 'strength', value)}
                placeholder={STRING.concentration}
                style={styles.inputField}
              />

              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={product.diluent_type === 'with'}
                  onValueChange={value => {
                    updateProduct(index, 'diluent_type', value ? 'with' : '');
                  }}
                  label={STRING.withDiluent}
                />
                <AppCheckBox
                  value={product.diluent_type === 'without'}
                  onValueChange={value => {
                    updateProduct(index, 'diluent_type', value ? 'without' : '');
                  }}
                  label={STRING.withoutDiluent}
                />
              </View>

              <Input
                label={STRING.diluentVolume}
                value={product.diluent_volume_ml}
                onChangeText={value =>
                  updateProduct(index, 'diluent_volume_ml', value)
                }
                placeholder={STRING.volumePerDay}
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label={STRING.duration}
                value={product.duration_hours}
                onChangeText={value =>
                  updateProduct(index, 'duration_hours', value)
                }
                placeholder={STRING.hours}
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label={STRING.durationMin}
                value={product.duration_minutes}
                onChangeText={value =>
                  updateProduct(index, 'duration_minutes', value)
                }
                placeholder={STRING.minutes}
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label={STRING.frequency}
                value={product.frequency_per_day}
                onChangeText={value =>
                  updateProduct(index, 'frequency_per_day', value)
                }
                placeholder={STRING.freqPerDay}
                style={styles.inputField}
                keyboardType="numeric"
              />

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                {STRING.routeOfAccess}
              </AppText>
              <Input
                label="Route of Access"
                value={product.route_of_access}
                onChangeText={value =>
                  updateProduct(index, 'route_of_access', value)
                }
                placeholder="Select route of access"
                style={styles.inputField}
              />

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                Mode of Administration
              </AppText>
              <Input
                label="Mode of Administration"
                value={product.mode_of_administration}
                onChangeText={value =>
                  updateProduct(index, 'mode_of_administration', value)
                }
                placeholder="Select mode of administration"
                style={styles.inputField}
              />

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                The patient must remain ambulatory during treatment?:
              </AppText>
              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={product.ambulatory_required}
                  onValueChange={value =>
                    updateProduct(index, 'ambulatory_required', value)
                  }
                  label="Yes"
                />

                <AppCheckBox
                  value={!product.ambulatory_required}
                  onValueChange={value =>
                    updateProduct(index, 'ambulatory_required', !value)
                  }
                  label="No"
                />
              </View>

              <View style={{ marginBottom: getScaleSize(10) }}>
                <AppCheckBox
                  value={product.prepared_in_facility}
                  onValueChange={value =>
                    updateProduct(index, 'prepared_in_facility', value)
                  }
                  label="If filled/prepared under the supervision of a healthcare facility, tick this box"
                />
              </View>

              <View style={styles.dateInputsRow}>
                <Input
                  label="Start Date"
                  value={product.start_date}
                  onPress={() => {
                    setPickerType({ type: 'start_date', index });
                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
                <Input
                  label="End Date"
                  value={product.end_date}
                  onPress={() => {
                    setPickerType({ type: 'end_date', index });
                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
              </View>
              <Input
                label="Treatment Duration (days)"
                value={product.treatment_duration_days}
                onChangeText={value =>
                  updateProduct(index, 'treatment_duration_days', value)
                }
                placeholder="Enter treatment duration"
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label="Total Number of Infusions"
                value={product.tni}
                onChangeText={value => updateProduct(index, 'tni', value)}
                placeholder="Auto-calculated"
                style={styles.inputField}
                keyboardType="numeric"
                editable={false}
              />

              <AppCheckBox
                value={product.infuse_alone}
                onValueChange={value =>
                  updateProduct(index, 'infuse_alone', value)
                }
                label="If this treatment must be infused ALONE, tick this box"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <Image source={IMAGES.add_patient} style={styles.addIcon} />
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._526674}
          >
            + Add Product
          </AppText>
        </TouchableOpacity>

        {/* SIGNATURE */}
        <FormSignature />
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={selectedDate => {
          setOpen(false);
          if (pickerType) {
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
            if (pickerType.index !== undefined) {
              // Handle product date fields
              updateProduct(pickerType.index, pickerType.type, formattedDate);
            } else {
              // Handle main form date fields
              setState(prev => ({ ...prev, [pickerType.type]: formattedDate }));
            }
          }
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />

      <WarningSheet ref={warningSheetRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  headerTextContainer: {
    marginBottom: getScaleSize(4),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getScaleSize(190),
    gap: getScaleSize(12),
    marginHorizontal: getScaleSize(16),
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  sectionIcon: {
    height: getScaleSize(20),
    width: getScaleSize(20),
    resizeMode: 'contain',
  },
  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(12),
  },
  radioOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    paddingVertical: getScaleSize(8),
    paddingHorizontal: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
  },
  radioOuterActive: {
    borderColor: COLORS._526674,
    backgroundColor: COLORS._F8F9FA,
  },
  radioInner: {
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: COLORS._526674,
  },
  checkboxGroup: {
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(2),
  },
  checkboxLabel: {
    flex: 1,
  },
  selectGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(8),
  },
  selectOption: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
  },
  selectOptionActive: {
    backgroundColor: COLORS._526674,
    borderColor: COLORS._526674,
  },
  booleanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
  },
  booleanLabel: {
    flex: 1,
  },
  sectionLabel: {
    marginBottom: getScaleSize(8),
  },
  productCard: {
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(8),
    elevation: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(10),
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    // marginBottom: getScaleSize(12),
  },
  halfWidthInput: {
    flex: 1,
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  removeButton: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS._F8F9FA,
  },
  addIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
  signatureLine: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginTop: getScaleSize(8),
  },
});

export default AntibiotherapyInfusionForm;
