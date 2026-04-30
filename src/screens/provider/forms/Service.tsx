import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import {
  AppBottomSheet,
  AppButton,
  AppText,
  Input,
  ReviewRequestSheet,
  CompleteServiceSheet,
} from '../../../components';
import { ActionSheetRef } from 'react-native-actions-sheet';

interface RouteParams {
  requestStatus?: string;
  formStatus?: string;
  patientName?: string;
  service?: string;
  requestId?: string;
}

const SERVICE_TYPES = [
  'Routine Checkup',
  'Wound Care',
  'Blood Draw',
  'Physical Therapy',
  'Post-Op Care',
  'Vitals Check',
];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'returned':
      return COLORS.error;
    case 'submitted':
    case 'signed':
      return '#2F80ED';
    case 'inprogress':
    case 'in progress':
      return '#F2994A';
    default:
      return COLORS._6F767E;
  }
};

const ServiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};

  const requestStatus = params.requestStatus || 'InProgress';
  const formStatus = params.formStatus || 'Signed';
  const patientName = params.patientName || 'Alice Smith';
  const service = params.service || 'Post-Op Wound Care';
  const requestId = params.requestId || 'SR-2023-10456';

  const [visitDate, setVisitDate] = useState('2023-10-25');
  const [serviceType, setServiceType] = useState('Routine Checkup');
  const [clinicalNotes, setClinicalNotes] = useState(
    'Patient showed stable vitals. No new complaints. Continued current medication plan.',
  );
  const [servicePickerVisible, setServicePickerVisible] = useState(false);

  // Action sheet refs
  const reviewSheetRef = useRef<ActionSheetRef>(null);
  const completeSheetRef = useRef<ActionSheetRef>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image source={IMAGES.arrow_back} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.headerWrapper}>
            <View style={styles.headerCenter}>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Service
              </AppText>
              <TouchableOpacity
                style={styles.openFormBtn}
                onPress={() =>
                  navigation.navigate(
                    'ProviderForm' as never,
                    {
                      mode: 'update',
                      requestStatus,
                      formStatus,
                    } as never,
                  )
                }
                activeOpacity={0.8}
              >
                <AppText
                  size={getScaleSize(10)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  View Form
                </AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.statusRow}>
              <AppText size={getScaleSize(11)} color={COLORS._6F767E}>
                Request Status:{' '}
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.Bold}
                  color={getStatusColor(requestStatus)}
                >
                  {requestStatus}
                </AppText>
              </AppText>
              <View style={styles.statusDivider} />
              <AppText size={getScaleSize(11)} color={COLORS._6F767E}>
                Form Status:{' '}
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.Bold}
                  color={getStatusColor(formStatus)}
                >
                  {formStatus}
                </AppText>
              </AppText>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Patient Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={IMAGES.ic_profile} style={styles.cardIcon} />
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Patient Details
              </AppText>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <AppText
                    font={FONTS.Inter.Regular}
                    size={getScaleSize(12)}
                    color={COLORS._6B7280}
                  >
                    Name
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    {patientName}
                  </AppText>
                </View>
                <View style={styles.gridItem}>
                  <AppText
                    font={FONTS.Inter.Regular}
                    size={getScaleSize(12)}
                    color={COLORS._6B7280}
                  >
                    DOB
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    05/12/1980
                  </AppText>
                </View>
              </View>
              <View style={[styles.gridRow, { marginTop: getScaleSize(14) }]}>
                <View style={styles.gridItem}>
                  <AppText
                    font={FONTS.Inter.Regular}
                    size={getScaleSize(12)}
                    color={COLORS._6B7280}
                  >
                    Service Requested
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    {service}
                  </AppText>
                </View>
                <View style={styles.gridItem}>
                  <AppText
                    font={FONTS.Inter.Regular}
                    size={getScaleSize(12)}
                    color={COLORS._6B7280}
                  >
                    Request ID
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    {requestId}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Service Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={IMAGES.ic_file} style={styles.cardIcon} />
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Service Details
              </AppText>
            </View>
            <View style={styles.cardBody}>
              <Input
                label="Visit Date"
                value={visitDate}
                isLocked
                style={styles.formInput}
                leftIcon={IMAGES.ic_calender}
              />
              <Input
                label="Service Type"
                value={serviceType}
                isLocked
                style={styles.formInput}
              />
              <Input
                label="Clinical Notes"
                value={clinicalNotes}
                isLocked
                multiline
                numberOfLines={4}
                style={styles.formInput}
                inputStyle={styles.notesInput}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <AppButton
            title="Request Review"
            onPress={() => reviewSheetRef.current?.show()}
            style={styles.bottomBtn}
          />
          <AppButton
            title="Mark as Completed"
            leftIcon={IMAGES.ic_doubleTick}
            leftIconStyle={{ tintColor: COLORS.white }}
            onPress={() => completeSheetRef.current?.show()}
            style={[
              styles.bottomBtn,
              {
                backgroundColor: COLORS._10B981,
              },
            ]}
          />
        </View>

        {/* ── Request Review Action Sheet ─────────────────────────── */}
        <ReviewRequestSheet
          ref={reviewSheetRef}
          onSend={(reason, details) => {
            console.log('Send for review:', { reason, details });
          }}
        />

        {/* ── Complete Service Action Sheet ────────────────────────── */}
        <CompleteServiceSheet
          ref={completeSheetRef}
          onComplete={() => {
            navigation.navigate('ServiceCompleted', {
              patientName: route.params?.patientName,
              requestId: route.params?.requestId,
              serviceType: route.params?.service,
              duration: '45 mins', // Static for demo as in screenshot
              doctorName: 'Sarah Jenkins', // Static for demo
              completedDate: new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              }),
            });
          }}
        />

        {/* No Picker Modal here (Display only) */}
      </View>
    </SafeAreaView>
  );
};

