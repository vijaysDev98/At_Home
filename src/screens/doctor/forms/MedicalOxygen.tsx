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
  Input,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';

import { IMAGES } from '../../../assets/images';
import { RootState } from '../../../redux/store';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
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
} from './formActionHandlers';

export interface MedicalOxygenProps {
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

export interface MedicalOxygenRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const MedicalOxygen = forwardRef<MedicalOxygenRef, MedicalOxygenProps>(
  ({ serviceId = '', initialData, patient, readOnly = false }, ref) => {
    const dispatch = useDispatch();

    const reduxPatient = useSelector(
      (state: RootState) => state.patient.selectedPatient,
    );
    const selectedPatient = initialData ? patient : reduxPatient;

    const profileData = useSelector(
      (state: RootState) => state.profile.profileData,
    );

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
      prescription_date: '',

      // Patient Information
      patient_last_name: selectedPatient?.lName || '',
      patient_first_name: selectedPatient?.fName || '',
      dob: selectedPatient?.dateOfBirth
        ? moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY')
        : '',
      weight: String(selectedPatient?.weight) || '',
      nir: selectedPatient?.socialInsuranceNumber || '',
      ald_condition: false,

      // Prescriber Identification
      prescriber_last_name: profileData?.lName || '',
      prescriber_first_name: profileData?.fName || '',
      prescriber_phone: profileData?.phoneNumber || '',
      rpps_id: profileData?.rppsNumber || '',

      // Facility Information
      hospital_name: profileData?.facilityName || '',
      hospital_address: profileData?.businessAddress || '',
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
          patient_last_name: selectedPatient?.lName || '',
          patient_first_name: selectedPatient?.fName || '',
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
      if (!state?.patient_last_name || !state.patient_last_name.trim()) {
        newErrors.patientLastName = STRING.lNameRequired;
      }
      if (!state?.patient_first_name || !state.patient_first_name.trim()) {
        newErrors.patientFirstName = STRING.fNameRequired;
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
        serviceId,
        selectedPatient,
        validateForm,
        scrollRef,
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
        serviceId,
        selectedPatient,
        validateForm,
        scrollRef,
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
        scrollRef,
        lastFirstErrorKey,
        errors,
      });
    };

