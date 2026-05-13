import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import {
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppCheckBox,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

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

export interface PcaFormProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

export interface PcaFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  getFormData: () => any;
}

const PcaForm = forwardRef<PcaFormRef, PcaFormProps>((props, ref) => {
  const { serviceId, initialData, patient, readOnly = false } = props;
  const dispatch = useDispatch();

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
    weight: '',
    nir: '',
    ald_condition: false,

    // Prescriber Identification (Auto-filled from doctor profile)
    prescriber_last_name: profileData?.lName || '',
    prescriber_first_name: profileData?.fName || '',
    prescriber_phone: profileData?.phoneNumber || '',
    rpps_id: profileData?.rppsNumber || '',

    // Facility Information
    hospital_name: '',
    hospital_address: '',
    finess_number: profileData?.finessNumber || '',

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
  const scrollRef = useRef<ScrollView>(null);

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
    if (!state.prescription_date) {
      newErrors.prescriptionDate = STRING.prescriptionDateRequired;
    }

    // Required: patient_last_name, patient_first_name
    if (!state.patient_last_name.trim()) {
      newErrors.patientLastName = STRING.lastNameRequired;
    }
    if (!state.patient_first_name.trim()) {
      newErrors.patientFirstName = STRING.firstNameRequired;
    }

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRequest = async () => {
    // Always validate first
    const ok = validateForm();
    if (!ok) {
      // Show first error in toast
      const firstErrorKey = lastFirstErrorKey.current || '';
      const firstErrorMessage =
        errors[firstErrorKey] || STRING.pleaseFillAllRequiredFields;
      SHOW_TOAST(firstErrorMessage, 'error');

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
      return;
    }

    // Show loader
    dispatch(setLoading(true));

    // Check if it's an existing draft
    const isExistingDraft = initialData && initialData._id;
    const requestId = isExistingDraft ? initialData._id : null;

    try {
      if (isExistingDraft && requestId) {
        const submitResponse = await serviceRequestApi.submitForReview(
          requestId,
        );
        if (submitResponse.success) {
          SHOW_SUCCESS_TOAST(submitResponse.message);
          dispatch(setLoading(false));
          setTimeout(() => {
            NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
              screen: SCREENS.DOCTOR_REQUEST,
            });
          }, 500);
        } else {
          dispatch(setLoading(false));
          SHOW_TOAST(submitResponse.error, 'error');
        }
      } else {
        // Create new service request
        const payload = {
          serviceId: serviceId || '',
          patientId: selectedPatient?.id || selectedPatient?._id || '',
          requestedDate: moment(state.prescription_date, 'DD/MM/YYYY').format(
            'YYYY-MM-DD',
          ),
          requestedTime: moment().format('HH:mm'),
          initialNotes: '',
          formData: state,
        };

        const response = await serviceRequestApi.createServiceRequest(payload);

        dispatch(setLoading(false));

        if (response.success) {
          SHOW_SUCCESS_TOAST(response?.message);

          // Submit for review to lock the request
          const newRequestId = response.data?.data?.id;
          if (newRequestId) {
            const submitResponse = await serviceRequestApi.submitForReview(
              newRequestId,
            );
            if (submitResponse.success) {
              SHOW_SUCCESS_TOAST(submitResponse.message);
              dispatch(setLoading(false));
              setTimeout(() => {
                NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
                  screen: SCREENS.DOCTOR_REQUEST,
                });
              }, 500);
            } else {
              dispatch(setLoading(false));
              SHOW_TOAST(submitResponse.error, 'error');
            }
          } else {
            dispatch(setLoading(false));
          }
        } else {
          dispatch(setLoading(false));
          SHOW_TOAST(response.error, 'error');
        }
      }
    } catch (error: any) {
      dispatch(setLoading(false));
      SHOW_TOAST(error.message, 'error');
    }
  };

  const handleSaveAsDraft = async () => {
    // Always validate first
    const ok = validateForm();
    if (!ok) {
      // Show first error in toast
      const firstErrorKey = lastFirstErrorKey.current || '';
      const firstErrorMessage =
        errors[firstErrorKey] || STRING.pleaseFillAllRequiredFields;
      SHOW_TOAST(firstErrorMessage, 'error');

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
      return;
    }

    // Show loader
    dispatch(setLoading(true));

    // Check if it's an existing draft
    const isExistingDraft = initialData && initialData._id;
    const requestId = isExistingDraft ? initialData._id : null;

    try {
      if (isExistingDraft && requestId) {
        // Update existing draft
        const response = await serviceRequestApi.updateDraft(requestId, {
          formData: state,
        });
        dispatch(setLoading(false));
        if (response.success) {
          SHOW_SUCCESS_TOAST(response.message);
          setTimeout(() => {
            NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
              screen: SCREENS.DOCTOR_REQUEST,
            });
          }, 500);
        } else {
          SHOW_TOAST(response.error, 'error');
        }
      } else {
        // Create new service request as draft
        const payload = {
          serviceId: serviceId || '',
          patientId: selectedPatient?.id || selectedPatient?._id || '',
          requestedDate: moment(state.prescription_date, 'DD/MM/YYYY').format(
            'YYYY-MM-DD',
          ),
          requestedTime: moment().format('HH:mm'),
          initialNotes: '',
          formData: state,
        };

        const response = await serviceRequestApi.createServiceRequest(payload);
        dispatch(setLoading(false));

        if (response.success) {
          SHOW_SUCCESS_TOAST(response?.message);
          setTimeout(() => {
            NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
              screen: SCREENS.DOCTOR_REQUEST,
            });
          }, 500);
        } else {
          SHOW_TOAST(response.error, 'error');
        }
      }
    } catch (error: any) {
      dispatch(setLoading(false));
      SHOW_TOAST(error.message, 'error');
    }
  };

  // Handle update & sign (for already-submitted requests)
  const handleUpdateAndSign = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const requestId = initialData?._id || initialData?.id;
    if (!requestId) {
      return { success: false, error: 'No request ID' };
    }
    try {
      const response = await serviceRequestApi.updateFormData(requestId, {
        formData: state,
      });
      if (response.success) {
        return { success: true };
      } else {
        SHOW_TOAST(response.error, 'error');
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      const msg = error.message;
      SHOW_TOAST(msg, 'error');
      return { success: false, error: msg };
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndSubmit: async () => {
      await handleSubmitRequest();
    },
    saveAsDraft: async () => {
      await handleSaveAsDraft();
    },
    updateAndSign: handleUpdateAndSign,
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
      <ScrollView
        ref={scrollRef}
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
            {STRING.pcaInfusionPrescriptionForm}
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

        <View style={styles.card}>
          {renderSectionHeader(STRING.prescriptionPlan)}
          {/* NURSING CARE */}
          <View style={styles.descriptionBlock}>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._1A1D1F}
            >
              {STRING.nursingCareTasks}
            </AppText>

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
                label={STRING.preparationAndProgrammingOfPortablePump}
              />

              <AppCheckBox
                disabled={readOnly}
                value={state.nursing_tasks.includes(
                  STRING.fillingAndSetupOfPump,
                )}
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
                label={STRING.fillingAndSetupOfPump}
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
                label={STRING.connectingInfusionAndStartingDevice}
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
                label={STRING.reservoirChange}
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
                    const index = tasks.indexOf(
                      STRING.stoppingAndRemovingDevice,
                    );
                    if (index > -1) tasks.splice(index, 1);
                  }
                  setFormState({ nursing_tasks: tasks });
                }}
                label={STRING.stoppingAndRemovingDevice}
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
                label={STRING.flushHeparinization}
              />

              <AppCheckBox
                disabled={readOnly}
                value={state.nursing_tasks.includes(
                  STRING.weeklyDressingChangeHuberNeedleReplacement,
                )}
                onValueChange={value => {
                  const tasks = [...state.nursing_tasks];
                  if (value) {
                    tasks.push(
                      STRING.weeklyDressingChangeHuberNeedleReplacement,
                    );
                  } else {
                    const index = tasks.indexOf(
                      STRING.weeklyDressingChangeHuberNeedleReplacement,
                    );
                    if (index > -1) tasks.splice(index, 1);
                  }
                  setFormState({ nursing_tasks: tasks });
                }}
                label={STRING.weeklyDressingChangeHuberNeedleReplacement}
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
                label={STRING.monitoringAndCoordinationOfCare}
              />
            </View>
          </View>

          <View style={styles.sectionSpacing}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
              {STRING.morphineAdministration}
            </AppText>
          </View>

          <View style={styles.inputRow}>
            <Input
              isLocked={readOnly}
              label={`${STRING.concentration} (mg/hr)`}
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
              label={STRING.totalMorphine}
              value={state.morphine_total_mg}
              onChangeText={value => setFormState({ morphine_total_mg: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          <View style={styles.inputRow}>
            <Input
              label={STRING.volume}
              value={state.solution_volume_ml}
              onChangeText={value =>
                setFormState({ solution_volume_ml: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              label={`${STRING.bagCapacity}`}
              value={state.bag_capacity_ml}
              onChangeText={value => setFormState({ bag_capacity_ml: value })}
              placeholder="50"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          <View style={styles.sectionSpacing}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
              {STRING.pumpSettings}
            </AppText>
          </View>

          <View style={styles.inputRow}>
            <Input
              label={STRING.basalRate}
              value={state.basal_rate_mg_per_hr}
              onChangeText={value =>
                setFormState({ basal_rate_mg_per_hr: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              label={STRING.bolusDose}
              value={state.bolus_dose_mg}
              onChangeText={value => setFormState({ bolus_dose_mg: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          <View style={styles.inputRow}>
            <Input
              label={STRING.lockoutMin}
              value={state.lockout_minutes}
              onChangeText={value => setFormState({ lockout_minutes: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              label={STRING.maxBolusPerHour}
              value={state.max_bolus_per_hour}
              onChangeText={value =>
                setFormState({ max_bolus_per_hour: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          <View style={styles.sectionSpacing}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
              {STRING.treatmentPlan}
            </AppText>
          </View>

          <View style={styles.inputRow}>
            <Input
              label={STRING.connectionsPerWeek}
              value={state.connections_per_week}
              onChangeText={value =>
                setFormState({ connections_per_week: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />

            <Input
              label={`${STRING.treatmentDurationDays}`}
              value={state.treatment_duration_days}
              onChangeText={value =>
                setFormState({ treatment_duration_days: value })
              }
              placeholder="28"
              keyboardType="numeric"
              style={styles.halfWidthInput}
            />
          </View>

          {/* <View style={[styles.sectionSpacing, { marginTop: getScaleSize(20) }]}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
              Compliance Note
            </AppText>
          </View> */}

          {/* <AppCheckBox
            value={state.requires_handwritten_prescription}
            onValueChange={() => {}}
            disabled
            label="This form must be accompanied by a handwritten secure prescription."
          /> */}
        </View>

        {/* <FormSignature state={state} setState={setFormState} /> */}
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
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
    paddingBottom: getScaleSize(190),
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
    gap: getScaleSize(15),
  },

  halfWidthInput: {
    flex: 1,
    paddingHorizontal: getScaleSize(0),
    marginBottom: getScaleSize(10),
  },
});

export default PcaForm;
