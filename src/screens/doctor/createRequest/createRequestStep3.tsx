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
import { SCREENS } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation';
import { STRING } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';

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
import { getServiceIcon } from './createRequestStep2';

export type CreateRequestStep3Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateRequestStep3'
>;

const CreateRequestStep3: React.FC<CreateRequestStep3Props> = ({ route }) => {
  const service = route?.params?.selected || {};
  const patientId = route?.params?.patientId;
  const initialData = (route?.params as any)?.initialData; // Existing request data if editing
  const requestStatus = (route?.params as any)?.requestStatus; // 'draft', 'submitted', or undefined for new

  const serviceId = service?.id;
  const serviceName = service?.serviceName;
  const serviceIcon = getServiceIcon(serviceName);

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

  const [state, setState] = useState({
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    currentCondition: '',
  });

  // Ref to store form ref
  const formRef = useRef<any>(null);

  // Determine button labels based on request status
  const isNewRequest = !initialData && !requestStatus;
  const isDraft = requestStatus === 'draft';
  const isSubmitted = requestStatus === 'submitted';

  const leftButtonLabel = isNewRequest ? 'Save as Draft' : 'Save Progress';
  const rightButtonLabel = isSubmitted ? 'Update & Sign' : 'Submit Request';

  // Button handlers - call the form's methods via ref
  const handleLeftButtonPress = async () => {
    if (formRef.current?.saveAsDraft) {
      await formRef.current.saveAsDraft();
    }
  };

  const handleRightButtonPress = async () => {
    if (formRef.current?.validateAndSubmit) {
      await formRef.current.validateAndSubmit();
    }
  };

  return (
    <AppSafeAreaView edges={true}>
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
              {STRING.createRequest}
            </AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >
              {STRING.step3Of3}
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
              />
            </View>
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
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId === '69ef359fd1c1c4252d4b8d4f' ? (
                  <AntibiotherapyInfusionForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId === '69ef359fd1c1c4252d4b8d4d' ? (
                  <CNOForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId === '69ef3557d1c1c4252d4b8d2c' ? (
                  <ArtificialNutritionForm
                    serviceId={serviceId}
                    ref={formRef}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId === '69eb112a056b86c571c1a44f' ? (
                  <FreePrescriptionForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId == '69ef3592d1c1c4252d4b8d4a' ? (
                  <HydrationInfusionForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId == '69ef353fd1c1c4252d4b8d22' ? (
                  <HydrationInfusionForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                    title={'IV Therapy Prescription Form'}
                  />
                ) : serviceId == '69ef354cd1c1c4252d4b8d27' ? (
                  <MedicalOxygen
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId == '69ef356cd1c1c4252d4b8d36' ? (
                  <PcaForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId == '69ef357cd1c1c4252d4b8d40' ? (
                  <HydrationInfusionForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                    title="Parenteral Nutrition (Central Line) Prescription Form"
                  />
                ) : serviceId == '69ef3563d1c1c4252d4b8d31' ? (
                  <PersonalHygieneCare
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId == '69ef3534d1c1c4252d4b8d1d' ? (
                  <WoundCareForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                  />
                ) : serviceId == '69ef3575d1c1c4252d4b8d3b' ? (
                  <HydrationInfusionForm
                    ref={formRef}
                    serviceId={serviceId || ''}
                    initialData={initialData}
                    patient={patient}
                    title={'Pregnancy-Related Care Prescription Form'}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: COLORS._F8F9FA,
                      borderRadius: getScaleSize(16),
                      borderWidth: 1,
                      borderColor: COLORS._EFEFEF,
                      padding: getScaleSize(16),
                      gap: getScaleSize(16),
                    }}
                  >
                    {/* Diagnosis Header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Image
                        source={IMAGES.stethoscopeIcon}
                        style={{ width: 20, height: 20 }}
                      />
                      <AppText
                        size={getScaleSize(16)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                      >
                        Diagnosis
                      </AppText>
                    </View>

                    {/* Primary Diagnosis */}
                    <Input
                      label="Primary Diagnosis"
                      labelColor={COLORS._1A1D1F}
                      labelFont={FONTS.Inter.SemiBold}
                      placeholder="Enter ICD-10 or description"
                      value={state?.primaryDiagnosis}
                      onChangeText={text =>
                        setState({ ...state, primaryDiagnosis: text })
                      }
                      style={styles.inputField}
                      placeholderTextColor={COLORS._1A1D1F}
                    />

                    {/* Secondary Diagnosis */}
                    <Input
                      label="Secondary Diagnosis"
                      labelColor={COLORS._1A1D1F}
                      labelFont={FONTS.Inter.SemiBold}
                      placeholder="Optional secondary diagnosis"
                      value={state?.secondaryDiagnosis}
                      onChangeText={text =>
                        setState({ ...state, secondaryDiagnosis: text })
                      }
                      style={styles.inputField}
                      placeholderTextColor={COLORS._1A1D1F}
                    />

                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.SemiBold}
                      color={COLORS._1A1D1F}
                    >
                      Current Condition
                    </AppText>
                    <TextInput
                      placeholder="Describe patient's current state..."
                      value={state?.currentCondition}
                      onChangeText={text =>
                        setState({ ...state, currentCondition: text })
                      }
                      style={styles.textArea}
                      multiline
                      placeholderTextColor={COLORS._1A1D1F}
                    />
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Floating Bottom Buttons */}
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
              {leftButtonLabel}
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
              {rightButtonLabel}
            </AppText>
          </TouchableOpacity>
        </View>
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
