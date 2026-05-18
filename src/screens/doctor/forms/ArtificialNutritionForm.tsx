import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Alert,
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
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING, SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import { IMAGES } from '../../../assets/images';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

export interface ArtificialNutritionFormProps {
  serviceId: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

const FEEDING_MODE = [
  { label: 'Gravity (Package 1)', value: 'gravity' },
  { label: 'Pump (Package 2)', value: 'pump' },
];

const ArtificialNutritionForm = forwardRef<any, ArtificialNutritionFormProps>(
  ({ serviceId, initialData, patient, readOnly = false }, ref) => {
    const dispatch = useDispatch();
    const reduxPatient = useSelector(
      (state: RootState) => state.patient.selectedPatient,
    );
    const selectedPatient = initialData ? patient : reduxPatient;
    const profileData = useSelector(
      (state: RootState) => state.profile.profileData,
    );

    console.log('profileData', profileData);

    const scrollRef = useRef<ScrollView>(null);
    const nutrientPositions = useRef<{ [index: number]: number }>({}).current;
    const lastFirstErrorKey = useRef<string | null>(null);

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());
    const [pickerType, setPickerType] = useState<{
      type: string;
      index?: number;
    } | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [state, setState] = useState({
      prescription_date: '',
      therapy_type: '',
      from_date: '',
      prescription_duration_weeks: '',
      renewal_times: '',

      patient_last_name: selectedPatient?.lName || '',
      patient_first_name: selectedPatient?.fName || '',
      dob: selectedPatient?.dateOfBirth
        ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
        : '',
      weight: String(selectedPatient?.weight) || '',
      nir: selectedPatient?.socialInsuranceNumber || '',
      ald_condition: false,

      prescriber_last_name: profileData?.lName || '',
      prescriber_first_name: profileData?.fName || '',
      prescriber_phone: profileData?.phoneNumber || '',
      rpps_id: profileData?.rppsNumber || '',

      hospital_name: profileData?.facilityName || '',
      hospital_address: profileData?.businessAddress || '',
      finess_number: profileData?.finessNumber || '',

      nutrition_duration_weeks: '',
      feeding_mode: '', // single selection

      initial_setup: false,
      weekly_package: false,
      nasogastric_tube_ch: '',
      nasogastric_rate_per_month: '',
      jejunostomy_tube_ch: '',
      iv_pole_rental: false,
      nasogastric_care_frequency_days: '',
      gastrostomy_care_equipment: false,
      jejunostomy_care_frequency_days: '',
      gastrostomy_replacement_equipment: false,
      button_extension_set: false,

      non_ald_prescriptions: false,
      ald_prescriptions: false,

      // Nutrients (repeatable)
      nutrients: [
        {
          nutrient_name: '',
          volume_ml: '',
          times_per_day: '',
        },
        {
          nutrient_name: '',
          volume_ml: '',
          times_per_day: '',
        },
        {
          nutrient_name: '',
          volume_ml: '',
          times_per_day: '',
        },
      ],

      physician_signature: '',
    });

    // Load initial data if editing an existing draft
    useEffect(() => {
      if (initialData?.formData) {
        console.log('initialData?.formData', initialData.formData);
        setState(initialData.formData);
      }
    }, [initialData]);

    const renderSectionHeader = (title: string, icon?: any) => (
      <View style={styles.sectionHeader}>
        {/* {icon && <Image source={icon} style={styles.sectionIcon} />} */}
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
        >
          {title}
        </AppText>
      </View>
    );

    const checkedBoxesCount = useMemo(() => {
      const boolFields = [
        state.initial_setup,
        state.weekly_package,
        state.iv_pole_rental,
        state.gastrostomy_care_equipment,
        state.gastrostomy_replacement_equipment,
        state.button_extension_set,
        state.non_ald_prescriptions,
        state.ald_prescriptions,
      ];

      return boolFields.filter(Boolean).length;
    }, [state]);

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

    const updateNutrient = (index: number, field: string, value: any) => {
      setState(prev => ({
        ...prev,
        nutrients: prev.nutrients.map((nutrient, i) =>
          i === index ? { ...nutrient, [field]: value } : nutrient,
        ),
      }));
      // Clear error immediately when user starts typing
      const errKey = `nutrients[${index}].${field}`;
      if (errors[errKey]) {
        setErrors(prev => {
          const ne = { ...prev } as any;
          delete ne[errKey];
          return ne;
        });
      }
    };

    // Validation function (aligned with schema required fields)
    const validateForm = (): boolean => {
      const newErrors: { [key: string]: string } = {};

      // Required (schema): prescription_date, patient_last_name, patient_first_name
      if (!state.prescription_date) {
        newErrors.prescription_date = STRING.prescriptionDateRequired;
      }
      if (!state.patient_last_name.trim()) {
        newErrors.patientLastName = STRING.lNameRequired;
      }
      if (!state.patient_first_name.trim()) {
        newErrors.patientFirstName = STRING.fNameRequired;
      }

      // Nutrients validation - at least 1 nutrient must be filled
      const filledNutrientIndices = state.nutrients
        .map((n, i) => (n.nutrient_name.trim() ? i : -1))
        .filter(i => i !== -1);

      if (filledNutrientIndices.length === 0) {
        newErrors['nutrients[0].nutrient_name'] = STRING.nutrientsRequired;
      }

      // Validate numeric fields for filled nutrients
      state.nutrients.forEach((nutrient, index) => {
        if (nutrient.nutrient_name.trim()) {
          // Only validate numeric fields if nutrient name is filled
          const numericFields: Array<{
            key: keyof typeof nutrient;
            label: string;
          }> = [
            { key: 'volume_ml', label: 'Volume (ml)' },
            { key: 'times_per_day', label: 'Times per Day' },
          ];
          numericFields.forEach(f => {
            const val = (nutrient as any)[f.key];
            if (
              val !== '' &&
              val !== undefined &&
              val !== null &&
              isNaN(Number(val))
            ) {
              newErrors[
                `nutrients[${index}].${String(f.key)}`
              ] = `${f.label} must be a number`;
            }
          });
        }
      });

      setErrors(newErrors);
      lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
      return Object.keys(newErrors).length === 0;
    };

    const scrollToFirstError = (firstErrorKey: string) => {
      const match = firstErrorKey.match(/nutrients\[(\d+)\]/);
      if (match) {
        const idx = Number(match[1]);
        const y = nutrientPositions[idx] ?? 0;
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            y: Math.max(y - 20, 0),
            animated: true,
          });
        }, 50);
      } else {
        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 50);
      }
    };

    // Handle form submission
    const handleSubmitRequest = async () => {
      const ok = validateForm();
      if (!ok) {
        const firstErrorKey = lastFirstErrorKey.current || '';
        const firstErrorMessage =
          errors[firstErrorKey] || STRING.pleaseFillAllRequiredFields;
        SHOW_TOAST(firstErrorMessage, 'error');
        scrollToFirstError(firstErrorKey);
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

    // Handle save as draft
    const handleSaveAsDraft = async () => {
      const ok = validateForm();
      if (!ok) {
        const firstErrorKey = lastFirstErrorKey.current || '';
        const firstErrorMessage =
          errors[firstErrorKey] || STRING.pleaseFillAllRequiredFields;
        SHOW_TOAST(firstErrorMessage, 'error');
        scrollToFirstError(firstErrorKey);
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

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      validateAndSubmit: async () => {
        await handleSubmitRequest();
      },
      saveAsDraft: async () => {
        await handleSaveAsDraft();
      },
      updateAndSign: handleUpdateAndSign,
      getFormData: () => state,
    }));

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
              {STRING.artificialNutritionForm}
            </AppText>
          </View>

          {/* PRESCRIPTION DETAILS */}
          <FormPrescriptionDetails
            readOnly={readOnly}
            state={state}
            setState={setFormState}
            errors={errors}
          />

          {/* PATIENT INFORMATION */}
          <FormPatientSection
            readOnly={readOnly}
            state={state}
            setState={setFormState}
            errors={errors}
          />

          {/* PRESCRIBER IDENTIFICATION */}
          <FormPrescriberSection state={state} setState={setFormState} />

          {/* FACILITY INFORMATION */}
          <FormFacilitySection
            readOnly={readOnly}
            state={state}
            setState={setFormState}
          />

          <View style={styles.card}>
            {renderSectionHeader(STRING.prescriptionPlan)}
            <Input
              isLocked={readOnly}
              onPress={() => {
                if (readOnly) return;
                setPickerType({ type: 'from_date' });
                setOpen(true);
              }}
              editable={false}
              label={STRING.from}
              placeholder="DD/MM/YYYY"
              value={state.from_date}
              style={styles.inputField}
              pointerEvents={readOnly ? 'none' : 'auto'}
              error={errors.from_date}
            />
            <View style={styles.row}>
              <Input
                isLocked={readOnly}
                label={STRING.prescriptionDurationWeeks}
                value={state.prescription_duration_weeks}
                onChangeText={value =>
                  setFormState({ prescription_duration_weeks: value })
                }
                placeholder={STRING.weeks}
                style={styles.rowInput}
                keyboardType="numeric"
              />
              <Input
                isLocked={readOnly}
                label={STRING.renewalTimes}
                value={state.renewal_times}
                onChangeText={value => setFormState({ renewal_times: value })}
                placeholder={STRING.number}
                style={styles.rowInput}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* TREATMENT PLAN */}
          <View style={styles.card}>
            {renderSectionHeader(STRING.treatmentPlan)}

            <Input
              isLocked={readOnly}
              label={STRING.nutritionDurationWeeks}
              value={state.nutrition_duration_weeks}
              onChangeText={value =>
                setFormState({ nutrition_duration_weeks: value })
              }
              placeholder={STRING.weeks}
              keyboardType="numeric"
              style={styles.inputField}
            />

            <AppText size={getScaleSize(14)} font={FONTS.Inter.SemiBold}>
              {STRING.feedingMode}
            </AppText>
            <View style={styles.checkboxGroup}>
              {FEEDING_MODE.map(mode => (
                <AppCheckBox
                  disabled={readOnly}
                  key={mode.value}
                  value={state.feeding_mode === mode.value}
                  onValueChange={value => {
                    if (value) {
                      setFormState({ feeding_mode: mode.value });
                    }
                  }}
                  label={mode.label}
                />
              ))}
            </View>
          </View>

          {/* EQUIPMENT & PACKAGES */}
          <View style={styles.card}>
            {renderSectionHeader(STRING.equipmentAndPackages)}

            <AppCheckBox
              disabled={readOnly}
              value={state.initial_setup}
              onValueChange={value => setFormState({ initial_setup: value })}
              label={STRING.initialSetupPackage}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.weekly_package}
              onValueChange={value => setFormState({ weekly_package: value })}
              label={STRING.weeklyPackage}
              containerStyle={{ marginBottom: getScaleSize(5) }}
            />

            <Input
              isLocked={readOnly}
              label={STRING.nasogastricTubeCh}
              value={state.nasogastric_tube_ch}
              onChangeText={value =>
                setFormState({ nasogastric_tube_ch: value })
              }
              placeholder={STRING.enterTubeDetails}
              style={styles.inputField}
            />

            <Input
              isLocked={readOnly}
              label={STRING.nasogastricRatePerMonth}
              value={state.nasogastric_rate_per_month}
              onChangeText={value =>
                setFormState({ nasogastric_rate_per_month: value })
              }
              placeholder={STRING.enterRate}
              keyboardType="numeric"
              style={styles.inputField}
            />

            <Input
              isLocked={readOnly}
              label={STRING.jejunostomyTubeCh}
              value={state.jejunostomy_tube_ch}
              onChangeText={value =>
                setFormState({ jejunostomy_tube_ch: value })
              }
              placeholder={STRING.enterTubeDetails}
              style={styles.inputField}
            />

            <AppCheckBox
              disabled={readOnly}
              containerStyle={{ marginBottom: getScaleSize(5) }}
              value={state.iv_pole_rental}
              onValueChange={value => setFormState({ iv_pole_rental: value })}
              label={STRING.ivPoleRental}
            />

            <Input
              isLocked={readOnly}
              label={STRING.nasogastricCareFrequencyDays}
              value={state.nasogastric_care_frequency_days}
              onChangeText={value =>
                setFormState({ nasogastric_care_frequency_days: value })
              }
              placeholder={STRING.enterFrequency}
              keyboardType="numeric"
              style={styles.inputField}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.gastrostomy_care_equipment}
              onValueChange={value =>
                setFormState({ gastrostomy_care_equipment: value })
              }
              containerStyle={{ marginBottom: getScaleSize(5) }}
              label={STRING.gastrostomyCareEquipment}
            />

            <Input
              isLocked={readOnly}
              label={STRING.jejunostomyCareFrequencyDays}
              value={state.jejunostomy_care_frequency_days}
              onChangeText={value =>
                setFormState({ jejunostomy_care_frequency_days: value })
              }
              placeholder={STRING.enterFrequency}
              keyboardType="numeric"
              style={styles.inputField}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.gastrostomy_replacement_equipment}
              onValueChange={value =>
                setFormState({ gastrostomy_replacement_equipment: value })
              }
              label={STRING.gastrostomyReplacementEquipment}
            />

            <AppCheckBox
              disabled={readOnly}
              value={state.button_extension_set}
              onValueChange={value =>
                setFormState({ button_extension_set: value })
              }
              label={STRING.buttonExtensionSet}
            />
          </View>

          <AppText size={getScaleSize(15)} font={FONTS.Inter.Bold}>
            {STRING.nutrients}
          </AppText>
          {errors.nutrients && (
            <View style={styles.nutrientErrorRow}>
              <Image
                source={IMAGES.error_icon}
                style={{ width: 11, height: 11 }}
              />
              <AppText
                size={getScaleSize(12)}
                color="#ef4444"
                style={styles.nutrientErrorText}
              >
                {errors.nutrients}
              </AppText>
            </View>
          )}
          <View style={styles.card}>
            {state.nutrients.map((nutrient, index) => (
              <View
                key={index}
                style={styles.nutrientBoxRow}
                onLayout={e => {
                  nutrientPositions[index] = e.nativeEvent.layout.y;
                }}
              >
                <AppText
                  size={getScaleSize(13)}
                  color={COLORS._1A1D1F}
                  font={FONTS.Inter.SemiBold}
                  style={styles.nutrientIndex}
                >
                  {index + 1}.
                </AppText>
                <Input
                  isLocked={readOnly}
                  value={nutrient.nutrient_name}
                  onChangeText={value =>
                    updateNutrient(index, 'nutrient_name', value)
                  }
                  style={styles.nutrientInputRoot}
                  inputWrapperStyle={styles.nutrientNameBox}
                  placeholder={STRING.nutrientName}
                  placeholderTextColor={COLORS._6F767E}
                  error={errors[`nutrients[${index}].nutrient_name`]}
                />
                <View style={styles.nutrientBottomRow}>
                  <Input
                    isLocked={readOnly}
                    value={nutrient.volume_ml}
                    onChangeText={value =>
                      updateNutrient(index, 'volume_ml', value)
                    }
                    keyboardType="numeric"
                    style={styles.nutrientSmallInputRoot}
                    inputWrapperStyle={styles.nutrientSmallBox}
                    inputStyle={styles.nutrientSmallText}
                    placeholder={STRING.ml}
                    placeholderTextColor={COLORS._6F767E}
                    error={errors[`nutrients[${index}].volume_ml`]}
                  />
                  <Input
                    isLocked={readOnly}
                    value={nutrient.times_per_day}
                    onChangeText={value =>
                      updateNutrient(index, 'times_per_day', value)
                    }
                    keyboardType="numeric"
                    style={styles.nutrientSmallInputRoot}
                    inputWrapperStyle={styles.nutrientSmallBox}
                    inputStyle={styles.nutrientSmallText}
                    placeholder={STRING.qty}
                    placeholderTextColor={COLORS._6F767E}
                    error={errors[`nutrients[${index}].times_per_day`]}
                  />
                  <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                    {STRING.perDay}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.signatureRow}>
              <AppText
                size={getScaleSize(13)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.SemiBold}
              >
                {STRING.numberOfBoxesChecked}
              </AppText>
              <TextInput
                value={String(checkedBoxesCount)}
                style={[styles.pdfInlineInput, styles.boxesCountInput]}
                editable={false}
                placeholder=""
              />
            </View>
          </View>

          {/* <FormSignature readOnly={readOnly} requestData={initialData} /> */}
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
              setState(prev => ({ ...prev, [pickerType.type]: formattedDate }));
            }
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
      </View>
    );
  },
);

