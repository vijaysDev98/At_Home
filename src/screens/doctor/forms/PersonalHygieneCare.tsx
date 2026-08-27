import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import { AppText, Input, AppCheckBox } from '../../../components';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST, STRING } from '../../../constant';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
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
import { capitalizeFirstLetter } from '../../../constant/smallFunctions';

export interface PersonalHygieneCareProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
  prescriber?: any; // Selected doctor (provider flow) or profileData (doctor flow)
}

const hygieneCareOptions = [
  'Assistance with hygiene care twice a day',
  'Complete bed hygiene care twice a day',
];

const vitalSignsOptions = [
  'Blood pressure / Pulse',
  'Temperature',
  'Oxygen Saturation',
];

const dressingType = ['Simple', 'Complex'];

const keyToErrorMap: Record<string, string> = {
  patient_last_name: 'patientLastName',
  patient_first_name: 'patientFirstName',
  prescription_date: 'prescriptionDate',
  glucose_frequency: 'glucoseFrequency',
  suture_removal_days: 'sutureRemovalDays',
  catheter_frequency: 'catheterFrequency',
};

export interface PersonalHygieneCareRef {
  validateAndSubmit: (options?: { providerId?: string }) => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
  validateForm?: () => boolean;
}

const PersonalHygieneCare = forwardRef<
  PersonalHygieneCareRef,
  PersonalHygieneCareProps
