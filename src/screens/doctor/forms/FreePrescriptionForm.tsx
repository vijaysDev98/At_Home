import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import moment from 'moment';
import { AppText, Input } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant/showToast';
import {
  handleFormSubmit,
  handleSaveAsDraft,
  handleUpdateAndSign,
  handleSaveProgress,
  handleSubmitForReview,
  handleEditForm,
} from './formActionHandlers';

import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import CheckBox from '@react-native-community/checkbox';
import {
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
} from '../../../components';
import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';
import {
  PatientInfo,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

export interface FreePrescriptionFormProps {
  serviceId: string;
  initialData?: ServiceRequestDetail | null;
  patient?: PatientInfo;
  readOnly?: boolean;
}

export interface FreePrescriptionFormRef {
  validateAndSubmit: () => Promise<void>;
  saveAsDraft: () => Promise<void>;
  updateAndSign: () => Promise<{ success: boolean; error?: string }>;
  saveProgress: () => Promise<{ success: boolean; error?: string }>;
  getFormData: () => any;
}

const FreePrescriptionForm = forwardRef<
  FreePrescriptionFormRef,
  FreePrescriptionFormProps
>(({ serviceId, initialData, patient, readOnly = false }, ref) => {
  const dispatch = useDispatch();

  const reduxPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  const selectedPatient = initialData ? patient : reduxPatient;
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const lastFirstErrorKey = useRef<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [state, setState] = useState({
    // Prescription Details
    prescription_date: '',
    therapy_type: '', // 'start' or 'renewal'

    // Patient Information
    patient_last_name: selectedPatient?.lName || '',
    patient_first_name: selectedPatient?.fName || '',
    dob: moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY'),
    weight: selectedPatient?.weight?.toString() || '',
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
    if (!state?.prescription_date) {
      newErrors.prescription_date = STRING.prescriptionDateRequired;
    }

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
      scrollRef: scrollViewRef,
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
      scrollRef: scrollViewRef,
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
      scrollRef: scrollViewRef,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle save progress (using centralized handler)
  const saveProgress = async () => {
    return await handleSaveProgress({
      dispatch,
      state,
      initialData,
      validateForm,
      scrollRef: scrollViewRef,
      lastFirstErrorKey,
      errors,
    });
  };

  // Handle submit for review (using centralized handler)
  const submitForReview = async () => {
    return await handleSubmitForReview({
      dispatch,
      state,
      initialData,
      validateForm,
      scrollRef: scrollViewRef,
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
      scrollRef,
      lastFirstErrorKey,
      errors,
    });
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    validateAndSubmit,
    saveAsDraft,
    saveProgress,
    editForm,
    submitForReview,
    updateAndSign,
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
              {STRING.freePrescription}
            </AppText>
          </View>

          {/* PRESCRIPTION DETAILS */}
          <FormPrescriptionDetails
            readOnly={readOnly}
            state={state}
            setState={setFormState}
            errors={errors}
          />

          {/* PATIENT SECTION */}
          <FormPatientSection
            readOnly={readOnly}
            state={state}
            setState={setFormState}
            errors={errors}
          />

          <FormPrescriberSection state={state} setState={setFormState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection
            readOnly={readOnly}
            state={state}
            setState={setFormState}
          />

          <View style={[styles.card, { elevation: 4 }]}>
            {renderSectionHeader(STRING.additionalNotes)}
            <Input
              isLocked={readOnly}
              multiline
              placeholder="Enter Additional Notes"
              value={state.free_text}
              onChangeText={text => setFormState({ free_text: text })}
              maxLength={1000}
              style={[styles.inputField]}
            />
          </View>

          {/* <FormSignature readOnly={readOnly} /> */}
        </ScrollView>
      </View>
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
    paddingBottom: getScaleSize(20),
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
