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

export interface HydrationInfusionFormProps {
  title?: string;
  serviceId?: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
}

export interface HydrationInfusionFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  getFormData: () => any;
}

const HydrationInfusionForm = forwardRef<
  HydrationInfusionFormRef,
  HydrationInfusionFormProps
>(
  (
    { title = 'Hydration Infusion Form', serviceId = '', initialData, patient },
    ref,
  ) => {
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
    const productPositions = useRef<{ [index: number]: number }>({}).current;
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
      therapy_type: '', // 'start' or 'renewal'

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

              // Calculate TNI per spec:
              // Prefer inclusive day difference between start_date (p) and end_date (y): M = (y - p) + 1 when valid
              // Otherwise use treatment_duration_days (n)
              // TNI = (M or n) * a, where a = frequency_per_day
              const freq = Number(updatedProduct.frequency_per_day) || 0;
              let days = 0;
              if (updatedProduct.start_date && updatedProduct.end_date) {
                const start = moment(
                  updatedProduct.start_date,
                  'DD/MM/YYYY',
                  true,
                );
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
                const start = moment(
                  updatedProduct.start_date,
                  'DD/MM/YYYY',
                  true,
                );
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
          const allowedRoutes = [
            'Implanted Port',
            'Central Catheter',
            'PICC',
            'Perineural',
            'Peripheral Venous',
            'Subcutaneous',
          ];
          const allowedModes = [
            'Gravity',
            'Elastomeric Diffuser',
            'Electric Infusion Pump',
          ];

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
      if (!state.prescription_date) {
        newErrors.prescriptionDate = 'Prescription date is required';
      }

      // Patient Information - Required fields
      if (!state.patient_last_name.trim()) {
        newErrors.patientLastName = 'Last name is required';
      }
      if (!state.patient_first_name.trim()) {
        newErrors.patientFirstName = 'First name is required';
      }

      // Infusion Products validation - at least 1 product must be filled
      let hasValidProduct = false;
      state.infusion_products.forEach((product, index) => {
        if (!product.product_name.trim()) {
          newErrors[`infusion_products[${index}].product_name`] =
            'Product name is required';
        } else {
          hasValidProduct = true;
        }
      });

      if (!hasValidProduct) {
        newErrors.infusion_products = 'At least one product name is required';
      }

      setErrors(newErrors);
      lastFirstErrorKey.current = Object.keys(newErrors)[0] || null;
      return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmitRequest = async () => {
      // Always validate first
      const ok = validateForm();
      if (!ok) {
        // Show first error in toast
        const firstErrorKey = lastFirstErrorKey.current || '';
        const firstErrorMessage =
          errors[firstErrorKey] || 'Please fill in all required fields';
        SHOW_TOAST(firstErrorMessage, 'error');

        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 50);
        return;
      }

      // Show loader
      dispatch(setLoading(true));

      // Check if it's an existing draft
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
          // Create new service request
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

            // Submit for review to lock the request
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
      // Always validate first
      const ok = validateForm();
      if (!ok) {
        // Show first error in toast
        const firstErrorKey = lastFirstErrorKey.current || '';
        const firstErrorMessage =
          errors[firstErrorKey] || 'Please fill in all required fields';
        SHOW_TOAST(firstErrorMessage, 'error');

        setTimeout(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        }, 50);
        return;
      }

      // Show loader
      dispatch(setLoading(true));

      // Check if it's an existing draft
      const isExistingDraft = initialData && initialData._id;
      const requestId = isExistingDraft ? initialData._id : null;

      try {
        if (isExistingDraft && requestId) {
          // Update existing draft
          console.log('requestId update', requestId, state);

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
          // Create new service request as draft
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
              {title}
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

          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Infusion Products
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
                  Product {index + 1}
                </AppText>

                {state.infusion_products.length > 1 && (
                  <TouchableOpacity onPress={() => removeProduct(index)}>
                    <Text
                      style={{
                        color: COLORS.error,
                      }}
                    >
                      Remove
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Input
                label="Product Name"
                value={product.product_name}
                onChangeText={value =>
                  updateProduct(index, 'product_name', value)
                }
                placeholder="Enter Product Name"
                style={styles.inputField}
                error={errors[`infusion_products[${index}].product_name`]}
              />

              <Input
                label="Strength"
                value={product.strength}
                onChangeText={value => updateProduct(index, 'strength', value)}
                placeholder="Enter Strength"
                style={styles.inputField}
              />

              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={!product.withoutDiluent}
                  onValueChange={() => {
                    updateProduct(index, 'withoutDiluent', false);
                  }}
                  label="Diluent"
                />

                <AppCheckBox
                  value={product.withoutDiluent}
                  onValueChange={value => {
                    updateProduct(index, 'withoutDiluent', value);

                    if (value) {
                      updateProduct(index, 'diluent', '');

                      updateProduct(index, 'diluentVolume', '');
                    }
                  }}
                  label="Without Diluent"
                />
              </View>

              {!product.withoutDiluent && (
                <>
                  <Input
                    label="Diluent"
                    value={product.diluent}
                    onChangeText={value =>
                      updateProduct(index, 'diluent', value)
                    }
                    placeholder="Enter Diluent"
                    style={styles.inputField}
                  />

                  <Input
                    label="Diluent Volume (ml)"
                    value={product.diluentVolume}
                    onChangeText={value =>
                      updateProduct(index, 'diluentVolume', value)
                    }
                    placeholder="Enter Volume"
                    keyboardType="numeric"
                    style={styles.inputField}
                  />
                </>
              )}

              <Input
                label="Duration Hours"
                value={product.durationHours}
                onChangeText={value =>
                  updateProduct(index, 'durationHours', value)
                }
                placeholder="Hours"
                keyboardType="numeric"
                style={styles.inputField}
              />

              <Input
                label="Duration Minutes"
                value={product.durationMinutes}
                onChangeText={value =>
                  updateProduct(index, 'durationMinutes', value)
                }
                placeholder="Minutes"
                keyboardType="numeric"
                style={styles.inputField}
              />

              <Input
                label="Frequency Per Day"
                value={product.frequencyPerDay}
                onChangeText={value =>
                  updateProduct(index, 'frequencyPerDay', value)
                }
                placeholder="Enter Frequency"
                keyboardType="numeric"
                style={styles.inputField}
              />

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                Route Of Access
              </AppText>

              <View style={styles.checkboxGroup}>
                <AppCheckBox
                  value={product.centralVenous}
                  onValueChange={value => {
                    updateProduct(index, 'centralVenous', value);

                    if (!value) {
                      updateProduct(index, 'implantedPort', false);

                      updateProduct(index, 'centralCatheter', false);

                      updateProduct(index, 'picc', false);
                    }
                  }}
                  label="Central Venous (CV)"
                />

                <View
                  style={{
                    marginLeft: getScaleSize(15),
                  }}
                >
                  <AppCheckBox
                    disabled={!product.centralVenous}
                    value={product.implantedPort}
                    onValueChange={value => {
                      updateProduct(index, 'implantedPort', value);

                      if (value) {
                        updateProduct(index, 'centralVenous', true);
                      }
                    }}
                    label="Implanted Port"
                  />

                  <AppCheckBox
                    disabled={!product.centralVenous}
                    value={product.centralCatheter}
                    onValueChange={value => {
                      updateProduct(index, 'centralCatheter', value);

                      if (value) {
                        updateProduct(index, 'centralVenous', true);
                      }
                    }}
                    label="Central Catheter"
                  />

                  <AppCheckBox
                    disabled={!product.centralVenous}
                    value={product.picc}
                    onValueChange={value => {
                      updateProduct(index, 'picc', value);

                      if (value) {
                        updateProduct(index, 'centralVenous', true);
                      }
                    }}
                    label="Peripherally Inserted Central Catheter (PICC)"
                  />
                </View>

                <AppCheckBox
                  value={product.perineural}
                  onValueChange={value =>
                    updateProduct(index, 'perineural', value)
                  }
                  label="Perineural"
                />

                <AppCheckBox
                  value={product.peripheralVenous}
                  onValueChange={value =>
                    updateProduct(index, 'peripheralVenous', value)
                  }
                  label="Peripheral Venous"
                />

                <AppCheckBox
                  value={product.subcutaneous}
                  onValueChange={value =>
                    updateProduct(index, 'subcutaneous', value)
                  }
                  label="Subcutaneous"
                />
              </View>

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                Mode Of Administration
              </AppText>

              <View style={styles.checkboxGroup}>
                <AppCheckBox
                  value={product.gravityMode}
                  onValueChange={value =>
                    updateProduct(index, 'gravityMode', value)
                  }
                  label="Gravity"
                />

                <AppCheckBox
                  value={product.elastomericDiffuser}
                  onValueChange={value =>
                    updateProduct(index, 'elastomericDiffuser', value)
                  }
                  label="Elastomeric Diffuser"
                />

                <AppCheckBox
                  value={product.electricInfusionPump}
                  onValueChange={value =>
                    updateProduct(index, 'electricInfusionPump', value)
                  }
                  label="Electric Infusion Pump"
                />
              </View>

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.sectionLabel}
              >
                Patient Must Remain Ambulatory?
              </AppText>

              <View style={[styles.checkboxGroup, { flexDirection: 'row' }]}>
                <AppCheckBox
                  value={product.ambulatoryYes}
                  onValueChange={value => {
                    updateProduct(index, 'ambulatoryYes', value);

                    if (value) {
                      updateProduct(index, 'ambulatoryNo', false);
                    }
                  }}
                  label="Yes"
                />

                <AppCheckBox
                  value={product.ambulatoryNo}
                  onValueChange={value => {
                    updateProduct(index, 'ambulatoryNo', value);

                    if (value) {
                      updateProduct(index, 'ambulatoryYes', false);
                    }
                  }}
                  label="No"
                />
              </View>

              <AppCheckBox
                value={product.preparedInFacility}
                onValueChange={value =>
                  updateProduct(index, 'preparedInFacility', value)
                }
                label="Prepared Under Healthcare Facility Supervision"
              />

              <View style={styles.dateInputsRow}>
                <Input
                  label="Start Date"
                  value={product.startDate}
                  onPress={() => {
                    setPickerType({
                      type: 'startDate',
                      index,
                    });

                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />

                <Input
                  label="End Date"
                  value={product.endDate}
                  onPress={() => {
                    setPickerType({
                      type: 'endDate',
                      index,
                    });

                    setOpen(true);
                  }}
                  placeholder="DD/MM/YYYY"
                  style={styles.halfWidthInput}
                />
              </View>

              <Input
                label="Treatment Duration (Days)"
                value={product.treatmentDurationDays}
                onChangeText={value =>
                  updateProduct(index, 'treatmentDurationDays', value)
                }
                placeholder="Enter Duration"
                keyboardType="numeric"
                style={styles.inputField}
              />

              <Input
                label="Total Number Of Infusions"
                value={product.totalInfusions}
                onChangeText={value =>
                  updateProduct(index, 'totalInfusions', value)
                }
                placeholder="Auto Calculated"
                editable={false}
                style={styles.inputField}
              />

              <AppCheckBox
                value={product.infuseAlone}
                onValueChange={value =>
                  updateProduct(index, 'infuseAlone', value)
                }
                label="If this treatment must be infused ALONE"
              />
            </View>
          ))}

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

              if (pickerType.index !== undefined) {
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

        <WarningSheet ref={warningSheetRef} />
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
