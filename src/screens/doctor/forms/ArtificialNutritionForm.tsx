import React, { useMemo, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
  AppText,
  Input,
  WarningSheet,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppCheckBox,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING, SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import { IMAGES } from '../../../assets/images';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';

export interface ArtificialNutritionFormProps {
  serviceId: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

const ArtificialNutritionForm = forwardRef<any, ArtificialNutritionFormProps>(({
  serviceId,
  onLoadingChange,
}, ref) => {
  const selectedPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const warningSheetRef = useRef<ActionSheetRef>(null);
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
  const [isLoading, setIsLoading] = useState(false);

  const [state, setState] = useState({
    prescription_date: moment().format('DD/MM/YYYY'),
    therapy_type: '',
    from_date: '',
    prescription_duration_weeks: '',
    renewal_times: '',

    patient_last_name: '',
    patient_first_name: selectedPatient?.fullName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    weight: '',
    nir: '',
    ald_condition: false,

    prescriber_last_name: profileData?.fullName?.split(' ').slice(-1)[0] || '',
    prescriber_first_name: profileData?.fullName?.split(' ')[0] || '',
    prescriber_phone: profileData?.phoneNumber || '',
    rpps_id: profileData?.rppsNumber || '',

    hospital_name: profileData?.businessAddress || '',
    hospital_address: '',
    finess_number: profileData?.finessNumber || '',

    nutrition_duration_weeks: '',
    feeding_mode: [] as string[], // checkbox array

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
          const changedKeys = Object.keys(next).filter(k => (prev as any)[k] !== (next as any)[k]);
          if (changedKeys.length) {
            setErrors(prevErrs => {
              const ne = { ...prevErrs } as any;
              changedKeys.forEach(k => {
                if (k === 'patient_first_name' && ne.patientFirstName) delete ne.patientFirstName;
                if (k === 'patient_last_name' && ne.patientLastName) delete ne.patientLastName;
                if (k === 'prescription_date' && ne.prescriptionDate) delete ne.prescriptionDate;
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
              if (k === 'patient_first_name' && ne.patientFirstName) delete ne.patientFirstName;
              if (k === 'patient_last_name' && ne.patientLastName) delete ne.patientLastName;
              if (k === 'prescription_date' && ne.prescriptionDate) delete ne.prescriptionDate;
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
      newErrors.prescriptionDate = 'Prescription date is required';
    }
    if (!state.patient_last_name.trim()) {
      newErrors.patientLastName = 'Last name is required';
    }
    if (!state.patient_first_name.trim()) {
      newErrors.patientFirstName = 'First name is required';
    }

    // Nutrients validation - at least 1 nutrient must be filled
    const filledNutrients = state.nutrients.filter(n => n.nutrient_name.trim().length > 0);
    if (filledNutrients.length === 0) {
      newErrors.nutrients = 'At least one nutrient must be filled';
    }

    // Validate numeric fields for filled nutrients
    state.nutrients.forEach((nutrient, index) => {
      if (nutrient.nutrient_name.trim()) {
        // Only validate numeric fields if nutrient name is filled
        const numericFields: Array<{ key: keyof typeof nutrient; label: string }> = [
          { key: 'volume_ml', label: 'Volume (ml)' },
          { key: 'times_per_day', label: 'Times per Day' },
        ];
        numericFields.forEach(f => {
          const val = (nutrient as any)[f.key];
          if (val !== '' && val !== undefined && val !== null && isNaN(Number(val))) {
            newErrors[`nutrients[${index}].${String(f.key)}`] = `${f.label} must be a number`;
          }
        });
      }
    });

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validateAndSubmit: async () => {
      const ok = validateForm();
      if (!ok) {
        // Show first error in toast
        const firstErrorKey = lastFirstErrorKey.current || '';
        const firstErrorMessage = errors[firstErrorKey] || 'Please fill in all required fields';
        SHOW_TOAST(firstErrorMessage, 'error');

        const match = firstErrorKey.match(/nutrients\[(\d+)\]/);
        if (match) {
          const idx = Number(match[1]);
          const y = nutrientPositions[idx] ?? 0;
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: Math.max(y - 20, 0), animated: true });
          }, 50);
        } else {
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }, 50);
        }
        return false;
      }

      // Call API to create service request
      try {
        setIsLoading(true);
        onLoadingChange?.(true);

        const payload = {
          serviceId: serviceId || '',
          patientId: selectedPatient?.id || '',
          priorityLevel: 'routine' as const,
          requestedDate: moment(state.prescription_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          requestedTime: moment().format('HH:mm'),
          initialNotes: '',
          formData: state,
        };

        const response = await serviceRequestApi.createServiceRequest(payload);

        setIsLoading(false);
        onLoadingChange?.(false);

        if (response.success) {
          SHOW_SUCCESS_TOAST('Service request created successfully');
          console.log('Service request created:', response.data);
          return true;
        } else {
          SHOW_TOAST(response.error || 'Failed to create service request', 'error');
          return false;
        }
      } catch (error: any) {
        setIsLoading(false);
        onLoadingChange?.(false);
        SHOW_TOAST(error.message || 'Failed to create service request', 'error');
        return false;
      }
    },
    getFormData: () => state,
    getIsLoading: () => isLoading,
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
            {STRING.artificialNutritionForm}
          </AppText>
        </View>

        {/* PRESCRIPTION DETAILS */}
        <FormPrescriptionDetails
          state={state}
          setState={setFormState}
          errors={errors}
        />

        {/* PATIENT INFORMATION */}
        <FormPatientSection
          state={state}
          setState={setFormState}
          errors={errors}
        />

        {/* PRESCRIBER IDENTIFICATION */}
        <FormPrescriberSection
          state={state}
          setState={setFormState}
        />

        {/* FACILITY INFORMATION */}
        <FormFacilitySection
          state={state}
          setState={setFormState}
        />

        <View style={styles.card}>
          {renderSectionHeader('Prescription Plan')}
          {/* <Input
            label="Forms for"
            value={state.formsFor}
            onChangeText={(value) => setState(prev => ({ ...prev, formsFor: value }))}
            placeholder="Enter details"
            style={styles.inputField}
          /> */}
          <Input
            onPress={() => {
              setPickerType({ type: 'from_date' });
              setOpen(true);
            }}
            editable={false}
            label="From"
            placeholder="DD/MM/YYYY"
            value={state.from_date}
            style={styles.inputField}
            pointerEvents="none"
            error={errors.from_date}
          />
          <View style={styles.row}>
            <Input
              label="Prescription for (weeks)"
              value={state.prescription_duration_weeks}
              onChangeText={(value) =>
                setFormState({ prescription_duration_weeks: value })
              }
              placeholder="Weeks"
              style={styles.rowInput}
              keyboardType="numeric"
            />
            <Input
              label="To be renewed (times)"
              value={state.renewal_times}
              onChangeText={(value) =>
                setFormState({ renewal_times: value })
              }
              placeholder="Times"
              style={styles.rowInput}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.blankSentenceWrap}>
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              The health condition of MR (Name of patient) requires enteral
              nutrition by gravity (package 1), at home, for a duration of
            </AppText>
            <TextInput
              value={state.nutrition_duration_weeks}
              onChangeText={(value) =>
                setFormState({ nutrition_duration_weeks: value })
              }
              keyboardType="numeric"
              style={styles.inlineBlankInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              week(s), with:
            </AppText>
          </View>
          <AppCheckBox
            value={state.initial_setup}
            onValueChange={(value) =>
              setFormState({ initial_setup: value })
            }
            label="Initial setup package for enteral nutrition"
          />
          <AppCheckBox
            value={state.weekly_package}
            onValueChange={(value) =>
              setFormState({ weekly_package: value })
            }
            label="Weekly enteral nutrition package by:"
          />
          <View style={styles.indentedCheckboxGroup}>
            <AppCheckBox
              value={state.feeding_mode.includes('gravity')}
              onValueChange={(value) => {
                const modes = value
                  ? [...state.feeding_mode, 'gravity']
                  : state.feeding_mode.filter(m => m !== 'gravity');
                setFormState({ feeding_mode: modes });
              }}
              label="Gravity (package 1)"
            />
            <AppCheckBox
              value={state.feeding_mode.includes('pump')}
              onValueChange={(value) => {
                const modes = value
                  ? [...state.feeding_mode, 'pump']
                  : state.feeding_mode.filter(m => m !== 'pump');
                setFormState({ feeding_mode: modes });
              }}
              label="Pump (package 2)"
            />
          </View>
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.feeding_mode.includes('nasogastric')}
              onValueChange={(value) => {
                const modes = value
                  ? [...state.feeding_mode, 'nasogastric']
                  : state.feeding_mode.filter(m => m !== 'nasogastric');
                setFormState({ feeding_mode: modes });
              }}
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Nasogastric tube CH:
            </AppText>
            <TextInput
              value={state.nasogastric_tube_ch}
              onChangeText={(value) =>
                setFormState({ nasogastric_tube_ch: value })
              }
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              to be used at a rate of
            </AppText>
            <TextInput
              value={state.nasogastric_rate_per_month}
              onChangeText={(value) =>
                setFormState({ nasogastric_rate_per_month: value })
              }
              keyboardType="numeric"
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              per month.
            </AppText>
          </View>
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.feeding_mode.includes('jejunostomy')}
              onValueChange={(value) => {
                const modes = value
                  ? [...state.feeding_mode, 'jejunostomy']
                  : state.feeding_mode.filter(m => m !== 'jejunostomy');
                setFormState({ feeding_mode: modes });
              }}
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Jejunostomy or gastrostomy tube CH:
            </AppText>
            <TextInput
              value={state.jejunostomy_tube_ch}
              onChangeText={(value) =>
                setFormState({ jejunostomy_tube_ch: value })
              }
              style={styles.pdfInlineInput}
              placeholder=""
            />
          </View>
          <AppCheckBox
            value={state.iv_pole_rental}
            onValueChange={(value) =>
              setFormState({ iv_pole_rental: value })
            }
            label="Rental of an IV pole"
          />
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.feeding_mode.includes('nasogastric_care')}
              onValueChange={(value) => {
                const modes = value
                  ? [...state.feeding_mode, 'nasogastric_care']
                  : state.feeding_mode.filter(m => m !== 'nasogastric_care');
                setFormState({ feeding_mode: modes });
              }}
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Equipment for adult nasogastric tube care every
            </AppText>
            <TextInput
              value={state.nasogastric_care_frequency_days}
              onChangeText={(value) =>
                setFormState({ nasogastric_care_frequency_days: value })
              }
              keyboardType="numeric"
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              days
            </AppText>
          </View>
          <AppCheckBox
            value={state.gastrostomy_care_equipment}
            onValueChange={(value) =>
              setFormState({ gastrostomy_care_equipment: value })
            }
            label="Equipment for gastrostomy or jejunostomy care"
          />
          <View style={styles.pdfRow}>
            <AppCheckBox
              value={state.feeding_mode.includes('jejunostomy_care')}
              onValueChange={(value) => {
                const modes = value
                  ? [...state.feeding_mode, 'jejunostomy_care']
                  : state.feeding_mode.filter(m => m !== 'jejunostomy_care');
                setFormState({ feeding_mode: modes });
              }}
              label=""
              containerStyle={styles.inlinePdfCheckbox}
              labelStyle={styles.emptyCheckboxLabel}
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              Jejunostomy care every
            </AppText>
            <TextInput
              value={state.jejunostomy_care_frequency_days}
              onChangeText={(value) =>
                setFormState({ jejunostomy_care_frequency_days: value })
              }
              keyboardType="numeric"
              style={styles.pdfInlineInput}
              placeholder=""
            />
            <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
              days
            </AppText>
          </View>
          <AppCheckBox
            value={state.gastrostomy_replacement_equipment}
            onValueChange={(value) =>
              setFormState({ gastrostomy_replacement_equipment: value })
            }
            label="Equipment in case of gastrostomy tube replacement"
          />
          <AppCheckBox
            value={state.button_extension_set}
            onValueChange={(value) =>
              setFormState({ button_extension_set: value })
            }
            label="One gastrostomy button (statutory set), to be renewed every 7 days"
          />
          <AppCheckBox
            value={state.non_ald_prescriptions}
            onValueChange={(value) =>
              setFormState({ non_ald_prescriptions: value })
            }
            label="Prescriptions unrelated to the recognized long-term condition"
          />
          <View style={styles.subTextBlock}>
            <AppText size={getScaleSize(12)} color={COLORS._1A1D1F}>
              (listed or not listed)
            </AppText>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              style={styles.italicText}
            >
              (Intercurrent illnesses)
            </AppText>
          </View>
          <AppCheckBox
            value={state.ald_prescriptions}
            onValueChange={(value) =>
              setFormState({ ald_prescriptions: value })
            }
            label="Prescriptions related to the treatment of the recognized long-term condition"
          />
          <View style={styles.subTextBlock}>
            <AppText size={getScaleSize(12)} color={COLORS._1A1D1F}>
              (listed or not listed)
            </AppText>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              style={styles.italicText}
            >
              (Exempting condition)
            </AppText>
          </View>
        </View>

        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
        >
          Nutrients
        </AppText>
        {errors.nutrients && (
          <View style={styles.nutrientErrorRow}>
            <Image source={IMAGES.error_icon} style={{ width: 11, height: 11 }} />
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
            <View key={index} style={styles.nutrientBoxRow} onLayout={(e) => {
              nutrientPositions[index] = e.nativeEvent.layout.y;
            }}>
              <AppText
                size={getScaleSize(13)}
                color={COLORS._1A1D1F}
                font={FONTS.Inter.SemiBold}
                style={styles.nutrientIndex}
              >
                {index + 1}.
              </AppText>
              <Input
                value={nutrient.nutrient_name}
                onChangeText={(value) => updateNutrient(index, 'nutrient_name', value)}
                style={styles.nutrientInputRoot}
                inputWrapperStyle={styles.nutrientNameBox}
                placeholder="Nutrient name"
                placeholderTextColor={COLORS._6F767E}
                error={errors[`nutrients[${index}].nutrient_name`]}
              />
              <View style={styles.nutrientBottomRow}>
                <Input
                  value={nutrient.volume_ml}
                  onChangeText={(value) => updateNutrient(index, 'volume_ml', value)}
                  keyboardType="numeric"
                  style={styles.nutrientSmallInputRoot}
                  inputWrapperStyle={styles.nutrientSmallBox}
                  inputStyle={styles.nutrientSmallText}
                  placeholder="ml"
                  placeholderTextColor={COLORS._6F767E}
                  error={errors[`nutrients[${index}].volume_ml`]}
                />
                <Input
                  value={nutrient.times_per_day}
                  onChangeText={(value) => updateNutrient(index, 'times_per_day', value)}
                  keyboardType="numeric"
                  style={styles.nutrientSmallInputRoot}
                  inputWrapperStyle={styles.nutrientSmallBox}
                  inputStyle={styles.nutrientSmallText}
                  placeholder="times"
                  placeholderTextColor={COLORS._6F767E}
                  error={errors[`nutrients[${index}].times_per_day`]}
                />
                <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                  per day
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
              Number of boxes checked:
            </AppText>
            <TextInput
              value={String(checkedBoxesCount)}
              style={[styles.pdfInlineInput, styles.boxesCountInput]}
              editable={false}
              placeholder=""
            />
          </View>
        </View>

        <FormSignature />

      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
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

      <WarningSheet ref={warningSheetRef} />
    </View>
  );
});

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
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
    marginLeft: getScaleSize(15),
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
