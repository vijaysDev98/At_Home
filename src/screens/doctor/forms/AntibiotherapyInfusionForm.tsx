import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { calculateTni } from '../../../utils/formUtils';

import {
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppCheckBox,
  FormSignature,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING, SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
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

export interface AntibiotherapyInfusionFormProps {
  serviceId: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

const ROUTE_OF_ACCESS = [
  'Implanted Port',
  'Central Catheter',
  'PICC',
  'Perineural',
  'Peripheral Venous',
  'Subcutaneous',
];

const MODE_OF_ADMINISTRATION = [
  'Gravity',
  'Elastomeric Diffuser',
  'Electric Infusion Pump',
];

export interface AntibiotherapyInfusionFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const AntibiotherapyInfusionForm = forwardRef<
  AntibiotherapyInfusionFormRef,
  AntibiotherapyInfusionFormProps
>(({ serviceId, initialData, patient, readOnly = false }, ref) => {
  const { t } = useTranslation();
  const locale = useSelector((state: any) => state.language.currentLanguage);

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
    index?: number;
  } | null>(null);

  // Scroll helpers to focus first error in infusion products
  const productPositions = useRef<{ [index: number]: number }>({}).current;
  const lastFirstErrorKey = useRef<string | null>(null);

  const [state, setState] = useState({
    // Prescription Details
    prescription_date: '',
    therapy_type: '',

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

    // Signature
    physician_signature: '',

    // Infusion Products (Repeatable)
    infusion_products: [
      {
        product_name: '',
        strength: '',
        diluent_type: '',
        diluent_volume_ml: '',
        duration_hours: '',
        duration_minutes: '',
        frequency_per_day: '',
        route_of_access: '',
        mode_of_administration: '',
        ambulatory_required: null,
        prepared_in_facility: false,
        start_date: '',
        end_date: '',
        treatment_duration_days: '',
        tni: '',
        infuse_alone: false,
      },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setState(initialData?.formData as any);
    }
  }, [initialData]);

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle form submission (using centralized handler)
  const validateAndSubmit = async () => {
    await handleFormSubmit({
      dispatch,
      state,
      initialData,
      serviceId,
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
      serviceId,
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

  // Expose methods to parent via ref
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

  // Wrapper setter that clears errors for changed top-level keys (e.g., patient_first_name)
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
                const newVal = (next as any)[k];
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
              const newVal = (next as any)[k];
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

  const addProduct = () => {
    if (state.infusion_products.length >= 10) {
      SHOW_TOAST(t(STRING.youCanOnlyAddUpto10Products), 'info');
      return;
    }
    setState(prev => ({
      ...prev,
      infusion_products: [
        ...prev.infusion_products,
        {
          product_name: '',
          strength: '',
          diluent_type: '',
          diluent_volume_ml: '',
          duration_hours: '',
          duration_minutes: '',
          frequency_per_day: '',
          route_of_access: '',
          mode_of_administration: '',
          ambulatory_required: null,
          prepared_in_facility: false,
          start_date: '',
          end_date: '',
          treatment_duration_days: '',
          tni: '',
          infuse_alone: false,
        },
      ],
    }));
  };

  const removeProduct = (index: number) => {
    setState(prev => ({
      ...prev,
      infusion_products: prev.infusion_products.filter(
        (_: any, i: number) => i !== index,
      ),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setState(prev => {
      const updatedProducts = prev.infusion_products.map(
        (product: any, i: number) => {
          if (i === index) {
            const updatedProduct = { ...product, [field]: value };
            // If user types duration days, clear dates (mutually exclusive)
            if (field === 'treatment_duration_days') {
              updatedProduct.start_date = '';
              updatedProduct.end_date = '';
            }

            const { tni, treatmentDurationDays } = calculateTni(
              updatedProduct.start_date,
              updatedProduct.end_date,
              updatedProduct.treatment_duration_days,
              updatedProduct.frequency_per_day,
            );

            updatedProduct.tni = tni;
            updatedProduct.treatment_duration_days = treatmentDurationDays;

            return updatedProduct;
          }
          return product;
        },
      );

      return { ...prev, infusion_products: updatedProducts };
    });

    // Clear error for this product field when it becomes valid
    const errKey = `infusion_products[${index}].${field}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const ne = { ...prev } as any;
        const val = (state.infusion_products[index] as any)[field];
        const allowedRoutes = ROUTE_OF_ACCESS;
        const allowedModes = MODE_OF_ADMINISTRATION;

        let isValid = false;
        if (field === 'product_name') {
          isValid = !!String(val || '').trim().length;
        } else if (
          [
            'diluent_volume_ml',
            'duration_hours',
            'duration_minutes',
            'frequency_per_day',
            'treatment_duration_days',
          ].includes(field)
        ) {
          // Optional numerics: valid if empty or numeric
          isValid = val === '' || !isNaN(Number(val));
        } else if (field === 'route_of_access') {
          isValid = !val || allowedRoutes.includes(val);
        } else if (field === 'mode_of_administration') {
          isValid = !val || allowedModes.includes(val);
        } else if (field === 'diluent_type') {
          isValid = !val || ['with', 'without'].includes(val);
        } else {
          isValid = true;
        }

        if (isValid) delete ne[errKey];
        return ne;
      });
    }
  };

  // Validation function (aligned with schema required fields and basic type checks)
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate only required fields from schema
    // Required: prescription_date
    if (!state?.prescription_date) {
      newErrors.prescription_date = t(STRING.prescriptionDateRequired);
    }

    // Required: patient_last_name, patient_first_name
    // Note: FormPatientSection uses camelCase keys internally
    if (!state?.patient_last_name || !state.patient_last_name.trim()) {
      newErrors.patientLastName = t(STRING.lastNameRequired);
    }
    if (!state?.patient_first_name || !state.patient_first_name.trim()) {
      newErrors.patientFirstName = t(STRING.firstNameRequired);
    }

    // Infusion Products validation - at least 1 product must be filled
    const products = state?.infusion_products || [];
    const filledProductIndices = products
      .map((p, i) => (p?.product_name && p.product_name.trim() ? i : -1))
      .filter(i => i !== -1);

    if (filledProductIndices.length === 0) {
      newErrors['infusion_products[0].product_name'] =
        t(STRING.atLeastOneProductRequired);
    }

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

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
            {t(STRING.antibiotherapyInfusionForm)}
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

        {/* INFUSION PRODUCTS */}
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._1A1D1F}
        >
          {t(STRING.infusionProducts)}
        </AppText>
        {state.infusion_products.map((product: any, index: number) => (
          <View
            key={`product-${index}`}
            style={styles.card}
            onLayout={e => {
              productPositions[index] = e.nativeEvent.layout.y;
            }}
          >
            <View style={[styles.productHeader]}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.product)}
                {index + 1}
              </AppText>
              {state.infusion_products.length > 1 && !readOnly && (
                <TouchableOpacity onPress={() => removeProduct(index)}>
                  <Text style={{ color: COLORS.error }}>remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <Input
              isLocked={readOnly}
              label={t(STRING.productName)}
              value={product.product_name}
              onChangeText={value =>
                updateProduct(index, 'product_name', value)
              }
              isMandatory
              placeholder={t(STRING.enterProductName)}
              style={styles.inputField}
              error={errors[`infusion_products[${index}].product_name`]}
            />
            <Input
              isLocked={readOnly}
              label={t(STRING.strength)}
              value={product.strength}
              onChangeText={value => updateProduct(index, 'strength', value)}
              placeholder={t(STRING.concentration)}
              style={styles.inputField}
            />

            <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
              <AppCheckBox
                disabled={readOnly}
                value={product.diluent_type === 'with'}
                onValueChange={value => {
                  updateProduct(index, 'diluent_type', value ? 'with' : '');
                }}
                label={t(STRING.withDiluent)}
              />
              <AppCheckBox
                disabled={readOnly}
                value={product.diluent_type === 'without'}
                onValueChange={value => {
                  updateProduct(index, 'diluent_type', value ? 'without' : '');
                }}
                label={t(STRING.withoutDiluent)}
              />
            </View>
            {errors[`infusion_products[${index}].diluent_type`] ? (
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Medium}
                color={COLORS.error}
                style={{ marginBottom: getScaleSize(8) }}
              >
                {errors[`infusion_products[${index}].diluent_type`]}
              </AppText>
            ) : null}

            <Input
              isLocked={readOnly}
              label={t(STRING.diluentVolume)}
              value={product.diluent_volume_ml}
              onChangeText={value =>
                updateProduct(index, 'diluent_volume_ml', value)
              }
              placeholder={t(STRING.volumePerDay)}
              style={styles.inputField}
              keyboardType="numeric"
              error={errors[`infusion_products[${index}].diluent_volume_ml`]}
            />
            <Input
              isLocked={readOnly}
              label={t(STRING.duration)}
              value={product.duration_hours}
              onChangeText={value =>
                updateProduct(index, 'duration_hours', value)
              }
              placeholder={t(STRING.hours)}
              style={styles.inputField}
              keyboardType="numeric"
              error={errors[`infusion_products[${index}].duration_hours`]}
            />
            <Input
              isLocked={readOnly}
              label={t(STRING.durationMin)}
              value={product.duration_minutes}
              onChangeText={value =>
                updateProduct(index, 'duration_minutes', value)
              }
              placeholder={t(STRING.minutes)}
              style={styles.inputField}
              keyboardType="numeric"
              error={errors[`infusion_products[${index}].duration_minutes`]}
            />
            <Input
              isLocked={readOnly}
              label={t(STRING.frequency)}
              value={product.frequency_per_day}
              onChangeText={value =>
                updateProduct(index, 'frequency_per_day', value)
              }
              placeholder={t(STRING.freqPerDay)}
              style={styles.inputField}
              keyboardType="numeric"
              error={errors[`infusion_products[${index}].frequency_per_day`]}
            />

            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._1A1D1F}
              style={styles.sectionLabel}
            >
              {t(STRING.routeOfAccess)}
            </AppText>
            <View style={styles.checkboxGroup}>
              {ROUTE_OF_ACCESS.map(route => (
                <AppCheckBox
                  disabled={readOnly}
                  key={route}
                  label={route}
                  value={product.route_of_access === route}
                  onValueChange={() =>
                    updateProduct(
                      index,
                      'route_of_access',
                      product.route_of_access === route ? '' : route,
                    )
                  }
                />
              ))}
            </View>
            {errors[`infusion_products[${index}].route_of_access`] && (
              <AppText
                color={COLORS.error}
                size={getScaleSize(11)}
                style={{ marginTop: getScaleSize(4) }}
              >
                {errors[`infusion_products[${index}].route_of_access`]}
              </AppText>
            )}

            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._1A1D1F}
              style={[styles.sectionLabel, { marginTop: getScaleSize(16) }]}
            >
              {t(STRING.modeOfAdministration)}
            </AppText>
            <View style={styles.checkboxGroup}>
              {MODE_OF_ADMINISTRATION.map(mode => (
                <AppCheckBox
                  disabled={readOnly}
                  key={mode}
                  label={mode}
                  value={product.mode_of_administration === mode}
                  onValueChange={() =>
                    updateProduct(
                      index,
                      'mode_of_administration',
                      product.mode_of_administration === mode ? '' : mode,
                    )
                  }
                />
              ))}
            </View>
            {errors[`infusion_products[${index}].mode_of_administration`] && (
              <AppText
                color={COLORS.error}
                size={getScaleSize(11)}
                style={{ marginTop: getScaleSize(4) }}
              >
                {errors[`infusion_products[${index}].mode_of_administration`]}
              </AppText>
            )}

            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._1A1D1F}
              style={styles.sectionLabel}
            >
              {t(STRING.thePatientMustRemainAmbulatoryDuringTreatment)}
            </AppText>
            <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
              <AppCheckBox
                disabled={readOnly}
                value={product.ambulatory_required}
                onValueChange={value =>
                  updateProduct(index, 'ambulatory_required', value)
                }
                label={t(STRING.yes)}
              />

              <AppCheckBox
                disabled={readOnly}
                value={product.ambulatory_required === false}
                onValueChange={value =>
                  updateProduct(index, 'ambulatory_required', !value)
                }
                label={t(STRING.no)}
              />
            </View>

            <View style={{ marginBottom: getScaleSize(10) }}>
              <AppCheckBox
                disabled={readOnly}
                value={product.prepared_in_facility}
                onValueChange={value =>
                  updateProduct(index, 'prepared_in_facility', value)
                }
                label={t(STRING.preparedInFacility)}
              />
            </View>

            <View style={styles.dateInputsRow}>
              <Input
                isLocked={readOnly}
                label={t(STRING.startDate)}
                value={product.start_date}
                onPress={() => {
                  if (!readOnly) {
                    setPickerType({ type: 'start_date', index });
                    if (product.start_date) {
                      setDate(moment(product.start_date, 'DD/MM/YYYY').toDate());
                    }
                    setOpen(true);
                  }
                }}
                placeholder={t(STRING.ddmmyyyy)}
                style={styles.halfWidthInput}
              />
              <Input
                isLocked={readOnly || !product.start_date}
                label={t(STRING.endDate)}
                value={product.end_date}
                onPress={() => {
                  if (!readOnly && product.start_date) {
                    setPickerType({ type: 'end_date', index });
                    if (product.end_date) {
                      setDate(moment(product.end_date, 'DD/MM/YYYY').toDate());
                    } else {
                      setDate(moment(product.start_date, 'DD/MM/YYYY').toDate());
                    }
                    setOpen(true);
                  } else if (!product.start_date) {
                    SHOW_TOAST('Please select start date first', 'error');
                  }
                }}
                placeholder={t(STRING.ddmmyyyy)}
                style={styles.halfWidthInput}
              />
            </View>
            <Input
              isLocked={readOnly}
              label={t(STRING.treatmentDurationDays)}
              value={product.treatment_duration_days}
              onChangeText={value =>
                updateProduct(index, 'treatment_duration_days', value)
              }
              placeholder={t(STRING.treatmentDurationDays)}
              style={styles.inputField}
              keyboardType="numeric"
              error={
                errors[`infusion_products[${index}].treatment_duration_days`]
              }
            />
            <Input
              label={t(STRING.totalNumberOfInfusions)}
              value={product.tni}
              onChangeText={value => updateProduct(index, 'tni', value)}
              placeholder={'0'}
              style={styles.inputField}
              keyboardType="numeric"
              editable={false}
            />

            <AppCheckBox
              disabled={readOnly}
              value={product.infuse_alone}
              onValueChange={value =>
                updateProduct(index, 'infuse_alone', value)
              }
              label={t(STRING.ifThisTreatmentMustBeInfused)}
            />
          </View>
        ))}

        {state.infusion_products.length < 10 && !readOnly && (
          <TouchableOpacity style={styles.addButton} onPress={addProduct}>
            <Image source={IMAGES.add_patient} style={styles.addIcon} />
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._526674}
            >
              {t(STRING.addAntibioticProduct)}
            </AppText>
          </TouchableOpacity>
        )}

        {/* SIGNATURE */}

        {/* SUBMIT BUTTON */}
        {/* <AppButton
          title="Submit Form"
          onPress={handleSubmit}
          style={{ marginTop: getScaleSize(20), marginBottom: getScaleSize(20) }}
        /> */}
      </KeyboardAwareScrollView>

      <DatePicker
        locale={locale}
        title={t(STRING.selectDate)}
        cancelText={t(STRING.cancel)}
        confirmText={t(STRING.confirm)}
        modal
        open={open}
        date={date}
        mode="date"
        minimumDate={new Date()}
        onConfirm={selectedDate => {
          setOpen(false);
          if (pickerType) {
            const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
            if (pickerType.index !== undefined) {
              // Handle product date fields
              const product = state.infusion_products[pickerType.index];

              // Validate end date is greater than start date
              if (pickerType.type === 'end_date' && product.start_date) {
                const startDate = moment(product.start_date, 'DD/MM/YYYY');
                const endDate = moment(selectedDate);

                if (endDate.isBefore(startDate) || endDate.isSame(startDate)) {
                  SHOW_TOAST(t(STRING.endDateMustBeAfterStartDate), 'error');
                  return;
                }
              }

              updateProduct(pickerType.index, pickerType.type, formattedDate);
            } else {
              // Handle main form date fields
              setState(prev => ({ ...prev, [pickerType.type]: formattedDate }));
            }
          }
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </View>
  );
});

AntibiotherapyInfusionForm.displayName = 'AntibiotherapyInfusionForm';

export default AntibiotherapyInfusionForm;

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
  backBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
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
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(12),
  },
  radioOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    paddingVertical: getScaleSize(8),
    paddingHorizontal: getScaleSize(12),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
  },
  radioOuterActive: {
    borderColor: COLORS._526674,
    backgroundColor: COLORS._F8F9FA,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
    marginTop: getScaleSize(20),
  },
  nextBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: COLORS._526674,
  },
  checkboxGroup: {
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(2),
  },
  checkboxLabel: {
    flex: 1,
  },
  selectGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(8),
  },
  selectOption: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
  },
  selectOptionActive: {
    backgroundColor: COLORS._526674,
    borderColor: COLORS._526674,
  },
  booleanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
  },
  booleanLabel: {
    flex: 1,
  },
  sectionLabel: {
    marginBottom: getScaleSize(8),
  },
  productCard: {
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(8),
    elevation: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(10),
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    // marginBottom: getScaleSize(12),
  },
  halfWidthInput: {
    flex: 1,
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  removeButton: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
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
  signatureLine: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginTop: getScaleSize(8),
  },
});
