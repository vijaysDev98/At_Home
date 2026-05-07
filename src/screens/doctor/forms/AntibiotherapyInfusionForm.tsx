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
    prescriptionDate: moment().format('DD/MM/YYYY'),
    startTherapy: false,
    renewalTherapy: false,

    // Patient
    patientLastName: '',
    patientFirstName: selectedPatient?.fullName || '',
    patientDOB: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    patientWeight: '',
    patientNIR: '',
    careRelatedToALD: false,

    // Prescriber (Auto-filled from doctor profile)
    prescriberLastName: '',
    prescriberFirstName: profileData?.fullName || '',
    prescriberPhone: profileData?.phoneNumber || '',
    prescriberRPPS: profileData?.rppsNumber || '',

    // Facility
    hospitalName: profileData?.businessAddress || '',
    hospitalAddress: '',
    finessNo: profileData?.finessNumber || '',

    // Signature
    physicianSignature: '',

    // Infusion Products (Repeatable)
    infusionProducts: [
      {
        productName: '',
        strength: '',
        withDiluent: false,
        withoutDiluent: false,
        diluentVolume: '',
        durationHours: '',
        durationMinutes: '',
        frequencyPerDay: '',
        implantedPort: false,
        centralCatheter: false,
        picc: false,
        perineural: false,
        peripheralVenous: false,
        subcutaneous: false,
        gravityMode: false,
        elastomericDiffuser: false,
        electricInfusionPump: false,
        ambulatoryRequired: false,
        preparedInFacility: false,
        healthcareFacilitySupervision: false,
        startDate: '',
        endDate: '',
        treatmentDurationDays: '',
        tni: '',
        infuseAlone: false,
      },
    ],
  });

  const addProduct = () => {
    setState(prev => ({
      ...prev,
      infusionProducts: [
        ...prev.infusionProducts,
        {
          productName: '',
          strength: '',
          withDiluent: false,
          withoutDiluent: false,
          diluentVolume: '',
          durationHours: '',
          durationMinutes: '',
          frequencyPerDay: '',
          implantedPort: false,
          centralCatheter: false,
          picc: false,
          perineural: false,
          peripheralVenous: false,
          subcutaneous: false,
          gravityMode: false,
          elastomericDiffuser: false,
          electricInfusionPump: false,
          ambulatoryRequired: false,
          preparedInFacility: false,
          healthcareFacilitySupervision: false,
          startDate: '',
          endDate: '',
          treatmentDurationDays: '',
          tni: '',
          infuseAlone: false,
          newProperty: '', // New state property
        },
      ],
    }));
  };

  const removeProduct = (index: number) => {
    setState(prev => ({
      ...prev,
      infusionProducts: prev.infusionProducts.filter((_, i) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      infusionProducts: prev.infusionProducts.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
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
        <View style={styles.card}>
          {renderSectionHeader(STRING.prescriptionDetails)}
          <Input
            onPress={() => {
              setPickerType({ type: 'prescriptionDate' });
              setOpen(true);
            }}
            editable={false}
            label={STRING.prescriptionDate}
            placeholder="DD/MM/YYYY"
            value={state.prescriptionDate}
            style={styles.inputField}
            pointerEvents="none"
          />
          <View style={styles.checkboxGroup}>
            <AppCheckBox
              value={state.startTherapy}
              onValueChange={(value) => setState(prev => ({ ...prev, startTherapy: value }))}
              label={STRING.startOfHomeInfusionTherapy}
            />
            <AppCheckBox
              value={state.renewalTherapy}
              onValueChange={(value) => setState(prev => ({ ...prev, renewalTherapy: value }))}
              label={STRING.renewalOrModification}
            />
          </View>
        </View>

        {/* PATIENT INFORMATION */}
        <FormPatientSection
          state={{
            patientLastName: state.patientLastName,
            patientFirstName: state.patientFirstName,
            patientDOB: state.patientDOB,
            patientWeight: state.patientWeight,
            patientNIR: state.patientNIR,
            careRelatedToALD: state.careRelatedToALD,
          }}
          setState={(updates) => setState(prev => ({ ...prev, ...updates }))}
        />

        {/* PRESCRIBER IDENTIFICATION */}
        <FormPrescriberSection
          state={{
            prescriberLastName: state.prescriberLastName,
            prescriberFirstName: state.prescriberFirstName,
            prescriberPhone: state.prescriberPhone,
            prescriberRPPS: state.prescriberRPPS,
          }}
          setState={(updates) => setState(prev => ({ ...prev, ...updates }))}
        />

        {/* FACILITY INFORMATION */}
        <FormFacilitySection
          state={{
            hospitalName: state.hospitalName,
            hospitalAddress: state.hospitalAddress,
            finessNo: state.finessNo,
          }}
          setState={(updates) => setState(prev => ({ ...prev, ...updates }))}
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
          {state.infusionProducts.map((product, index) => (
            <View>
              <View style={[styles.productHeader]}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1A1D1F}
                >
                  {STRING.product}{index + 1}
                </AppText>
                {state.infusionProducts.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeProduct(index)}
                  >
                    <Text style={{ color: COLORS.error }}>remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label={STRING.productName}
                value={product.productName}
                onChangeText={(value) => updateProduct(index, 'productName', value)}
                placeholder={STRING.enterProductName}
                style={styles.inputField}
              />
              <Input
                label={STRING.strength}
                value={product.strength}
                onChangeText={(value) => updateProduct(index, 'strength', value)}
                placeholder={STRING.concentration}
                style={styles.inputField}
              />


              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={product.withDiluent}
                  onValueChange={(value) => {
                    updateProduct(index, 'withDiluent', value);
                    if (value) {
                      updateProduct(index, 'withoutDiluent', false);
                    }
                  }}
                  label={STRING.withDiluent}
                />
                <AppCheckBox
                  value={product.withoutDiluent}
                  onValueChange={(value) => {
                    updateProduct(index, 'withoutDiluent', value);
                    if (value) {
                      updateProduct(index, 'withDiluent', false);
                    }
                  }}
                  label={STRING.withoutDiluent}
                />
              </View>

              <Input
                label={STRING.diluentVolume}
                value={product.diluentVolume}
                onChangeText={(value) => updateProduct(index, 'diluentVolume', value)}
                placeholder={STRING.volumePerDay}
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label={STRING.duration}
                value={product.durationHours}
                onChangeText={(value) => updateProduct(index, 'durationHours', value)}
                placeholder={STRING.hours}
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label={STRING.durationMin}
                value={product.durationMinutes}
                onChangeText={(value) => updateProduct(index, 'durationMinutes', value)}
                placeholder={STRING.minutes}
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label={STRING.frequency}
                value={product.frequencyPerDay}
                onChangeText={(value) => updateProduct(index, 'frequencyPerDay', value)}
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
              <View style={styles.checkboxGroup}>
                <AppCheckBox
                  value={product.implantedPort}
                  onValueChange={(value) => updateProduct(index, 'implantedPort', value)}
                  label="Implanted Port"
                />
                <AppCheckBox
                  value={product.centralCatheter}
                  onValueChange={(value) => updateProduct(index, 'centralCatheter', value)}
                  label="Central Catheter"
                />
                <AppCheckBox
                  value={product.picc}
                  onValueChange={(value) => updateProduct(index, 'picc', value)}
                  label="Peripherally inserted central catheter (PICC)"
                />
                <AppCheckBox
                  value={product.perineural}
                  onValueChange={(value) => updateProduct(index, 'perineural', value)}
                  label="Perineural"
                />
                <AppCheckBox
                  value={product.peripheralVenous}
                  onValueChange={(value) => updateProduct(index, 'peripheralVenous', value)}
                  label="Peripheral Venous"
                />
                <AppCheckBox
                  value={product.subcutaneous}
                  onValueChange={(value) => updateProduct(index, 'subcutaneous', value)}
                  label="Subcutaneous"
                />
              </View>

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                Mode of Administration
              </AppText>
              <View style={styles.checkboxGroup}>
                <AppCheckBox
                  value={product.gravityMode}
                  onValueChange={(value) => updateProduct(index, 'gravityMode', value)}
                  label="Gravity"
                />
                <AppCheckBox
                  value={product.elastomericDiffuser}
                  onValueChange={(value) => updateProduct(index, 'elastomericDiffuser', value)}
                  label="Elastomeric Diffuser"
                />
                <AppCheckBox
                  value={product.electricInfusionPump}
                  onValueChange={(value) => updateProduct(index, 'electricInfusionPump', value)}
                  label="Electric Infusion Pump"
                />
              </View>

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
                  value={product.ambulatoryRequired}
                  onValueChange={(value) => updateProduct(index, 'ambulatoryRequired', value)}
                  label="Yes"
                />

                <AppCheckBox
                  value={product.preparedInFacility}
                  onValueChange={(value) => updateProduct(index, 'preparedInFacility', value)}
                  label="No"
                />
              </View>

              <View style={{ marginBottom: getScaleSize(10) }}>
                <AppCheckBox
                  value={product.healthcareFacilitySupervision}
                  onValueChange={(value) => updateProduct(index, 'healthcareFacilitySupervision', value)}
                  label="If filled/prepared under the supervision of a healthcare facility, tick this box"
                />
              </View>

              <View style={styles.dateInputsRow}>
                <Input
                  label="Start Date"
                  value={product.startDate}
                  onPress={() => {
                    setPickerType({ type: 'startDate', index });
                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
                <Input
                  label="End Date"
                  value={product.endDate}
                  onPress={() => {
                    setPickerType({ type: 'endDate', index });
                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
              </View>
              <Input
                label="Treatment Duration (days)"
                value={product.treatmentDurationDays}
                onChangeText={(value) => updateProduct(index, 'treatmentDurationDays', value)}
                placeholder="Enter treatment duration"
                style={styles.inputField}
                keyboardType="numeric"
              />
              <Input
                label="Total Number of Infusions"
                value={product.tni}
                onChangeText={(value) => updateProduct(index, 'tni', value)}
                placeholder="Auto-calculated"
                style={styles.inputField}
                keyboardType="numeric"
                editable={false}
              />

              <AppCheckBox
                value={product.infuseAlone}
                onValueChange={(value) => updateProduct(index, 'infuseAlone', value)}
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
        <View style={styles.card}>
          {renderSectionHeader('Signature')}
          <Input
            label="Physician Signature"
            value={state.physicianSignature}
            onChangeText={(value) => setState(prev => ({ ...prev, physicianSignature: value }))}
            placeholder="Enter physician signature"
            style={styles.inputField}
          />
          <View style={styles.signatureLine} />
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
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
    marginBottom: getScaleSize(12)
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
    marginBottom: getScaleSize(10)
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
