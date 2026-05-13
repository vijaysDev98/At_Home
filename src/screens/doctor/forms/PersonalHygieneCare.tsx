import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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

export interface PersonalHygieneCareProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

const hygieneCareOptions = [
  'Assistance with hygiene care twice a day',
  'Complete bed hygiene care twice a day',
];

const vitalSignsOptions = [
  'Blood pressure / Pulse',
  'Temperature',
  'Oxygen saturation',
];

const dressingType = ['Simple', 'Complex'];

export interface PersonalHygieneCareRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  getFormData: () => any;
}

const PersonalHygieneCare = forwardRef<
  PersonalHygieneCareRef,
  PersonalHygieneCareProps
>(({ serviceId, initialData, patient, readOnly = false }, ref) => {
  const dispatch = useDispatch();

  const reduxPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const selectedPatient = initialData ? patient : reduxPatient;
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const scrollRef = useRef<ScrollView>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<{
    type: string;
  } | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const lastFirstErrorKey = useRef<string | null>(null);

  const [state, setState] = useState({
    // Basic Information
    patient_name: selectedPatient?.fName + ' ' + selectedPatient?.lName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    prescriber_name: profileData?.fName + ' ' + profileData?.lName || '',
    prescription_date: moment().format('DD/MM/YYYY'),

    // Daily Care (Home Nurse)
    hygiene_care: [] as string[],

    // Vital Signs Monitoring
    vital_signs: [] as string[],
    weekly_weight_monitoring: false,

    // Treatment Administration
    glucose_monitoring: true,
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
    ald_prescriptions: false,

    // Medical Certification
    doctor_name: profileData?.fName + ' ' + profileData?.lName || '',
    certified_patient_name:
      selectedPatient?.fName + ' ' + selectedPatient?.lName || '',
    care_required: false,
    prescription_duration_days: '',
    renewable: false,

    // Signature
    physician_signature: '',
  });

  useEffect(() => {
    if (initialData) {
      setState(initialData?.formData as any);
    }
  }, [initialData]);

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
                if (k === 'patient_name' && ne.patientName)
                  delete ne.patientName;
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
              if (k === 'patient_name' && ne.patientName) delete ne.patientName;
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

    // Required: patient_name
    if (!state.patient_name.trim()) {
      newErrors.patientName = STRING.patientNameIsRequired;
    }

    // Required: prescription_date
    if (!state.prescription_date) {
      newErrors.prescriptionDate = STRING.prescriptionDateIsRequired;
    }

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitRequest = async () => {
    const ok = validateForm();
    if (!ok) {
      const firstErrorKey = lastFirstErrorKey.current || '';
      const firstErrorMessage =
        errors[firstErrorKey] || STRING.pleaseFillAllRequiredFields;
      SHOW_TOAST(firstErrorMessage, 'error');

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
      return;
    }

    dispatch(setLoading(true));

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
        const payload = {
          serviceId: serviceId || '',
          patientId: selectedPatient?.id || selectedPatient?._id || '',
          priorityLevel: 'routine' as const,
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
    const ok = validateForm();

    if (!ok) {
      const firstErrorKey = lastFirstErrorKey.current || '';
      const firstErrorMessage =
        errors[firstErrorKey] || STRING.pleaseFillAllRequiredFields;
      SHOW_TOAST(firstErrorMessage, 'error');

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
      return;
    }

    dispatch(setLoading(true));

    const isExistingDraft = initialData && initialData._id;
    const requestId = isExistingDraft ? initialData._id : null;

    try {
      if (isExistingDraft && requestId) {
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
        const payload = {
          serviceId: serviceId || '',
          patientId: selectedPatient?.id || selectedPatient?._id || '',
          priorityLevel: 'routine' as const,
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
            {STRING.personalHygieneCare}
          </AppText>
        </View>

        {/* BASIC INFORMATION */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.basicInformation)}

          <Input
            label={STRING.patientName}
            value={state.patient_name}
            isMandatory
            onChangeText={value => setFormState({ patient_name: value })}
            placeholder={STRING.enterPatientName}
            style={styles.inputField}
            error={errors.patientName}
          />

          <Input
            onPress={() => {
              setPickerType({ type: 'dob' });
              setOpen(true);
            }}
            editable={false}
            label={STRING.dateOfBirth}
            placeholder="DD/MM/YYYY"
            value={state.dob}
            style={styles.inputField}
            pointerEvents="none"
          />

          <Input
            label={STRING.prescriberIdentification}
            value={state.prescriber_name}
            onChangeText={value => setFormState({ prescriber_name: value })}
            placeholder={STRING.enterPrescriberIdentification}
            style={styles.inputField}
          />

          <Input
            onPress={() => {
              setPickerType({ type: 'prescription_date' });
              setOpen(true);
            }}
            editable={false}
            label={STRING.date}
            placeholder="DD/MM/YYYY"
            value={state.prescription_date}
            style={styles.inputField}
            pointerEvents="none"
            error={errors.prescriptionDate}
          />
        </View>

        {/* DAILY CARE */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.dailyCareHomeNurse)}

          <View style={styles.checkboxGroup}>
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
                label={care}
              />
            ))}
          </View>
        </View>

        {/* VITAL SIGNS MONITORING */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.vitalSignsMonitoring)}

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
                label={vital}
              />
            ))}
          </View>

          <AppCheckBox
            disabled={readOnly}
            value={state.weekly_weight_monitoring}
            onValueChange={value =>
              setFormState({ weekly_weight_monitoring: value })
            }
            label={STRING.weeklyMonitoringOfBodyWeight}
          />
        </View>

        {/* TREATMENT ADMINISTRATION */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.treatmentAdministration)}

          <AppCheckBox
            disabled={readOnly}
            value={state.glucose_monitoring}
            onValueChange={value =>
              setFormState({
                glucose_monitoring: value,
                glucose_frequency: value ? state.glucose_frequency : '',
              })
            }
            label={STRING.capillaryBloodGlucoseMonitoringAndInsulinInjection}
            containerStyle={{ marginBottom: getScaleSize(12) }}
          />

          {state.glucose_monitoring && (
            <Input
              isLocked={readOnly}
              label={STRING.timesPerDay}
              value={state.glucose_frequency}
              onChangeText={value => setFormState({ glucose_frequency: value })}
              placeholder="0"
              keyboardType="numeric"
              style={styles.inputField}
            />
          )}
        </View>

        {/* DRESSING CARE */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.dressingCare)}

          <Input
            isLocked={readOnly}
            label={STRING.location}
            placeholder={STRING.enterLocation}
            value={state.dressing_location}
            onChangeText={value => setFormState({ dressing_location: value })}
            style={styles.inputField}
          />

          <View style={styles.checkboxGroup}>
            <AppText size={getScaleSize(13)}>{STRING.dressingType}</AppText>
            {dressingType.map(type => (
              <AppCheckBox
                disabled={readOnly}
                key={type}
                value={state.dressing_type === type}
                onValueChange={value =>
                  setFormState({ dressing_type: value ? type : '' })
                }
                label={type}
              />
            ))}
          </View>

          <Input
            isLocked={readOnly}
            label={STRING.timesPerDay}
            value={state.dressing_frequency_per_day}
            onChangeText={value =>
              setFormState({ dressing_frequency_per_day: value })
            }
            placeholder={STRING.enterFrequency}
            keyboardType="numeric"
            style={styles.inputField}
          />

          <Input
            isLocked={readOnly}
            label={STRING.everyXDays}
            value={state.dressing_frequency_days}
            onChangeText={value =>
              setFormState({ dressing_frequency_days: value })
            }
            placeholder={STRING.enterDays}
            keyboardType="numeric"
            style={styles.inputField}
          />
        </View>

        {/* PROCEDURES */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.procedures)}

          <AppCheckBox
            disabled={readOnly}
            value={state.suture_removal}
            onValueChange={value =>
              setFormState({
                suture_removal: value,
                suture_removal_days: value ? state.suture_removal_days : '',
              })
            }
            label={STRING.RemovalOfSuturesStaples}
            containerStyle={{ marginBottom: getScaleSize(12) }}
          />

          {state.suture_removal && (
            <Input
              isLocked={readOnly}
              label={STRING.inXdays}
              value={state.suture_removal_days}
              onChangeText={value =>
                setFormState({ suture_removal_days: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.inputField}
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
            label={STRING.urinaryCatheterCare}
            containerStyle={{ marginBottom: getScaleSize(12) }}
          />

          {state.urinary_catheter_care && (
            <Input
              isLocked={readOnly}
              label={STRING.timesPerDay}
              value={state.catheter_frequency}
              onChangeText={value =>
                setFormState({ catheter_frequency: value })
              }
              placeholder="0"
              keyboardType="numeric"
              style={styles.inputField}
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
            label={STRING.catheterRemovalDate}
            placeholder="DD/MM/YYYY"
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
            label={STRING.monitoringOfUrineOutput}
          />
        </View>

        {/* CONDITION CLASSIFICATION */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.conditionClassification)}

          <AppCheckBox
            disabled={readOnly}
            value={state.non_ald_prescriptions}
            onValueChange={value =>
              setFormState({ non_ald_prescriptions: value })
            }
            label={STRING.notRelatedToLongTermCondition}
          />

          <AppCheckBox
            disabled={readOnly}
            value={state.ald_prescriptions}
            onValueChange={value => setFormState({ ald_prescriptions: value })}
            label={STRING.relatedToLongTermCondition}
          />
        </View>

        {/* MEDICAL CERTIFICATION */}
        <View style={styles.card}>
          {renderSectionHeader(STRING.medicalCertification)}

          <Input
            isLocked={readOnly}
            label={STRING.doctorName}
            value={state.doctor_name}
            onChangeText={value => setFormState({ doctor_name: value })}
            placeholder={STRING.enterDoctorName}
            style={styles.inputField}
          />

          <Input
            isLocked={readOnly}
            label={STRING.patientName}
            value={state.certified_patient_name}
            onChangeText={value =>
              setFormState({ certified_patient_name: value })
            }
            placeholder={STRING.enterPatientName}
            style={styles.inputField}
          />

          <AppCheckBox
            disabled={readOnly}
            value={state.care_required}
            onValueChange={value => setFormState({ care_required: value })}
            label={STRING.requiresNursingCareAtHome}
          />

          <Input
            isLocked={readOnly}
            label={STRING.prescriptionDurationDays}
            value={state.prescription_duration_days}
            onChangeText={value =>
              setFormState({ prescription_duration_days: value })
            }
            placeholder={STRING.enterDuration}
            keyboardType="numeric"
            style={[styles.inputField, { marginTop: getScaleSize(5) }]}
          />

          <AppCheckBox
            disabled={readOnly}
            value={state.renewable}
            onValueChange={value => setFormState({ renewable: value })}
            label={STRING.renewable}
          />
        </View>

        {/* SIGNATURE */}
        {/* <FormSignature readOnly={readOnly} state={state} setState={setFormState} /> */}
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
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
});

export default PersonalHygieneCare;
