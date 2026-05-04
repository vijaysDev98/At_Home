import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
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
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const EnteralNutritionForm: React.FC = () => {
  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);

  const [state, setState] = useState({
    prescriptionDate: '',
    homeInfusionTherapy: false,
    renewalModification: false,

    patientLastName: '',
    patientFirstName: '',
    patientDOB: '',
    patientWeight: '',
    patientNIR: '',
    careRelatedToALD: false,

    prescriberLastName: 'Jenkins',
    prescriberFirstName: 'Sarah',
    prescriberPhone: '01 23 45 67 89',
    prescriberRPPS: '12345678901',

    hospitalName: '',
    hospitalAddress: '',
    finessNo: '1234567',
    formsFor: '',

    fromDateText: '',
    prescriptionForWeeks: '',
    renewedTimes: '',
    durationWeeks: '',

    initialSetupPackage: false,
    weeklyPackageGravity: false,
    weeklyPackagePump: false,
    nasogastricTubeCH: '',
    nasogastricRate: '',
    nasogastricTubeChecked: false,
    jejunostomyTubeCH: '',
    jejunostomyTubeChecked: false,
    rentalIVPole: false,
    equipmentNasogastricCareEvery: '',
    equipmentNasogastricCareChecked: false,
    equipmentGastrostomyCare: false,

    unrelatedToALD: false,
    relatedToALD: false,
    jejunostomyCareEveryDays: '',
    jejunostomyCareChecked: false,
    equipmentGastrostomyReplacement: false,
    gastrostomyButtonSet: false,

    nutrients: [
      { name: '', ml: '', timesPerDay: '' },
      { name: '', ml: '', timesPerDay: '' },
      { name: '', ml: '', timesPerDay: '' },
    ],
    numBoxesChecked: '',
  });

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

  const updateNutrient = (index: number, key: string, value: string) => {
    setState(prevState => {
      const newNutrients = [...prevState.nutrients];
      newNutrients[index] = { ...newNutrients[index], [key]: value };
      return { ...prevState, nutrients: newNutrients };
    });
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
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
              ENTERAL ARTIFICIAL NUTRITION PRESCRIPTION FORM
            </AppText>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
              style={{ marginTop: getScaleSize(4) }}
            >
              TICK THE APPROPRIATE BOXES ON THE FORM
            </AppText>
          </View>

          {/* Prescription Date & Main Options */}
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('prescriptionDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                label="Prescription date"
                placeholder="DD/MM/YYYY"
                value={state.prescriptionDate}
                style={styles.inputField}
                pointerEvents="none"
              />
            </TouchableOpacity>

            <DatePicker
              modal
              mode="date"
              open={open}
              date={date}
              onConfirm={d => {
                setOpen(false);
                setDate(d);
                const formattedDate = moment(d).format('DD/MM/YYYY');

                
                if (pickerType === 'prescriptionDate') {
                  setState({ ...state, prescriptionDate: formattedDate });
                } else if (pickerType === 'fromDate') {
                  setState({ ...state, fromDateText: formattedDate });
                }
                setPickerType(null);
              }}
              onCancel={() => {
                setOpen(false);
                setPickerType(null);
              }}
            />

            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.homeInfusionTherapy}
                  onValueChange={val =>
                    setState({ ...state, homeInfusionTherapy: val })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Start of home infusion therapy
                </AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.renewalModification}
                  onValueChange={val =>
                    setState({ ...state, renewalModification: val })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Renewal or modification
                </AppText>
              </View>
            </View>
          </View>

          {/* PATIENT SECTION */}
          <FormPatientSection state={state} setState={setState} />

          {/* PRESCRIBER IDENTIFICATION */}
          <FormPrescriberSection state={state} setState={setState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection state={state} setState={setState} />

          {/* PRESCRIPTION DETAILS */}
          <View style={styles.card}>
            {renderSectionHeader('PRESCRIPTION DETAILS', IMAGES.ic_file)}
            <Input
              label="Forms for"
              placeholder="Enter details"
              value={state.formsFor}
              onChangeText={text => setState({ ...state, formsFor: text })}
              style={styles.inputField}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('fromDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                label="From"
                placeholder="DD/MM/YYYY"
                value={state.fromDateText}
                style={styles.inputField}
                pointerEvents="none"
              />
            </TouchableOpacity>


            <View style={styles.row}>
              <Input
                label="Prescription for (weeks)"
                placeholder="e.g. 4"
                value={state.prescriptionForWeeks}
                onChangeText={t =>
                  setState({ ...state, prescriptionForWeeks: t })
                }
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
              <Input
                label="Renewed (times)"
                placeholder="e.g. 2"
                value={state.renewedTimes}
                onChangeText={t => setState({ ...state, renewedTimes: t })}
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* CONDITION & EQUIPMENT */}
          <View style={styles.card}>
            {renderSectionHeader('CONDITION & EQUIPMENT')}
            <Input
              label="Duration of treatment (weeks)"
              placeholder="e.g. 12"
              value={state.durationWeeks}
              onChangeText={t => setState({ ...state, durationWeeks: t })}
              style={styles.inputField}
              keyboardType="numeric"
            />

            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.initialSetupPackage}
                  onValueChange={v =>
                    setState({ ...state, initialSetupPackage: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Initial setup package for enteral nutrition
                </AppText>
              </View>

              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                style={{ marginTop: getScaleSize(8) }}
              >
                Weekly enteral nutrition package by:
              </AppText>
              <View
                style={{ marginLeft: getScaleSize(20), gap: getScaleSize(8) }}
              >
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={state.weeklyPackageGravity}
                    onValueChange={v =>
                      setState({ ...state, weeklyPackageGravity: v })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Gravity (package 1)</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={state.weeklyPackagePump}
                    onValueChange={v =>
                      setState({ ...state, weeklyPackagePump: v })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Pump (package 2)</AppText>
                </View>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.nasogastricTubeChecked}
                  onValueChange={v =>
                    setState({ ...state, nasogastricTubeChecked: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: getScaleSize(4),
                  }}
                >
                  <Input
                    label="Nasogastric tube CH"
                    placeholder="CH"
                    value={state.nasogastricTubeCH}
                    onChangeText={t =>
                      setState({ ...state, nasogastricTubeCH: t })
                    }
                    style={{ flex: 0.4, paddingHorizontal: 0 }}
                  />
                  <Input
                    label="Rate / month"
                    placeholder="Rate"
                    value={state.nasogastricRate}
                    onChangeText={t =>
                      setState({ ...state, nasogastricRate: t })
                    }
                    style={{ flex: 0.6, paddingHorizontal: 0 }}
                  />
                </View>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.jejunostomyTubeChecked}
                  onValueChange={v =>
                    setState({ ...state, jejunostomyTubeChecked: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <Input
                  label="Jejunostomy or gastrostomy tube CH"
                  placeholder="CH"
                  value={state.jejunostomyTubeCH}
                  onChangeText={t =>
                    setState({ ...state, jejunostomyTubeCH: t })
                  }
                  style={{ flex: 1, paddingHorizontal: 0 }}
                />
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.rentalIVPole}
                  onValueChange={v => setState({ ...state, rentalIVPole: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Rental of an IV pole</AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.equipmentNasogastricCareChecked}
                  onValueChange={v =>
                    setState({ ...state, equipmentNasogastricCareChecked: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: getScaleSize(4),
                  }}
                >
                  <AppText size={getScaleSize(13)}>
                    Equipment for adult nasogastric tube care every
                  </AppText>
                  <Input
                    placeholder="days"
                    value={state.equipmentNasogastricCareEvery}
                    onChangeText={t =>
                      setState({ ...state, equipmentNasogastricCareEvery: t })
                    }
                    style={{ flex: 0.3, paddingHorizontal: 0 }}
                    keyboardType="numeric"
                  />
                  <AppText size={getScaleSize(13)}>days</AppText>
                </View>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.equipmentGastrostomyCare}
                  onValueChange={v =>
                    setState({ ...state, equipmentGastrostomyCare: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Equipment for gastrostomy or jejunostomy care
                </AppText>
              </View>
            </View>
          </View>

          {/* ADDITIONAL PRESCRIPTIONS */}
          <View style={styles.card}>
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.unrelatedToALD}
                  onValueChange={v => setState({ ...state, unrelatedToALD: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Prescriptions unrelated to the recognized long-term condition
                </AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.relatedToALD}
                  onValueChange={v => setState({ ...state, relatedToALD: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Prescriptions related to the treatment of the recognized
                  long-term condition
                </AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.jejunostomyCareChecked}
                  onValueChange={v =>
                    setState({ ...state, jejunostomyCareChecked: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: getScaleSize(4),
                  }}
                >
                  <AppText size={getScaleSize(13)}>
                    Jejunostomy care every
                  </AppText>
                  <Input
                    placeholder="days"
                    value={state.jejunostomyCareEveryDays}
                    onChangeText={t =>
                      setState({ ...state, jejunostomyCareEveryDays: t })
                    }
                    style={{ flex: 0.3, paddingHorizontal: 0 }}
                    keyboardType="numeric"
                  />
                  <AppText size={getScaleSize(13)}>days</AppText>
                </View>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.equipmentGastrostomyReplacement}
                  onValueChange={v =>
                    setState({ ...state, equipmentGastrostomyReplacement: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Equipment in case of gastrostomy tube replacement
                </AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.gastrostomyButtonSet}
                  onValueChange={v =>
                    setState({ ...state, gastrostomyButtonSet: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  One gastrostomy button (statutory set), to be renewed every 7
                  days
                </AppText>
              </View>
            </View>
          </View>

          {/* NUTRIENTS SECTION */}
          <View style={styles.card}>
            {renderSectionHeader('NUTRIENTS')}
            {state.nutrients.map((n, i) => (
              <View key={i} style={{ marginBottom: getScaleSize(16) }}>
                <Input
                  label={`${i + 1}) Nutrient name`}
                  placeholder="Enter name"
                  value={n.name}
                  onChangeText={t => updateNutrient(i, 'name', t)}
                  style={styles.inputField}
                />
                <View style={styles.row}>
                  <Input
                    label="Volume (ml)"
                    placeholder="ml"
                    value={n.ml}
                    onChangeText={t => updateNutrient(i, 'ml', t)}
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    keyboardType="numeric"
                  />
                  <Input
                    label="Times / day"
                    placeholder="Times"
                    value={n.timesPerDay}
                    onChangeText={t => updateNutrient(i, 'timesPerDay', t)}
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}
            <Input
              label="Number of boxes checked"
              placeholder="e.g. 5"
              value={state.numBoxesChecked}
              onChangeText={t => setState({ ...state, numBoxesChecked: t })}
              style={styles.inputField}
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      </View>
      <WarningSheet ref={warningSheetRef} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: getScaleSize(100),
    gap: getScaleSize(12),
  },
  headerTextContainer: {
    marginBottom: getScaleSize(8),
    // marginTop: getScaleSize(16),
    // paddingHorizontal: getScaleSize(16),
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    // marginHorizontal: getScaleSize(16),
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
    marginTop: getScaleSize(0),
    marginBottom: getScaleSize(12),
    paddingHorizontal: getScaleSize(0),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
  },
  checkboxGroup: {
    marginTop: getScaleSize(4),
    gap: getScaleSize(8),
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
});

export default EnteralNutritionForm;
