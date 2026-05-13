import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppSafeAreaView,
  AppText,
  Input,
  RequestSummaryCard,
  AppLoader,
  Header,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import moment from 'moment';
import { RootStackParamList } from '../../../navigation';
import { STRING } from '../../../constant';
import { API } from '../../../api';
import { REQUEST_STATUS } from '../../../constant/RequestStatus';
import { SHOW_TOAST } from '../../../constant/showToast';
import {
  ServiceDetailInfo,
  ServiceInfo,
  ServiceRequest,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

// Import all form components
import AntibiotherapyInfusionForm from '../forms/AntibiotherapyInfusionForm';
import ArtificialNutritionForm from '../forms/ArtificialNutritionForm';
import CNOForm from '../forms/CNOForm';
import FreePrescriptionForm from '../forms/FreePrescriptionForm';
import GenericForm from '../forms/FreePrescriptionForm';
import HydrationInfusionForm from '../forms/HydrationInfusion';
import MedicalOxygen from '../forms/MedicalOxygen';
import PcaForm from '../forms/PcaForm';
import PersonalHygieneCare from '../forms/PersonalHygieneCare';
import PregnancyCareForm from '../forms/PregnancyCareForm';
import WoundCareForm from '../forms/WoundCareForm';
import FormRequestHeader from '../../../components/FormRequestHeader';
import { getServiceIcon } from '../createRequest/createRequestStep2';

const FormReviewScreen: React.FC = () => {
  const route = useRoute();
  console.log('route.params', route.params);

  const request: ServiceRequest = (route.params as any)?.request;
  const requestId = request?.id;

  // Use patient from request, or fallback to Redux
  const [requestData, setRequestData] = useState<ServiceRequestDetail | any>(
    request || null,
  );

  // Use global loader state from Redux
  const isLoading = useSelector((state: RootState) => state.common.isLoading);

  // Ref to store form ref
  const formRef = useRef<any>(null);

  // Map patient data if needed (fullName to fName/lName)
  const patientData = useMemo(() => {
    return request?.patient || requestData?.patient || {};
  }, [request, requestData]);

  const isReadOnly = useMemo(() => {
    return (
      requestData?.status === REQUEST_STATUS.SUBMITTED ||
      request?.status === REQUEST_STATUS.SUBMITTED
    );
  }, [requestData, request]);

  // Button handlers - call the form's methods via ref
  const handleLeftButtonPress = async () => {
    NavigationService.goBack();
  };

  const handleRightButtonPress = async () => {
    if (formRef.current?.validateAndSubmit) {
      await formRef.current.validateAndSubmit();
    }
  };

  const service = requestData?.service || request?.service || {};
  const serviceId = service?._id || service?.id;
  const serviceName = service?.serviceName;

  // Fetch service request details when in view mode
  useEffect(() => {
    // Only fetch if we don't have complete data already
    if (requestId && !requestData?.formData) {
      fetchServiceRequestDetails();
    }
  }, [requestId]);

  const fetchServiceRequestDetails = async () => {
    try {
      const response = await API.Instance.get(`/service-requests/${requestId}`);
      if (response?.data?.status) {
        setRequestData(response.data.data);
        console.log('Service request details fetched:', response);
      } else {
        SHOW_TOAST('Failed to fetch service request details', 'error');
      }
    } catch (error: any) {
      console.log('Error fetching service request:', error);
      SHOW_TOAST(error?.message || 'Failed to fetch service request', 'error');
    }
  };

  return (
    <AppSafeAreaView edges={true}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        <Header title="Review & Sign" isBack={true} style={styles.header} />
        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Patient Info Header */}
            <FormRequestHeader
              fromReview={true}
              patientData={patientData}
              serviceName={serviceName}
              requestData={requestData}
            />

            <View>
              <View
                style={{
                  // paddingHorizontal: getScaleSize(16),
                  backgroundColor: COLORS._F9FAFB,
                }}
              >
                {/* Dynamic Form Content */}
                {serviceId == '69ef3589d1c1c4252d4b8d45' ? (
                  <CNOForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId === '69ef359fd1c1c4252d4b8d4f' ? (
                  <AntibiotherapyInfusionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef3557d1c1c4252d4b8d2c' ? (
                  <ArtificialNutritionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId === '69eb112a056b86c571c1a44f' ? (
                  <FreePrescriptionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef3592d1c1c4252d4b8d4a' ? (
                  <HydrationInfusionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef353fd1c1c4252d4b8d22' ? (
                  <HydrationInfusionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                    title={'IV Therapy Prescription Form'}
                  />
                ) : serviceId == '69ef354cd1c1c4252d4b8d27' ? (
                  <MedicalOxygen
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef356cd1c1c4252d4b8d36' ? (
                  <PcaForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef357cd1c1c4252d4b8d40' ? (
                  <HydrationInfusionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                    title="Parenteral Nutrition (Central Line) Prescription Form"
                  />
                ) : serviceId == '69ef3563d1c1c4252d4b8d31' ? (
                  <PersonalHygieneCare
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef3534d1c1c4252d4b8d1d' ? (
                  <WoundCareForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId == '69ef3575d1c1c4252d4b8d3b' ? (
                  <HydrationInfusionForm
                    readOnly={isReadOnly}
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                    title={'Pregnancy-Related Care Prescription Form'}
                  />
                ) : (
                  <></>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Floating Bottom Buttons */}
        {/* {!isReadOnly && ( */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.saveBtn}
            onPress={handleLeftButtonPress}
          >
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              Edit Form
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.submitBtn}
            onPress={handleRightButtonPress}
          >
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {'Submit Form'}
            </AppText>
          </TouchableOpacity>
        </View>
        {/* )} */}
      </View>
      <AppLoader visible={isLoading} />
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
    shadowColor: COLORS.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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

export default FormReviewScreen;
