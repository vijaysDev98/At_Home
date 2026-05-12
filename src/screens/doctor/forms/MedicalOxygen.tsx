import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';

import {
  AppCheckBox,
  AppText,
  FormFacilitySection,
  FormPatientSection,
  FormPrescriberSection,
  FormSignature,
  WarningSheet,
  Input,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';

import { IMAGES } from '../../../assets/images';
import { RootState } from '../../../redux/store';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { setLoading } from '../../../actions/common/commonSlice';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

export interface MedicalOxygenProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
}

export interface MedicalOxygenRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  getFormData: () => any;
}

const MedicalOxygen = forwardRef<MedicalOxygenRef, MedicalOxygenProps>(
  ({ serviceId = '', initialData, patient }, ref) => {
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
    const lastFirstErrorKey = useRef<string | null>(null);

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [pickerType, setPickerType] = useState<{
      type: string;
      index?: number;
    } | null>(null);

    const [state, setState] = useState({
      // Prescription Details
      prescription_date: moment().format('DD/MM/YYYY'),

      // Patient Information
      patient_last_name: selectedPatient?.lName || '',
      patient_first_name: selectedPatient?.fName || '',
      dob: selectedPatient?.dateOfBirth
        ? moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY')
        : '',
      weight: '',
      nir: '',
      ald_condition: false,

      // Prescriber Identification
      prescriber_last_name: profileData?.lName || '',
      prescriber_first_name: profileData?.fName || '',
      prescriber_phone: profileData?.phoneNumber || '',
      rpps_id: profileData?.rppsNumber || '',

      // Facility Information
      hospital_name: profileData?.businessAddress || '',
      hospital_address: '',
      finess_number: profileData?.finessNumber || '',

      // Prescription Details - Medical Oxygen
      primary_oxygen_source: '',
      ambulatory_cylinder: false,
      delivery_method: '',
      duration_hours_per_day: '',
      flow_rate_rest: '',
      flow_rate_exertion: '',
      humidifier_required: false,
      backup_source: true,
      mobility_source: true,
      pulse_oximeter_provided: false,
      non_kinking_tubing: false,
      target_spo2: '',
      contact_phone: '',

      // Patient Instructions
      instructions_acknowledged: false,

      // Palliative Care
      palliative_care: false,

      // Signature
      physician_signature: '',
      signature_date: moment().format('DD/MM/YYYY'),
    });

    // Hydrate form state from initialData when editing an existing draft
    useEffect(() => {
      if (initialData && initialData.formData) {
        setState(prev => ({
          ...prev,
          ...initialData.formData,
        }));
      } else if (selectedPatient && !initialData) {
        // Update patient info from selectedPatient if not editing
        setState(prev => ({
          ...prev,
          patient_last_name:
            selectedPatient?.lName || '',
          patient_first_name:
            selectedPatient?.fName || '',
          dob: selectedPatient?.dateOfBirth
            ? moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY')
            : '',
        }));
      }
    }, [initialData, selectedPatient]);

    // Wrapper setter that clears errors immediately on any change
    const setFormState = (updaterOrPartial: any): void => {
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
                  if (ne[k]) delete ne[k];
                  // Map snake_case to camelCase for error clearing
                  if (k === 'patient_first_name' && ne.patientFirstName)
                    delete ne.patientFirstName;
                  if (k === 'patient_last_name' && ne.patientLastName)
                    delete ne.patientLastName;
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
                if (ne[k]) delete ne[k];
                // Map snake_case to camelCase for error clearing
                if (k === 'patient_first_name' && ne.patientFirstName)
                  delete ne.patientFirstName;
                if (k === 'patient_last_name' && ne.patientLastName)
                  delete ne.patientLastName;
              });
              return ne;
            });
          }
          return next;
        });
      }
    };

    // Validation function
    const validateForm = (): boolean => {
      const newErrors: { [key: string]: string } = {};

      // Patient Information - Required fields
      if (!state.patient_last_name.trim()) {
        newErrors.patientLastName = 'Last name is required';
      }
      if (!state.patient_first_name.trim()) {
        newErrors.patientFirstName = 'First name is required';
      }

      setErrors(newErrors);
      lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
      return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
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
            requestedDate: moment(state.prescription_date, 'DD/MM/YYYY').format(
              'YYYY-MM-DD',
            ),
            requestedTime: moment().format('HH:mm'),
            initialNotes: '',
            formData: state,
          };

          const response = await serviceRequestApi.createServiceRequest(
            payload,
          );

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

    // Handle save as draft
    const handleSaveAsDraft = async () => {
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
            requestedDate: moment(state.prescription_date, 'DD/MM/YYYY').format(
              'YYYY-MM-DD',
            ),
            requestedTime: moment().format('HH:mm'),
            initialNotes: '',
            formData: state,
          };

          const response = await serviceRequestApi.createServiceRequest(
            payload,
          );
          dispatch(setLoading(false));

          if (response.success) {
            SHOW_SUCCESS_TOAST(response?.message);
            setTimeout(() => {
              NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
                screen: 'DoctorRequest',
              });
            }, 500);
          } else {
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

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validateAndSubmit: handleSubmitRequest,
      saveAsDraft: handleSaveAsDraft,
      getFormData: () => state,
    }));

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
              Medical Oxygen Form
            </AppText>
          </View>

          <FormPrescriptionDetails
            state={state}
            setState={setFormState}
            errors={errors}
          />

          <FormPatientSection
            state={state}
            setState={updates => setFormState(updates)}
            errors={errors}
          />

          <FormPrescriberSection
            state={state}
            setState={updates => setFormState(updates)}
          />

          <FormFacilitySection
            state={state}
            setState={updates => setFormState(updates)}
          />

          {/* Medical Oxygen Prescription Details */}
          <View style={styles.card}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={styles.sectionTitle}
            >
              Oxygen Prescription Details
            </AppText>

            <View style={styles.checkboxGroup}>
              <AppText
                size={getScaleSize(14)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.Medium}
              >
                Primary Oxygen Source:
              </AppText>
              <AppCheckBox
                value={
                  state.primary_oxygen_source === 'Stationary concentrator'
                }
                onValueChange={value =>
                  setFormState({
                    primary_oxygen_source: value
                      ? 'Stationary concentrator'
                      : '',
                  })
                }
                label="Stationary concentrator"
              />
              <AppCheckBox
                value={
                  state.primary_oxygen_source === 'Compressed oxygen cylinder'
                }
                onValueChange={value =>
                  setFormState({
                    primary_oxygen_source: value
                      ? 'Compressed oxygen cylinder'
                      : '',
                  })
                }
                label="Compressed oxygen cylinder"
              />
            </View>

            <AppCheckBox
              value={state.ambulatory_cylinder}
              onValueChange={value =>
                setFormState({ ambulatory_cylinder: value })
              }
              label="Ambulatory cylinder"
            />

            <View style={styles.checkboxGroup}>
              <AppText
                size={getScaleSize(14)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.Medium}
              >
                Delivery Method:
              </AppText>
              <AppCheckBox
                value={state.delivery_method === 'Nasal cannula'}
                onValueChange={value =>
                  setFormState({
                    delivery_method: value ? 'Nasal cannula' : '',
                  })
                }
                label="Nasal cannula"
              />
              <AppCheckBox
                value={state.delivery_method === 'Oxygen mask'}
                onValueChange={value =>
                  setFormState({
                    delivery_method: value ? 'Oxygen mask' : '',
                  })
                }
                label="Oxygen mask"
              />
            </View>

            {/* Duration input */}
            <Input
              label="Duration (hours/day)"
              value={state.duration_hours_per_day}
              onChangeText={value =>
                setFormState({ duration_hours_per_day: value })
              }
              placeholder="Enter duration"
              keyboardType="numeric"
              style={styles.inputField}
            />

            {/* Flow rate inputs */}
            <Input
              label="Flow rate at rest (L/min)"
              value={state.flow_rate_rest}
              onChangeText={value => setFormState({ flow_rate_rest: value })}
              placeholder="Enter flow rate"
              keyboardType="numeric"
              style={styles.inputField}
            />

            <Input
              label="Flow rate during exertion (L/min)"
              value={state.flow_rate_exertion}
              onChangeText={value =>
                setFormState({ flow_rate_exertion: value })
              }
              placeholder="Enter flow rate"
              keyboardType="numeric"
              style={styles.inputField}
            />

            {/* Humidifier checkbox */}
            <AppCheckBox
              value={state.humidifier_required}
              onValueChange={value =>
                setFormState({ humidifier_required: value })
              }
              label="Humidifier required (ISO 8185)"
            />

            {/* Backup and mobility checkboxes */}
            <AppCheckBox
              value={state.backup_source}
              onValueChange={value => setFormState({ backup_source: value })}
              label="Backup oxygen cylinder"
            />

            <AppCheckBox
              value={state.mobility_source}
              onValueChange={value => setFormState({ mobility_source: value })}
              label="Mobility oxygen cylinder"
            />

            {/* Pulse oximeter and tubing checkboxes */}
            <AppCheckBox
              value={state.pulse_oximeter_provided}
              onValueChange={value =>
                setFormState({ pulse_oximeter_provided: value })
              }
              label="Pulse oximeter provided"
            />

            <AppCheckBox
              value={state.non_kinking_tubing}
              onValueChange={value =>
                setFormState({ non_kinking_tubing: value })
              }
              label="Non-kinking tubing"
            />

            {/* Target SpO2 input */}
            <Input
              label="Target SpO2 (%)"
              value={state.target_spo2}
              onChangeText={value => setFormState({ target_spo2: value })}
              placeholder="Enter target SpO2"
              keyboardType="numeric"
              style={styles.inputField}
            />

            {/* Emergency contact phone */}
            <Input
              label="Emergency Contact Phone"
              value={state.contact_phone}
              onChangeText={value => setFormState({ contact_phone: value })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              style={styles.inputField}
            />
          </View>

          <View style={styles.card}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={styles.sectionTitle}
            >
              PATIENT INSTRUCTIONS
            </AppText>

            <AppText style={styles.instructionText}>
              It is essential to follow the instructions carefully.
            </AppText>

            <AppText style={styles.instructionText}>
              Use your oxygen daily for at least the duration indicated on your
              prescription.
            </AppText>

            <AppText style={styles.instructionText}>
              If oxygen comes into contact with a flame or combustible material,
              there is a risk of explosion, fire, and/or serious burns.
            </AppText>

            <AppText style={styles.instructionText}>
              NEVER smoke or vape while using oxygen.
            </AppText>

            <AppText style={styles.instructionText}>
              NEVER smoke in the room where your oxygen is installed.
            </AppText>

            <AppText style={styles.instructionText}>
              NEVER cook while using oxygen.
            </AppText>

            <AppText style={styles.instructionText}>
              NEVER use aerosol sprays or flammable solvents near oxygen
              (alcohol, gasoline, etc.).
            </AppText>

            <AppText style={styles.instructionText}>
              NEVER apply greasy ointment to the face and never handle the
              equipment with greasy hands.
            </AppText>

            <AppText style={styles.instructionText}>
              NEVER keep the equipment near heat sources.
            </AppText>
          </View>

          {/* Palliative Care Section */}
          <AppCheckBox
            value={state.palliative_care}
            onValueChange={value => setFormState({ palliative_care: value })}
            label="Part of palliative care"
          />

          {/* Instructions Acknowledged */}
          <AppCheckBox
            value={state.instructions_acknowledged}
            onValueChange={value =>
              setFormState({ instructions_acknowledged: value })
            }
            label="Patient acknowledges safety instructions"
          />

          <FormSignature />
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

        <WarningSheet ref={warningSheetRef} />
      </View>
    );
  },
);

MedicalOxygen.displayName = 'MedicalOxygen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  headerTextContainer: {
    marginBottom: getScaleSize(4),
  },
  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: getScaleSize(190),
    gap: getScaleSize(12),
    marginHorizontal: getScaleSize(16),
  },

  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    elevation: 4,
  },

  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(16),
  },

  checkboxGroup: {
    gap: getScaleSize(10),
    marginBottom: getScaleSize(16),
  },

  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(16),
    flexWrap: 'wrap',
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: getScaleSize(20),
    gap: getScaleSize(8),
  },

  blankInput: {
    minWidth: getScaleSize(70),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    paddingVertical: getScaleSize(4),
    paddingHorizontal: getScaleSize(2),
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
  },

  longBlankInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    paddingVertical: getScaleSize(4),
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
  },

  phoneWrapper: {
    marginBottom: getScaleSize(20),
  },

  sectionLabel: {
    marginBottom: getScaleSize(12),
  },

  sectionTitle: {
    marginBottom: getScaleSize(14),
  },

  instructionText: {
    marginBottom: getScaleSize(10),
    lineHeight: getScaleSize(22),
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS._F8F9FA,
  },

  addIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
});

export default MedicalOxygen;
