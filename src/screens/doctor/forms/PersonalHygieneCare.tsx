import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';

import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import {
  AppText,
  Input,
  WarningSheet,
  FormPatientSection,
  FormPrescriberSection,
  AppCheckBox,
  AppLoader,
  AppButton,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
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
}

export interface PersonalHygieneCareRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  getFormData: () => any;
}

const PersonalHygieneCare = forwardRef<
  PersonalHygieneCareRef,
  PersonalHygieneCareProps
>(({ serviceId, initialData, patient }, ref) => {
  const dispatch = useDispatch();

  const reduxPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const selectedPatient = initialData ? patient : reduxPatient;
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const warningSheetRef = useRef<ActionSheetRef>(null);
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
    patient_name: selectedPatient?.fName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    prescriber_name: profileData?.fName || '',
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
    ald_prescriptions: false,

    // Medical Certification
    doctor_name: profileData?.fName || '',
    certified_patient_name: selectedPatient?.fName || '',
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
      newErrors.patientName = 'Patient name is required';
    }

    // Required: prescription_date
    if (!state.prescription_date) {
      newErrors.prescriptionDate = 'Prescription date is required';
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
        errors[firstErrorKey] || 'Please fill in all required fields';
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
              screen: 'DoctorRequest',
            });
          }, 500);
        } else {
          dispatch(setLoading(false));
          SHOW_TOAST(
            submitResponse.error ||
              'Failed to submit service request for review',
            'error',
          );
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
                  screen: 'DoctorRequest',
                });
              }, 500);
            } else {
              dispatch(setLoading(false));
              SHOW_TOAST(
                submitResponse.error ||
                  'Failed to submit service request for review',
                'error',
              );
            }
          } else {
            dispatch(setLoading(false));
          }
        } else {
          dispatch(setLoading(false));
          SHOW_TOAST(
            response.error || 'Failed to create service request',
            'error',
          );
        }
      }
    } catch (error: any) {
      dispatch(setLoading(false));
      SHOW_TOAST(error.message || 'Failed to process request', 'error');
    }
  };

  const handleSaveAsDraft = async () => {
    const ok = validateForm();
    console.log('validate', ok);

    if (!ok) {
      const firstErrorKey = lastFirstErrorKey.current || '';
      const firstErrorMessage =
        errors[firstErrorKey] || 'Please fill in all required fields';
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
              screen: 'DoctorRequest',
            });
          }, 500);
        } else {
          SHOW_TOAST(response.error || 'Failed to update draft', 'error');
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
              screen: 'DoctorRequest',
            });
          }, 500);
        } else {
          SHOW_TOAST(response.error || 'Failed to save draft', 'error');
        }
      }
    } catch (error: any) {
      dispatch(setLoading(false));
      SHOW_TOAST(error.message || 'Failed to save draft', 'error');
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndSubmit: async () => {
      await handleSubmitRequest();
    },
    saveAsDraft: async () => {
      await handleSaveAsDraft();
    },
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
            Personal Hygiene Care
          </AppText>
        </View>

        {/* BASIC INFORMATION */}
        <View style={styles.card}>
          {renderSectionHeader('Basic Information')}

          <Input
            label="Patient Name"
            value={state.patient_name}
            onChangeText={value => setFormState({ patient_name: value })}
            placeholder="Enter patient name"
            style={styles.inputField}
            error={errors.patientName}
          />

          <Input
            onPress={() => {
              setPickerType({ type: 'dob' });
              setOpen(true);
            }}
            editable={false}
            label="Date of Birth"
            placeholder="DD/MM/YYYY"
            value={state.dob}
            style={styles.inputField}
            pointerEvents="none"
          />

          <Input
            label="Prescriber Identification"
            value={state.prescriber_name}
            onChangeText={value => setFormState({ prescriber_name: value })}
            placeholder="Enter prescriber identification"
            style={styles.inputField}
          />

          <Input
            onPress={() => {
              setPickerType({ type: 'prescription_date' });
              setOpen(true);
            }}
            editable={false}
            label="Date"
            placeholder="DD/MM/YYYY"
            value={state.prescription_date}
            style={styles.inputField}
            pointerEvents="none"
            error={errors.prescriptionDate}
          />
        </View>

        {/* DAILY CARE */}
        <View style={styles.card}>
          {renderSectionHeader('Daily Care (Home Nurse)')}

          <View style={styles.checkboxGroup}>
            <AppCheckBox
              value={state.hygiene_care.includes(
                'Assistance with hygiene care twice a day',
              )}
              onValueChange={value => {
                const tasks = [...state.hygiene_care];
                if (value) {
                  tasks.push('Assistance with hygiene care twice a day');
                } else {
                  const index = tasks.indexOf(
                    'Assistance with hygiene care twice a day',
                  );
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ hygiene_care: tasks });
              }}
              label="Assistance with hygiene care twice a day"
            />

            <AppCheckBox
              value={state.hygiene_care.includes(
                'Complete bed hygiene care twice a day',
              )}
              onValueChange={value => {
                const tasks = [...state.hygiene_care];
                if (value) {
                  tasks.push('Complete bed hygiene care twice a day');
                } else {
                  const index = tasks.indexOf(
                    'Complete bed hygiene care twice a day',
                  );
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ hygiene_care: tasks });
              }}
              label="Complete bed hygiene care twice a day"
            />
          </View>
        </View>

        {/* VITAL SIGNS MONITORING */}
        <View style={styles.card}>
          {renderSectionHeader('Vital Signs Monitoring')}

          <View style={styles.checkboxGroup}>
            <AppCheckBox
              value={state.vital_signs.includes('Blood pressure / Pulse')}
              onValueChange={value => {
                const tasks = [...state.vital_signs];
                if (value) {
                  tasks.push('Blood pressure / Pulse');
                } else {
                  const index = tasks.indexOf('Blood pressure / Pulse');
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ vital_signs: tasks });
              }}
              label="Blood pressure / Pulse"
            />

            <AppCheckBox
              value={state.vital_signs.includes('Temperature')}
              onValueChange={value => {
                const tasks = [...state.vital_signs];
                if (value) {
                  tasks.push('Temperature');
                } else {
                  const index = tasks.indexOf('Temperature');
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ vital_signs: tasks });
              }}
              label="Temperature"
            />

            <AppCheckBox
              value={state.vital_signs.includes('Oxygen saturation')}
              onValueChange={value => {
                const tasks = [...state.vital_signs];
                if (value) {
                  tasks.push('Oxygen saturation');
                } else {
                  const index = tasks.indexOf('Oxygen saturation');
                  if (index > -1) tasks.splice(index, 1);
                }
                setFormState({ vital_signs: tasks });
              }}
              label="Oxygen saturation"
            />
          </View>

          <AppCheckBox
            value={state.weekly_weight_monitoring}
            onValueChange={value =>
              setFormState({ weekly_weight_monitoring: value })
            }
            label="Weekly monitoring of body weight"
          />
        </View>

        {/* TREATMENT ADMINISTRATION */}
        <View style={styles.card}>
          {renderSectionHeader('Treatment Administration')}

          <View style={styles.blankSentenceWrap}>
            <AppCheckBox
              value={state.glucose_monitoring}
              onValueChange={value =>
                setFormState({ glucose_monitoring: value })
              }
              label=""
              containerStyle={styles.inlineCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />

            <AppText size={getScaleSize(13)}>
              Capillary blood glucose monitoring & insulin injection
            </AppText>
          </View>

          {state.glucose_monitoring && (
            <Input
              label="Times per day"
              value={state.glucose_frequency}
              onChangeText={value => setFormState({ glucose_frequency: value })}
              placeholder="Enter frequency"
              keyboardType="numeric"
              style={styles.inputField}
            />
          )}
        </View>

        {/* DRESSING CARE */}
        <View style={styles.card}>
          {renderSectionHeader('Dressing Care')}

          <Input
            label="Location"
            placeholder="Enter location"
            value={state.dressing_location}
            onChangeText={value => setFormState({ dressing_location: value })}
            style={styles.inputField}
          />

          <View style={styles.checkboxGroup}>
            <AppCheckBox
              value={state.dressing_type === 'Simple'}
              onValueChange={value =>
                setFormState({ dressing_type: value ? 'Simple' : '' })
              }
              label="Simple"
            />

            <AppCheckBox
              value={state.dressing_type === 'Complex'}
              onValueChange={value =>
                setFormState({ dressing_type: value ? 'Complex' : '' })
              }
              label="Complex"
            />
          </View>

          <Input
            label="Times per day"
            value={state.dressing_frequency_per_day}
            onChangeText={value =>
              setFormState({ dressing_frequency_per_day: value })
            }
            placeholder="Enter frequency"
            keyboardType="numeric"
            style={styles.inputField}
          />

          <Input
            label="Every X days"
            value={state.dressing_frequency_days}
            onChangeText={value =>
              setFormState({ dressing_frequency_days: value })
            }
            placeholder="Enter days"
            keyboardType="numeric"
            style={styles.inputField}
          />
        </View>

        {/* PROCEDURES */}
        <View style={styles.card}>
          {renderSectionHeader('Procedures')}

          <View style={styles.blankSentenceWrap}>
            <AppCheckBox
              value={state.suture_removal}
              onValueChange={value => setFormState({ suture_removal: value })}
              label=""
              containerStyle={styles.inlineCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />

            <AppText size={getScaleSize(13)}>
              Removal of sutures/staples
            </AppText>
          </View>

          {state.suture_removal && (
            <Input
              label="In X days"
              value={state.suture_removal_days}
              onChangeText={value =>
                setFormState({ suture_removal_days: value })
              }
              placeholder="Enter days"
              keyboardType="numeric"
              style={styles.inputField}
            />
          )}

          <View style={styles.blankSentenceWrap}>
            <AppCheckBox
              value={state.urinary_catheter_care}
              onValueChange={value =>
                setFormState({ urinary_catheter_care: value })
              }
              label=""
              containerStyle={styles.inlineCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />

            <AppText size={getScaleSize(13)}>Urinary catheter care</AppText>
          </View>

          {state.urinary_catheter_care && (
            <Input
              label="Times per day"
              value={state.catheter_frequency}
              onChangeText={value =>
                setFormState({ catheter_frequency: value })
              }
              placeholder="Enter frequency"
              keyboardType="numeric"
              style={styles.inputField}
            />
          )}

          <Input
            onPress={() => {
              setPickerType({ type: 'catheter_removal_date' });
              setOpen(true);
            }}
            editable={false}
            label="Catheter Removal Date"
            placeholder="DD/MM/YYYY"
            value={state.catheter_removal_date}
            style={styles.inputField}
            pointerEvents="none"
          />

          <AppCheckBox
            value={state.urine_output_monitoring}
            onValueChange={value =>
              setFormState({ urine_output_monitoring: value })
            }
            label="Monitoring of urine output"
          />
        </View>

        {/* CONDITION CLASSIFICATION */}
        <View style={styles.card}>
          {renderSectionHeader('Condition Classification')}

          <AppCheckBox
            value={state.non_ald_prescriptions}
            onValueChange={value =>
              setFormState({ non_ald_prescriptions: value })
            }
            label="Not related to long-term condition"
          />

          <AppCheckBox
            value={state.ald_prescriptions}
            onValueChange={value => setFormState({ ald_prescriptions: value })}
            label="Related to long-term condition"
          />
        </View>

        {/* MEDICAL CERTIFICATION */}
        <View style={styles.card}>
          {renderSectionHeader('Medical Certification')}

          <Input
            label="Doctor Name"
            value={state.doctor_name}
            onChangeText={value => setFormState({ doctor_name: value })}
            placeholder="Enter doctor name"
            style={styles.inputField}
          />

          <Input
            label="Patient Name"
            value={state.certified_patient_name}
            onChangeText={value =>
              setFormState({ certified_patient_name: value })
            }
            placeholder="Enter patient name"
            style={styles.inputField}
          />

          <AppCheckBox
            value={state.care_required}
            onValueChange={value => setFormState({ care_required: value })}
            label="Requires nursing care at home"
          />

          <Input
            label="Prescription Duration (days)"
            value={state.prescription_duration_days}
            onChangeText={value =>
              setFormState({ prescription_duration_days: value })
            }
            placeholder="Enter duration"
            keyboardType="numeric"
            style={styles.inputField}
          />

          <AppCheckBox
            value={state.renewable}
            onValueChange={value => setFormState({ renewable: value })}
            label="Renewable"
          />
        </View>

        {/* SIGNATURE */}
        <FormSignature state={state} setState={setFormState} />
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

      <WarningSheet ref={warningSheetRef} />
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
