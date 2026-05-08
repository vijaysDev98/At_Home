import React, { useState, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
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
  AppCheckBox,
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
    patientName: '', // For inline input
    patientAge: '', // For inline input
    outSideAld: false,
    relatedToAld: false,
    highProteinHighCalorieONSdrink1_5_Qty: '',
    highProteinHighCalorieONSdrink1_5_Qty2: '',
    highProteinHighCalorieONSdrink1_5_fiber_Qty: '',
    highProteinHighCalorieONSdrink1_5_fiber_Qty2: '',
    highProteinHighCalorieONSdrink2_Qty: '',
    highProteinHighCalorieONSdrink2_Qty2: '',
    highProteinHighCalorieONS2_concentrated_Qty: '',
    highProteinHighCalorieONS2_concentrated_Qty2: '',
    highProteinHighCalorieONScream1_5_Qty: '',
    highProteinHighCalorieONScream1_5_Qty2: '',
    highProteinHighCalorieONSsoup1_5_Qty: '',
    highProteinHighCalorieONSsoup1_5_Qty2: '',
    blendedHighProteinMeals_Qty: '',
    blendedHighProteinMeals_Qty2: '',
    fruitJuiceONS_Qty: '',
    fruitJuiceONS_Qty2: '',
    compote_Qty: '',
    compote_Qty2: '',
    otherNutritionalSupplement: '',

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

        {/* PATIENT SECTION */}
        <FormPatientSection
          state={state}
          setState={setState}
          showWeight={true}
          showNIR={true}
          showALD={true}
        />

        {/* PRESCRIBER SECTION */}
        <FormPrescriberSection
          state={state}
          setState={setState}
          title={STRING.prescriberIdentification}
        />

        {/* FACILITY INFORMATION */}
        <FormFacilitySection state={state} setState={setState} />

        {/* MEDICAL HISTORY */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.prescriptionContext)}
          <Input
            label={STRING.prescriptionPlace}
            placeholder={STRING.enterPrescriptionPlace}
            value={state.primaryDiagnosis}
            onChangeText={t => setState({ ...state, primaryDiagnosis: t })}
            style={styles.inputField}
          />
          <Input
            onPress={() => setOpen(true)}
            editable={false}
            label={STRING.prescriptionDate}
            placeholder="DD/MM/YYYY"
            value={state.albuminDate}
            style={[styles.inputField, { flex: 1 }]}
            pointerEvents="none"
          />
          <AppText
            style={{ marginBottom: getScaleSize(5) }}
            color={COLORS._1E293B}
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
          >
            {STRING.prescriptionType}
          </AppText>
          <View style={[styles.checkBoxContainer]}>
            <AppCheckBox
              label={STRING.outSideAld}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
            <AppCheckBox
              label={STRING.relatedToAld}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
          </View>
        </View>

        <View style={styles.card}>
          {renderSectionHeader(STRING.patientCondition)}
          <View style={styles.patientConditionRow}>
            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              The health status of Mr/Ms
            </AppText>
            <TextInput
              value={state.patientName}
              onChangeText={value =>
                setState(prev => ({ ...prev, patientName: value }))
              }
              style={styles.inlineInput}
              placeholder=""
              placeholderTextColor={COLORS._6F767E}
            />
            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              aged
            </AppText>
            <TextInput
              value={state.patientAge}
              onChangeText={value =>
                setState(prev => ({ ...prev, patientAge: value }))
              }
              style={styles.inlineInput}
              placeholder=""
              placeholderTextColor={COLORS._6F767E}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.patientConditionRow}>
            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              Weighing
            </AppText>
            <TextInput
              value={state.patientWeight}
              onChangeText={value =>
                setState(prev => ({ ...prev, patientWeight: value }))
              }
              style={styles.inlineInput}
              placeholder=""
              placeholderTextColor={COLORS._6F767E}
              keyboardType="numeric"
            />
            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              kg.
            </AppText>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Medium}
              color={COLORS._1A1D1F}
            >
              {`\nrequires oral nutritional supplements:`}
            </AppText>
            <View style={[styles.checkBoxContainer]}>
              <AppCheckBox
                label={STRING.diabeticRange}
                value={state.outSideAld}
                onValueChange={v => setState({ ...state, outSideAld: v })}
              />
              <AppCheckBox
                label={STRING.standardCarbohydrateRange}
                value={state.outSideAld}
                onValueChange={v => setState({ ...state, outSideAld: v })}
              />
            </View>

            {/* Nutritional Supplements List */}
            <View style={styles.nutritionalSupplementsList}>
              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  1. High protein high calorie ONS drink 1.5 kcal/ml
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSdrink1_5_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSdrink1_5_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSdrink1_5_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSdrink1_5_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • High protein high calorie ONS drink 1.5 kcal/ml + fiber
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSdrink1_5_fiber_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSdrink1_5_fiber_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSdrink1_5_fiber_Qty2}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSdrink1_5_fiber_Qty2: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • High protein high calorie ONS drink 2 kcal/ml
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSdrink2_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSdrink2_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSdrink2_Qty2}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSdrink2_Qty2: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • High protein high calorie ONS 2 concentrated kcal/ml
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONS2_concentrated_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONS2_concentrated_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONS2_concentrated_Qty2}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONS2_concentrated_Qty2: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • High protein high calorie ONS cream 1.5 kcal/ml
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONScream1_5_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONScream1_5_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONScream1_5_Qty2}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONScream1_5_Qty2: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • High protein high calorie ONS soup 1.5 kcal/ml
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSsoup1_5_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSsoup1_5_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.highProteinHighCalorieONSsoup1_5_Qty2}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      highProteinHighCalorieONSsoup1_5_Qty2: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • Blended high protein meals
                </AppText>
                <TextInput
                  value={state.blendedHighProteinMeals_Qty}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      blendedHighProteinMeals_Qty: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.blendedHighProteinMeals_Qty2}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      blendedHighProteinMeals_Qty2: value,
                    }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • Fruit juice ONS
                </AppText>
                <TextInput
                  value={state.fruitJuiceONS_Qty}
                  onChangeText={value =>
                    setState(prev => ({ ...prev, fruitJuiceONS_Qty: value }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.fruitJuiceONS_Qty2}
                  onChangeText={value =>
                    setState(prev => ({ ...prev, fruitJuiceONS_Qty2: value }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • Compote
                </AppText>
                <TextInput
                  value={state.compote_Qty}
                  onChangeText={value =>
                    setState(prev => ({ ...prev, compote_Qty: value }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Qty
                </AppText>
                <TextInput
                  value={state.compote_Qty2}
                  onChangeText={value =>
                    setState(prev => ({ ...prev, compote_Qty2: value }))
                  }
                  style={styles.quantityInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                  keyboardType="numeric"
                />
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  /day
                </AppText>
              </View>

              <View style={styles.supplementItem}>
                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  • Other:
                </AppText>
                <TextInput
                  value={state.otherNutritionalSupplement}
                  onChangeText={value =>
                    setState(prev => ({
                      ...prev,
                      otherNutritionalSupplement: value,
                    }))
                  }
                  style={styles.otherInput}
                  placeholder=""
                  placeholderTextColor={COLORS._6F767E}
                />
              </View>
            </View>
            <View style={styles.row}>
              <Input
                label={STRING.patientName}
                placeholder={STRING.enterPatientName}
                value={state.primaryDiagnosis}
                onChangeText={t => setState({ ...state, primaryDiagnosis: t })}
                style={[styles.inputField, { flex: 1 }]}
              />

              <Input
                editable={false}
                label="Date of birth"
                placeholder="DD/MM/YYYY"
                value={state.patientDOB}
                style={[styles.inputField, { flex: 1 }]}
                pointerEvents="none"
              />
            </View>

            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Medium}
              color={COLORS._1A1D1F}
            >
              {STRING.prescriberIdentification}
            </AppText>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Regular}
              color={COLORS._1A1D1F}
            >
              To be consumed at least 2 hours before or after each meal for 1
              month
            </AppText>
            <Input
              label={'Texture'}
              value={state.primaryDiagnosis}
              onChangeText={t => setState({ ...state, primaryDiagnosis: t })}
              style={[styles.inputField, { flex: 1 }]}
            />
          </View>

          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Regular}
            color={COLORS._1A1D1F}
            style={{ marginBottom: getScaleSize(10) }}
          >
            Reassessment at 1 month
          </AppText>
          <View style={styles.supplementItem}>
            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              Renewal to be carried out for
            </AppText>
            <TextInput
              value={state.fruitJuiceONS_Qty2}
              onChangeText={value =>
                setState(prev => ({ ...prev, fruitJuiceONS_Qty2: value }))
              }
              style={styles.quantityInput}
              placeholder=""
              placeholderTextColor={COLORS._6F767E}
              keyboardType="numeric"
            />
            <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
              months
            </AppText>
          </View>

          <View
            style={{ gap: getScaleSize(3), marginBottom: getScaleSize(10) }}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Medium}
              color={COLORS._1A1D1F}
            >
              {`After a reassessment including:`}
            </AppText>
            <AppCheckBox
              label={STRING.weight}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
            <AppCheckBox
              label={STRING.nutritionalStatus}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
            <AppCheckBox
              label={STRING.progressionOfThePathology}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
            <AppCheckBox
              label={STRING.levelOfSpontaneousOralIntake}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
            <AppCheckBox
              label={STRING.toleranceOfOralNutritionalSupplements}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
            <AppCheckBox
              label={STRING.complianceWithOns}
              value={state.outSideAld}
              onValueChange={v => setState({ ...state, outSideAld: v })}
            />
          </View>
          <Input
            onPress={() => setOpen(true)}
            editable={false}
            label={STRING.date}
            placeholder="DD/MM/YYYY"
            value={state.albuminDate}
            style={[styles.inputField]}
            pointerEvents="none"
          />
        </View>

        {/* SIGNATURE SECTION */}
        <View style={styles.card}>
          <View style={[styles.row]}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
              {STRING.signature}
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
    marginHorizontal: getScaleSize(16),
  },
  checkBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginBottom: getScaleSize(4),
    paddingHorizontal: getScaleSize(16),
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
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
  patientConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: getScaleSize(12),
    gap: getScaleSize(6),
  },
  inlineInput: {
    minWidth: getScaleSize(80),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(8),
  },
  nutritionalSupplementsList: {
    marginTop: getScaleSize(12),
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: getScaleSize(8),
    gap: getScaleSize(6),
  },
  quantityInput: {
    minWidth: getScaleSize(50),
    maxWidth: getScaleSize(80),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(6),
  },
  otherInput: {
    minWidth: getScaleSize(120),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(8),
    flex: 1,
  },
});

export default CNOForm;
