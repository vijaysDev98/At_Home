import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import {
  AppSafeAreaView,
  AppText,
  Input,
  RequestSummaryCard,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import FreePrescriptionForm from '../forms/FreePrescriptionForm';
import HomeInfusionForm from '../forms/HomeInfusionForm';
import EnteralNutritionForm from '../forms/EnteralNutritionForm';
import NursingCareForm from '../forms/NursingCareForm';
import PCAInfusionForm from '../forms/PCAInfusionForm';
import PregnancyCareForm from '../forms/PregnancyCareForm';
import ParenteralNutritionForm from '../forms/ParenteralNutritionForm';
import OralNutritionForm from '../forms/OralNutritionForm';
import OxygenTherapyForm from '../forms/OxygenTherapyForm';
import WoundCareForm from '../forms/WoundCareForm';

export type CreateRequestStep3Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateRequestStep3'
>;

const CreateRequestStep3: React.FC<CreateRequestStep3Props> = ({ route }) => {
  const serviceId = (route.params as any)?.serviceId || 'wound';

  const serviceTitle = useMemo(() => {
    switch (serviceId) {
      case 'prescription':
        return 'Free Prescription';
      case 'iv':
        return 'Home Infusion';
      case 'oxygen':
        return 'Short-term Oxygen Therapy';
      case 'pca':
        return 'PCA Infusion';
      case 'pregnancy':
        return 'Pregnancy Care';
      case 'parenteral':
        return 'Parenteral Nutrition';
      case 'oral_nutrition':
        return 'Oral Nutrition';
      case 'nursing':
        return 'Nursing Care';
      case 'physio':
        return 'Physiotherapy';
      case 'enteral':
        return 'Enteral Nutrition';
      case 'lab':
        return 'Lab Collection';
      default:
        return 'Wound Care';
    }
  }, [serviceId]);

  const serviceIcon = useMemo(() => {
    switch (serviceId) {
      case 'prescription':
        return IMAGES.ivfIcon;
      case 'iv':
        return IMAGES.ivfIcon;
      case 'oxygen':
        return IMAGES.maskIcon;
      case 'pca':
        return IMAGES.ivfIcon;
      case 'pregnancy':
        return IMAGES.nurseIcon;
      case 'parenteral':
        return IMAGES.ivfIcon;
      case 'oral_nutrition':
        return IMAGES.ivfIcon;
      case 'nursing':
        return IMAGES.nurseIcon;
      case 'physio':
        return IMAGES.injectionIcon;
      case 'enteral':
        return IMAGES.ivfIcon;
      case 'lab':
        return IMAGES.testTubeIcon;
      default:
        return IMAGES.bandegeIcon;
    }
  }, [serviceId]);

  const [state, setState] = useState({
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    currentCondition: '',
  });

  const handleSubmitRequest = () => {
    console.log('state', state);
    NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, { screen: 'Forms' });
  };

  const handleSaveAsDraft = () => {
    // navigation.goBack()
  };

  return (
    <AppSafeAreaView>
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
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >
              Create Request
            </AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >
              Step 3/3: Fill Medical Form
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
                paddingTop: getScaleSize(18),
                paddingBottom: getScaleSize(12),
                backgroundColor: COLORS.white,
                paddingHorizontal: getScaleSize(16),
              }}
            >
              <RequestSummaryCard
                patientName="Robert Fox"
                patientMeta="ID: PT-8829 • 65 yrs"
                patientAvatar="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                serviceTitle={serviceTitle}
                serviceIcon={serviceIcon}
              />
            </View>
            <View>
              <View
                style={{
                  paddingHorizontal: getScaleSize(16),
                  backgroundColor: COLORS._F9FAFB,
                }}
              >
                {/* Dynamic Form Content */}
                {serviceId === 'prescription' ? (
                  <FreePrescriptionForm />
                ) : serviceId === 'wound' ? (
                  <WoundCareForm />
                ) : serviceId === 'oxygen' ? (
                  <OxygenTherapyForm />
                ) : serviceId === 'iv' ? (
                  <HomeInfusionForm />
                ) : serviceId === 'enteral' ? (
                  <EnteralNutritionForm />
                ) : serviceId === 'nursing' ? (
                  <NursingCareForm />
                ) : serviceId === 'pca' ? (
                  <PCAInfusionForm />
                ) : serviceId === 'pregnancy' ? (
                  <PregnancyCareForm />
                ) : serviceId === 'parenteral' ? (
                  <ParenteralNutritionForm />
                ) : serviceId === 'oral_nutrition' ? (
                  <OralNutritionForm />
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

export default CreateRequestStep3;
