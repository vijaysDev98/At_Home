import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import {
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  FormPrescriptionContextSection,
  AppCheckBox,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { RootState } from '../../../redux/store';
import { STRING } from '../../../constant';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';
import {
  handleFormSubmit,
  handleSaveAsDraft,
  handleUpdateAndSign,
  handleSaveProgress,
  handleSubmitForReview,
  handleEditForm,
} from './formActionHandlers';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface PcaFormProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

export interface PcaFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const PcaForm = forwardRef<PcaFormRef, PcaFormProps>((props, ref) => {
  const { serviceId, initialData, patient, readOnly = false } = props;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const locale = useSelector((state: any) => state.language.currentLanguage);
  const reduxPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const selectedPatient = initialData ? patient : reduxPatient;

  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const [pickerType, setPickerType] = useState<{
    type: string;
  } | null>(null);

  const [state, setState] = useState({
    // Prescription Details
    prescription_date: '',
    therapy_type: '',
    effective_from: '',
    duration_weeks: '',
    renewal_times: '',

    // Patient Information
    patient_last_name: selectedPatient?.lName || '',
    patient_first_name: selectedPatient?.fName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    weight: selectedPatient?.weight?.toString() || '',
    nir: selectedPatient?.socialInsuranceNumber || '',
    ald_condition: false,

    // Prescriber Identification (Auto-filled from doctor profile)
    prescriber_last_name: profileData?.lName || '',
    prescriber_first_name: profileData?.fName || '',
    prescriber_phone: profileData?.phoneNumber || '',
    rpps_id: profileData?.rppsNumber || '',

    // Facility Information
    hospital_name: profileData?.facilityName || '',
    hospital_address: profileData?.businessAddress || '',
    finess_number: profileData?.finessNumber || '',

    // Prescription Context
    forms_for: '',

    // Nursing Care Tasks
    nursing_tasks: [] as string[],

    // Morphine Administration
    morphine_concentration_mg_per_hr: '',
    morphine_total_mg: '',
    solution_volume_ml: '',
    bag_capacity_ml: '50',

    // Pump Settings
    basal_rate_mg_per_hr: '',
    bolus_dose_mg: '',
    lockout_minutes: '',
    max_bolus_per_hour: '',

    // Treatment Plan
    connections_per_week: '',
    treatment_duration_days: '28',

    // Compliance Note
    requires_handwritten_prescription: true,

    // Signature
    physician_signature: '',
  });

  useEffect(() => {
    if (initialData) {
      setState(initialData?.formData as any);
    }
  }, [initialData]);

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const lastFirstErrorKey = useRef<string | null>(null);

  // Wrapper setter that clears errors for changed top-level keys
  const setFormState = (updaterOrPartial: any) => {
    if (typeof updaterOrPartial === 'function') {
      setState(prev => {
        const next = updaterOrPartial(prev);
        try {
          const changedKeys = Object.keys(next).filter(
            k => (prev as any)[k] !== (next as any)[k],
          );
          if (changedKeys.length) {
            setErrors(prevErrs => {
              const ne = { ...prevErrs } as any;
              changedKeys.forEach(k => {
                if (k === 'patient_first_name' && ne.patientFirstName)
                  delete ne.patientFirstName;
                if (k === 'patient_last_name' && ne.patientLastName)
                  delete ne.patientLastName;
                if (k === 'prescription_date' && ne.prescriptionDate)
                  delete ne.prescriptionDate;
              });
              return ne;
            });
          }
        } catch { }
        return next;
      });
    } else {
      const partial = updaterOrPartial || {};
      setState(prev => {
        const next = { ...prev, ...partial } as any;
        const changedKeys = Object.keys(partial);
        if (changedKeys.length) {
          setErrors(prevErrs => {
            const ne = { ...prevErrs } as any;
            changedKeys.forEach(k => {
              if (k === 'patient_first_name' && ne.patientFirstName)
                delete ne.patientFirstName;
              if (k === 'patient_last_name' && ne.patientLastName)
                delete ne.patientLastName;
              if (k === 'prescription_date' && ne.prescriptionDate)
                delete ne.prescriptionDate;
            });
            return ne;
          });
        }
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate only required fields from schema
    // Required: prescription_date
    if (!state?.prescription_date) {
      newErrors.prescriptionDate = t(STRING.prescriptionDateRequired);
    }

    // Required: patient_last_name, patient_first_name
    if (!state?.patient_last_name || !state.patient_last_name.trim()) {
      newErrors.patientLastName = t(STRING.lastNameRequired);
    }
    if (!state?.patient_first_name || !state.patient_first_name.trim()) {
      newErrors.patientFirstName = t(STRING.firstNameRequired);
    }

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (using centralized handler)
  const validateAndSubmit = async () => {
    await handleFormSubmit({
      dispatch,
      state,
      initialData,
      serviceId: serviceId || '',
      selectedPatient,
      validateForm,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle save as draft (using centralized handler)
  const saveAsDraft = async () => {
    await handleSaveAsDraft({
      dispatch,
      state,
      initialData,
      serviceId: serviceId || '',
      selectedPatient,
      validateForm,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle update & sign (using centralized handler)
  const updateAndSign = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    return await handleUpdateAndSign({
      dispatch,
      state,
      initialData,
      validateForm,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle save progress (using centralized handler)
  const saveProgress = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    return await handleSaveProgress({
      dispatch,
      state,
      initialData,
      validateForm,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle submit for review (using centralized handler)
  const submitForReview = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    return await handleSubmitForReview({
      dispatch,
      state,
      initialData,
      validateForm,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle edit form (using centralized handler - no navigation)
  const editForm = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    return await handleEditForm({
      dispatch,
      state,
      initialData,
      validateForm,
      lastFirstErrorKey,
      errors,
    });
  };

  useImperativeHandle(ref, () => ({
    validateAndSubmit,
    saveAsDraft,
    updateAndSign,
    editForm,
    saveProgress,
    submitForReview,
    getFormData: () => {
      return state;
    },
  }));

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
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
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
      >
        <View style={styles.headerTextContainer}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {t(STRING.pcaInfusionPrescriptionForm)}
          </AppText>
        </View>

        <FormPrescriptionDetails
          readOnly={readOnly}
          state={state}
          setState={updates => setFormState(updates)}
          errors={errors}
        />

        <FormPatientSection
          readOnly={readOnly}
          state={state}
          setState={updates => setFormState(updates)}
          errors={errors}
        />

        <FormPrescriberSection
          state={state}
          setState={updates => setFormState(updates)}
        />

        <FormFacilitySection
          readOnly={readOnly}
          state={state}
          setState={updates => setFormState(updates)}
        />

        <FormPrescriptionContextSection
          readOnly={readOnly}
          state={state}
          setState={updates => setFormState(updates)}
        />

        <View style={styles.card}>
          {renderSectionHeader(t(STRING.prescriptionValidity))}

          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Regular}
            color={COLORS._1A1D1F}
            style={styles.inputField}
          >
            {t(
              STRING.thisFormMustBeAccompaniedByAHandwrittenSecurePrescription,
            )}
          </AppText>

          <Input
            isLocked={readOnly}
            label={t(STRING.effectiveFrom)}
            value={state.effective_from}
            onPress={() => {
              if (readOnly) return;

              setPickerType({
                type: 'effective_from',
              });

              if (state.effective_from) {
                setDate(moment(state.effective_from, 'DD/MM/YYYY').toDate());
              }

              setOpen(true);
            }}
            placeholder={t(STRING.ddmmyyyy)}
            style={styles.inputField}
          />

          <Input
            isLocked={readOnly}
            label={t(STRING.prescriptionDurationWeeks)}
            value={state.duration_weeks}
            onChangeText={value =>
              setFormState({
                duration_weeks: value,
              })
            }
            placeholder="0"
            keyboardType="numeric"
            style={styles.inputField}
          />

          <Input
            isLocked={readOnly}
            label={t(STRING.renewalTimes)}
            value={state.renewal_times}
            onChangeText={value =>
              setFormState({
                renewal_times: value,
              })
            }
            placeholder="0"
            keyboardType="numeric"
            style={styles.inputField}
          />
        </View>

        {/* CARE INSTRUCTIONS */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.careInstructionsSection))}
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Regular}
            color={COLORS._1A1D1F}
          >
            {t(STRING.careInstructionNote)}
          </AppText>
        </View>

        {/* NURSING CARE TASKS */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.nursingCareTasks))}
          <View style={styles.checkboxGroup}>
            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(
                STRING.preparationAndProgrammingOfPortablePump,
              )}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.preparationAndProgrammingOfPortablePump);
                } else {
                  const index = tasks.indexOf(
                    STRING.preparationAndProgrammingOfPortablePump,
                  );
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.preparationAndProgrammingOfPortablePump)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(STRING.fillingAndSetupOfPump)}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.fillingAndSetupOfPump);
                } else {
                  const index = tasks.indexOf(STRING.fillingAndSetupOfPump);
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.fillingAndSetupOfPump)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(
                STRING.connectingInfusionAndStartingDevice,
              )}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.connectingInfusionAndStartingDevice);
                } else {
                  const index = tasks.indexOf(
                    STRING.connectingInfusionAndStartingDevice,
                  );
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.connectingInfusionAndStartingDevice)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(STRING.reservoirChange)}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.reservoirChange);
                } else {
                  const index = tasks.indexOf(STRING.reservoirChange);
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.reservoirChange)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(
                STRING.stoppingAndRemovingDevice,
              )}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.stoppingAndRemovingDevice);
                } else {
                  const index = tasks.indexOf(STRING.stoppingAndRemovingDevice);
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.stoppingAndRemovingDevice)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(STRING.flushHeparinization)}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.flushHeparinization);
                } else {
                  const index = tasks.indexOf(STRING.flushHeparinization);
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.flushHeparinization)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(
                STRING.weeklyDressingChangeHuberNeedleReplacement,
              )}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.weeklyDressingChangeHuberNeedleReplacement);
                } else {
                  const index = tasks.indexOf(
                    STRING.weeklyDressingChangeHuberNeedleReplacement,
                  );
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.weeklyDressingChangeHuberNeedleReplacement)}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.nursing_tasks.includes(
                STRING.monitoringAndCoordinationOfCare,
              )}
              onValueChange={value => {
                const tasks = [...state.nursing_tasks];
                if (value) {
                  tasks.push(STRING.monitoringAndCoordinationOfCare);
                } else {
                  const index = tasks.indexOf(
                    STRING.monitoringAndCoordinationOfCare,
                  );
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ nursing_tasks: tasks });
              }}
              label={t(STRING.monitoringAndCoordinationOfCare)}
            />
          </View>
        </View>

        {/* MORPHINE ADMINISTRATION */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.morphineAdministration))}
          <View style={styles.inputRow}>
            <Input
              isLocked={readOnly}
              label={`${t(STRING.morphineHydrochlorideConcentration)} (mg/h)`}
              value={state.morphine_concentration_mg_per_hr}
              onChangeText={value =>
                setFormState({ morphine_concentration_mg_per_hr: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              isLocked={readOnly}
              label={`${t(STRING.pureMorphine)} (mg)`}
              value={state.morphine_total_mg}
              onChangeText={value => setFormState({ morphine_total_mg: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          <View style={styles.inputRow}>
            <Input
              isLocked={readOnly}
              label={`${t(STRING.solutionVolume)} (ml)`}
              value={state.solution_volume_ml}
              onChangeText={value =>
                setFormState({ solution_volume_ml: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              isLocked={readOnly}
              label={`${t(STRING.flexibleBagCapacity)} (ml)`}
              value={state.bag_capacity_ml}
              onChangeText={value => setFormState({ bag_capacity_ml: value })}
              placeholder="50"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>
        </View>

        {/* PUMP SETTINGS */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.pumpSettings))}
          <View style={styles.inputRow}>
            <Input
              isLocked={readOnly}
              label={`${t(STRING.basalRateLabel)} (mg/h)`}
              value={state.basal_rate_mg_per_hr}
              onChangeText={value =>
                setFormState({ basal_rate_mg_per_hr: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              isLocked={readOnly}
              label={`${t(STRING.bolusDoseLabel)} (mg)`}
              value={state.bolus_dose_mg}
              onChangeText={value => setFormState({ bolus_dose_mg: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          <View style={styles.inputRow}>
            <Input
              isLocked={readOnly}
              label={`${t(STRING.lockoutPeriod)} (minutes)`}
              value={state.lockout_minutes}
              onChangeText={value => setFormState({ lockout_minutes: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              isLocked={readOnly}
              label={t(STRING.maximumNumberOfBolusesPerHour)}
              value={state.max_bolus_per_hour}
              onChangeText={value =>
                setFormState({ max_bolus_per_hour: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>
        </View>

        {/* TREATMENT PLAN */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.treatmentPlan))}
          <View style={styles.inputRow}>
            <Input
              isLocked={readOnly}
              label={t(STRING.connectionsPerWeekLabel)}
              value={state.connections_per_week}
              onChangeText={value =>
                setFormState({ connections_per_week: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              isLocked={readOnly}
              label={`${t(STRING.treatmentDurationLabel)} (days)`}
              value={state.treatment_duration_days}
              onChangeText={value =>
                setFormState({ treatment_duration_days: value })
              }
              placeholder="28"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>
        </View>

        {/* <FormSignature state={state} setState={setFormState} /> */}
      </KeyboardAwareScrollView>

      <DatePicker
        locale={locale}
        title={t(STRING.selectDate)}
        cancelText={t(STRING.cancel)}
        confirmText={t(STRING.confirm)}
        modal
        theme="light"
        open={open}
        date={date}
        mode="date"
        // minimumDate={new Date()}
        onConfirm={selectedDate => {
          setOpen(false);
          if (pickerType) {
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
            setFormState({
              [pickerType.type]: formattedDate,
            });
          }
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
});

PcaForm.displayName = 'PcaForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },

  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: getScaleSize(20),
    gap: getScaleSize(12),
    marginHorizontal: getScaleSize(16),
  },

  headerTextContainer: {
    marginBottom: getScaleSize(4),
  },

  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    elevation: 4,
  },

  warningContainer: {
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: getScaleSize(12),
    paddingVertical: getScaleSize(14),
    paddingHorizontal: getScaleSize(16),
    marginBottom: getScaleSize(20),
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(16),
  },

  topRight: {
    flex: 1.5,
  },

  descriptionBlock: {
    marginBottom: getScaleSize(18),
    gap: getScaleSize(8),
  },

  checkboxGroup: {
    // marginTop: getScaleSize(8),
    gap: getScaleSize(4),
  },

  sectionSpacing: {
    marginTop: getScaleSize(6),
    marginBottom: getScaleSize(12),
  },

  blankSentenceWrap: {
    marginBottom: getScaleSize(14),
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: getScaleSize(6),
  },

  inlineBlankInput: {
    minWidth: getScaleSize(70),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(6),
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: getScaleSize(15),
  },

  halfWidthInput: {
    flex: 1,
    paddingHorizontal: getScaleSize(0),
    marginBottom: getScaleSize(10),
  },
});

export default PcaForm;
