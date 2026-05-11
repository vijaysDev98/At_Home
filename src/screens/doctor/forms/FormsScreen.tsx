import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { SHOW_TOAST } from '../../../constant/showToast';
import { ServiceDetailInfo, ServiceInfo, ServiceRequest, ServiceRequestDetail } from '../../../services/serviceRequestListApi';

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

export type CreateRequestStep3Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateRequestStep3'
>;

const FormsScreen: React.FC = () => {
  const route = useRoute();
  const request: ServiceRequest = (route.params as any)?.request;
  const requestId = request?.id;


  // Extract service and patient from request object
  const service: ServiceInfo = request?.service || {};
  const patientData = request?.patient || {};


  const serviceId = service?._id;
  const serviceName = service?.serviceName;
  const serviceIcon = getServiceIcon(serviceName);

  // Use patient from request, or fallback to Redux
  const [isLoading, setIsLoading] = useState(false);
  const [requestData, setRequestData] = useState<ServiceRequestDetail | null>(null);

  // Form refs for different service types
  const formRefs = useRef<{ [key: string]: any }>({});

  // Fetch service request details when in view mode
  useEffect(() => {
    if (requestId) {
      fetchServiceRequestDetails();
    }
  }, [requestId]);

  const fetchServiceRequestDetails = async () => {
    setIsLoading(true);
    try {
      const response = await API.Instance.get(`/service-requests/${requestId}`);
      if (response?.data?.status) {
        setRequestData(response.data.data);
        console.log('Service request details:', response);
        console.log('Form data to pre-fill:', response.data.data?.formData);
      } else {
        SHOW_TOAST('Failed to fetch service request details', 'error');
      }
    } catch (error: any) {
      console.log('Error fetching service request:', error);
      SHOW_TOAST(error?.message || 'Failed to fetch service request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    const activeFormRef = formRefs.current[serviceId];

    if (activeFormRef && activeFormRef.validateAndSubmit) {
      const isValid = await activeFormRef.validateAndSubmit();

      if (isValid) {
        const formData = activeFormRef.getFormData();
        // Navigate back after successful submission
        // setTimeout(() => {
        NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, { screen: 'DoctorRequest' });
        // }, 1500);
      }
    } else {
      // Fallback for forms that don't support ref forwarding yet
    }
  };

  const handleSaveAsDraft = () => {
    // navigation.goBack()
  };

  return (
    <AppSafeAreaView edges={true}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
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
              size={getScaleSize(16)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >
              Medical Form
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
            {/* Patient Info Header */}
            <FormRequestHeader
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
                    ref={(ref: any) => {
                      formRefs.current[serviceId] = ref;
                    }}
                  // initialData={isViewMode ? requestData?.formData : undefined}
                  />
                ) : serviceId === '69ef359fd1c1c4252d4b8d4f' ? (
                  <AntibiotherapyInfusionForm
                    ref={(ref: any) => {
                      formRefs.current[serviceId] = ref;
                    }}
                    serviceId={serviceId}
                    onLoadingChange={setIsLoading}
                    initialData={requestData}
                    patient={patientData}
                  />
                ) : serviceId === '69ef359fd1c1c4252d4b8d4d' ? (
                  <CNOForm
                    ref={(ref: any) => {
                      formRefs.current[serviceId] = ref;
                    }}
                  // initialData={isViewMode ? requestData?.formData : undefined}
                  />
                ) : serviceId === '69ef3557d1c1c4252d4b8d2c' ? (
                  <ArtificialNutritionForm
                    ref={(ref: any) => {
                      formRefs.current[serviceId] = ref;
                    }}
                    serviceId={serviceId}
                    onLoadingChange={setIsLoading}
                  // initialData={isViewMode ? requestData?.formData : undefined}
                  />
                ) : serviceId === '69eb112a056b86c571c1a44f' ? (
                  <FreePrescriptionForm
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == '69ef3592d1c1c4252d4b8d4a' ? (
                  <HydrationInfusionForm
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == '69ef353fd1c1c4252d4b8d22' ? (
                  <HydrationInfusionForm title={'IV Therapy Prescription Form'}
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == '69ef354cd1c1c4252d4b8d27' ? (
                  <MedicalOxygen
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == "69ef356cd1c1c4252d4b8d36" ? (
                  <PcaForm
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == "69ef357cd1c1c4252d4b8d40" ? (
                  <HydrationInfusionForm title='Parenteral Nutrition (Central Line) Prescription Form'
                  // initialData={isViewMode ? requestData?.formData : undefined}
                  />
                ) : serviceId == "69ef3563d1c1c4252d4b8d31" ? (
                  <PersonalHygieneCare
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == "69ef3534d1c1c4252d4b8d1d" ? (
                  <WoundCareForm
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                ) : serviceId == "69ef3575d1c1c4252d4b8d3b" ?
                  <HydrationInfusionForm title={'Pregnancy-Related Care Prescription Form'}
                  // initialData={isViewMode ? requestData?.formData : undefined} 
                  />
                  : (
                    <></>
                  )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.backBtn}
              onPress={() => handleSaveAsDraft()}
            >
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Save as Draft
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.nextBtn,
                // && styles.nextDisabled
              ]}
              // disabled={!canProceed}
              onPress={() => handleSubmitRequest()}
            >
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                Submit Request
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    shadowColor: '#000',
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
    backgroundColor: '#e8edf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconWrap: {
    backgroundColor: '#e7eef3',
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
    borderColor: '#efefef',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  priorityRoutine: {
    borderColor: '#526674',
    backgroundColor: '#e8edf1',
  },
  priorityUrgent: {
    borderColor: '#ffb800',
    backgroundColor: '#fff7e6',
  },
  priorityEmergency: {
    borderColor: '#ff4d4f',
    backgroundColor: '#ffecec',
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
    borderColor: '#efefef',
    backgroundColor: '#ffffff',
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
  nextBtn: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDisabled: {
    opacity: 0.6,
  },
});

export default FormsScreen;
