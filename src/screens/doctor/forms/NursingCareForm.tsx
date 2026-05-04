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

const NursingCareForm: React.FC = () => {
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

    hygieneCareTwiceADay: false,
    completeBedHygieneTwiceADay: false,

    monitorBP: false,
    monitorTemp: false,
    monitorOxygen: false,
    monitorWeightWeekly: false,

    glucoseInsulinChecked: false,
    glucoseInsulinTimesPerDay: '',

    dressingLocation: '',
    dressingSimple: false,
    dressingComplex: false,
    dressingTimesPerDay: '',
    dressingEveryDays: '',

    removalSuturesChecked: false,
    removalSuturesInDays: '',

    urinaryCatheterCareChecked: false,
    urinaryCatheterCareTimesPerDay: '',
    urinaryCatheterRemovalDate: '',
    monitoringUrineOutput: false,

    unrelatedToALD: false,
    relatedToALD: false,

    prescriptionForDays: '',
    renewable: false,
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
              PRESCRIPTION FORM EXCLUSIVELY FOR NURSING CARE
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
                } else if (pickerType === 'catheterRemovalDate') {
                  setState({ ...state, urinaryCatheterRemovalDate: formattedDate });
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

          {/* HYGIENE & CARE DETAILS */}
          <View style={styles.card}>
            {renderSectionHeader('HYGIENE & CARE')}
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.hygieneCareTwiceADay}
                  onValueChange={v =>
                    setState({ ...state, hygieneCareTwiceADay: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Assistance with hygiene care twice a day
                </AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.completeBedHygieneTwiceADay}
                  onValueChange={v =>
                    setState({ ...state, completeBedHygieneTwiceADay: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Complete bed hygiene care twice a day
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            {renderSectionHeader('MONITORING VITAL SIGNS')}
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.monitorBP}
                  onValueChange={v => setState({ ...state, monitorBP: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Blood pressure / Pulse
                </AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.monitorTemp}
                  onValueChange={v => setState({ ...state, monitorTemp: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Temperature</AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.monitorOxygen}
                  onValueChange={v => setState({ ...state, monitorOxygen: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Oxygen saturation</AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.monitorWeightWeekly}
                  onValueChange={v =>
                    setState({ ...state, monitorWeightWeekly: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Weekly monitoring of body weight with chart
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            {renderSectionHeader('TREATMENTS & DRESSINGS')}
            <View style={styles.checkboxItem}>
              <CheckBox
                boxType="square"
                value={state.glucoseInsulinChecked}
                onValueChange={v =>
                  setState({ ...state, glucoseInsulinChecked: v })
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
                <AppText size={getScaleSize(13)}>Glucose & insulin</AppText>
                <Input
                  placeholder="Times"
                  value={state.glucoseInsulinTimesPerDay}
                  onChangeText={t =>
                    setState({ ...state, glucoseInsulinTimesPerDay: t })
                  }
                  style={{ flex: 0.3, paddingHorizontal: 0 }}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(13)}>/ day</AppText>
              </View>
            </View>

            <Input
              label="Dressing Location"
              placeholder="e.g. Right leg"
              value={state.dressingLocation}
              onChangeText={t => setState({ ...state, dressingLocation: t })}
              style={styles.inputField}
            />
            <View style={styles.row}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="circle"
                  value={state.dressingSimple}
                  onValueChange={v => setState({ ...state, dressingSimple: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Simple</AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="circle"
                  value={state.dressingComplex}
                  onValueChange={v =>
                    setState({ ...state, dressingComplex: v })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Complex</AppText>
              </View>
            </View>
            <View style={styles.row}>
              <Input
                label="Times / day"
                placeholder="e.g. 1"
                value={state.dressingTimesPerDay}
                onChangeText={t =>
                  setState({ ...state, dressingTimesPerDay: t })
                }
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
              <Input
                label="Every (days)"
                placeholder="e.g. 2"
                value={state.dressingEveryDays}
                onChangeText={t => setState({ ...state, dressingEveryDays: t })}
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.card}>
            {renderSectionHeader('SUTURES & CATHETER')}
            <View style={styles.checkboxItem}>
              <CheckBox
                boxType="square"
                value={state.removalSuturesChecked}
                onValueChange={v =>
                  setState({ ...state, removalSuturesChecked: v })
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
                <AppText size={getScaleSize(13)}>Removal of sutures in</AppText>
                <Input
                  placeholder="days"
                  value={state.removalSuturesInDays}
                  onChangeText={t =>
                    setState({ ...state, removalSuturesInDays: t })
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
                value={state.urinaryCatheterCareChecked}
                onValueChange={v =>
                  setState({ ...state, urinaryCatheterCareChecked: v })
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
                <AppText size={getScaleSize(13)}>Urinary catheter care</AppText>
                <Input
                  placeholder="Times"
                  value={state.urinaryCatheterCareTimesPerDay}
                  onChangeText={t =>
                    setState({ ...state, urinaryCatheterCareTimesPerDay: t })
                  }
                  style={{ flex: 0.3, paddingHorizontal: 0 }}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(13)}>/ day</AppText>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('catheterRemovalDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                label="Removal of the urinary catheter on"
                placeholder="DD/MM/YYYY"
                value={state.urinaryCatheterRemovalDate}
                style={styles.inputField}
                pointerEvents="none"
              />
            </TouchableOpacity>


            <View style={styles.checkboxItem}>
              <CheckBox
                boxType="square"
                value={state.monitoringUrineOutput}
                onValueChange={v =>
                  setState({ ...state, monitoringUrineOutput: v })
                }
                tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
              />

              <AppText size={getScaleSize(13)}>
                Monitoring of urine output
              </AppText>
            </View>
          </View>

          <View style={styles.card}>
            {renderSectionHeader('CONDITION RELEVANCE')}
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.unrelatedToALD}
                  onValueChange={v => setState({ ...state, unrelatedToALD: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>
                  Prescriptions unrelated to long-term condition (ALD)
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
                  Prescriptions related to treatment of ALD
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            {renderSectionHeader('MEDICAL CERTIFICATION')}
            <AppText
              size={getScaleSize(13)}
              color={COLORS._6F767E}
              style={{ marginBottom: getScaleSize(12) }}
            >
              I, the undersigned Dr. {state.prescriberLastName}, certify that
              patient's state of health requires nursing care at home.
            </AppText>
            <View style={styles.row}>
              <Input
                label="Prescription for (days)"
                placeholder="days"
                value={state.prescriptionForDays}
                onChangeText={t =>
                  setState({ ...state, prescriptionForDays: t })
                }
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
              <View
                style={[styles.checkboxItem, { marginTop: getScaleSize(25) }]}
              >
                <CheckBox
                  boxType="square"
                  value={state.renewable}
                  onValueChange={v => setState({ ...state, renewable: v })}
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(13)}>Renewable</AppText>
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
    marginTop: getScaleSize(16),
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

export default NursingCareForm;