    // Expose methods to parent via ref
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
        scrollRef,
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
        scrollRef,
        lastFirstErrorKey,
        errors,
      });
    };

    useImperativeHandle(ref, () => ({
      validateAndSubmit,
      saveAsDraft,
      updateAndSign,
      saveProgress,
      submitForReview,
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
              {STRING.medicalOxygenForm}
            </AppText>
          </View>

          {/* <FormPrescriptionDetails
            state={state}
            setState={setFormState}
            errors={errors}
          /> */}

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

          {/* Medical Oxygen Prescription Details */}
          <View style={styles.card}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={styles.sectionTitle}
            >
              {STRING.oxygenPrescriptionDetails}
            </AppText>

            <View style={styles.checkboxGroup}>
              <AppText
                size={getScaleSize(14)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.Medium}
              >
                {STRING.primaryOxygenSource}
              </AppText>
              <AppCheckBox
                disabled={readOnly}
                value={
                  state.primary_oxygen_source === STRING.stationaryConcentrator
                }
                onValueChange={value =>
                  setFormState({
                    primary_oxygen_source: value
                      ? STRING.stationaryConcentrator
                      : '',
                  })
                }
                containerStyle={{ marginLeft: getScaleSize(10) }}
                label={STRING.stationaryConcentrator}
              />
              <AppCheckBox
                disabled={readOnly}
                value={
                  state.primary_oxygen_source ===
                  STRING.compressedOxygenCylinder
                }
                onValueChange={value =>
                  setFormState({
                    primary_oxygen_source: value
                      ? STRING.compressedOxygenCylinder
                      : '',
                  })
                }
                containerStyle={{ marginLeft: getScaleSize(10) }}
                label={STRING.compressedOxygenCylinder}
              />
            </View>

            <AppCheckBox
              disabled={readOnly}
              value={state.ambulatory_cylinder}
              onValueChange={value =>
                setFormState({ ambulatory_cylinder: value })
              }
              label={STRING.ambulatoryCylinder}
            />

            <View style={styles.checkboxGroup}>
              <AppText
                size={getScaleSize(14)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.Medium}
                style={{
                  marginTop: getScaleSize(12),
                }}
              >
                {STRING.deliveryMethod}
              </AppText>
              <AppCheckBox
                disabled={readOnly}
                value={state.delivery_method === STRING.nasalCannula}
                onValueChange={value =>
                  setFormState({
                    delivery_method: value ? STRING.nasalCannula : '',
                  })
                }
                label={STRING.nasalCannula}
              />
              <AppCheckBox
                disabled={readOnly}
                value={state.delivery_method === STRING.oxygenMask}
                onValueChange={value =>
                  setFormState({
                    delivery_method: value ? STRING.oxygenMask : '',
                  })
                }
                label={STRING.oxygenMask}
              />
            </View>

            {/* Duration input */}
            <Input
              isLocked={readOnly}
              label={STRING.durationHoursPerDay}
              value={state.duration_hours_per_day}
              onChangeText={value =>
                setFormState({ duration_hours_per_day: value })
              }
              placeholder={STRING.enterDuration}
              keyboardType="numeric"
              style={styles.inputField}
            />

            {/* Flow rate inputs */}
            <Input
              isLocked={readOnly}
              label={STRING.flowRateAtRest}
              value={state.flow_rate_rest}
              onChangeText={value => setFormState({ flow_rate_rest: value })}
              placeholder={STRING.enterFlowRate}
              keyboardType="numeric"
              style={styles.inputField}
            />

            <Input
              isLocked={readOnly}
              label={STRING.flowRateDuringExertion}
              value={state.flow_rate_exertion}
              onChangeText={value =>
                setFormState({ flow_rate_exertion: value })
              }
              placeholder={STRING.enterFlowRate}
              keyboardType="numeric"
              style={styles.inputField}
            />

            {/* Humidifier checkbox */}
            <AppCheckBox
              disabled={readOnly}
              value={state.humidifier_required}
              onValueChange={value =>
                setFormState({ humidifier_required: value })
              }
              label={STRING.humidifierRequired}
            />

            {/* Backup and mobility checkboxes */}
            <AppCheckBox
              disabled={readOnly}
              value={state.backup_source}
              onValueChange={value => setFormState({ backup_source: value })}
              label={STRING.backupOxygenCylinder}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.mobility_source}
              onValueChange={value => setFormState({ mobility_source: value })}
              label={STRING.mobilityOxygenCylinder}
            />

            {/* Pulse oximeter and tubing checkboxes */}
            <AppCheckBox
              disabled={readOnly}
              value={state.pulse_oximeter_provided}
              onValueChange={value =>
                setFormState({ pulse_oximeter_provided: value })
              }
              label={STRING.pulseOximeterProvided}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.non_kinking_tubing}
              onValueChange={value =>
                setFormState({ non_kinking_tubing: value })
              }
              label={STRING.nonKinking}
              containerStyle={{ marginBottom: getScaleSize(10) }}
            />

            {/* Target SpO2 input */}
            <Input
              isLocked={readOnly}
              label={STRING.targetSpO2}
              value={state.target_spo2}
              onChangeText={value => setFormState({ target_spo2: value })}
              placeholder={STRING.enterTargetSpO2}
              keyboardType="numeric"
              style={styles.inputField}
            />

            {/* Emergency contact phone */}
            <Input
              isLocked={readOnly}
              label={STRING.emergencyContactPhone}
              value={state.contact_phone}
              onChangeText={value => setFormState({ contact_phone: value })}
              placeholder={STRING.enterPhoneNumber}
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
              {STRING.patientInstructions}
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.ItIsEssentialToFollowTheInstructionsCarefully}
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.UseYourOxygenDailyForAtLeastTheDurationIndicatedOnYour}
            </AppText>

            <AppText style={styles.instructionText}>
              {
                STRING.IfOxygenComesIntoContactWithAFlameOrCombustibleMaterialThereIsARiskOfExplosionFireAndOrSeriousBurns
              }
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.NEVERSmokeOrVapeWhileUsingOxygen}
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.NEVERSmokeInTheRoomWhereYourOxygenIsInstalled}
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.NEVERcookWhileUsingOxygen}
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.NEVERuseAerosolSpraysOrFlammableSolventsNearOxygen}
            </AppText>

            <AppText style={styles.instructionText}>
              {
                STRING.NEVERapplyGreasyOintmentToTheFaceAndNeverHandleTheEquipmentWithGreasyHands
              }
            </AppText>

            <AppText style={styles.instructionText}>
              {STRING.NEVERkeepTheEquipmentNearHeatSources}
            </AppText>
          </View>

          {/* Palliative Care Section */}
          <AppCheckBox
            disabled={readOnly}
            value={state.palliative_care}
            onValueChange={value => setFormState({ palliative_care: value })}
            label={STRING.partOfPalliativeCare}
          />

          {/* Instructions Acknowledged */}
          <AppCheckBox
            disabled={readOnly}
            value={state.instructions_acknowledged}
            onValueChange={value =>
              setFormState({ instructions_acknowledged: value })
            }
            label={STRING.patientacknowledgesinstructions}
          />

          {/* <FormSignature readOnly={readOnly} /> */}
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
    paddingBottom: getScaleSize(20),
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