>(({ serviceId, initialData, patient, readOnly = false, prescriber }, ref) => {
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

  // Use prescriber prop (selected doctor or profile data)
  const prescriberData = prescriber || profileData;

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<{
    type: string;
  } | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const lastFirstErrorKey = useRef<string | null>(null);

  const [state, setState] = useState({
    // Basic Information
    patient_last_name: selectedPatient?.lName || '',
    patient_first_name: selectedPatient?.fName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    prescriber_last_name:
      capitalizeFirstLetter(prescriberData?.lName || '') || '',
    prescriber_first_name:
      capitalizeFirstLetter(prescriberData?.fName || '') || '',
    prescription_date: moment().format('DD/MM/YYYY'),

    // Daily Care (Home Nurse)
    hygiene_care: [] as string[],

    // Vital Signs Monitoring
    vital_signs: [] as string[],
    weekly_weight_monitoring: false,

    // Treatment Administration
    glucose_monitoring: false,
    glucose_frequency: '',

    // Dressing Care
    dressing_location: '',
    dressing_type: '',
    dressing_frequency_per_day: '',
    dressing_frequency_days: '',

    // Procedures
    suture_removal: false,
    suture_removal_days: '',
    urinary_catheter_care: false,
    catheter_frequency: '',
    catheter_removal_date: '',
    urine_output_monitoring: false,

    // Condition Classification
    non_ald_prescriptions: false,
    intercurrent_illness_details: '',
    ald_prescriptions: false,
    ald_condition_details: '',

    // Medical Certification
    doctor_name:
      capitalizeFirstLetter(prescriberData?.fName || '') +
      ' ' +
      capitalizeFirstLetter(prescriberData?.lName || ''),
    certified_patient_name:
      capitalizeFirstLetter(selectedPatient?.fName || '') +
      ' ' +
      capitalizeFirstLetter(selectedPatient?.lName || ''),
    care_required: false,
    prescription_duration_days: '',
    renewable: false,
    renewal_notes: '',

    // Signature
    physician_signature: '',
  });

  useEffect(() => {
    if (initialData) {
      setState(initialData?.formData as any);
    }
  }, [initialData]);

  // Update patient fields when selectedPatient changes (e.g., after editing patient)
  useEffect(() => {
    if (!initialData && selectedPatient) {
      setState(prev => ({
        ...prev,
        patient_last_name: selectedPatient?.lName || '',
        patient_first_name: selectedPatient?.fName || '',
        dob: selectedPatient?.dateOfBirth
          ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
          : '',
        certified_patient_name:
          capitalizeFirstLetter(selectedPatient?.fName || '') +
          ' ' +
          capitalizeFirstLetter(selectedPatient?.lName || ''),
      }));
    }
  }, [selectedPatient, initialData]);

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
                const errKey = keyToErrorMap[k];
                if (errKey && ne[errKey]) delete ne[errKey];
              });
              return ne;
            });
          }
        } catch {}
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
              const errKey = keyToErrorMap[k];
              if (errKey && ne[errKey]) delete ne[errKey];
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

    // Basic Information
    if (!state.patient_first_name?.trim()) {
      newErrors.patientFirstName = t(STRING.firstNameRequired);
    }

    if (!state.patient_last_name?.trim()) {
      newErrors.patientLastName = t(STRING.lastNameRequired);
    }

    // prescription_date is pre-filled but still guard it
    if (!state.prescription_date?.trim()) {
      newErrors.prescriptionDate = t(STRING.prescriptionDateIsRequired);
    }

    // Treatment Administration — dependsOn glucose_monitoring
    if (state.glucose_monitoring) {
      if (
        !state.glucose_frequency?.trim() ||
        Number(state.glucose_frequency) <= 0
      ) {
        newErrors.glucoseFrequency = t(STRING.enterValidFrequency);
      }
    }

    // Procedures — dependsOn suture_removal
    if (state.suture_removal) {
      if (
        !state.suture_removal_days?.trim() ||
        Number(state.suture_removal_days) <= 0
      ) {
        newErrors.sutureRemovalDays = t(STRING.enterValidDays);
      }
    }

    // Procedures — dependsOn urinary_catheter_care
    if (state.urinary_catheter_care) {
      if (
        !state.catheter_frequency?.trim() ||
        Number(state.catheter_frequency) <= 0
      ) {
        newErrors.catheterFrequency = t(STRING.enterValidFrequency);
      }
    }

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (using centralized handler)
  const validateAndSubmit = async (options?: {
    providerId?: string;
    preRequestId?: string;
  }) => {
    await handleFormSubmit({
      dispatch,
      state,
      initialData,
      serviceId: serviceId || '',
      selectedPatient,
      doctorId: prescriber?.id, // Pass doctorId from prescriber
      providerId: options?.providerId,
      preRequestId: options?.preRequestId,
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
      doctorId: prescriber?.id, // Pass doctorId from prescriber
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
    validateForm: () => {
      const isValid = validateForm();
      if (!isValid) {
        const firstErrorKey = lastFirstErrorKey.current || '';
        const firstErrorMessage =
          errors[firstErrorKey] || t(STRING.pleaseFillAllRequiredFields);
        SHOW_TOAST(firstErrorMessage, 'error');
        return false;
      }
      return true;
    },
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
            {t(STRING.personalHygieneCare)}
          </AppText>
        </View>

        {/* BASIC INFORMATION */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.basicInformation))}

          <View style={styles.row}>
            <Input
              isLocked={readOnly}
              label={t(STRING.firstName)}
              placeholder={t(STRING.enterFirstName)}
              isMandatory
              value={state.patient_first_name}
              onChangeText={value =>
                setFormState({ patient_first_name: value })
              }
              style={[styles.inputField, { flex: 1 }]}
              error={errors.patientFirstName}
              nameOnly={true}
            />
            <Input
              isLocked={readOnly}
              label={t(STRING.lastName)}
              isMandatory
              placeholder={t(STRING.enterLastName)}
              value={state.patient_last_name}
              onChangeText={value => setFormState({ patient_last_name: value })}
              style={[styles.inputField, { flex: 1 }]}
              error={errors.patientLastName}
              nameOnly={true}
            />
          </View>

          <Input
            isLocked={readOnly}
            onPress={() => {
              setPickerType({ type: 'dob' });
              setOpen(true);
            }}
            editable={false}
            label={t(STRING.dateOfBirth)}
            placeholder={t(STRING.ddmmyyyy)}
            value={state.dob}
            style={styles.inputField}
            pointerEvents="none"
          />

          {renderSectionHeader(t(STRING.doctorInformation))}

          <View style={styles.row}>
            <Input
              isLocked={true}
              label={t(STRING.firstName)}
              placeholder={t(STRING.enterFirstName)}
              value={state.prescriber_first_name}
              onChangeText={value =>
                setFormState({ prescriber_first_name: value })
              }
              style={[styles.inputField, { flex: 1 }]}
            />
            <Input
              isLocked={true}
              label={t(STRING.lastName)}
              placeholder={t(STRING.enterLastName)}
              value={state.prescriber_last_name}
              onChangeText={value =>
                setFormState({ prescriber_last_name: value })
              }
              style={[styles.inputField, { flex: 1 }]}
            />
          </View>

          <Input
            isLocked={readOnly}
            onPress={() => {
              setPickerType({ type: 'prescription_date' });
              setOpen(true);
            }}
            editable={false}
            label={t(STRING.prescriptionDate)}
            placeholder={t(STRING.ddmmyyyy)}
            value={state.prescription_date}
            style={styles.inputField}
            pointerEvents="none"
            error={errors.prescriptionDate}
          />
        </View>

        {/* CARE INSTRUCTIONS */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.careInstructions))}

          <View style={styles.staticTextContainer}>
            <AppText
              size={getScaleSize(13)}
              color={COLORS._6B7280}
              style={styles.staticText}
            >
              {t(STRING.careLocationNote)}
            </AppText>
          </View>
        </View>

        {/* DAILY CARE */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.dailyCareHomeNurse))}

          <View style={styles.checkboxGroup}>
            <AppText size={getScaleSize(13)}>{t(STRING.hygieneCare)}</AppText>
            {hygieneCareOptions.map(care => (
              <AppCheckBox
                disabled={readOnly}
                key={care}
                value={state.hygiene_care.includes(care)}
                onValueChange={value => {
                  const nextCare = value
                    ? [...state.hygiene_care, care]
                    : state.hygiene_care.filter(c => c !== care);
                  setFormState({ hygiene_care: nextCare });
                }}
                label={t(care)}
              />
            ))}
          </View>
        </View>

        {/* VITAL SIGNS MONITORING */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.vitalSignsMonitoring))}

          <View
            style={[styles.checkboxGroup, { marginLeft: getScaleSize(12) }]}
          >
            {vitalSignsOptions.map(vital => (
              <AppCheckBox
                disabled={readOnly}
                key={vital}
                value={state.vital_signs.includes(vital)}
                onValueChange={value => {
                  const nextVitals = value
                    ? [...state.vital_signs, vital]
                    : state.vital_signs.filter(v => v !== vital);
                  setFormState({ vital_signs: nextVitals });
                }}
                label={t(vital)}
              />
            ))}
          </View>

          <AppCheckBox
            disabled={readOnly}
            value={state.weekly_weight_monitoring}
            onValueChange={value =>
              setFormState({ weekly_weight_monitoring: value })
            }
            label={t(STRING.weeklyMonitoringOfBodyWeight)}
          />
        </View>

        {/* TREATMENT ADMINISTRATION */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.treatmentAdministration))}

          <AppCheckBox
            disabled={readOnly}
            value={state.glucose_monitoring}
            onValueChange={value =>
              setFormState({
                glucose_monitoring: value,
                glucose_frequency: value ? state.glucose_frequency : '',
              })
            }
            label={t(STRING.capillaryBloodGlucoseMonitoringAndInsulinInjection)}
            containerStyle={{ marginBottom: getScaleSize(12) }}
          />

          <View style={{ marginTop: getScaleSize(12) }}>
            <AppText
              size={getScaleSize(13)}
              style={{ marginBottom: getScaleSize(8) }}
            >
              {t(STRING.timesPerDay)}
            </AppText>
            <Input
              isLocked={readOnly}
              value={state.glucose_frequency}
              onChangeText={value => setFormState({ glucose_frequency: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.inputField}
              error={errors.glucoseFrequency} // ← add
            />
          </View>
        </View>

        {/* DRESSING CARE */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.dressingCare))}

          <Input
            isLocked={readOnly}
            label={t(STRING.location)}
            placeholder={t(STRING.enterLocation)}
            value={state.dressing_location}
            onChangeText={value => setFormState({ dressing_location: value })}
            style={styles.inputField}
          />

          <View style={styles.checkboxGroup}>
            <AppText size={getScaleSize(13)}>{t(STRING.dressingType)}</AppText>
            {dressingType.map(type => (
              <AppCheckBox
                disabled={readOnly}
                key={type}
                value={state.dressing_type === type}
                onValueChange={value =>
                  setFormState({ dressing_type: value ? type : '' })
                }
                label={t(type)}
              />
            ))}
          </View>

          <View style={{ marginTop: getScaleSize(12) }}>
            <AppText
              size={getScaleSize(13)}
              style={{ marginBottom: getScaleSize(8) }}
            >
              {t(STRING.timesPerDay)}
            </AppText>
            <Input
              isLocked={readOnly}
              value={state.dressing_frequency_per_day}
              onChangeText={value =>
                setFormState({ dressing_frequency_per_day: value })
              }
              placeholder={t(STRING.enterFrequency)}
              keyboardType="numeric"
              style={styles.inputField}
            />
          </View>

          <View style={{ marginTop: getScaleSize(12) }}>
            <AppText
              size={getScaleSize(13)}
              style={{ marginBottom: getScaleSize(8) }}
            >
              {t(STRING.everyXDays)}
            </AppText>
            <Input
              isLocked={readOnly}
              value={state.dressing_frequency_days}
              onChangeText={value =>
                setFormState({ dressing_frequency_days: value })
              }
              placeholder={t(STRING.enterDays)}
              keyboardType="numeric"
              style={styles.inputField}
            />
          </View>
        </View>

        {/* PROCEDURES */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.procedures))}

          <AppCheckBox
            disabled={readOnly}
            value={state.suture_removal}
            onValueChange={value =>
              setFormState({
                suture_removal: value,
                suture_removal_days: value ? state.suture_removal_days : '',
              })
            }
            label={t(STRING.RemovalOfSuturesStaples)}
            containerStyle={{ marginBottom: getScaleSize(12) }}
          />

          {state.suture_removal && (
            <Input
              isLocked={readOnly}
              label={t(STRING.inXdays)}
              value={state.suture_removal_days}
              onChangeText={value =>
                setFormState({ suture_removal_days: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.inputField}
              error={errors.sutureRemovalDays}
            />
          )}

          <AppCheckBox
            disabled={readOnly}
            value={state.urinary_catheter_care}
            onValueChange={value =>
              setFormState({
                urinary_catheter_care: value,
                catheter_frequency: value ? state.catheter_frequency : '',
              })
            }
            label={t(STRING.urinaryCatheterCare)}
            containerStyle={{ marginBottom: getScaleSize(12) }}
          />

          {state.urinary_catheter_care && (
            <Input
              isLocked={readOnly}
              label={t(STRING.timesPerDay)}
              value={state.catheter_frequency}
              onChangeText={value =>
                setFormState({ catheter_frequency: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.inputField}
              error={errors.catheterFrequency}
            />
          )}

          <Input
            isLocked={readOnly}
            onPress={() => {
              if (readOnly) return;
              setPickerType({ type: 'catheter_removal_date' });
              setOpen(true);
            }}
            editable={false}
            label={t(STRING.catheterRemovalDate)}
            placeholder={t(STRING.ddmmyyyy)}
            value={state.catheter_removal_date}
            style={styles.inputField}
            pointerEvents="none"
          />

          <AppCheckBox
            disabled={readOnly}
            value={state.urine_output_monitoring}
            onValueChange={value =>
              setFormState({ urine_output_monitoring: value })
            }
            label={t(STRING.monitoringOfUrineOutput)}
          />
        </View>

        {/* CONDITION CLASSIFICATION */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.conditionClassification))}

          <AppCheckBox
            disabled={readOnly}
            value={state.non_ald_prescriptions}
            onValueChange={value =>
              setFormState({ non_ald_prescriptions: value })
            }
            label={t(STRING.notRelatedToLongTermCondition)}
          />

          {state.non_ald_prescriptions && (
            <Input
              isLocked={readOnly}
              label={t(STRING.intercurrentIllnessDetails)}
              placeholder={t(STRING.enterIllnessDetails)}
              value={state.intercurrent_illness_details}
              onChangeText={value =>
                setFormState({ intercurrent_illness_details: value })
              }
              style={[styles.inputField, styles.textArea]}
              multiline
              numberOfLines={3}
            />
          )}

          <AppCheckBox
            disabled={readOnly}
            value={state.ald_prescriptions}
            onValueChange={value => setFormState({ ald_prescriptions: value })}
            label={t(STRING.relatedToLongTermCondition)}
          />

          {state.ald_prescriptions && (
            <Input
              isLocked={readOnly}
              label={t(STRING.aldConditionDetails)}
              placeholder={t(STRING.enterConditionDetails)}
              value={state.ald_condition_details}
              onChangeText={value =>
                setFormState({ ald_condition_details: value })
              }
              style={[styles.inputField, styles.textArea]}
              multiline
              numberOfLines={3}
            />
          )}
        </View>

        {/* MEDICAL CERTIFICATION */}
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.medicalCertification))}

          <Input
            isLocked={true}
            label={t(STRING.doctorName)}
            value={state.doctor_name}
            onChangeText={value => setFormState({ doctor_name: value })}
            placeholder={t(STRING.enterDoctorName)}
            style={styles.inputField}
          />

          <Input
            isLocked={readOnly}
            label={t(STRING.patientName)}
            value={state.certified_patient_name}
            onChangeText={value =>
              setFormState({ certified_patient_name: value })
            }
            placeholder={t(STRING.enterPatientName)}
            style={styles.inputField}
          />

          <AppCheckBox
            disabled={readOnly}
            value={state.care_required}
            onValueChange={value => setFormState({ care_required: value })}
            label={t(STRING.requiresNursingCareAtHome)}
          />

          <Input
            isLocked={readOnly}
            label={t(STRING.prescriptionDurationDays)}
            value={state.prescription_duration_days}
            onChangeText={value =>
              setFormState({ prescription_duration_days: value })
            }
            placeholder={t(STRING.enterDuration)}
            keyboardType="numeric"
            style={[styles.inputField, { marginTop: getScaleSize(5) }]}
          />

          <AppCheckBox
            disabled={readOnly}
            value={state.renewable}
            onValueChange={value => setFormState({ renewable: value })}
            label={t(STRING.renewable)}
          />

          {state.renewable && (
            <Input
              isLocked={readOnly}
              label={t(STRING.renewalNotes)}
              placeholder={t(STRING.enterRenewalNotes)}
              value={state.renewal_notes}
              onChangeText={value => setFormState({ renewal_notes: value })}
              style={styles.inputField}
            />
          )}
        </View>

        {/* SIGNATURE */}
        {/* <FormSignature readOnly={readOnly} state={state} setState={setFormState} /> */}
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
          setDate(selectedDate);

          if (pickerType) {
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');

            setFormState({
              [pickerType.type]: formattedDate,
            });
          }
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
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
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS == 'android' ? 0.03 : 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(16),
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

  warningSubText: {
    marginTop: getScaleSize(4),
  },

  descriptionText: {
    lineHeight: getScaleSize(20),
  },

  checkboxGroup: {
    gap: getScaleSize(6),
    marginBottom: getScaleSize(8),
    marginTop: getScaleSize(4),
  },

  sectionSpacing: {
    marginTop: getScaleSize(14),
    marginBottom: getScaleSize(12),
  },

  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },

  blankSentenceWrap: {
    marginBottom: getScaleSize(14),
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    // gap: getScaleSize(6),
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

  inlineCheckbox: {
    flex: 0,
    marginRight: getScaleSize(2),
  },

  emptyCheckboxLabel: {
    flex: 0,
    width: 0,
  },

  subTextBlock: {
    marginLeft: getScaleSize(34),
    marginTop: getScaleSize(-4),
    marginBottom: getScaleSize(10),
  },

  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },

  staticTextContainer: {
    // padding: getScaleSize(12),
    // borderRadius: getScaleSize(8),
    // borderLeftWidth: 3,
    // borderLeftColor: COLORS._3B82F6,
  },

  staticText: {
    lineHeight: getScaleSize(18),
  },

  textArea: {
    height: getScaleSize(80),
    textAlignVertical: 'top',
  },
});

export default PersonalHygieneCare;
