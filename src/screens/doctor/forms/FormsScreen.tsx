import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppDropdown, AppSafeAreaView, AppText, Header, Input, WarningSheet } from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { ActionSheetRef } from 'react-native-actions-sheet';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

const procedureList = [
  { label: 'Wound Dressing', value: 'wound_dressing' },
  { label: 'Debridement', value: 'debridement' },
];

const frequencyList = [
  { label: 'Once', value: 'once' },
  { label: 'Twice', value: 'twice' },
];

const routeList = [
  { label: 'Oral', value: 'oral' },
  { label: 'Injection', value: 'injection' },
];

const FormsScreen: React.FC = () => {

 
   const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const diagnosisRef = useRef<View>(null);
  const treatmentRef = useRef<View>(null);


  const [state, setState] = useState({
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    currentCondition: '',

    procedure: '',
    treatmentGoals: '',

    medicationName: '',
    dosage: '',
    frequency: '',
    route: '',

    clinicalNotes: '',
  });

  const [errors, setErrors] = useState({
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    currentCondition: '',
    procedure: '',
  })

    useEffect(() => {
      // Only show warning for preview/testing
      // const timer = setTimeout(() => {
        warningSheetRef.current?.show();
      // }, 500);
      // return () => clearTimeout(timer);
    }, []);

  // Validation function
  const validateForm = () => {
    const newErrors = {
      primaryDiagnosis: '',
      secondaryDiagnosis: '',
      currentCondition: '',
      procedure: '',
    };

    let hasErrors = false;

    // Validate Primary Diagnosis
    if (!state.primaryDiagnosis.trim()) {
      newErrors.primaryDiagnosis = 'Primary diagnosis is required';
      hasErrors = true;
    }

    // Validate Current Condition
    if (!state.currentCondition.trim()) {
      newErrors.currentCondition = 'Current condition description is required';
      hasErrors = true;
    }

    // Validate Procedure
    if (!state.procedure) {
      newErrors.procedure = 'Procedure selection is required';
      hasErrors = true;
    }

    setErrors(newErrors);
    return hasErrors;
  };

  // Get error count for display
  const getErrorCount = () => {
    return Object.values(errors).filter(error => error !== '').length;
  };

  // Clear specific error when user starts typing
  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Scroll to first error field
  const scrollToFirstError = () => {
    if (errors.primaryDiagnosis || errors.secondaryDiagnosis || errors.currentCondition) {
      diagnosisRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
      });
    } else if (errors.procedure) {
      treatmentRef.current?.measure((x, y, width, height, pageX, pageY) => {
        scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true });
      });
    }
  };

  // Handle submit with validation
  const handleSubmit = () => {
    const hasErrors = !validateForm();
    if (!hasErrors) {
      // Navigate to next screen
      NavigationService.navigate(SCREENS.SIGNATURE_FORM);
    } else {
      // Scroll to first error
      setTimeout(() => scrollToFirstError(), 100);
    }
  };

  return (
    <AppSafeAreaView
    edges={true}
    >
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          isBack
          backIcon={IMAGES.arrowLeft}
          title="Medical Form"

        />
        {/* Error summary toast */}
        {getErrorCount() > 0 && (
          <View style={styles.errorToast}>
            <Image
              source={IMAGES.error_icon}
              style={styles.errorImageIcon}
            />
            <View style={styles.errorToastContent}>
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS.returned}
              >
                Please fix {getErrorCount()} error{getErrorCount() > 1 ? 's' : ''} before submitting
              </AppText>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS.returned}
              >
                Required fields are missing in Diagnosis and Treatment Plan sections.
              </AppText>
            </View>
          </View>
        )}

        <View style={styles.patientInfoCard}>
          <View style={styles.patientAvatarWrap}>
            <Image
              source={{
                uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
              }}
              style={styles.patientAvatar}
            />
          </View>
          <View>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >Robert Fox</AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >Wound Care • Req #8829</AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >Request Status:
              <AppText
                font={FONTS.Inter.SemiBold}
                color={COLORS.submitted}

              > Submitted</AppText>
              {" Form Status:"} <AppText
                font={FONTS.Inter.SemiBold}
                color={COLORS.submitted}

              > Submitted</AppText>
            </AppText>
          </View>
        </View>



        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._6F767E}
          >
            {"Wound Care Form"}
          </AppText>

          <View ref={diagnosisRef} style={[styles.diagnosisCard, (errors.primaryDiagnosis || errors.secondaryDiagnosis || errors.currentCondition) && styles.diagnosisCardError]}>
            <View style={styles.diagnosisHeader}>
              <Image
                source={IMAGES.stethoscopeIcon}
                style={styles.stethoscopeIcon}
              />
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >{"Diagnosis"}</AppText>
            </View>
            <Input
              isMandatory
              label='Primary Diagnosis'
              labelColor={COLORS._1A1D1F}
              labelFont={FONTS.Inter.SemiBold}
              placeholder="Enter ICD-10 or description"
              value={state?.primaryDiagnosis}
              onChangeText={(text) => {
                setState({ ...state, primaryDiagnosis: text });
                clearError('primaryDiagnosis');
              }}
              style={[styles.inputField]}
              placeholderTextColor={COLORS._1A1D1F}
              error={errors.primaryDiagnosis}
              inputWrapperStyle={errors.primaryDiagnosis && styles.inputFieldError}
            />
            <Input
              label='Secondary Diagnosis'
              labelColor={COLORS._1A1D1F}
              labelFont={FONTS.Inter.SemiBold}
              placeholder="Optional secondary diagnosis"
              value={state?.secondaryDiagnosis}
              onChangeText={(text) => {
                setState({ ...state, secondaryDiagnosis: text });
                clearError('secondaryDiagnosis');
              }}
              style={styles.inputField}
              placeholderTextColor={COLORS._1A1D1F}
            />

            <Input
              multiline
              isMandatory
              label='Current Condition '
              labelColor={COLORS._1A1D1F}
              labelFont={FONTS.Inter.SemiBold}
              placeholder="Describe patient's current state..."
              value={state?.currentCondition}
              onChangeText={(text) => {
                setState({ ...state, currentCondition: text });
                clearError('currentCondition');
              }}
              style={styles.inputField}
              inputWrapperStyle={[styles.textArea, errors.currentCondition && { borderColor: COLORS.error, backgroundColor: COLORS.errorBg }]}
              placeholderTextColor={COLORS._1A1D1F}
              error={errors.currentCondition}
            />
          </View>

          <View ref={treatmentRef} style={[styles.diagnosisCard, errors.procedure && styles.diagnosisCardError]}>

            <View style={styles.diagnosisHeader}>
              <Image
                source={IMAGES.treatmentIcon}
                style={styles.stethoscopeIcon}
              />
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >{"Treatment Plan"}</AppText>
            </View>
            <AppDropdown
              label="Procedure / Intervention"
              labelColor={COLORS._1A1D1F}
              labelFont={FONTS.Inter.SemiBold}
              style={styles.inputField}
              isMandatory
              data={procedureList}
              value={state.procedure}
              placeholder="Select procedure..."
              onChange={(val: string | number) => {
                setState({ ...state, procedure: val as string });
                clearError('procedure');
              }}
              error={errors.procedure}
            />

            <Input
              multiline
              label="Treatment Goals"
              placeholder="Expected outcomes..."
              value={state.treatmentGoals}
              onChangeText={(text) =>
                setState({ ...state, treatmentGoals: text })
              }
              style={styles.inputField}
            />
          </View>

          <View style={styles.diagnosisCard}>

            <View style={styles.diagnosisHeader}>
              <Image
                source={IMAGES.stethoscopeIcon}
                style={styles.stethoscopeIcon}
              />
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >{"Medication / Dosage"}</AppText>
            </View>
            <View style={styles.rowGap}>
              <View style={styles.col2}>
                <Input
                  label="Medication"
                  placeholder="Name"
                  value={state.medicationName}
                  onChangeText={(text) =>
                    setState({ ...state, medicationName: text })
                  }
                  style={styles.inputField}
                />
              </View>

              <View style={styles.col2}>
                <Input
                  label="Dosage"
                  placeholder="e.g. 50mg"
                  value={state.dosage}
                  onChangeText={(text) =>
                    setState({ ...state, dosage: text })
                  }
                  style={styles.inputField}
                />
              </View>
            </View>

            <View style={styles.rowGap}>
              <View style={styles.col2}>
                <AppDropdown
                  label="Frequency"
                  labelColor={COLORS._1A1D1F}
                  labelFont={FONTS.Inter.SemiBold}
                  data={frequencyList}
                  value={state.frequency}
                  placeholder="Select"
                  onChange={(val: string | number) =>
                    setState({ ...state, frequency: val as string })
                  }
                />
              </View>

              <View style={styles.col2}>
                <AppDropdown
                  label="Route"
                  labelColor={COLORS._1A1D1F}
                  labelFont={FONTS.Inter.SemiBold}
                  data={routeList}
                  value={state.route}
                  placeholder="Select"
                  onChange={(val: string | number) =>
                    setState({ ...state, route: val as string })
                  }
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addBtn}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.primary}
              >+ Add Medication</AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sticky action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionSecondary]}
            activeOpacity={0.85}
            onPress={()=>
       warningSheetRef?.current?.show()
            }
          >
            <Text style={[styles.actionText, styles.actionSecondaryText]}>
              Save Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={[styles.actionText, styles.actionPrimaryText]}>
              Update & Sign
            </Text>
          </TouchableOpacity>
        </View>
      </View>
        <WarningSheet ref={warningSheetRef} />
    </AppSafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._E5E7EB,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
    backgroundColor: COLORS._E5E7EB
  },
  patientAvatarWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    overflow: 'hidden',
    backgroundColor: '#E8EDF1',
  },
  patientAvatar: {
    width: '100%',
    height: '100%',
  },
  errorStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FF4D4F',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    gap: 12,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  required: {
    color: '#FF4D4F',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    position: 'relative',
  },
  inputMultiline: {
    minHeight: 88,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FFF1F0',
  },
  inputReadonly: {
    backgroundColor: '#F1F5F9',
  },
  placeholder: {
    fontSize: 14,
    color: '#6F767E',
  },
  placeholderReadonly: {
    color: '#526674',
  },
  select: {
    paddingRight: 36,
  },
  selectIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -8 }],
    color: '#6F767E',
    fontSize: 16,
  },
  selectIconError: {
    color: '#FF4D4F',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorIcon: {
    fontSize: 12,
    color: '#FF4D4F',
  },
  errorToast: {
    backgroundColor: COLORS.errorBg,
    borderBottomColor: COLORS.returned,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 11,
    color: '#FF4D4F',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12,
    marginTop: getScaleSize(12)
  },
  col2: {
    flex: 1,
  },
  addBtn: {
    marginTop: getScaleSize(12),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#526674',
    height: getScaleSize(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F4F7',
  },
  addBtnIcon: {
    fontSize: 16,
    color: '#526674',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526674',
  },
  errorToastBody: {
    fontSize: 12,
    color: '#FF4D4F',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 6,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  actionPrimary: {
    flex: 1.5,
    backgroundColor: '#526674',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionSecondaryText: {
    color: '#1A1D1F',
  },
  actionPrimaryText: {
    color: '#FFFFFF',
  },
  // New styles for inline styles
  headerStyle: {
    paddingHorizontal: getScaleSize(27),
    backgroundColor: COLORS.white,
  },
  errorImageIcon: {
    height: getScaleSize(18),
    width: getScaleSize(18),
  },
  errorToastIcon: {
    fontSize: 16,
    color: '#FF4D4F',
    marginTop: 2,
  },
  errorToastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF4D4F',
    marginBottom: 2,
  },
  errorToastContent: {
    flex: 1,
  },
  patientInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    gap: getScaleSize(12),
    backgroundColor: COLORS.white,
  },
  diagnosisCard: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  stethoscopeIcon: {
    height: getScaleSize(20),
    width: getScaleSize(20),
  },
  inputField: {
    marginTop: getScaleSize(12),
    paddingHorizontal: 0,
  },
  textArea: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  diagnosisCardError: {
    borderColor: COLORS.error,
    // backgroundColor: COLORS.errorBg,
    borderWidth: 1,
  },
  inputFieldError: {
    backgroundColor: COLORS.errorBg
  }
});

export default FormsScreen;
