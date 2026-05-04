import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
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

const OralNutritionForm: React.FC = () => {
  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);

  const [state, setState] = useState({
    prescriptionDate: '',
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

    doneAt: '',
    doneOn: '',

    prescriptionOutsideALD: false,

    supplements: [
      {
        id: 1,
        label: 'High protein / high calorie ONS drink 1.5 kcal/ml',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 2,
        label: 'High protein / high calorie ONS drink 1.5 kcal/ml + fiber',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 3,
        label: 'High protein / high calorie ONS drink 2 kcal/ml',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 4,
        label:
          'High protein / high calorie ONS 2 kcal/ml concentrated (small volume)',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 5,
        label: 'High protein / high calorie ONS cream 1.5 kcal/ml',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 6,
        label: 'High protein / high calorie ONS soup 1.5 kcal',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 7,
        label: 'Blended high-protein meals (300 g), 500 kcal',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 8,
        label: 'Fruit juice ONS, standard protein, high calorie',
        qty: '',
        perDay: '',
        checked: false,
      },
      {
        id: 9,
        label: 'Compote 250 kcal + 6-9 g protein',
        qty: '',
        perDay: '',
        checked: false,
      },
    ],
    otherSupplement: '',
    otherSupplementQty: '',
    otherSupplementPerDay: '',

    texture: '',
    renewalForMonths: '',
  });

  const updateSupplement = (index: number, key: string, value: any) => {
    setState(prevState => {
      const newSupplements = [...prevState.supplements];
      (newSupplements[index] as any)[key] = value;
      return { ...prevState, supplements: newSupplements };
    });
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
              HOME ORAL NUTRITION SUPPLEMENT PRESCIPTION FORM
            </AppText>
          </View>

          {/* Prescription Date */}
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
                } else if (pickerType === 'doneOn') {
                  setState({ ...state, doneOn: formattedDate });
                }
                setPickerType(null);
              }}
              onCancel={() => {
                setOpen(false);
                setPickerType(null);
              }}
            />
          </View>

          {/* PATIENT SECTION */}
          <FormPatientSection state={state} setState={setState} />

          {/* PRESCRIBER IDENTIFICATION */}
          <FormPrescriberSection state={state} setState={setState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection state={state} setState={setState} />

          {/* DONE AT / ON */}
          <View style={styles.card}>
            {renderSectionHeader('LOCATION & DATE')}
            <View style={styles.row}>
              <Input
                label="Done at"
                placeholder="City"
                value={state.doneAt}
                onChangeText={t => setState({ ...state, doneAt: t })}
                style={{ flex: 1, paddingHorizontal: 0 }}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ flex: 1 }}
                onPress={() => {
                  setPickerType('doneOn');
                  setOpen(true);
                }}
              >
                <Input
                  editable={false}
                  label="Done on"
                  placeholder="DD/MM/YYYY"
                  value={state.doneOn}
                  style={{ flex: 1, paddingHorizontal: 0 }}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            </View>
            <View
              style={[styles.checkboxItem, { marginTop: getScaleSize(12) }]}
            >
              <CheckBox
                boxType="square"
                value={state.prescriptionOutsideALD}
                onValueChange={v =>
                  setState({ ...state, prescriptionOutsideALD: v })
                }
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />

              <AppText size={getScaleSize(13)}>
                Prescription outside ALD
              </AppText>
            </View>
          </View>

          {/* SUPPLEMENTS LIST */}
          <View style={styles.card}>
            {renderSectionHeader('SUPPLEMENTS LIST')}
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._6F767E}
              style={{ marginBottom: getScaleSize(12) }}
            >
              Standard carbohydrate range / Diabetic range
            </AppText>

            {state.supplements.map((item, index) => (
              <View
                key={item.id}
                style={{
                  marginBottom: getScaleSize(12),
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS._EFEFEF,
                  paddingBottom: getScaleSize(12),
                }}
              >
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={item.checked}
                    onValueChange={v => updateSupplement(index, 'checked', v)}
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)} style={{ flex: 1 }}>
                    {item.label}
                  </AppText>
                </View>
                {item.checked && (
                  <View
                    style={[
                      styles.row,
                      {
                        marginLeft: getScaleSize(32),
                        marginTop: getScaleSize(8),
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: getScaleSize(4),
                      }}
                    >
                      <AppText size={getScaleSize(13)}>Qty</AppText>
                      <TextInput
                        placeholder="0"
                        value={item.qty}
                        onChangeText={t => updateSupplement(index, 'qty', t)}
                        style={styles.inlineInput}
                        keyboardType="numeric"
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: getScaleSize(4),
                      }}
                    >
                      <TextInput
                        placeholder="0"
                        value={item.perDay}
                        onChangeText={t => updateSupplement(index, 'perDay', t)}
                        style={styles.inlineInput}
                        keyboardType="numeric"
                      />
                      <AppText size={getScaleSize(13)}>/ day</AppText>
                    </View>
                  </View>
                )}
              </View>
            ))}

            <View style={{ marginTop: getScaleSize(12) }}>
              <Input
                label="Other"
                placeholder="Specify supplement"
                value={state.otherSupplement}
                onChangeText={t => setState({ ...state, otherSupplement: t })}
                style={styles.inputField}
              />
              <View style={[styles.row, { marginTop: getScaleSize(8) }]}>
                <Input
                  label="Qty"
                  placeholder="Qty"
                  value={state.otherSupplementQty}
                  onChangeText={t =>
                    setState({ ...state, otherSupplementQty: t })
                  }
                  style={{ flex: 1, paddingHorizontal: 0 }}
                />
                <Input
                  label="/ day"
                  placeholder="times"
                  value={state.otherSupplementPerDay}
                  onChangeText={t =>
                    setState({ ...state, otherSupplementPerDay: t })
                  }
                  style={{ flex: 1, paddingHorizontal: 0 }}
                />
              </View>
            </View>
          </View>

          {/* TREATMENT DETAILS */}
          <View style={styles.card}>
            {renderSectionHeader('TREATMENT DETAILS')}
            <AppText
              size={getScaleSize(13)}
              color={COLORS._6F767E}
              style={{ fontStyle: 'italic' }}
            >
              To be consumed at least 2 hours before or after each meal for 1
              month
            </AppText>
            <Input
              label="Texture"
              placeholder="e.g. Liquid, Semi-solid"
              value={state.texture}
              onChangeText={t => setState({ ...state, texture: t })}
              style={{ marginTop: getScaleSize(12), paddingHorizontal: 0 }}
            />

            <View
              style={{
                marginTop: getScaleSize(16),
                borderTopWidth: 1,
                borderTopColor: COLORS._EFEFEF,
                paddingTop: getScaleSize(16),
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: getScaleSize(8),
                }}
              >
                <AppText size={getScaleSize(13)}>
                  Renewal to be carried out for
                </AppText>
                <TextInput
                  placeholder="0"
                  value={state.renewalForMonths}
                  onChangeText={t =>
                    setState({ ...state, renewalForMonths: t })
                  }
                  style={styles.inlineInput}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(13)}>months</AppText>
              </View>
            </View>
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
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
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
    marginBottom: getScaleSize(10),
    paddingHorizontal: getScaleSize(0),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
    marginBottom: getScaleSize(5),
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
  inlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    width: getScaleSize(40),
    textAlign: 'center',
    padding: 0,
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.primary,
    fontSize: getScaleSize(14),
  },
});

export default OralNutritionForm;
