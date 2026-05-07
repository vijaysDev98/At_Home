import React, { useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
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
  AppCheckBox,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING } from '../../../constant';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const ArtificialNutritionForm: React.FC = () => {
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

    patientLastName: '',
    patientFirstName: selectedPatient?.fullName || '',
    patientDOB: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    patientWeight: '',
    patientNIR: '',
    careRelatedToALD: false,

    prescriberLastName: '',
    prescriberFirstName: profileData?.fullName || '',
    prescriberPhone: profileData?.phoneNumber || '',
    prescriberRPPS: profileData?.rppsNumber || '',

    hospitalName: profileData?.businessAddress || '',
    hospitalAddress: '',
    finessNo: profileData?.finessNumber || '',
    formsFor: '',
    fromDateText: '',
    prescriptionForWeeks: '',
    renewedTimes: '',
    gravityDurationWeeks: '',
    initialSetupPackage: false,
    weeklyEnteralNutritionPackage: false,
    weeklyPackageGravity: false,
    weeklyPackagePump: false,
    nasogastricTubeLine: false,
    nasogastricTubeCH: '',
    nasogastricRate: '',
    jejunostomyTubeLine: false,
    jejunostomyTubeCH: '',
    ivPoleRental: false,
    equipmentNasogastricCareLine: false,
    equipmentNasogastricCareEvery: '',
    equipmentGastrostomyCare: false,
    unrelatedToALD: false,
    relatedToALD: false,
    jejunostomyCareLine: false,
    jejunostomyCareEveryDays: '',
    equipmentGastrostomyReplacement: false,
    gastrostomyButtonSet: false,
    nutrients: [
      {
        name: '',
        ml: '',
        timesPerDay: '',
      },
      {
        name: '',
        ml: '',
        timesPerDay: '',
      },
      {
        name: '',
        ml: '',
        timesPerDay: '',
      },
    ],
    signature: '',
  });

  const renderSectionHeader = (title: string, icon?: any) => (
    <View style={styles.sectionHeader}>
      {/* {icon && <Image source={icon} style={styles.sectionIcon} />} */}
      <AppText
        size={getScaleSize(15)}
        font={FONTS.Inter.Bold}
        color={COLORS._1A1D1F}
      >
        {title}
      </AppText>
    </View>
  );

  const checkedBoxesCount = useMemo(() => {
    const boolFields = [
      state.startTherapy,
      state.renewalTherapy,
      state.careRelatedToALD,
      state.initialSetupPackage,
      state.weeklyEnteralNutritionPackage,
      state.weeklyPackageGravity,
      state.weeklyPackagePump,
      state.nasogastricTubeLine,
      state.jejunostomyTubeLine,
      state.ivPoleRental,
      state.equipmentNasogastricCareLine,
      state.equipmentGastrostomyCare,
      state.unrelatedToALD,
      state.relatedToALD,
      state.jejunostomyCareLine,
      state.equipmentGastrostomyReplacement,
      state.gastrostomyButtonSet,
    ];

    return boolFields.filter(Boolean).length;
  }, [state]);

  const updateNutrient = (index: number, field: string, value: any) => {
    setState(prev => ({
      ...prev,
      nutrients: prev.nutrients.map((nutrient, i) =>
        i === index ? { ...nutrient, [field]: value } : nutrient,
      ),
    }));
  };

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
            {STRING.artificialNutritionForm}
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

        <View style={styles.card}>
          {renderSectionHeader('Prescription Plan')}
          {/* <Input
            label="Forms for"
            value={state.formsFor}
            onChangeText={(value) => setState(prev => ({ ...prev, formsFor: value }))}
            placeholder="Enter details"
            style={styles.inputField}
          /> */}
          <Input
            onPress={() => {
              setPickerType({ type: 'fromDateText' });
              setOpen(true);
            }}
            editable={false}
            label="From"
            placeholder="DD/MM/YYYY"
            value={state.fromDateText}
            style={styles.inputField}
            pointerEvents="none"
          />
          <View style={styles.row}>
            <Input
              label="Prescription for (weeks)"
              value={state.prescriptionForWeeks}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, prescriptionForWeeks: value }))
              }
              placeholder="Weeks"
              style={styles.rowInput}
              keyboardType="numeric"
            />
            <Input
              label="To be renewed (times)"
              value={state.renewedTimes}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, renewedTimes: value }))
              }
              placeholder="Times"
              style={styles.rowInput}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.blankSentenceWrap}>
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              The health condition of MR (Name of patient) requires enteral
              nutrition by gravity (package 1), at home, for a duration of
            </AppText>
            <TextInput
              value={state.gravityDurationWeeks}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, gravityDurationWeeks: value }))
              }
              keyboardType="numeric"
              style={styles.inlineBlankInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              week(s), with:
            </AppText>
          </View>
          <AppCheckBox
            value={state.initialSetupPackage}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, initialSetupPackage: value }))
            }
            label="Initial setup package for enteral nutrition"
          />
          <AppCheckBox
            value={state.weeklyEnteralNutritionPackage}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, weeklyEnteralNutritionPackage: value }))
            }
            label="Weekly enteral nutrition package by:"
          />
          <View style={styles.indentedCheckboxGroup}>
            <AppCheckBox
              value={state.weeklyPackageGravity}
              onValueChange={(value) =>
                setState(prev => ({ ...prev, weeklyPackageGravity: value }))
              }
              label="Gravity (package 1)"
            />
            <AppCheckBox
              value={state.weeklyPackagePump}
              onValueChange={(value) =>
                setState(prev => ({ ...prev, weeklyPackagePump: value }))
              }
              label="Pump (package 2)"
            />
          </View>
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.nasogastricTubeLine}
              onValueChange={(value) =>
                setState(prev => ({ ...prev, nasogastricTubeLine: value }))
              }
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Nasogastric tube CH:
            </AppText>
            <TextInput
              value={state.nasogastricTubeCH}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, nasogastricTubeCH: value }))
              }
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              to be used at a rate of
            </AppText>
            <TextInput
              value={state.nasogastricRate}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, nasogastricRate: value }))
              }
              keyboardType="numeric"
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              per month.
            </AppText>
          </View>
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.jejunostomyTubeLine}
              onValueChange={(value) =>
                setState(prev => ({ ...prev, jejunostomyTubeLine: value }))
              }
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Jejunostomy or gastrostomy tube CH:
            </AppText>
            <TextInput
              value={state.jejunostomyTubeCH}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, jejunostomyTubeCH: value }))
              }
              style={styles.pdfInlineInput}
              placeholder=""
            />
          </View>
          <AppCheckBox
            value={state.ivPoleRental}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, ivPoleRental: value }))
            }
            label="Rental of an IV pole"
          />
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.equipmentNasogastricCareLine}
              onValueChange={(value) =>
                setState(prev => ({ ...prev, equipmentNasogastricCareLine: value }))
              }
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Equipment for adult nasogastric tube care every
            </AppText>
            <TextInput
              value={state.equipmentNasogastricCareEvery}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, equipmentNasogastricCareEvery: value }))
              }
              keyboardType="numeric"
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              days
            </AppText>
          </View>
          <AppCheckBox
            value={state.equipmentGastrostomyCare}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, equipmentGastrostomyCare: value }))
            }
            label="Equipment for gastrostomy or jejunostomy care"
          />
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.jejunostomyCareLine}
              onValueChange={(value) =>
                setState(prev => ({ ...prev, jejunostomyCareLine: value }))
              }
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Jejunostomy care every
            </AppText>
            <TextInput
              value={state.jejunostomyCareEveryDays}
              onChangeText={(value) =>
                setState(prev => ({ ...prev, jejunostomyCareEveryDays: value }))
              }
              keyboardType="numeric"
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              days
            </AppText>
          </View>
          <AppCheckBox
            value={state.equipmentGastrostomyReplacement}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, equipmentGastrostomyReplacement: value }))
            }
            label="Equipment in case of gastrostomy tube replacement"
          />
          <AppCheckBox
            value={state.gastrostomyButtonSet}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, gastrostomyButtonSet: value }))
            }
            label="One gastrostomy button (statutory set), to be renewed every 7 days"
          />
          <AppCheckBox
            value={state.unrelatedToALD}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, unrelatedToALD: value }))
            }
            label="Prescriptions unrelated to the recognized long-term condition"
          />
          <View style={styles.subTextBlock}>
            <AppText size={getScaleSize(12)} color={COLORS._1A1D1F}>
              (listed or not listed)
            </AppText>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              style={styles.italicText}
            >
              (Intercurrent illnesses)
            </AppText>
          </View>
          <AppCheckBox
            value={state.relatedToALD}
            onValueChange={(value) =>
              setState(prev => ({ ...prev, relatedToALD: value }))
            }
            label="Prescriptions related to the treatment of the recognized long-term condition"
          />
          <View style={styles.subTextBlock}>
            <AppText size={getScaleSize(12)} color={COLORS._1A1D1F}>
              (listed or not listed)
            </AppText>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              style={styles.italicText}
            >
              (Exempting condition)
            </AppText>
          </View>
        </View>

        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
        >
          Nutrients
        </AppText>
        <View style={styles.card}>
          {state.nutrients.map((nutrient, index) => (
            <View key={index} style={styles.nutrientBoxRow}>
              <AppText
                size={getScaleSize(13)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.SemiBold}
                style={styles.nutrientIndex}
              >
                {index + 1}.
              </AppText>
              <Input
                value={nutrient.name}
                onChangeText={(value) => updateNutrient(index, 'name', value)}
                style={styles.nutrientInputRoot}
                inputWrapperStyle={styles.nutrientNameBox}
                placeholder="Nutrient name"
                placeholderTextColor={COLORS._6F767E}
              />
              <View style={styles.nutrientBottomRow}>
                <Input
                  value={nutrient.ml}
                  onChangeText={(value) => updateNutrient(index, 'ml', value)}
                  keyboardType="numeric"
                  style={styles.nutrientSmallInputRoot}
                  inputWrapperStyle={styles.nutrientSmallBox}
                  inputStyle={styles.nutrientSmallText}
                  placeholder="ml"
                  placeholderTextColor={COLORS._6F767E}
                />
                <Input
                  value={nutrient.timesPerDay}
                  onChangeText={(value) => updateNutrient(index, 'timesPerDay', value)}
                  keyboardType="numeric"
                  style={styles.nutrientSmallInputRoot}
                  inputWrapperStyle={styles.nutrientSmallBox}
                  inputStyle={styles.nutrientSmallText}
                  placeholder="times"
                  placeholderTextColor={COLORS._6F767E}
                />
                <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                  per day
                </AppText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.signatureRow}>
            <AppText
              size={getScaleSize(13)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.SemiBold}
            >
              Signature:
            </AppText>
            <TextInput
              value={state.signature}
              onChangeText={(value) => setState(prev => ({ ...prev, signature: value }))}
              style={[styles.pdfInlineInput, styles.signatureInput]}
              placeholder=""
            />
          </View>
          <View style={styles.signatureRow}>
            <AppText
              size={getScaleSize(13)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.SemiBold}
            >
              Number of boxes checked:
            </AppText>
            <TextInput
              value={String(checkedBoxesCount)}
              style={[styles.pdfInlineInput, styles.boxesCountInput]}
              editable={false}
              placeholder=""
            />
          </View>
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpen(false);
          setDate(selectedDate);
          if (pickerType) {
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
            setState(prev => ({ ...prev, [pickerType.type]: formattedDate }));
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
    marginBottom: getScaleSize(12),
  },
  sectionIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    marginRight: getScaleSize(8),
  },
  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  rowInput: {
    flex: 1,
    paddingHorizontal: 0,
  },
  checkboxGroup: {
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
    marginLeft: getScaleSize(15),
  },
  indentedCheckboxGroup: {
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
    marginLeft: getScaleSize(30),
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: getScaleSize(8),
    // gap: getScaleSize(6),
  },
  inlinePdfCheckbox: {
    flex: 0,
    marginRight: getScaleSize(2),
  },
  emptyCheckboxLabel: {
    flex: 0,
    width: 0,
  },
  pdfInlineInput: {
    minWidth: getScaleSize(70),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(4),
  },
  subTextBlock: {
    marginLeft: getScaleSize(34),
    marginBottom: getScaleSize(8),
    marginTop: getScaleSize(-4),
  },
  italicText: {
    fontStyle: 'italic',
  },
  nutrientBoxRow: {
    marginBottom: getScaleSize(14),
  },
  nutrientIndex: {
    marginBottom: getScaleSize(6),
  },
  nutrientBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginTop: getScaleSize(8),
  },
  nutrientInputRoot: {
    paddingHorizontal: 0,
  },
  nutrientSmallInputRoot: {
    width: getScaleSize(58),
    paddingHorizontal: 0,
  },
  nutrientNameBox: {
    // height: getScaleSize(42),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    backgroundColor: COLORS.white,
  },
  nutrientSmallBox: {
    // height: getScaleSize(42),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS.white,
  },
  nutrientSmallText: {
    textAlign: 'center',
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(16),
  },
  signatureInput: {
    minWidth: getScaleSize(140),
  },
  boxesCountInput: {
    minWidth: getScaleSize(70),
  },
  signText: {
    marginTop: getScaleSize(8),
  },
  sectionLabel: {
    marginTop: getScaleSize(4),
    marginBottom: getScaleSize(8),
  },
  blankSentenceWrap: {
    marginBottom: getScaleSize(12),
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: getScaleSize(6),
  },
  inlineBlankInput: {
    minWidth: getScaleSize(40),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(6),
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._10B981,
    backgroundColor: COLORS._E6F9F0,
    marginTop: getScaleSize(8),
  },
});

export default ArtificialNutritionForm;
