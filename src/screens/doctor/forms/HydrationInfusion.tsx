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
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { calculateTni } from '../../../utils/formUtils';
import { useSelector, useDispatch } from 'react-redux';

import {
  AppCheckBox,
  AppText,
  FormFacilitySection,
  FormPatientSection,
  FormPrescriberSection,
  FormPrescriptionContextSection,
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
  handleEditForm,
} from './formActionHandlers';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getCountryCode } from '../../../constant/getCountryCode';

export interface HydrationInfusionFormProps {
  title?: string;
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
  prescriber?: any; // Selected doctor (provider flow) or profileData (doctor flow)
}

export interface HydrationInfusionFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const CENTRAL_VENOUS_OPTIONS = [
  STRING.implantedPort,
  STRING.centralCatheter,
  STRING.picc,
];

const MODE_OF_ADMINISTRATION = [
  STRING.gravity,
  STRING.elastomericDiffuser,
  STRING.electricInfusionPump,
];

const HydrationInfusionForm = forwardRef<
  HydrationInfusionFormRef,
  HydrationInfusionFormProps
>(
  (
    {
      title = STRING.hydrationInfusionForm,
      serviceId = '',
      initialData,
      patient,
      readOnly = false,
      prescriber,
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const locale = useSelector((state: any) => state.language.currentLanguage);
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
      therapy_type: '', // 'start' or 'renewal'

      // Patient Information
      patient_last_name: selectedPatient?.lName || '',
      patient_first_name: selectedPatient?.fName || '',
      dob: selectedPatient?.dateOfBirth
        ? moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY')
        : '',
      weight: selectedPatient?.weight?.toString() || '',
      nir: selectedPatient?.socialInsuranceNumber || '',
      ald_condition: false,

      // Prescriber Identification
      prescriber_last_name: prescriberData?.lName || '',
      prescriber_first_name: prescriberData?.fName || '',
      prescriber_phone: getCountryCode(prescriberData?.country) +
        ' ' +
        prescriberData?.phoneNumber || '',
      rpps_id: prescriberData?.rppsNumber || '',

      // Facility Information
      hospital_name: prescriberData?.facilityName || '',
      hospital_address: prescriberData?.businessAddress || '',
      finess_number: prescriberData?.finessNumber || '',

      // Prescription Context
      forms_for: '',

      // Infusion Products (repeatable)
      infusion_products: [
        {
          product_name: '',
          strength: '',
          diluent_type: '',
          diluent_volume_ml: '',
          duration_hours: '',
          duration_minutes: '',
          frequency_per_day: '',
          central_venous: false,
          central_venous_options: [],
          perineural_access: false,
          peripheral_venous_access: false,
          subcutaneous_access: false, mode_of_administration: '',
          ambulatory_required: false,
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
      if (initialData && initialData.formData) {
        setState(prev => ({
          ...prev,
          ...(initialData.formData as any),
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
          weight: selectedPatient?.weight?.toString() || '',
          nir: selectedPatient?.socialInsuranceNumber || '',
        }));
      }
    }, [initialData, selectedPatient]);

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
            central_venous: false,
            central_venous_options: [],
            perineural_access: false,
            peripheral_venous_access: false,
            subcutaneous_access: false,
            mode_of_administration: '',
            ambulatory_required: false,
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
                  if (k === 'therapy_type' && ne.therapyType)
                    delete ne.therapyType;
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
                if (ne[k]) delete ne[k];
                // Map snake_case to camelCase for error clearing
                if (k === 'patient_first_name' && ne.patientFirstName)
                  delete ne.patientFirstName;
                if (k === 'patient_last_name' && ne.patientLastName)
                  delete ne.patientLastName;
                if (k === 'prescription_date' && ne.prescriptionDate)
                  delete ne.prescriptionDate;
                if (k === 'therapy_type' && ne.therapyType)
                  delete ne.therapyType;
              });
              return ne;
            });
          }
          return next;
        });
      }
    };

    // Validation function (aligned with schema required fields)
    const validateForm = (): boolean => {
      const newErrors: { [key: string]: string } = {};

      // Prescription Details - Required fields
      if (!state?.prescription_date) {
        newErrors.prescription_date = t(STRING.prescriptionDateRequired);
      }

      // Patient Information - Required fields
      if (!state?.patient_last_name || !state.patient_last_name.trim()) {
        newErrors.patientLastName = t(STRING.lNameRequired);
      }
      if (!state?.patient_first_name || !state.patient_first_name.trim()) {
        newErrors.patientFirstName = t(STRING.fNameRequired);
      }

      // Infusion Products validation - at least 1 product must be filled
      const filledProductIndices = (state?.infusion_products || [])
        .map((p, i) => (p?.product_name?.trim() ? i : -1))
        .filter(i => i !== -1);

      if (filledProductIndices.length === 0) {
        newErrors['infusion_products[0].product_name'] =
          t(STRING.atLeastOneProductRequired);
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
      editForm,
      saveProgress,
      submitForReview,
      getFormData: () => state,
    }));

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
              {t(title)}
            </AppText>
          </View>

          <FormPrescriptionDetails
            readOnly={readOnly}
            state={state}
            setState={setFormState}
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

          <FormPrescriptionContextSection
            readOnly={readOnly}
            state={state}
            setState={updates => setFormState(updates)}
          />

          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {t(STRING.infusionProducts)}
          </AppText>

          {state.infusion_products.map((product: any, index: number) => (
            <View
              key={index}
              style={[
                styles.card,
                index !== state.infusion_products.length - 1 && {
                  marginBottom: getScaleSize(16),
                },
              ]}
            >
              <View style={styles.productHeader}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1A1D1F}
                >
                  {t(STRING.product)} {index + 1}
                </AppText>

                {!readOnly && state.infusion_products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(index)}>
                    <Text
                      style={{
                        color: COLORS.error,
                      }}
                    >
                      {t(STRING.remove)}
                    </Text>
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
                placeholder={t(STRING.enterStrength)}
                style={styles.inputField}
              />

              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  disabled={readOnly}
                  value={product.diluent_type === 'with'}
                  onValueChange={value => {
                    updateProduct(index, 'diluent_type', value ? 'with' : '');
                  }}
                  label={t(STRING.diluent)}
                />

                <AppCheckBox
                  disabled={readOnly}
                  value={product.diluent_type === 'without'}
                  onValueChange={value => {
                    updateProduct(
                      index,
                      'diluent_type',
                      value ? 'without' : '',
                    );
                    if (value) {
                      updateProduct(index, 'diluent_volume_ml', '');
                    }
                  }}
                  label={t(STRING.withoutDiluent)}
                />
              </View>

              {product.diluent_type === 'with' && (
                <>
                  <Input
                    isLocked={readOnly}
                    label={t(STRING.diluent)}
                    value={product.diluent}
                    onChangeText={value =>
                      updateProduct(index, 'diluent', value)
                    }
                    placeholder={t(STRING.enterDiluent)}
                    style={styles.inputField}
                  />

                  <Input
                    isLocked={readOnly}
                    label={t(STRING.diluentVolumeMl)}
                    value={product.diluent_volume_ml}
                    onChangeText={value =>
                      updateProduct(index, 'diluent_volume_ml', value)
                    }
                    placeholder={t(STRING.enterVolume)}
                    keyboardType="numeric"
                    style={styles.inputField}
                  />
                </>
              )}

              <Input
                isLocked={readOnly}
                label={t(STRING.durationHours)}
                value={product.duration_hours}
                onChangeText={value =>
                  updateProduct(index, 'duration_hours', value)
                }
                placeholder={t(STRING.hours)}
                keyboardType="numeric"
                style={styles.inputField}
              />

              <Input
                isLocked={readOnly}
                label={t(STRING.durationMinutes)}
                value={product.duration_minutes}
                onChangeText={value =>
                  updateProduct(index, 'duration_minutes', value)
                }
                placeholder={t(STRING.minutes)}
                keyboardType="numeric"
                style={styles.inputField}
              />

              <Input
                isLocked={readOnly}
                label={t(STRING.frequencyPerDay)}
                value={product.frequency_per_day}
                onChangeText={value =>
                  updateProduct(index, 'frequency_per_day', value)
                }
                placeholder={t(STRING.enterFrequency)}
                keyboardType="numeric"
                style={styles.inputField}
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
                <AppCheckBox
                  disabled={readOnly}
                  label={(STRING.centralVenous)}
                  value={product.central_venous}
                  onValueChange={value => {
                    updateProduct(index, 'central_venous', value);

                    if (!value) {
                      updateProduct(index, 'central_venous_options', []);
                    }
                  }}
                />

                {product.central_venous && (
                  <View
                    style={{
                      marginLeft: getScaleSize(20),
                      gap: getScaleSize(12),
                    }}
                  >
                    {CENTRAL_VENOUS_OPTIONS.map(option => (
                      <AppCheckBox
                        disabled={readOnly}
                        key={option}
                        label={option}
                        value={product.central_venous_options?.includes(option)}
                        onValueChange={value => {
                          const current = product.central_venous_options || [];

                          updateProduct(
                            index,
                            'central_venous_options',
                            value
                              ? [...current, option]
                              : current.filter((item: string) => item !== option),
                          );
                        }}
                      />
                    ))}
                  </View>
                )}

                <AppCheckBox
                  disabled={readOnly}
                  label={(STRING.perineural)}
                  value={product.perineural_access}
                  onValueChange={value =>
                    updateProduct(index, 'perineural_access', value)
                  }
                />

                <AppCheckBox
                  disabled={readOnly}
                  label={(STRING.peripheralVenous)}
                  value={product.peripheral_venous_access}
                  onValueChange={value =>
                    updateProduct(index, 'peripheral_venous_access', value)
                  }
                />

                <AppCheckBox
                  disabled={readOnly}
                  label={(STRING.subcutaneous)}
                  value={product.subcutaneous_access}
                  onValueChange={value =>
                    updateProduct(index, 'subcutaneous_access', value)
                  }
                />
              </View>

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
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

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                {t(STRING.patientMustRemainAmbulatory)}
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
                  value={!product.ambulatory_required}
                  onValueChange={value =>
                    updateProduct(index, 'ambulatory_required', !value)
                  }
                  label={t(STRING.no)}
                />
              </View>

              <AppCheckBox
                disabled={readOnly}
                value={product.prepared_in_facility}
                onValueChange={value =>
                  updateProduct(index, 'prepared_in_facility', value)
                }
                label={t(STRING.preparedUnderHealthcareFacilitySupervision)}
              />

              <View style={styles.dateInputsRow}>
                <Input
                  isLocked={readOnly}
                  label={t(STRING.startDate)}
                  value={product.start_date}
                  onPress={() => {
                    if (readOnly) return;
                    setPickerType({
                      type: 'start_date',
                      index,
                    });
                    if (product.start_date) {
                      setDate(moment(product.start_date, 'DD/MM/YYYY').toDate());
                    }
                    setOpen(true);
                  }}
                  placeholder={t(STRING.ddmmyyyy)}
                  style={styles.halfWidthInput}
                />

                <Input
                  isLocked={readOnly || !product.start_date}
                  label={t(STRING.endDate)}
                  value={product.end_date}
                  onPress={() => {
                    if (readOnly || !product.start_date) {
                      if (!product.start_date) {
                        SHOW_TOAST('Please select start date first', 'error');
                      }
                      return;
                    }
                    setPickerType({
                      type: 'end_date',
                      index,
                    });
                    if (product.end_date) {
                      setDate(moment(product.end_date, 'DD/MM/YYYY').toDate());
                    } else {
                      setDate(moment(product.start_date, 'DD/MM/YYYY').toDate());
                    }
                    setOpen(true);
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
                placeholder={t(STRING.enterDuration)}
                keyboardType="numeric"
                style={styles.inputField}
              />

              <Input
                label={t(STRING.totalNumberOfInfusions)}
                value={product.tni}
                onChangeText={value => updateProduct(index, 'tni', value)}
                placeholder="0"
                editable={false}
                style={styles.inputField}
              />

              <AppCheckBox
                disabled={readOnly}
                value={product.infuse_alone}
                onValueChange={value =>
                  updateProduct(index, 'infuse_alone', value)
                }
                label={t(STRING.ifThisTreatmentMustBeInfusedAlone)}
              />
            </View>
          ))}

          {!readOnly && state.infusion_products.length < 10 && (
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

          {/* <FormSignature readOnly={readOnly} /> */}
        </KeyboardAwareScrollView>

        <DatePicker
          locale={locale}
          title={t(STRING.selectDate)}
          cancelText={t(STRING.cancel)}
          confirmText={t(STRING.confirm)}
          modal
          theme='light'
          open={open}
          date={date}
          mode="date"
          // minimumDate={new Date()}
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
                setState(prev => ({
                  ...prev,
                  [pickerType.type]: formattedDate,
                }));
              }
            }
          }}
          onCancel={() => setOpen(false)}
        />
      </View>
    );
  },
);

HydrationInfusionForm.displayName = 'HydrationInfusionForm';

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

  inputField: {
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
  },

  checkboxGroup: {
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },

  sectionLabel: {
    marginBottom: getScaleSize(8),
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
  },

  halfWidthInput: {
    flex: 1,
    marginBottom: getScaleSize(12),
    paddingHorizontal: 0,
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

export default HydrationInfusionForm;
