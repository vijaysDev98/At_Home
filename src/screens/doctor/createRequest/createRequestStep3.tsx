import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionSheetRef } from 'react-native-actions-sheet';
import {
  AppSafeAreaView,
  AppText,
  Input,
  RequestSummaryCard,
  AppLoader,
  ProviderOptionSheet,
  SelectProviderSheet,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { SCREENS } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation';
import { STRING } from '../../../constant';
import { REQUEST_STATUS } from '../../../constant/RequestStatus';
import NavigationService from '../../../navigation/NavigationService';

// Import all form components
import { getServiceIcon } from './createRequestStep2';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import ServiceFormRenderer from '../forms/ServiceFormRenderer';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../../../constant/getRole';

export type CreateRequestStep3Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateRequestStep3'
>;

const CreateRequestStep3: React.FC<CreateRequestStep3Props> = ({ route }) => {
  const { t } = useTranslation();

  const service = route?.params?.selected || {};
  const patientId = route?.params?.patientId;
  const doctorId = route?.params?.doctorId;
  const selectedDoctor = route?.params?.selectedDoctor;
  const initialData = (route?.params as any)?.initialData; // Existing request data if editing
  const requestStatus = (route?.params as any)?.requestStatus; // 'draft', 'submitted', or undefined for new

  const serviceId =
    service?.id ||
    service?._id ||
    initialData?.serviceId?._id ||
    (typeof initialData?.serviceId === 'string'
      ? initialData?.serviceId
      : initialData?.serviceId?.id) ||
    initialData?.service?.id ||
    initialData?.service?._id;
  const serviceName =
    service?.serviceName ||
    initialData?.serviceId?.serviceName ||
    initialData?.service?.serviceName;
  const serviceIcon = getServiceIcon(serviceName);

  // Get profile data to determine role
  const profileData = useSelector((state: any) => state.profile.profileData);
  let role: string = profileData?.roles?.[0] || '';

  // Fetch patient from Redux using patientId
  const allPatients = useSelector((state: any) => state.patient.patients);
  const selectedPatient = useSelector(
    (state: any) => state.patient.selectedPatient,
  );

  // Use selectedPatient from Redux, or find from patients list if needed
  const patient =
    selectedPatient ||
    allPatients?.find((p: any) => p.id === patientId || p._id === patientId);

  // Use global loader state from Redux
  const isLoading = useSelector((state: RootState) => state.common.isLoading);

  // Ref to store form ref
  const formRef = useRef<any>(null);

  // Sheet refs for provider selection
  const providerOptionSheetRef = useRef<ActionSheetRef>(null);
  const selectProviderSheetRef = useRef<ActionSheetRef>(null);

  const rawAssignedProvider =
    (route?.params as any)?.assignedProviderId ||
    (route?.params as any)?.assignedProvider;
  const assignedProviderId =
    typeof rawAssignedProvider === 'object'
      ? rawAssignedProvider?.id || rawAssignedProvider?._id
      : rawAssignedProvider;
  const preRequestId = (route?.params as any)?.preRequestId;
  const isFillFormFlow = Boolean(
    (route?.params as any)?.fromPreRequest || preRequestId,
  );
  const [doctorData, setDoctorData] = useState<any>(
    selectedDoctor || (route?.params as any)?.doctor || null,
  );

  useEffect(() => {
    const fetchPreRequestDoctor = async () => {
      const targetId = preRequestId || (initialData as any)?._id || (initialData as any)?.id;
      if (targetId) {
        try {
          const details = await serviceRequestApi.getServiceRequestDetails(targetId);
          if (details) {
            const doc =
              details.doctor ||
              details.doctorId ||
              details.createdBy 
            if (doc && typeof doc === 'object') {
              setDoctorData(doc);
            }
          }
        } catch (e) {
          console.log('Error fetching pre-request doctor details:', e);
        }
      }
    };
    fetchPreRequestDoctor();
  }, [preRequestId, initialData]);

  // Determine button labels based on request status
  const isNewRequest = !initialData && !requestStatus;
  const isDraftRequest =
    requestStatus === REQUEST_STATUS.DRAFT ||
    requestStatus === 'draft' ||
    initialData?.status === REQUEST_STATUS.DRAFT ||
    initialData?.status === 'draft';
  const isDoctor =
    role === ROLES.DOCTOR || (role !== ROLES.PROVIDER && !selectedDoctor);
  const isFirstTimeDoctorRequest =
    !assignedProviderId && (isNewRequest || isDraftRequest) && isDoctor;
  const isSubmitted = requestStatus === REQUEST_STATUS.SUBMITTED;

  const leftButtonLabel = isNewRequest
    ? t(STRING.saveAsDraft)
    : t(STRING.saveProgress);
  const rightButtonLabel = isSubmitted
    ? t(STRING.updateAndSign)
    : t(STRING.submitRequest);

  // Button handlers - call the form's methods via ref
  const handleLeftButtonPress = async () => {
    if (formRef.current?.saveAsDraft) {
      await formRef.current.saveAsDraft();
    }
  };

  const handleRightButtonPress = async () => {
    if (preRequestId || assignedProviderId) {
      if (formRef.current?.validateAndSubmit) {
        await formRef.current.validateAndSubmit({
          providerId: assignedProviderId,
          preRequestId: preRequestId,
        });
      }
      return;
    }

    if (isFirstTimeDoctorRequest) {
      // 1. Validate form fields first if validateForm is available
      if (formRef.current?.validateForm) {
        const isValid = formRef.current.validateForm();
        if (!isValid) {
          return;
        }
      }
      // 2. Open provider option selection sheet
      providerOptionSheetRef.current?.show();
    } else {
      // Existing submission flow unchanged
      if (formRef.current?.validateAndSubmit) {
        await formRef.current.validateAndSubmit();
      }
    }
  };

  const handleSendToAllProviders = async () => {
    providerOptionSheetRef.current?.hide();
    if (formRef.current?.validateAndSubmit) {
      await formRef.current.validateAndSubmit();
    }
  };

  const handleSendToSpecificProvider = () => {
    providerOptionSheetRef.current?.hide();
    setTimeout(() => {
      selectProviderSheetRef.current?.show(serviceId);
    }, 250);
  };

  const handleProviderSelected = async (provider: any) => {
    const selectedProviderId = provider?.id || provider?._id;
    if (formRef.current?.validateAndSubmit) {
      await formRef.current.validateAndSubmit({
        providerId: selectedProviderId,
      });
    }
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <AppLoader visible={isLoading} />
        <View style={styles.header}>
          <View style={{ flex: 0.5 }}>
            <TouchableOpacity
              style={styles.circleBtn}
              activeOpacity={0.8}
              onPress={() => NavigationService.goBack()}
            >
              <Image source={IMAGES.arrowLeft} style={styles.crossIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >
              {t(STRING.createRequest)}
            </AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
              align="center"
            >
              {t(
                role === ROLES.PROVIDER && !isFillFormFlow
                  ? STRING.step4Of4
                  : STRING.step3Of3,
              )}
            </AppText>
          </View>
          <View style={{ flex: 0.5 }} />
        </View>

        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                gap: getScaleSize(14),
                paddingVertical: getScaleSize(18),
                backgroundColor: COLORS.white,
                paddingHorizontal: getScaleSize(16),
                borderBottomWidth: 1.5,
                borderColor: COLORS._EFEFEF,
              }}
            >
              <RequestSummaryCard
                patient={patient}
                serviceTitle={serviceName}
                serviceIcon={serviceIcon}
                showEdit={true}
                onEditService={() => NavigationService.goBack()}
                onEditPatient={() =>
                  NavigationService.navigate(SCREENS.ADD_PATIENT, { patient })
                }
                // rightContent={
                //   <View style={{ flex: 1 }}>
                //     {/* This will be handled by a context or global state */}
                //   </View>
                // }
              />
            </View>
            <View>
              <View
                style={{
                  backgroundColor: COLORS._F9FAFB,
                }}
              >
                {/* Dynamic Form Content */}
                <ServiceFormRenderer
                  serviceId={serviceId || ''}
                  formRef={formRef}
                  initialData={initialData}
                  patient={patient}
                  prescriber={
                    doctorData || selectedDoctor || profileData
                  }
                />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Floating Bottom Buttons */}
        <View style={styles.bottomBar}>
          {!isFillFormFlow && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.saveBtn}
              onPress={handleLeftButtonPress}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                align="center"
              >
                {leftButtonLabel}
              </AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.submitBtn, isFillFormFlow && { flex: 1 }]}
            onPress={handleRightButtonPress}
          >
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {rightButtonLabel}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Provider Selection Bottom Sheet (All vs Specific) */}
        <ProviderOptionSheet
          ref={providerOptionSheetRef}
          onSendToAll={handleSendToAllProviders}
          onSendToSpecific={handleSendToSpecificProvider}
        />

        {/* 80% Occupancy Non-Draggable Bottom Sheet with Selection and Submit/Cancel Buttons */}
        <SelectProviderSheet
          ref={selectProviderSheetRef}
          serviceId={serviceId}
          onSelectProvider={handleProviderSelected}
        />
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    // shadowColor: COLORS.black,
    // shadowOpacity: 0.04,
    // shadowRadius: 4,
    // elevation: 1,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    resizeMode: 'contain',
  },

  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 2,
  },

  content: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS._F9FAFB,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    backgroundColor: COLORS._F9FAFB,
    // paddingHorizontal: 20,
    paddingBottom: 160,
    // paddingTop: 12,
    gap: 18,
  },
  sectionTitleRow: {
    marginTop: 6,
    backgroundColor: COLORS.white,
  },
  summaryCard: {
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    paddingVertical: getScaleSize(14),
    paddingHorizontal: getScaleSize(17),
    gap: getScaleSize(12),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRowDivider: {
    height: getScaleSize(1),
    backgroundColor: COLORS._EFEFEF,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  avatarWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._E8EDF1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconWrap: {
    backgroundColor: COLORS._EDF2F7,
  },
  summaryTextBlock: {
    gap: getScaleSize(2),
  },
  formGroup: {
    gap: getScaleSize(10),
  },
  priorityRow: {
    flexDirection: 'row',
    gap: getScaleSize(10),
  },
  priorityPill: {
    flex: 1,
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  priorityRoutine: {
    borderColor: COLORS._526674,
    backgroundColor: COLORS._E8EDF1,
  },
  priorityUrgent: {
    borderColor: COLORS._F59E0B,
    backgroundColor: COLORS._FFF4E5,
  },
  priorityEmergency: {
    borderColor: COLORS._B42318,
    backgroundColor: COLORS._FEF2F2,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  inputBlock: {
    flex: 1,
    gap: getScaleSize(8),
  },
  inputField: {
    paddingHorizontal: getScaleSize(0),
  },
  textArea: {
    minHeight: getScaleSize(110),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(12),
    textAlignVertical: 'top',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    padding: getScaleSize(16),
    gap: getScaleSize(16),
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
    elevation: 10,
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
  nextBtn: {
    flex: 1.4,
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
  nextDisabled: {
    opacity: 0.6,
  },
});

export default CreateRequestStep3;
