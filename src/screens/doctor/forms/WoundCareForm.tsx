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
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const WoundCareForm: React.FC = () => {
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
    careRelatedToALD: '', // 'ALD', 'NOT_ALD'

    prescriberLastName: 'Jenkins',
    prescriberFirstName: 'Sarah',
    prescriberPhone: '01 23 45 67 89',
    prescriberRPPS: '12345678901',
    prescriberFINESS: '1234567',

    woundSize: '',
    woundType: '', // 'Acute', 'Chronic'
    woundCategory: '', // 'Ulcer', 'Pressure', 'Postop', 'Cavity', 'Fibrin'
    otherWound: '',

    dressingType: '', // 'Hyperabsorbent', 'Postop', 'Debridement', 'Hydrocolloid'
    dressingDetails: '',
    packing: false,
    packingGoals: {
      fillCavity: false,
      occupyDeadSpace: false,
      preventClosure: false,
    },

    exudate: '', // 'Yes', 'No'
    cavity: '', // 'Yes', 'No'
    septic: '', // 'Yes', 'No'

    materials: {
      dressingKitsChecked: false,
      dressingKits: '',
      kitsPerDay: '',
      retentionBandageChecked: false,
      retentionBandage: '',
      bandagePerDay: '',
      cleaningChecked: false,
      cleaningWith: '',
      disinfectionChecked: false,
      disinfectionWith: '',
      firstLayer: '',
      secondLayer: '',
    },

    treatmentDuration: '',
    untilHealed: false,
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
              Wound Dressing Prescription Support Form
            </AppText>
          </View>

          {/* PRESCRIBER IDENTIFICATION */}
          <FormPrescriberSection
            state={state}
            setState={setState}
            title="Physician Information"
            showFiness={true}
          />

          {/* PATIENT SECTION */}
          <FormPatientSection
            state={state}
            setState={setState}
            showWeight={false}
            showNIR={false}
            showALD={false}
          />

          {/* ALD & Date SECTION */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1, gap: getScaleSize(8) }}>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={state.careRelatedToALD === 'ALD'}
                    onValueChange={() =>
                      setState({ ...state, careRelatedToALD: 'ALD' })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />
                  <AppText size={getScaleSize(13)}>
                    Care related to long-term condition (ALD)
                  </AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={state.careRelatedToALD === 'NOT_ALD'}
                    onValueChange={() =>
                      setState({ ...state, careRelatedToALD: 'NOT_ALD' })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />
                  <AppText size={getScaleSize(13)}>
                    Care not related to long-term condition (ALD)
                  </AppText>
                </View>
              </View>
            </View>

            <View style={{ marginTop: getScaleSize(12) }}>
              <Input
                onPress={() => {
                  setPickerType('prescriptionDate');
                  setOpen(true);
                }}
                editable={false}
                label="Prescription date"
                placeholder="DD/MM/YYYY"
                value={state.prescriptionDate}
                style={[styles.inputField, { marginBottom: 0 }]}
                pointerEvents="none"
              />
            </View>
          </View>

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
              }
              setPickerType(null);
            }}
            onCancel={() => {
              setOpen(false);
              setPickerType(null);
            }}
          />

          {/* WOUND CHARACTERISTICS */}
          <View style={styles.card}>
            {renderSectionHeader('Type of wound:')}

            <View style={{ gap: getScaleSize(12), marginTop: getScaleSize(8) }}>
              <View>
                <View
                  style={[
                    styles.row,
                    { justifyContent: 'space-between', marginBottom: 0 },
                  ]}
                >
                  <View style={[styles.row, { flex: 1, marginLeft: 12 }]}>
                    <AppText size={getScaleSize(13)}>Size:</AppText>
                    <Input
                      value={state.woundSize}
                      onChangeText={t => setState({ ...state, woundSize: t })}
                      style={{ flex: 1, paddingHorizontal: 0 }}
                      inputWrapperStyle={styles.inlineInputWrapper}
                      inputStyle={[
                        styles.inlineInputText,
                        { textAlign: 'left' },
                      ]}
                      placeholder="e.g. 5x5 cm"
                    />
                  </View>
                </View>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.woundType === 'Acute'}
                      onValueChange={() =>
                        setState({ ...state, woundType: 'Acute' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>Acute</AppText>
                  </View>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.woundType === 'Chronic'}
                      onValueChange={() =>
                        setState({ ...state, woundType: 'Chronic' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>Chronic</AppText>
                  </View>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: getScaleSize(12),
                }}
              >
                {[
                  { key: 'Ulcer', label: 'Ulcer' },
                  { key: 'Pressure', label: 'Pressure ulcer' },
                  { key: 'Postop', label: 'Postoperative wound' },
                  { key: 'Cavity', label: 'Cavity wound' },
                  { key: 'Fibrin', label: 'Wound with fibrin' },
                ].map(cat => (
                  <View key={cat.key} style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.woundCategory === cat.key}
                      onValueChange={() =>
                        setState({ ...state, woundCategory: cat.key })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>{cat.label}</AppText>
                  </View>
                ))}
              </View>
              <Input
                label="Other"
                placeholder="Specify..."
                value={state.otherWound}
                onChangeText={t => setState({ ...state, otherWound: t })}
                style={styles.inputField}
              />
            </View>
          </View>

          {/* DRESSING TYPE & STATUS */}
          <View style={styles.card}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              style={{ marginBottom: getScaleSize(12) }}
            >
              Desired dressing type
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: getScaleSize(12),
                marginBottom: getScaleSize(16),
              }}
            >
              {[
                {
                  key: 'Hyperabsorbent',
                  label: 'Hyperabsorbent (ulcer-type wound)',
                },
                { key: 'Postop', label: 'Post-op (e.g., Mediane Post-op)' },
                {
                  key: 'Debridement',
                  label: 'Debridement and healing dressing (e.g., Algostéril)',
                },
                {
                  key: 'Hydrocolloid',
                  label:
                    'Hydrocolloid: absorbs exudate and forms a moist gel on contact with the wound',
                },
              ].map(dt => (
                <View
                  key={dt.key}
                  style={[styles.checkboxItem, { width: '100%' }]}
                >
                  <CheckBox
                    boxType="circle"
                    value={state.dressingType === dt.key}
                    onValueChange={() =>
                      setState({ ...state, dressingType: dt.key })
                    }
                    tintColors={{
                      true: COLORS.primary,
                      false: COLORS._6F767E,
                    }}
                  />

                  <AppText size={getScaleSize(12)} style={{ flex: 1 }}>
                    {dt.label}
                  </AppText>
                </View>
              ))}
              <View style={[styles.checkboxItem, { width: '100%' }]}>
                <CheckBox
                  boxType="square"
                  value={state.packing}
                  onValueChange={v => setState({ ...state, packing: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(12)}>Packing</AppText>
              </View>

              <View
                style={[
                  { marginLeft: getScaleSize(24), gap: getScaleSize(8) },
                  !state.packing && { opacity: 0.5 },
                ]}
                pointerEvents={state.packing ? 'auto' : 'none'}
              >
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={state.packingGoals.fillCavity}
                    onValueChange={v =>
                      setState({
                        ...state,
                        packingGoals: {
                          ...state.packingGoals,
                          fillCavity: v,
                        },
                      })
                    }
                    tintColors={{
                      true: COLORS.primary,
                      false: COLORS._6F767E,
                    }}
                  />
                  <AppText size={getScaleSize(12)}>Fill a cavity</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={state.packingGoals.occupyDeadSpace}
                    onValueChange={v =>
                      setState({
                        ...state,
                        packingGoals: {
                          ...state.packingGoals,
                          occupyDeadSpace: v,
                        },
                      })
                    }
                    tintColors={{
                      true: COLORS.primary,
                      false: COLORS._6F767E,
                    }}
                  />
                  <AppText size={getScaleSize(12)}>Occupy dead space</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={state.packingGoals.preventClosure}
                    onValueChange={v =>
                      setState({
                        ...state,
                        packingGoals: {
                          ...state.packingGoals,
                          preventClosure: v,
                        },
                      })
                    }
                    tintColors={{
                      true: COLORS.primary,
                      false: COLORS._6F767E,
                    }}
                  />
                  <AppText size={getScaleSize(12)}>
                    Prevent premature superficial closure
                  </AppText>
                </View>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: COLORS._EFEFEF,
                marginBottom: getScaleSize(16),
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: getScaleSize(16),
              }}
            >
              {[
                { key: 'exudate', label: 'Exudate' },
                { key: 'cavity', label: 'Cavity' },
                { key: 'septic', label: 'Septic wound' },
              ].map(item => (
                <View key={item.key} style={{ minWidth: '45%' }}>
                  <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                    {item.label}
                  </AppText>
                  <View style={[styles.row, { marginTop: 4, marginBottom: 0 }]}>
                    <View style={styles.checkboxItem}>
                      <CheckBox
                        boxType="circle"
                        value={(state as any)[item.key] === 'Yes'}
                        onValueChange={() =>
                          setState({ ...state, [item.key]: 'Yes' })
                        }
                        tintColors={{
                          true: COLORS.primary,
                          false: COLORS._6F767E,
                        }}
                      />

                      <AppText size={getScaleSize(12)}>Yes</AppText>
                    </View>
                    <View style={styles.checkboxItem}>
                      <CheckBox
                        boxType="circle"
                        value={(state as any)[item.key] === 'No'}
                        onValueChange={() =>
                          setState({ ...state, [item.key]: 'No' })
                        }
                        tintColors={{
                          true: COLORS.primary,
                          false: COLORS._6F767E,
                        }}
                      />

                      <AppText size={getScaleSize(12)}>No</AppText>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* PROTOCOL SECTION */}
          <View style={styles.card}>
            {renderSectionHeader('Required Materials & Protocol')}
            <View style={{ gap: getScaleSize(16) }}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.materials.dressingKitsChecked}
                  onValueChange={v =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, dressingKitsChecked: v },
                    }))
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Dressing kits</AppText>
                {/* <TextInput
                  placeholder="________________"
                  value={state.materials.dressingKits}
                  onChangeText={t =>
                    setState({
                      ...state,
                      materials: { ...state.materials, dressingKits: t },
                    })
                  }
                  style={[styles.inlineInput, { flex: 1 }]}
                /> */}
                <Input
                  placeholder="0"
                  value={state.materials.kitsPerDay}
                  onChangeText={t =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, kitsPerDay: t },
                    }))
                  }
                  style={{ width: getScaleSize(40), paddingHorizontal: 0 }}
                  inputWrapperStyle={styles.inlineInputWrapper}
                  inputStyle={styles.inlineInputText}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(13)}>per day</AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.materials.retentionBandageChecked}
                  onValueChange={v =>
                    setState(prev => ({
                      ...prev,
                      materials: {
                        ...prev.materials,
                        retentionBandageChecked: v,
                      },
                    }))
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Nylex or Velpeau retention bandage
                </AppText>
                <Input
                  value={state.materials.bandagePerDay}
                  onChangeText={t =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, bandagePerDay: t },
                    }))
                  }
                  style={{
                    width: getScaleSize(40),
                    paddingHorizontal: 0,
                    marginLeft: getScaleSize(8),
                  }}
                  inputWrapperStyle={styles.inlineInputWrapper}
                  inputStyle={styles.inlineInputText}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(13)}>per day</AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  value={state.materials.cleaningChecked}
                  onValueChange={v =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, cleaningChecked: v },
                    }))
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />
                <AppText size={getScaleSize(13)}>Cleaning with</AppText>
                <Input
                  // placeholder="________________________________"
                  value={state.materials.cleaningWith}
                  onChangeText={t =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, cleaningWith: t },
                    }))
                  }
                  style={{ flex: 1, paddingHorizontal: 0 }}
                  inputWrapperStyle={styles.inlineInputWrapper}
                  inputStyle={[styles.inlineInputText, { textAlign: 'left' }]}
                />
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  value={state.materials.disinfectionChecked}
                  onValueChange={v =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, disinfectionChecked: v },
                    }))
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />
                <AppText size={getScaleSize(13)}>Disinfection with</AppText>
                <Input
                  // placeholder="________________________________"
                  value={state.materials.disinfectionWith}
                  onChangeText={t =>
                    setState(prev => ({
                      ...prev,
                      materials: { ...prev.materials, disinfectionWith: t },
                    }))
                  }
                  style={{ flex: 1, paddingHorizontal: 0 }}
                  inputWrapperStyle={styles.inlineInputWrapper}
                  inputStyle={[styles.inlineInputText, { textAlign: 'left' }]}
                />
              </View>

              <View style={{ gap: getScaleSize(8) }}>
                <View style={styles.row}>
                  <AppText size={getScaleSize(13)}>
                    1st layer in contact with the wound
                  </AppText>
                  <Input
                    value={state.materials.firstLayer}
                    onChangeText={t =>
                      setState(prev => ({
                        ...prev,
                        materials: { ...prev.materials, firstLayer: t },
                      }))
                    }
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    inputWrapperStyle={styles.inlineInputWrapper}
                    inputStyle={[styles.inlineInputText, { textAlign: 'left' }]}
                  />
                </View>
                <View style={styles.row}>
                  <AppText size={getScaleSize(13)}>
                    2nd overlapping layer
                  </AppText>
                  <Input
                    value={state.materials.secondLayer}
                    onChangeText={t =>
                      setState(prev => ({
                        ...prev,
                        materials: { ...prev.materials, secondLayer: t },
                      }))
                    }
                    style={{ flex: 1, paddingHorizontal: 0 }}
                    inputWrapperStyle={styles.inlineInputWrapper}
                    inputStyle={[styles.inlineInputText, { textAlign: 'left' }]}
                  />
                </View>
              </View>

              <View style={[styles.row, { marginTop: getScaleSize(8) }]}>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    value={!state.untilHealed}
                    onValueChange={() =>
                      setState({ ...state, untilHealed: false })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />
                  <AppText size={getScaleSize(13)}>Treatment duration</AppText>
                </View>
                <Input
                  value={state.treatmentDuration}
                  onChangeText={t =>
                    setState({
                      ...state,
                      treatmentDuration: t,
                      untilHealed: false,
                    })
                  }
                  style={{ width: getScaleSize(60), paddingHorizontal: 0 }}
                  inputWrapperStyle={styles.inlineInputWrapper}
                  inputStyle={styles.inlineInputText}
                />
                <AppText size={getScaleSize(13)}>or</AppText>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    value={state.untilHealed}
                    onValueChange={v => setState({ ...state, untilHealed: v })}
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />
                  <AppText size={getScaleSize(13)}>Until healed</AppText>
                </View>
              </View>
            </View>
          </View>

          {/* SIGNATURE SECTION */}
          <View style={styles.card}>
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
                Physician signature
              </AppText>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS._EFEFEF,
                  width: getScaleSize(150),
                  height: getScaleSize(40),
                }}
              />
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
    flexWrap: 'wrap',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
  inlineInputWrapper: {
    height: 'auto',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 0,
    borderBottomColor: COLORS.primary,
  },
  inlineInputText: {
    textAlign: 'center',
    padding: 0,
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.primary,
    fontSize: getScaleSize(14),
  },
});

export default WoundCareForm;
