import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import {
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  WarningSheet,
  RequestSummaryCard,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

export interface FreePrescriptionFormProps {
  serviceId: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
}

export interface FreePrescriptionFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  getFormData: () => any;
}

const FreePrescriptionForm = forwardRef<
  FreePrescriptionFormRef,
  FreePrescriptionFormProps
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
  const scrollViewRef = useRef<ScrollView>(null);
  const productPositions = useRef<{ [index: number]: number }>({}).current;
  const lastFirstErrorKey = useRef<string | null>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [state, setState] = useState({
    // Prescription Details
    prescription_date: moment().format('DD/MM/YYYY'),
    therapy_type: '', // 'start' or 'renewal'

    // Patient Information
    patient_last_name: selectedPatient?.lName || '',
    patient_first_name: selectedPatient?.fName || '',
    dob: moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY'),
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

    // Additional Notes
    free_text: '',
  });

  // Hydrate form state from initialData when editing an existing draft
  useEffect(() => {
    if (initialData && initialData.formData) {
      setState(prev => ({
        ...prev,
        ...initialData.formData,
      }));
    }
  }, [initialData]);

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
              if (k === 'therapy_type' && ne.therapyType) delete ne.therapyType;
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
    if (!state.therapy_type) {
      newErrors.therapyType = 'Therapy type is required';
    }

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
    // Always validate first
    const ok = validateForm();
    if (!ok) {
      // Show first error in toast
      const firstErrorKey = lastFirstErrorKey.current || '';
      const firstErrorMessage =
        errors[firstErrorKey] || 'Please fill in all required fields';
      SHOW_TOAST(firstErrorMessage, 'error');

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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

        const response = await serviceRequestApi.createServiceRequest(payload);

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
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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

  const renderSectionHeader = (title: string, icon?: any) => (
    <View style={styles.sectionHeader}>
      {icon && <Image source={icon} style={styles.sectionIcon} />}
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
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
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
              Free Prescription Form
            </AppText>
          </View>

          {/* PRESCRIPTION DETAILS */}
          <FormPrescriptionDetails
            state={state}
            setState={setFormState}
            errors={{
              ...errors,
              prescription_date: errors.prescriptionDate,
              therapy_type: errors.therapyType,
            }}
          />

          {/* PATIENT SECTION */}
          <FormPatientSection
            state={state}
            setState={setFormState}
            errors={errors}
          />

          <FormPrescriberSection state={state} setState={setFormState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection state={state} setState={setFormState} />

          <View style={[styles.card, { elevation: 4 }]}>
            {renderSectionHeader('Additional Notes')}
            <Input
              multiline
              placeholder=".........."
              value={state.free_text}
              onChangeText={text => setFormState({ free_text: text })}
              style={[styles.inputField]}
            />
          </View>

          <FormSignature />
        </ScrollView>
      </View>
      <WarningSheet ref={warningSheetRef} />
    </>
  );
});

export default FreePrescriptionForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    // padding: 16,
    paddingBottom: getScaleSize(100),
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(16),
  },
  headerTextContainer: {
    marginBottom: getScaleSize(8),
    // paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
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
    marginTop: getScaleSize(0),
    marginBottom: getScaleSize(12),
    paddingHorizontal: getScaleSize(0),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  checkboxGroup: {
    marginTop: getScaleSize(4),
    gap: getScaleSize(8),
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
  textArea: {
    minHeight: getScaleSize(120),
    textAlignVertical: 'top',
  },
  actionBar: {
    position: 'absolute',
    left: getScaleSize(0),
    right: getScaleSize(0),
    bottom: getScaleSize(0),
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._E5E7EB,
  },
  actionBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  actionPrimary: {
    flex: 1.5,
    backgroundColor: '#526674',
  },
  actionText: {
    fontSize: getScaleSize(16),
    fontFamily: FONTS.Inter.Bold,
  },
  actionSecondaryText: {
    color: COLORS._1A1D1F,
  },
  actionPrimaryText: {
    color: COLORS.white,
  },
});
