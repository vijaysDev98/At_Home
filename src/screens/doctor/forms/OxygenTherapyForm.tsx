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
  FormFacilitySection,
  AppDurationPicker,
  AppDurationPickerRef,
  WarningSheet,
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const OxygenTherapyForm: React.FC = () => {
  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);
  const durationPickerRef = useRef<AppDurationPickerRef>(null);

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

    primarySource: '', // stationary concentrator / cylinder
    ambulatoryCylinder: '', // YES / NO
    interface: '', // cannula / mask

    durationHours: '',
    durationPer: 'day', // day / month

    flowRateRest: '',
    flowRateExertion: '',

    humidifierCompliant: '', // YES / NO
    backupSource: false,
    mobilitySource: false,
    pulseOximeter: false,
    nonKinkingTubing: false,

    targetSpO2: '',
    prescriberEmergencyPhone: '',

    palliativeCare: false,
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
              SHORT-TERM HOME OXYGEN THERAPY
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

                if (pickerType === 'prescriptionDate') {
                  const formattedDate = moment(d).format('DD/MM/YYYY');
                  setState({ ...state, prescriptionDate: formattedDate });
                }

                setPickerType(null);
              }}
              onCancel={() => {
                setOpen(false);
                setPickerType(null);
              }}
            />

            <AppDurationPicker
              ref={durationPickerRef}
              onConfirm={h => {
                setState({ ...state, durationHours: h });
              }}
            />
          </View>

          {/* PATIENT SECTION */}
          <FormPatientSection state={state} setState={setState} />

          {/* PRESCRIBER IDENTIFICATION */}
          <FormPrescriberSection state={state} setState={setState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection state={state} setState={setState} />

          {/* PRESCRIPTION */}
          <View style={styles.card}>
            {renderSectionHeader('PRESCRIPTION')}

            <View style={{ gap: getScaleSize(16) }}>
              <View>
                <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                  Type of primary oxygen (O2) source:
                </AppText>
                <View style={[styles.row, { marginTop: 8 }]}>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.primarySource === 'concentrator'}
                      onValueChange={() =>
                        setState({ ...state, primarySource: 'concentrator' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>
                      Stationary concentrator
                    </AppText>
                  </View>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.primarySource === 'cylinder'}
                      onValueChange={() =>
                        setState({ ...state, primarySource: 'cylinder' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>Cylinder</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                  Ambulatory cylinder:
                </AppText>
                <View style={styles.row}>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.ambulatoryCylinder === 'YES'}
                      onValueChange={() =>
                        setState({ ...state, ambulatoryCylinder: 'YES' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>YES</AppText>
                  </View>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.ambulatoryCylinder === 'NO'}
                      onValueChange={() =>
                        setState({ ...state, ambulatoryCylinder: 'NO' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>NO</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={state.interface === 'cannula'}
                    onValueChange={() =>
                      setState({ ...state, interface: 'cannula' })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Nasal cannula</AppText>
                </View>
                <View style={styles.checkboxItem}>
                  <CheckBox
                    boxType="circle"
                    value={state.interface === 'mask'}
                    onValueChange={() =>
                      setState({ ...state, interface: 'mask' })
                    }
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>Oxygen mask</AppText>
                </View>
              </View>

              <View style={styles.row}>
                <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                  Duration:
                </AppText>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    durationPickerRef.current?.show(state.durationHours, '00');
                  }}
                  style={styles.inlineInput}
                >
                  <TextInput
                    editable={false}
                    placeholder="0"
                    value={state.durationHours}
                    style={{
                      fontFamily: FONTS.Inter.Bold,
                      color: COLORS.primary,
                      padding: 0,
                      textAlign: 'center',
                    }}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                <AppText size={getScaleSize(13)}>hours /</AppText>
                <View style={styles.row}>
                  <TouchableOpacity
                    onPress={() => setState({ ...state, durationPer: 'day' })}
                  >
                    <AppText
                      size={getScaleSize(13)}
                      color={
                        state.durationPer === 'day'
                          ? COLORS.primary
                          : COLORS._6F767E
                      }
                      font={
                        state.durationPer === 'day'
                          ? FONTS.Inter.Bold
                          : FONTS.Inter.Regular
                      }
                    >
                      day
                    </AppText>
                  </TouchableOpacity>
                  <AppText size={getScaleSize(13)} color={COLORS._6F767E}>
                    /
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setState({ ...state, durationPer: 'month' })}
                  >
                    <AppText
                      size={getScaleSize(13)}
                      color={
                        state.durationPer === 'month'
                          ? COLORS.primary
                          : COLORS._6F767E
                      }
                      font={
                        state.durationPer === 'month'
                          ? FONTS.Inter.Bold
                          : FONTS.Inter.Regular
                      }
                    >
                      month
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                <View style={styles.row}>
                  <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                    Flow rate:
                  </AppText>
                  <TextInput
                    placeholder="0"
                    value={state.flowRateRest}
                    onChangeText={t => setState({ ...state, flowRateRest: t })}
                    style={styles.inlineInput}
                    keyboardType="numeric"
                  />
                  <AppText size={getScaleSize(13)}>L/min at rest</AppText>
                </View>
                <View style={[styles.row, { marginLeft: getScaleSize(70) }]}>
                  <TextInput
                    placeholder="0"
                    value={state.flowRateExertion}
                    onChangeText={t =>
                      setState({ ...state, flowRateExertion: t })
                    }
                    style={styles.inlineInput}
                    keyboardType="numeric"
                  />
                  <AppText size={getScaleSize(13)}>
                    L/min during exertion
                  </AppText>
                </View>
              </View>

              <View style={styles.row}>
                <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                  Humidifier (ISO 8185):
                </AppText>
                <View style={styles.row}>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.humidifierCompliant === 'YES'}
                      onValueChange={() =>
                        setState({ ...state, humidifierCompliant: 'YES' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>YES</AppText>
                  </View>
                  <View style={styles.checkboxItem}>
                    <CheckBox
                      boxType="circle"
                      value={state.humidifierCompliant === 'NO'}
                      onValueChange={() =>
                        setState({ ...state, humidifierCompliant: 'NO' })
                      }
                      tintColors={{
                        true: COLORS.primary,
                        false: COLORS._6F767E,
                      }}
                    />

                    <AppText size={getScaleSize(13)}>NO</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.backupSource}
                  onValueChange={v => setState({ ...state, backupSource: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Provision of backup source (cylinder)
                </AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.mobilitySource}
                  onValueChange={v => setState({ ...state, mobilitySource: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Provision of mobility source (small cylinder)
                </AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.pulseOximeter}
                  onValueChange={v => setState({ ...state, pulseOximeter: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Provision of a pulse oximeter
                </AppText>
              </View>

              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.nonKinkingTubing}
                  onValueChange={v =>
                    setState({ ...state, nonKinkingTubing: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Non-kinking star-lumen tubing
                </AppText>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                  Adjust oxygen to obtain an SpO2 {'\u2265'}
                </AppText>
                <TextInput
                  placeholder="95"
                  value={state.targetSpO2}
                  onChangeText={t => setState({ ...state, targetSpO2: t })}
                  style={styles.inlineInput}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(13)}>%</AppText>
              </View>

              <Input
                label="Emergency contact phone"
                placeholder="Phone number"
                value={state.prescriberEmergencyPhone}
                onChangeText={t =>
                  setState({ ...state, prescriberEmergencyPhone: t })
                }
                keyboardType="phone-pad"
                style={styles.inputField}
              />
            </View>
          </View>

          {/* PATIENT INSTRUCTIONS */}
          <View style={styles.card}>
            {renderSectionHeader('PATIENT INSTRUCTIONS')}
            <View style={{ gap: 6 }}>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                {'\u2022'} NEVER smoke or vape while using oxygen.
              </AppText>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                {'\u2022'} NEVER smoke in the room where oxygen is installed.
              </AppText>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                {'\u2022'} NEVER cook while using oxygen.
              </AppText>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                {'\u2022'} NEVER use aerosol sprays or flammable solvents.
              </AppText>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                {'\u2022'} NEVER apply greasy ointment to face/hands.
              </AppText>
            </View>
            <View
              style={[styles.checkboxItem, { marginTop: getScaleSize(20) }]}
            >
              <CheckBox
                value={state.palliativeCare}
                onValueChange={v => setState({ ...state, palliativeCare: v })}
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />
              <AppText size={getScaleSize(13)} font={FONTS.Inter.SemiBold}>
                Home oxygen therapy as part of palliative care
              </AppText>
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
  inlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    width: getScaleSize(45),
    textAlign: 'center',
    padding: 0,
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.primary,
    fontSize: getScaleSize(14),
  },
});

export default OxygenTherapyForm;
