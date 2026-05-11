import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
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
  AppButton,
  AppCheckBox,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { STRING, SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { PatientInfo, ServiceRequestDetail } from '../../../services/serviceRequestListApi';

export interface AntibiotherapyInfusionFormProps {
  serviceId: string;
  onLoadingChange?: (isLoading: boolean) => void;
  initialData?: ServiceRequestDetail;
  patient?: PatientInfo;
}

const AntibiotherapyInfusionForm = forwardRef<any, AntibiotherapyInfusionFormProps>(({
  serviceId,
  onLoadingChange,
  initialData,
  patient,
}, ref) => {

  const selectedPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const warningSheetRef = useRef<ActionSheetRef>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<{
    type: string;
    index?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Scroll helpers to focus first error in infusion products
  const scrollRef = useRef<ScrollView>(null);
  const productPositions = useRef<{ [index: number]: number }>({}).current;
  const lastFirstErrorKey = useRef<string | null>(null);

  const [state, setState] = useState({
    // Prescription Details
    prescription_date: moment().format('DD/MM/YYYY'),
    therapy_type: '',

    // Patient Information
    patient_last_name: '',
    patient_first_name: selectedPatient?.fullName || '',
    dob: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',
    weight: '',
    nir: '',
    ald_condition: false,

    // Prescriber Identification (Auto-filled from doctor profile)
    prescriber_last_name: profileData?.fullName?.split(' ').slice(-1)[0] || '',
    prescriber_first_name: profileData?.fullName?.split(' ')[0] || '',
    prescriber_phone: profileData?.phoneNumber || '',
    rpps_id: profileData?.rppsNumber || '',

    // Facility Information
    hospital_name: profileData?.businessAddress || '',
    hospital_address: '',
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
        duration_minutes: '',
        frequency_per_day: '',
        route_of_access: '',
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
  });

  useEffect(() => {
    if (initialData) {
      console.log("initialDatainitialData", initialData);

      setState(initialData.formData);
    }
  }, [initialData])

  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Wrapper setter that clears errors for changed top-level keys (e.g., patient_first_name)
  const setFormState = (updaterOrPartial: any) => {
    if (typeof updaterOrPartial === 'function') {
      setState(prev => {
        const next = updaterOrPartial(prev);
        try {
          const changedKeys = Object.keys(next).filter(k => (prev as any)[k] !== (next as any)[k]);
          if (changedKeys.length) {
            setErrors(prevErrs => {
              const ne = { ...prevErrs } as any;
              changedKeys.forEach(k => {
                const newVal = (next as any)[k];
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
              const newVal = (next as any)[k];
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

  const addProduct = () => {
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
      infusion_products: prev.infusion_products.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    setState(prev => {
      const updatedProducts = prev.infusion_products.map((product: any, i: number) => {
        if (i === index) {
          const updatedProduct = { ...product, [field]: value };
          // If user types duration days, clear dates (mutually exclusive)
          if (field === 'treatment_duration_days') {
            updatedProduct.start_date = '';
            updatedProduct.end_date = '';
          }

          // Calculate TNI per spec:
          // Prefer inclusive day difference between start_date (p) and end_date (y): M = (y - p) + 1 when valid
          // Otherwise use treatment_duration_days (n)
          // TNI = (M or n) * a, where a = frequency_per_day
          const freq = Number(updatedProduct.frequency_per_day) || 0;
          let days = 0;
          if (updatedProduct.start_date && updatedProduct.end_date) {
            const start = moment(updatedProduct.start_date, 'DD/MM/YYYY', true);
            const end = moment(updatedProduct.end_date, 'DD/MM/YYYY', true);
            if (start.isValid() && end.isValid()) {
              const diff = end.diff(start, 'days');
              if (diff >= 0) {
                days = diff + 1; // inclusive of start and end
              }
            }
          }
          if (!days) {
            const n = Number(updatedProduct.treatment_duration_days);
            if (!isNaN(n) && n > 0) days = n;
          }
          // If dates are valid, reflect inclusive days into duration and make input read-only in UI
          if (updatedProduct.start_date && updatedProduct.end_date) {
            const start = moment(updatedProduct.start_date, 'DD/MM/YYYY', true);
            const end = moment(updatedProduct.end_date, 'DD/MM/YYYY', true);
            if (start.isValid() && end.isValid()) {
              const diff = end.diff(start, 'days');
              if (diff >= 0) {
                updatedProduct.treatment_duration_days = String(diff + 1);
              }
            }
          }
          let tniCalc = '';
          if (days > 0) {
            // Show 0 until frequency is set (or when it's zero)
            tniCalc = String(freq > 0 ? days * freq : 0);
          } else {
            // No days provided (no dates or duration) -> keep blank
            tniCalc = '';
          }
          updatedProduct.tni = tniCalc;

          return updatedProduct;
        }
        return product;
      });

      return { ...prev, infusion_products: updatedProducts };
    });

    // Clear error for this product field when it becomes valid
    const errKey = `infusion_products[${index}].${field}`;
    if (errors[errKey]) {
      setErrors(prev => {
        const ne = { ...prev } as any;
        const val = (state.infusion_products[index] as any)[field];
        const allowedRoutes = ['Implanted Port', 'Central Catheter', 'PICC', 'Perineural', 'Peripheral Venous', 'Subcutaneous'];
        const allowedModes = ['Gravity', 'Elastomeric Diffuser', 'Electric Infusion Pump'];

        let isValid = false;
        if (field === 'product_name') {
          isValid = !!(String(val || '').trim().length);
        } else if (['diluent_volume_ml', 'duration_hours', 'duration_minutes', 'frequency_per_day', 'treatment_duration_days'].includes(field)) {
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

    // Required (schema): prescription_date
    if (!state.prescription_date) {
      newErrors.prescriptionDate = 'Prescription date is required';
    }

    // Required (schema): patient_last_name, patient_first_name
    if (!state.patient_last_name.trim()) {
      newErrors.patientLastName = 'Last name is required';
    }
    if (!state.patient_first_name.trim()) {
      newErrors.patientFirstName = 'First name is required';
    }

    // Infusion Products validation (required product_name)
    const allowedRoutes = [
      'Implanted Port',
      'Central Catheter',
      'PICC',
      'Perineural',
      'Peripheral Venous',
      'Subcutaneous',
    ];
    const allowedModes = ['Gravity', 'Elastomeric Diffuser', 'Electric Infusion Pump'];

    state.infusion_products.forEach((product, index) => {
      if (!product.product_name.trim()) {
        newErrors[`infusion_products[${index}].product_name`] = 'Product name is required';
      }

      // Optional numeric fields: validate if provided
      const numericFields: Array<{ key: keyof typeof product; label: string }> = [
        { key: 'diluent_volume_ml', label: 'Diluent Volume (ml)' },
        { key: 'duration_hours', label: 'Duration (hours)' },
        { key: 'duration_minutes', label: 'Duration (minutes)' },
        { key: 'frequency_per_day', label: 'Frequency per day' },
        { key: 'treatment_duration_days', label: 'Treatment Duration (days)' },
      ];
      numericFields.forEach(f => {
        const val = (product as any)[f.key];
        if (val !== '' && val !== undefined && val !== null && isNaN(Number(val))) {
          newErrors[`infusion_products[${index}].${String(f.key)}`] = `${f.label} must be a number`;
        }
      });

      // Validate select/radio fields if provided
      if (product.route_of_access && !allowedRoutes.includes(product.route_of_access)) {
        newErrors[`infusion_products[${index}].route_of_access`] = 'Invalid route of access';
      }
      if (
        product.mode_of_administration &&
        !allowedModes.includes(product.mode_of_administration)
      ) {
        newErrors[`infusion_products[${index}].mode_of_administration`] = 'Invalid mode of administration';
      }
      if (
        product.diluent_type &&
        !['with', 'without'].includes(product.diluent_type)
      ) {
        newErrors[`infusion_products[${index}].diluent_type`] = 'Invalid diluent option';
      }
    });

    setErrors(newErrors);
    lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form is valid, submitting:', state);
      // TODO: Implement form submission logic
      warningSheetRef.current?.show();
    } else {
      console.log('Form validation failed:', errors);
      // Scroll to first error or show error message
    }
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

        const match = firstErrorKey.match(/infusion_products\[(\d+)\]/);
        if (match) {
          const idx = Number(match[1]);
          const y = productPositions[idx] ?? 0;
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
            {STRING.antibiotherapyInfusionForm}
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

        {/* INFUSION PRODUCTS */}
        {/* {renderSectionHeader(STRING.infusionProducts, IMAGES.testTubeIcon)} */}
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
        >
          {STRING.infusionProducts}
        </AppText>
        <View style={styles.card}>
          {state.infusion_products.map((product: any, index: number) => (
            <View
              key={`product-${index}`}
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
                  {STRING.product}
                  {index + 1}
                </AppText>
                {state.infusion_products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(index)}>
                    <Text style={{ color: COLORS.error }}>remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label={STRING.productName}
                value={product.product_name}
                onChangeText={value =>
                  updateProduct(index, 'product_name', value)
                }
                placeholder={STRING.enterProductName}
                style={styles.inputField}
                error={errors[`infusion_products[${index}].product_name`]}
              />
              <Input
                label={STRING.strength}
                value={product.strength}
                onChangeText={value => updateProduct(index, 'strength', value)}
                placeholder={STRING.concentration}
                style={styles.inputField}
              />

              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={product.diluent_type === 'with'}
                  onValueChange={value => {
                    updateProduct(index, 'diluent_type', value ? 'with' : '');
                  }}
                  label={STRING.withDiluent}
                />
                <AppCheckBox
                  value={product.diluent_type === 'without'}
                  onValueChange={value => {
                    updateProduct(index, 'diluent_type', value ? 'without' : '');
                  }}
                  label={STRING.withoutDiluent}
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
                label={STRING.diluentVolume}
                value={product.diluent_volume_ml}
                onChangeText={value =>
                  updateProduct(index, 'diluent_volume_ml', value)
                }
                placeholder={STRING.volumePerDay}
                style={styles.inputField}
                keyboardType="numeric"
                error={errors[`infusion_products[${index}].diluent_volume_ml`]}
              />
              <Input
                label={STRING.duration}
                value={product.duration_hours}
                onChangeText={value =>
                  updateProduct(index, 'duration_hours', value)
                }
                placeholder={STRING.hours}
                style={styles.inputField}
                keyboardType="numeric"
                error={errors[`infusion_products[${index}].duration_hours`]}
              />
              <Input
                label={STRING.durationMin}
                value={product.duration_minutes}
                onChangeText={value =>
                  updateProduct(index, 'duration_minutes', value)
                }
                placeholder={STRING.minutes}
                style={styles.inputField}
                keyboardType="numeric"
                error={errors[`infusion_products[${index}].duration_minutes`]}
              />
              <Input
                label={STRING.frequency}
                value={product.frequency_per_day}
                onChangeText={value =>
                  updateProduct(index, 'frequency_per_day', value)
                }
                placeholder={STRING.freqPerDay}
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
                {STRING.routeOfAccess}
              </AppText>
              <View style={styles.checkboxGroup}>
                {['Implanted Port', 'Central Catheter', 'PICC', 'Perineural', 'Peripheral Venous', 'Subcutaneous'].map(
                  route => (
                    <AppCheckBox
                      key={route}
                      label={route}
                      value={product.route_of_access === route}
                      onValueChange={() =>
                        updateProduct(index, 'route_of_access', product.route_of_access === route ? '' : route)
                      }
                    />
                  ),
                )}
              </View>
              {errors[`infusion_products[${index}].route_of_access`] && (
                <AppText color={COLORS.error} size={getScaleSize(11)} style={{ marginTop: getScaleSize(4) }}>
                  {errors[`infusion_products[${index}].route_of_access`]}
                </AppText>
              )}

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={[styles.sectionLabel, { marginTop: getScaleSize(16) }]}
              >
                Mode of Administration
              </AppText>
              <View style={styles.checkboxGroup}>
                {['Gravity', 'Elastomeric Diffuser', 'Electric Infusion Pump'].map(mode => (
                  <AppCheckBox
                    key={mode}
                    label={mode}
                    value={product.mode_of_administration === mode}
                    onValueChange={() =>
                      updateProduct(index, 'mode_of_administration', product.mode_of_administration === mode ? '' : mode)
                    }
                  />
                ))}
              </View>
              {errors[`infusion_products[${index}].mode_of_administration`] && (
                <AppText color={COLORS.error} size={getScaleSize(11)} style={{ marginTop: getScaleSize(4) }}>
                  {errors[`infusion_products[${index}].mode_of_administration`]}
                </AppText>
              )}

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                The patient must remain ambulatory during treatment?:
              </AppText>
              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={product.ambulatory_required}
                  onValueChange={value =>
                    updateProduct(index, 'ambulatory_required', value)
                  }
                  label="Yes"
                />

                <AppCheckBox
                  value={!product.ambulatory_required}
                  onValueChange={value =>
                    updateProduct(index, 'ambulatory_required', !value)
                  }
                  label="No"
                />
              </View>

              <View style={{ marginBottom: getScaleSize(10) }}>
                <AppCheckBox
                  value={product.prepared_in_facility}
                  onValueChange={value =>
                    updateProduct(index, 'prepared_in_facility', value)
                  }
                  label="If filled/prepared under the supervision of a healthcare facility, tick this box"
                />
              </View>

              <View style={styles.dateInputsRow}>
                <Input
                  label="Start Date"
                  value={product.start_date}
                  onPress={() => {
                    setPickerType({ type: 'start_date', index });
                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
                <Input
                  label="End Date"
                  value={product.end_date}
                  onPress={() => {
                    setPickerType({ type: 'end_date', index });
                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
              </View>
              <Input
                label="Treatment Duration (days)"
                value={product.treatment_duration_days}
                onChangeText={value =>
                  updateProduct(index, 'treatment_duration_days', value)
                }
                placeholder="Enter treatment duration"
                style={styles.inputField}
                keyboardType="numeric"
                error={errors[`infusion_products[${index}].treatment_duration_days`]}
              />
              <Input
                label="Total Number of Infusions"
                value={product.tni}
                onChangeText={value => updateProduct(index, 'tni', value)}
                placeholder="Auto-calculated"
                style={styles.inputField}
                keyboardType="numeric"
                editable={false}
              />

              <AppCheckBox
                value={product.infuse_alone}
                onValueChange={value =>
                  updateProduct(index, 'infuse_alone', value)
                }
                label="If this treatment must be infused ALONE, tick this box"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <Image source={IMAGES.add_patient} style={styles.addIcon} />
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._526674}
          >
            + Add Product
          </AppText>
        </TouchableOpacity>

        {/* SIGNATURE */}
        <FormSignature />

        {/* SUBMIT BUTTON */}
        {/* <AppButton
          title="Submit Form"
          onPress={handleSubmit}
          style={{ marginTop: getScaleSize(20), marginBottom: getScaleSize(20) }}
        /> */}
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
            if (pickerType.index !== undefined) {
              // Handle product date fields
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

      <WarningSheet ref={warningSheetRef} />
    </View>
  );
});

AntibiotherapyInfusionForm.displayName = 'AntibiotherapyInfusionForm';

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
  backBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    // position: 'absolute',
    left: getScaleSize(0),
    right: getScaleSize(0),
    bottom: getScaleSize(0),
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
  },
  nextBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: '#526674',
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

export default AntibiotherapyInfusionForm;