ArtificialNutritionForm.displayName = 'ArtificialNutritionForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(12),
  },
  sectionIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    marginRight: getScaleSize(8),
  },
  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  rowInput: {
    flex: 1,
    paddingHorizontal: 0,
  },
  checkboxGroup: {
    marginTop: getScaleSize(5),
    // gap: getScaleSize(8),
    // marginBottom: getScaleSize(12),
    // marginLeft: getScaleSize(15),
  },
  indentedCheckboxGroup: {
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
    marginLeft: getScaleSize(30),
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: getScaleSize(8),
    // gap: getScaleSize(6),
  },
  inlinePdfCheckbox: {
    flex: 0,
    marginRight: getScaleSize(2),
  },
  emptyCheckboxLabel: {
    flex: 0,
    width: 0,
  },
  pdfInlineInput: {
    minWidth: getScaleSize(70),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(4),
  },
  subTextBlock: {
    marginLeft: getScaleSize(34),
    marginBottom: getScaleSize(8),
    marginTop: getScaleSize(-4),
  },
  italicText: {
    fontStyle: 'italic',
  },
  nutrientBoxRow: {
    marginBottom: getScaleSize(14),
  },
  nutrientIndex: {
    marginBottom: getScaleSize(6),
  },
  nutrientBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginTop: getScaleSize(8),
  },
  nutrientInputRoot: {
    paddingHorizontal: 0,
  },
  nutrientSmallInputRoot: {
    flex: 1,
    paddingHorizontal: 0,
  },
  nutrientNameBox: {
    // height: getScaleSize(42),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    backgroundColor: COLORS.white,
  },
  nutrientSmallBox: {
    // height: getScaleSize(42),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS.white,
  },
  nutrientSmallText: {
    textAlign: 'center',
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    // marginBottom: getScaleSize(16),
  },
  signatureInput: {
    minWidth: getScaleSize(140),
  },
  boxesCountInput: {
    minWidth: getScaleSize(70),
  },
  signText: {
    marginTop: getScaleSize(8),
  },
  sectionLabel: {
    marginTop: getScaleSize(4),
    marginBottom: getScaleSize(8),
  },
  blankSentenceWrap: {
    marginBottom: getScaleSize(12),
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: getScaleSize(6),
  },
  inlineBlankInput: {
    minWidth: getScaleSize(40),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._1A1D1F,
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    textAlign: 'center',
    paddingVertical: getScaleSize(2),
    paddingHorizontal: getScaleSize(6),
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._10B981,
    backgroundColor: COLORS._E6F9F0,
    marginTop: getScaleSize(8),
  },
  nutrientErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    marginBottom: getScaleSize(8),
    marginHorizontal: getScaleSize(16),
  },
  nutrientErrorText: {
    marginBottom: 0,
  },
});

export default ArtificialNutritionForm;