export default ServiceScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    gap: getScaleSize(10),
  },
  backBtn: {
    padding: getScaleSize(4),
  },
  backIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
  },
  headerWrapper: {
    flex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getScaleSize(2),
    flexWrap: 'wrap',
    gap: getScaleSize(4),
  },
  statusDivider: {
    width: 1,
    height: getScaleSize(10),
    backgroundColor: COLORS._EFEFEF,
    marginHorizontal: getScaleSize(4),
  },
  openFormBtn: {
    backgroundColor: COLORS._526674,
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(5),
    borderRadius: getScaleSize(8),
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(20),
    gap: getScaleSize(16),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getScaleSize(16),
    // borderBottomWidth: 1,
    // borderBottomColor: '#F1F5F9',
    gap: getScaleSize(10),
  },
  cardIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS._6F767E,
    resizeMode: 'contain',
  },
  cardBody: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(16),
    gap: getScaleSize(0),
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    gap: getScaleSize(4),
  },
  formInput: {
    paddingHorizontal: 0,
    marginBottom: getScaleSize(14),
  },
  arrowIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: COLORS._6F767E,
    resizeMode: 'contain',
  },
  notesInput: {
    textAlignVertical: 'top',
  },
  footer: {
    padding: getScaleSize(16),
    gap: getScaleSize(10),
  },
  bottomBtn: {
    height: getScaleSize(52),
    borderRadius: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtn: {
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    backgroundColor: '#27AE60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  picker: {
    width: '100%',
  },
});

const sheetStyles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  centeredContent: {
    alignItems: 'center',
    paddingVertical: getScaleSize(10),
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: COLORS.white,
  },
  chipActive: {
    borderColor: '#94A3B8',
    backgroundColor: '#F8FAFC',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    height: 140,
    backgroundColor: '#F8FAFC',
  },
  textareaInput: {
    flex: 1,
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
    padding: 0,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  cancelBtn: {
    flex: 4,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    flex: 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  androidPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    backgroundColor: 'transparent',
    color: 'transparent',
    zIndex: 10,
  },
});
