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
import { AppSafeAreaView, AppText, Input } from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

export type CreateRequestStep3Props = NativeStackScreenProps<RootStackParamList, 'CreateRequestStep3'>;

const CreateRequestStep3: React.FC<CreateRequestStep3Props> = () => {
  const [state, setState] = useState({
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    currentCondition: '',
  })

  const handleSubmitRequest = () => {
    console.log("state", state);
    NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, { screen: 'Forms' })
  }

  const handleSaveAsDraft = () => {
    // navigation.goBack()
  }

  return (
    <AppSafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.circleBtn}
            activeOpacity={0.8}
            onPress={() => NavigationService.goBack()}
          >
            <Image
              source={IMAGES.arrowLeft}
              style={styles.crossIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >Create Request</AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >Step 2/3: Service</AppText>
          </View>
        </View>


        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={{
              gap: getScaleSize(14),
              paddingTop: getScaleSize(18),
              paddingBottom: getScaleSize(12), backgroundColor: COLORS.white, paddingHorizontal: getScaleSize(16)
            }}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._6F767E}
              >Request Summary</AppText>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLeft}>
                    <View style={styles.avatarWrap}>
                      <Image
                        source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                        style={{ height: getScaleSize(40), width: getScaleSize(40), borderRadius: getScaleSize(20) }}
                      />
                    </View>
                    <View style={styles.summaryTextBlock}>
                      <AppText
                        size={getScaleSize(14)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                      >Robert Fox</AppText>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                      >ID: PT-8829 • 65 yrs</AppText>
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.8}>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._526674}
                    >Edit</AppText>
                  </TouchableOpacity>
                </View>

                <View style={styles.summaryRowDivider} />

                <View style={styles.summaryRow}>
                  <View style={styles.summaryLeft}>
                    <View style={[styles.avatarWrap, styles.serviceIconWrap]}>
                      <Image
                        source={IMAGES.bandegeIcon}
                        style={{ height: getScaleSize(40), width: getScaleSize(40), borderRadius: getScaleSize(20) }}
                      />
                    </View>
                    <View style={styles.summaryTextBlock}>
                      <AppText
                        size={getScaleSize(14)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                      >Wound Care</AppText>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                      >Primary Service</AppText>
                    </View>
                  </View>
                  <TouchableOpacity activeOpacity={0.8}>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._526674}
                    >Edit</AppText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View>
              <View style={{
                paddingHorizontal: getScaleSize(16),
                paddingVertical: getScaleSize(16),
                gap: getScaleSize(16),
              }}>

                {/* Title */}
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._6F767E}
                >
                  Wound Care Form
                </AppText>

                {/* Card */}
                <View style={{
                  backgroundColor: COLORS._F8F9FA,
                  borderRadius: getScaleSize(16),
                  borderWidth: 1,
                  borderColor: COLORS._EFEFEF,
                  padding: getScaleSize(16),
                  gap: getScaleSize(16),
                }}>

                  {/* Diagnosis Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                    label='Primary Diagnosis'
                    labelColor={COLORS._1A1D1F}
                    labelFont={FONTS.Inter.SemiBold}
                    placeholder="Enter ICD-10 or description"
                    value={state?.primaryDiagnosis}
                    onChangeText={(text) => setState({ ...state, primaryDiagnosis: text })}
                    style={styles.inputField}
                    placeholderTextColor={COLORS._1A1D1F}
                  />


                  {/* Secondary Diagnosis */}
                  <Input
                    label='Secondary Diagnosis'
                    labelColor={COLORS._1A1D1F}
                    labelFont={FONTS.Inter.SemiBold}
                    placeholder="Optional secondary diagnosis"
                    value={state?.secondaryDiagnosis}
                    onChangeText={(text) => setState({ ...state, secondaryDiagnosis: text })}
                    style={styles.inputField}
                    placeholderTextColor={COLORS._1A1D1F}
                  />

                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._1A1D1F}
                  >Current Condition</AppText>
                  <TextInput
                    placeholder="Describe patient's current state..."
                    value={state?.currentCondition}
                    onChangeText={(text) => setState({ ...state, currentCondition: text })}
                    style={styles.textArea}
                    multiline
                    placeholderTextColor={COLORS._1A1D1F}
                  />

                </View>

              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity
              activeOpacity={0.9} style={styles.backBtn} onPress={() => handleSaveAsDraft()}>
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >Save as Draft</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.nextBtn,
                // && styles.nextDisabled

              ]}
              // disabled={!canProceed}
              onPress={() => handleSubmitRequest()}
            >
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >Submit Request</AppText>
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
    backgroundColor: '#f8f9fa',
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
    flex: 1,
  },

  content: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS._E5E7EB
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal: 20,
    paddingBottom: 160,
    // paddingTop: 12,
    gap: 18,
  },
  sectionTitleRow: {
    marginTop: 6,
    backgroundColor: COLORS.white
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
    height: 1,
    backgroundColor: '#efefef',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8edf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconWrap: {
    backgroundColor: '#e7eef3',
  },
  summaryTextBlock: {
    gap: 2,
  },
  formGroup: {
    gap: 10,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
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
    gap: 12,
  },
  inputBlock: {
    flex: 1,
    gap: 8,
  },
  inputField: {
    paddingHorizontal: 0
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
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
  },
  backBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1.4,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDisabled: {
    opacity: 0.6,
  },
});

export default CreateRequestStep3;
