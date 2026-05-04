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
  AppText,
  WarningSheet,
  Input,
  FormPatientSection,
  FormPrescriberSection,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const PCAInfusionForm: React.FC = () => {
  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);
  const durationPickerRef = useRef<AppDurationPickerRef>(null);

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

    effectiveFrom: '',
    prescriptionForWeeks: '',
    renewedTimes: '',

    carePreparation: false,
    careFilling: false,
    careConnecting: false,
    careReservoirChange: false,
    careStopping: false,
    careFlush: false,
    careDressing: false,
    careOrganization: false,

    morphineConcentration: '',
    morphinePureMg: '',
    morphinePureMl: '',

    pumpBasalRate: '',
    pumpBolusDose: '',
    pumpLockoutPeriod: '',
    pumpMaxBoluses: '',

    renewedForConnectionTimes: '',
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
              PCA infusion prescription Forms.
            </AppText>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
              style={{ marginTop: getScaleSize(4) }}
            >
              Tick the appropriate boxes on the form
            </AppText>
          </View>

          {/* Prescription Date & Main Options */}
          <View style={styles.card}>
            {renderSectionHeader('Prescription date', IMAGES.ic_calender)}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('prescriptionDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                // label="Prescription date"
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
                } else if (pickerType === 'patientDOB') {
                  setState({ ...state, patientDOB: formattedDate });
                } else if (pickerType === 'effectiveFrom') {
                  setState({ ...state, effectiveFrom: formattedDate });
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
              onConfirm={(h, m) => {
                const totalMinutes = parseInt(h) * 60 + parseInt(m);
                setState({
                  ...state,
                  pumpLockoutPeriod: totalMinutes.toString(),
                });
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

          <FormFacilitySection state={state} setState={setState} />

          {/* PCA DETAILS */}
          <View style={styles.card}>
            <View
              style={{
                backgroundColor: '#FFFBEB',
                padding: getScaleSize(12),
                borderRadius: getScaleSize(8),
                marginBottom: getScaleSize(16),
              }}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color="#B45309"
              >
                **This form must be accompanied by a handwritten secure
                prescription.**
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('effectiveFrom');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                label="Effective from"
                placeholder="DD/MM/YYYY"
                value={state.effectiveFrom}
                style={styles.inputField}
                pointerEvents="none"
              />
            </TouchableOpacity>

            <View style={styles.row}>
              <Input
                label="Prescription for (weeks)"
                placeholder="weeks"
                value={state.prescriptionForWeeks}
                onChangeText={t =>
                  setState({ ...state, prescriptionForWeeks: t })
                }
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
              <Input
                label="To be renewed (times)"
                placeholder="times"
                value={state.renewedTimes}
                onChangeText={t => setState({ ...state, renewedTimes: t })}
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* NURSING CARE */}
          <View style={styles.card}>
            {renderSectionHeader('NURSING CARE TO BE PROVIDED')}
            <View style={styles.checkboxGroup}>
              {[
                {
                  key: 'carePreparation',
                  label: 'Preparation and programming of a portable pump',
                },
                {
                  key: 'careFilling',
                  label: 'Filling and setting up the portable pump',
                },
                {
                  key: 'careConnecting',
                  label: 'Connecting the infusion and starting the device',
                },
                {
                  key: 'careReservoirChange',
                  label: 'Reservoir change (flexible bag)',
                },
                {
                  key: 'careStopping',
                  label: 'Stopping and removing the device',
                },
                { key: 'careFlush', label: 'Flush / heparinization' },
                {
                  key: 'careDressing',
                  label:
                    'Dressing change and replacement of the Huber needle once a week',
                },
                {
                  key: 'careOrganization',
                  label:
                    'Organization of infusion monitoring, care planning, and, where applicable, coordination of 24-hour monitoring services, including Saturdays, Sundays, and public holidays',
                },
              ].map(item => (
                <View key={item.key} style={styles.checkboxItem}>
                  <CheckBox
                    boxType="square"
                    value={(state as any)[item.key]}
                    onValueChange={v => setState({ ...state, [item.key]: v })}
                    tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                  />

                  <AppText size={getScaleSize(13)}>{item.label}</AppText>
                </View>
              ))}
            </View>
          </View>

          {/* ADMINISTRATION */}
          <View style={styles.card}>
            {renderSectionHeader('Administration PCA Pump')}
            <Input
              label="Morphine concentration (mg/h)"
              placeholder="mg/h"
              value={state.morphineConcentration}
              onChangeText={t =>
                setState({ ...state, morphineConcentration: t })
              }
              style={styles.inputField}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <Input
                label="Pure morphine (mg)"
                placeholder="mg"
                value={state.morphinePureMg}
                onChangeText={t => setState({ ...state, morphinePureMg: t })}
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
              <Input
                label="Volume (ml)"
                placeholder="ml"
                value={state.morphinePureMl}
                onChangeText={t => setState({ ...state, morphinePureMl: t })}
                style={{ flex: 1, paddingHorizontal: 0 }}
                keyboardType="numeric"
              />
            </View>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._6F767E}
              style={{ marginTop: getScaleSize(4) }}
            >
              in a flexible bag with a maximum capacity of 50 ml
            </AppText>
          </View>

          {/* PUMP SETTINGS */}
          <View style={styles.card}>
            {renderSectionHeader('Pump Settings')}
            <Input
              label="Basal rate (mg/h)"
              placeholder="mg/h"
              value={state.pumpBasalRate}
              onChangeText={t => setState({ ...state, pumpBasalRate: t })}
              style={styles.inputField}
              keyboardType="numeric"
            />
            <Input
              label="Bolus dose (mg)"
              placeholder="mg"
              value={state.pumpBolusDose}
              onChangeText={t => setState({ ...state, pumpBolusDose: t })}
              style={styles.inputField}
              keyboardType="numeric"
            />

            <Input
              editable={true}
              label="Lockout period (minutes)"
              placeholder="minutes"
              value={state.pumpLockoutPeriod}
              onChangeText={t => setState({ ...state, pumpLockoutPeriod: t })}
              style={styles.inputField}
              pointerEvents="none"
            />
            <Input
              label="Max boluses / hour"
              placeholder="number"
              value={state.pumpMaxBoluses}
              onChangeText={t => setState({ ...state, pumpMaxBoluses: t })}
              style={styles.inputField}
              keyboardType="numeric"
            />

            <View style={{ marginTop: getScaleSize(12) }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: getScaleSize(6),
                }}
              >
                <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                  To be renewed for connection
                </AppText>
                <View
                  style={{
                    width: getScaleSize(50),
                    height: getScaleSize(32),
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    placeholder="0"
                    value={state.renewedForConnectionTimes}
                    onChangeText={t =>
                      setState({ ...state, renewedForConnectionTimes: t })
                    }
                    keyboardType="numeric"
                    style={{
                      fontSize: getScaleSize(14),
                      fontFamily: FONTS.Inter.Bold,
                      color: COLORS.primary,
                      padding: 0,
                      textAlign: 'center',
                      width: '100%',
                    }}
                  />
                </View>
                <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                  times per week
                </AppText>
              </View>
              <AppText
                size={getScaleSize(13)}
                color={COLORS._6F767E}
                style={{ marginTop: getScaleSize(6) }}
              >
                for 28 days for administration by continuous infusion PCA pump
                of injectable morphine hydrochloride.
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
    width: '90%',
  },
});

export default PCAInfusionForm;
