import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING } from '../../../constant';

const CNOForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const [state, setState] = useState({
    // Patient
    patientLastName: '',
    patientFirstName: '',
    patientDOB: '',
    patientWeight: '',
    patientNIR: '',
    careRelatedToALD: false,

    // Prescriber
    prescriberLastName: 'Jenkins',
    prescriberFirstName: 'Sarah',
    prescriberPhone: '01 23 45 67 89',
    prescriberRPPS: '12345678901',

    // Facility
    hospitalName: '',
    hospitalAddress: '',
    finessNo: '1234567',

    // Medical History
    primaryDiagnosis: '',
    comorbidities: '',

    // Nutritional Assessment
    weightLossPercentage: '',
    bmi: '',
    oralIntake: 'normal', // 'normal', 'reduced', 'minimal'
    albuminLevel: '',
    albuminDate: '',

    // Prescription
    productName: '',
    energyDensity: '',
    volumePerDay: '',
    frequency: '',
    durationWeeks: '',

    // Follow-up
    weightMonitoringFrequency: '',
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
            {STRING.cnoForm}
          </AppText>
        </View>

        {/* PRESCRIBER SECTION */}
        <FormPrescriberSection
          state={state}
          setState={setState}
          title={STRING.prescriberIdentification}
        />

        {/* FACILITY INFORMATION */}
        <FormFacilitySection state={state} setState={setState} />

        {/* PATIENT SECTION */}
        <FormPatientSection
          state={state}
          setState={setState}
          showWeight={true}
          showNIR={true}
          showALD={true}
        />

        {/* MEDICAL HISTORY */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.medicalHistory, IMAGES.stethoscopeIcon)}
          <Input
            label={STRING.primaryDiagnosis}
            placeholder="Enter primary diagnosis"
            value={state.primaryDiagnosis}
            onChangeText={t => setState({ ...state, primaryDiagnosis: t })}
            style={styles.inputField}
          />
          <Input
            label={STRING.comorbidities}
            placeholder="e.g. Diabetes, Renal Failure"
            value={state.comorbidities}
            onChangeText={t => setState({ ...state, comorbidities: t })}
            style={styles.inputField}
            multiline
          />
        </View>

        {/* NUTRITIONAL ASSESSMENT */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.nutritionalAssessment)}
          <View style={styles.row}>
            <Input
              label={STRING.weightLossPercentage}
              placeholder="%"
              value={state.weightLossPercentage}
              onChangeText={t =>
                setState({ ...state, weightLossPercentage: t })
              }
              style={[styles.inputField, { flex: 1 }]}
              keyboardType="numeric"
            />
            <Input
              label={STRING.bmi}
              placeholder="0.0"
              value={state.bmi}
              onChangeText={t => setState({ ...state, bmi: t })}
              style={[styles.inputField, { flex: 1 }]}
              keyboardType="numeric"
            />
          </View>

          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.SemiBold}
            style={{ marginBottom: 8 }}
          >
            {STRING.oralIntake}
          </AppText>
          <View style={styles.radioRow}>
            {[
              { label: STRING.normal, value: 'normal' },
              { label: STRING.reduced, value: 'reduced' },
              { label: STRING.minimal, value: 'minimal' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={styles.radioItem}
                onPress={() => setState({ ...state, oralIntake: opt.value })}
              >
                <View
                  style={[
                    styles.radioOuter,
                    state.oralIntake === opt.value && styles.radioOuterActive,
                  ]}
                >
                  {state.oralIntake === opt.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <AppText size={getScaleSize(12)}>{opt.label}</AppText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <Input
              label={STRING.albuminLevel}
              placeholder="g/L"
              value={state.albuminLevel}
              onChangeText={t => setState({ ...state, albuminLevel: t })}
              style={[styles.inputField, { flex: 1 }]}
              keyboardType="numeric"
            />
            <Input
              onPress={() => setOpen(true)}
              editable={false}
              label={STRING.albuminDate}
              placeholder="DD/MM/YYYY"
              value={state.albuminDate}
              style={[styles.inputField, { flex: 1 }]}
              pointerEvents="none"
            />
          </View>
        </View>

        {/* PRESCRIPTION */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.nutritionalPrescription)}
          <Input
            label={STRING.productName}
            placeholder={STRING.enterProductName}
            value={state.productName}
            onChangeText={t => setState({ ...state, productName: t })}
            style={styles.inputField}
          />
          <View style={styles.row}>
            <Input
              label={STRING.energyDensity}
              placeholder="kcal/ml"
              value={state.energyDensity}
              onChangeText={t => setState({ ...state, energyDensity: t })}
              style={[styles.inputField, { flex: 1 }]}
              keyboardType="numeric"
            />
            <Input
              label={STRING.volumePerDay}
              placeholder="ml"
              value={state.volumePerDay}
              onChangeText={t => setState({ ...state, volumePerDay: t })}
              style={[styles.inputField, { flex: 1 }]}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.row}>
            <Input
              label={STRING.frequency}
              placeholder="times/day"
              value={state.frequency}
              onChangeText={t => setState({ ...state, frequency: t })}
              style={[styles.inputField, { flex: 1 }]}
            />
            <Input
              label={STRING.durationWeeks}
              placeholder="Weeks"
              value={state.durationWeeks}
              onChangeText={t => setState({ ...state, durationWeeks: t })}
              style={[styles.inputField, { flex: 1 }]}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* FOLLOW-UP */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.followUp)}
          <Input
            label={STRING.weightMonitoringFrequency}
            placeholder="e.g. Once a week"
            value={state.weightMonitoringFrequency}
            onChangeText={t =>
              setState({ ...state, weightMonitoringFrequency: t })
            }
            style={styles.inputField}
          />
        </View>

        {/* SIGNATURE SECTION */}
        <View style={styles.card}>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
              {STRING.physicianSignature}
            </AppText>
            <View style={styles.signatureLine} />
          </View>
        </View>

        <DatePicker
          modal
          mode="date"
          open={open}
          date={date}
          onConfirm={d => {
            setOpen(false);
            const formatted = moment(d).format('DD/MM/YYYY');
            setState({ ...state, albuminDate: formatted });
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
      </ScrollView>
    </View>
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
    paddingBottom: getScaleSize(40),
    gap: getScaleSize(12),
  },
  headerTextContainer: {
    marginBottom: getScaleSize(4),
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
    marginBottom: getScaleSize(12),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS._6F767E,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    width: getScaleSize(150),
    height: getScaleSize(40),
  },
});

export default CNOForm;
