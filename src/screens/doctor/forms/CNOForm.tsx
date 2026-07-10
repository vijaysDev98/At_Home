import React, {
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import moment from 'moment';

import {
  AppText,
  Input,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
  AppCheckBox,
  AppDropDown,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING } from '../../../constant';
import { IMAGES } from '../../../assets/images';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { setLoading } from '../../../actions/common/commonSlice';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
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
import { getCountryCode } from '../../../constant/getCountryCode';

const NUTRITION_CATEGORIES = [
  { label: 'Diabetic Range', value: 'Diabetic Range' },
  {
    label: 'Standard Carbohydrate Range',
    value: 'Standard Carbohydrate Range',
  },
];

const NUTRITION_PRODUCT_TYPES = [
  { label: 'ONS drink 1.5 kcal/ml', value: 'ONS drink 1.5 kcal/ml' },
  {
    label: 'ONS drink 1.5 kcal/ml + fiber',
    value: 'ONS drink 1.5 kcal/ml + fiber',
  },
  { label: 'ONS drink 2 kcal/ml', value: 'ONS drink 2 kcal/ml' },
  { label: 'ONS concentrated 2 kcal/ml', value: 'ONS concentrated 2 kcal/ml' },
  { label: 'ONS cream 1.5 kcal/ml', value: 'ONS cream 1.5 kcal/ml' },
  { label: 'ONS soup 1.5 kcal', value: 'ONS soup 1.5 kcal' },
  {
    label: 'Blended high-protein meal (300g, 500 kcal)',
    value: 'Blended high-protein meal (300g, 500 kcal)',
  },
  { label: 'Fruit juice ONS', value: 'Fruit juice ONS' },
  {
    label: 'Compote (250 kcal, 6–9g protein)',
    value: 'Compote (250 kcal, 6–9g protein)',
  },
];

const CNO_REASSESSMENT_CRITERIA = [
  STRING.weight,
  STRING.nutritionalStatus,
  STRING.pathologyProgression,
  STRING.oralIntakeLevel,
  STRING.onsTolerance,
  STRING.complianceWithOns,
];

export interface CNOFormProps {
  serviceId: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
  prescriber?: any; // Selected doctor (provider flow) or profileData (doctor flow)
}

export interface CNOFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const CNOForm = forwardRef<CNOFormRef, CNOFormProps>(
  ({ serviceId, initialData, patient, readOnly = false, prescriber }, ref) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const reduxPatient = useSelector(
      (state: RootState) => state.patient.selectedPatient,
    );
    const selectedPatient = initialData ? patient : reduxPatient;
    const profileData = useSelector(
      (state: RootState) => state.profile.profileData,
    );

    // Use prescriber prop (selected doctor or profile data)
    const prescriberData = prescriber || profileData;

    const productPositions = useRef<{ [index: number]: number }>({}).current;
    const lastFirstErrorKey = useRef<string | null>(null);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [state, setState] = useState({
      // Prescription Context
      done_at: '',
      prescription_place: '',
      prescription_date: '',
      prescription_type: '', // 'outside_ald' or 'ald'

      // Patient
      patient_last_name: selectedPatient?.lName || '',
      patient_first_name: selectedPatient?.fName || '',
      dob: moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY'),
      weight: selectedPatient?.weight?.toString() || '',
      nir: selectedPatient?.socialInsuranceNumber || '',
      ald_condition: false,

      // Patient Condition
      patient_age: '',
      patient_weight_confirm: '',

      // Prescriber
      prescriber_last_name: prescriberData?.lName || '',
      prescriber_first_name: prescriberData?.fName || '',
      prescriber_phone:
        getCountryCode(prescriberData?.country) +
        ' ' +
        (prescriberData?.phoneNumber || ''),
      rpps_id: prescriberData?.rppsNumber || '',

      // Facility
      hospital_name: prescriberData?.facilityName || '',
      hospital_address: prescriberData?.businessAddress || '',
      finess_number: prescriberData?.finessNumber || '',

      // Nutrition Products (repeatable)
      nutrition_products: [
        { category: '', product_type: '', quantity_per_day: '' },
        // { category: '', product_type: '', quantity_per_day: '' },
        // { category: '', product_type: '', quantity_per_day: '' },
      ],

      // Other Nutrition
      other_nutrition: '',

      // Instructions
      texture: '',

      // Reassessment
      reassessment_after_month: '1',
      renewal_months: '',
      reassessment_criteria: [] as string[],

      // Signature
      physician_signature: '',
    });

    // Hydrate form state from initialData when editing an existing draft
    React.useEffect(() => {
      if (initialData && initialData.formData) {
        setState(prev => ({
          ...prev,
          ...initialData.formData,
        }));
      }
    }, [initialData]);

    // Update patient fields when selectedPatient changes (e.g., after editing patient)
    React.useEffect(() => {
      if (!initialData && selectedPatient) {
        setState(prev => ({
          ...prev,
          patient_last_name: selectedPatient?.lName || '',
          patient_first_name: selectedPatient?.fName || '',
          dob: selectedPatient?.dateOfBirth
            ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
            : '',
          weight: selectedPatient?.weight?.toString() || '',
          nir: selectedPatient?.socialInsuranceNumber || '',
        }));
      }
    }, [selectedPatient, initialData]);

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
                  if (k === 'prescription_date' && ne.prescriptionDate)
                    delete ne.prescriptionDate;
                  if (k === 'patient_age' && ne.patient_age)
                    delete ne.patient_age;
                  if (
                    k === 'patient_weight_confirm' &&
                    ne.patient_weight_confirm
                  )
                    delete ne.patient_weight_confirm;
                  if (
                    k === 'reassessment_after_month' &&
                    ne.reassessment_after_month
                  )
                    delete ne.reassessment_after_month;
                  if (k === 'renewal_months' && ne.renewal_months)
                    delete ne.renewal_months;
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
                if (k === 'prescription_date' && ne.prescriptionDate)
                  delete ne.prescriptionDate;
                if (k === 'patient_age' && ne.patient_age)
                  delete ne.patient_age;
                if (k === 'patient_weight_confirm' && ne.patient_weight_confirm)
                  delete ne.patient_weight_confirm;
                if (
                  k === 'reassessment_after_month' &&
                  ne.reassessment_after_month
                )
                  delete ne.reassessment_after_month;
                if (k === 'renewal_months' && ne.renewal_months)
                  delete ne.renewal_months;
              });
              return ne;
            });
          }
          return next;
        });
      }
    };

    const updateProduct = (index: number, field: string, value: any) => {
      setState(prev => ({
        ...prev,
        nutrition_products: prev.nutrition_products.map((product, i) =>
          i === index ? { ...product, [field]: value } : product,
        ),
      }));
      // Clear error immediately when user starts typing
      const errKey = `nutrition_products[${index}].${field}`;
      if (errors[errKey]) {
        setErrors(prev => {
          const ne = { ...prev } as any;
          delete ne[errKey];
          return ne;
        });
      }
    };

    const addProduct = () => {
      if (state.nutrition_products.length >= 20) {
        SHOW_TOAST(STRING.youCanOnlyAddUpto20Products, 'info');
        return;
      }
      setFormState(prev => ({
        ...prev,
        nutrition_products: [
          ...prev.nutrition_products,
          { category: '', product_type: '', quantity_per_day: '' },
        ],
      }));
    };

    const removeProduct = (index: number) => {
      setFormState(prev => ({
        ...prev,
        nutrition_products: prev.nutrition_products.filter(
          (_, i) => i !== index,
        ),
      }));
    };

    const checkedBoxesCount = useMemo(() => {
      return state.reassessment_criteria?.length || 0;
    }, [state]);

    // Validation function (aligned with schema required fields)
    const validateForm = (): boolean => {
      const newErrors: { [key: string]: string } = {};

      // Patient Information - Required fields
      if (!state?.patient_last_name || !state.patient_last_name.trim()) {
        newErrors.patientLastName = t(STRING.lNameRequired);
      }
      if (!state?.patient_first_name || !state.patient_first_name.trim()) {
        newErrors.patientFirstName = t(STRING.fNameRequired);
      }

      // Prescription Context - Required fields
      if (!state?.prescription_date) {
        newErrors.prescriptionDate = t(STRING.prescriptionDateRequired);
      }

      // Nutrition Products validation - at least 1 product must be filled
      const products = state?.nutrition_products || [];
      const filledProductIndices = products
        .map((p, i) => (p?.product_type && p.product_type.trim() ? i : -1))
        .filter(i => i !== -1);

      if (filledProductIndices.length === 0) {
        newErrors['nutrition_products'] = t(STRING.atLeastOneProductRequired);
      }

      // Validate numeric fields for filled products
      products.forEach((product, index) => {
        if (product?.product_type && product.product_type.trim()) {
          const val = product.quantity_per_day;
          if (
            val !== '' &&
            val !== undefined &&
            val !== null &&
            isNaN(Number(val))
          ) {
            newErrors[`nutrition_products[${index}].quantity_per_day`] = t(
              STRING.quantityMustBeNumber,
            );
          }
        }
      });

      // Patient Condition - Numeric validation
      if (
        state?.patient_age &&
        state.patient_age !== '' &&
        isNaN(Number(state.patient_age))
      ) {
        newErrors.patient_age = t(STRING.mustBeNumber);
      }
      if (
        state?.patient_weight_confirm &&
        state.patient_weight_confirm !== '' &&
        isNaN(Number(state.patient_weight_confirm))
      ) {
        newErrors.patient_weight_confirm = t(STRING.mustBeNumber);
      }

      // Reassessment - Numeric validation
      if (
        state?.reassessment_after_month &&
        state.reassessment_after_month !== '' &&
        isNaN(Number(state.reassessment_after_month))
      ) {
        newErrors.reassessment_after_month = t(STRING.mustBeNumber);
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
        doctorId: prescriber?.id, // Pass doctorId from prescriber
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
      saveProgress,
      submitForReview,
      editForm,
      getFormData: () => state,
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
              {t(STRING.cnoForm)}
            </AppText>
          </View>

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

          {/* PRESCRIPTION DETAILS */}
          <FormPrescriptionDetails
            readOnly={readOnly}
            state={state}
            setState={setFormState}
            errors={errors}
            showDoneAt={true}
          />

          {/* PATIENT CONDITION */}
          <View style={styles.card}>
            {renderSectionHeader(STRING.patientCondition)}
            <View style={styles.row}>
              <Input
                isLocked={readOnly}
                label={t(STRING.age)}
                value={state.patient_age}
                isNumberOnly
                onChangeText={value => setFormState({ patient_age: value })}
                placeholder={t(STRING.years)}
                style={styles.rowInput}
                keyboardType="numeric"
              />
              <Input
                isLocked={readOnly}
                label={t(STRING.weightKg)}
                value={state.patient_weight_confirm}
                isNumberOnly
                onChangeText={value =>
                  setFormState({ patient_weight_confirm: value })
                }
                placeholder={t(STRING.kg)}
                style={styles.rowInput}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* NUTRITION PRODUCTS */}
          <AppText size={getScaleSize(15)} font={FONTS.Inter.Bold}>
            {t(STRING.nutritionProducts)}
          </AppText>
          {errors.nutrition_products && (
            <View style={styles.productErrorRow}>
              <Image
                source={IMAGES.error_icon}
                style={{ width: 11, height: 11 }}
              />
              <AppText
                size={getScaleSize(12)}
                color={COLORS.error}
                style={styles.productErrorText}
              >
                {errors.nutrition_products}
              </AppText>
            </View>
          )}
          <View style={styles.card}>
            {state.nutrition_products.map((product, index) => (
              <View
                key={index}
                style={styles.productBoxRow}
                onLayout={e => {
                  productPositions[index] = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.productHeader}>
                  <AppText
                    size={getScaleSize(13)}
                    color={COLORS._1A1D1F}
                    font={FONTS.Inter.SemiBold}
                    style={styles.productIndex}
                  >
                    {index + 1}.
                  </AppText>
                  {!readOnly && state.nutrition_products.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <AppText
                        size={getScaleSize(12)}
                        color={COLORS.error}
                        font={FONTS.Inter.Medium}
                      >
                        {t(STRING.remove)}
                      </AppText>
                    </TouchableOpacity>
                  )}
                </View>
                <AppDropDown
                  disabled={readOnly}
                  label={t(STRING.category)}
                  data={NUTRITION_CATEGORIES}
                  value={product.category}
                  onChange={value => updateProduct(index, 'category', value)}
                  style={styles.productInputRoot}
                  placeholder={t(STRING.selectCategory)}
                />
                <AppDropDown
                  disabled={readOnly}
                  label={t(STRING.productType)}
                  data={NUTRITION_PRODUCT_TYPES}
                  value={product.product_type}
                  onChange={value =>
                    updateProduct(index, 'product_type', value)
                  }
                  style={styles.productInputRoot}
                  placeholder={t(STRING.selectProductType)}
                  error={errors[`nutrition_products[${index}].product_type`]}
                />
                <View style={styles.productBottomRow}>
                  <Input
                    isLocked={readOnly}
                    value={product.quantity_per_day}
                    onChangeText={value =>
                      updateProduct(index, 'quantity_per_day', value)
                    }
                    keyboardType="numeric"
                    multiline
                    style={styles.productSmallInputRoot}
                    inputWrapperStyle={styles.productSmallBox}
                    inputStyle={styles.productSmallText}
                    placeholder={t(STRING.qty)}
                    placeholderTextColor={COLORS._6F767E}
                    error={
                      errors[`nutrition_products[${index}].quantity_per_day`]
                    }
                  />
                  <AppText size={getScaleSize(13)} color={COLORS._1A1D1F}>
                    {t(STRING.perDay)}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          {!readOnly && state.nutrition_products.length < 20 && (
            <TouchableOpacity style={styles.addButton} onPress={addProduct}>
              <Image source={IMAGES.add_patient} style={styles.addIcon} />
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Medium}
                color={COLORS._526674}
              >
                {t(STRING.addAnotherProduct)}
              </AppText>
            </TouchableOpacity>
          )}

          {/* OTHER NUTRITION */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.otherNutrition))}
            <Input
              isLocked={readOnly}
              // label="Other Nutrition"
              value={state.other_nutrition}
              onChangeText={value => setFormState({ other_nutrition: value })}
              placeholder={t(STRING.enterOtherNutritionDetails)}
              multiline
              numberOfLines={4}
              style={styles.inputField}
            />
          </View>

          {/* INSTRUCTIONS */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.instructions))}
            <AppText
              size={getScaleSize(12)}
              color={COLORS._6F767E}
              style={{ marginBottom: getScaleSize(12) }}
            >
              {t(STRING.consumeAtLeast2HoursBeforeOrAfterMealsFor1Month)}
            </AppText>
            <Input
              isLocked={readOnly}
              label={t(STRING.texture)}
              value={state.texture}
              onChangeText={value => setFormState({ texture: value })}
              placeholder={t(STRING.enterTextureDetails)}
              style={styles.inputField}
            />
          </View>

          {/* REASSESSMENT */}
          <View style={styles.card}>
            {renderSectionHeader(t(STRING.reassessment))}
            <View style={styles.row}>
              <Input
                isLocked={readOnly}
                label={t(STRING.reassessmentAfterMonths)}
                value={state.reassessment_after_month}
                isNumberOnly
                onChangeText={value =>
                  setFormState({ reassessment_after_month: value })
                }
                placeholder="1"
                style={styles.rowInput}
                keyboardType="numeric"
              />
              <Input
                isLocked={readOnly}
                label={t(STRING.renewalMonths)}
                value={state.renewal_months}
                isNumberOnly
                onChangeText={value => setFormState({ renewal_months: value })}
                placeholder={t(STRING.months)}
                style={styles.rowInput}
                keyboardType="numeric"
              />
            </View>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              style={{
                marginTop: getScaleSize(12),
                marginBottom: getScaleSize(8),
              }}
            >
              {t(STRING.reassessmentCriteria)} ({checkedBoxesCount}{' '}
              {t(STRING.selected)})
            </AppText>
            {CNO_REASSESSMENT_CRITERIA.map(criterion => (
              <AppCheckBox
                disabled={readOnly}
                key={criterion}
                value={state.reassessment_criteria.includes(criterion)}
                onValueChange={val => {
                  const updated = val
                    ? [...state.reassessment_criteria, criterion]
                    : state.reassessment_criteria.filter(c => c !== criterion);
                  setFormState({ reassessment_criteria: updated });
                }}
                label={criterion}
              />
            ))}
          </View>

          {/* SIGNATURE */}
          {/* <FormSignature
            readOnly={readOnly}
            title="Physician Signature"
            showDate={true}
          /> */}
        </KeyboardAwareScrollView>
      </View>
    );
  },
);

CNOForm.displayName = 'CNOForm';

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
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS == 'android' ? 0.03 : 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getScaleSize(12),
  },
  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'flex-end',
  },
  rowInput: {
    flex: 1,
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },
  productBoxRow: {
    marginBottom: getScaleSize(16),
    paddingBottom: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getScaleSize(8),
  },
  productIndex: {
    marginBottom: 0,
  },
  productInputRoot: {
    paddingHorizontal: 0,
    marginBottom: getScaleSize(8),
  },
  productSmallInputRoot: {
    flex: 1,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
  productNameBox: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    backgroundColor: COLORS.white,
  },
  productSmallBox: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    backgroundColor: COLORS.white,
  },
  productSmallText: {
    fontSize: getScaleSize(13),
    textAlign: 'center',
  },
  productBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginTop: getScaleSize(8),
  },
  productErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    marginBottom: getScaleSize(8),
    marginHorizontal: getScaleSize(16),
  },
  productErrorText: {
    marginBottom: 0,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._F8F9FA,
    marginHorizontal: getScaleSize(16),
    marginBottom: getScaleSize(12),
  },
  addIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    marginRight: getScaleSize(8),
  },
});

export default CNOForm;
