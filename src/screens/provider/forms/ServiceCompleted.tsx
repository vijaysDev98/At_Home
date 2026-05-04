import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import AppText from '../../../components/AppText';
import NavigationService from '../../../navigation/NavigationService';

const ServiceCompletedScreen: React.FC = () => {
  const route = useRoute<any>();

  // Extracting data from route params or using dummy data for demo
  const {
    patientName = 'Alice Smith',
    requestId = 'SR-2023-10456',
    serviceType = 'Post-Op Wound Care',
    duration = '45 mins',
    doctorName = 'Sarah Jenkins',
    completedDate = 'Oct 24, 2023 at 11:45 AM',
  } = route.params || {};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => NavigationService.goBack()}
          style={styles.backBtn}
        >
          <Image source={IMAGES.arrow_back} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <AppText
            font={FONTS.Inter.Bold}
            size={getScaleSize(20)}
            color={COLORS._526674}
            style={styles.headerTitle}
          >
            Service Completed
          </AppText>
          <View style={styles.headerStatusRow}>
            <AppText size={getScaleSize(12)} color={COLORS._6B7280}>
              Request Status:{' '}
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Bold}
                color={COLORS._10B981}
              >
                Completed
              </AppText>
            </AppText>
            <AppText size={getScaleSize(12)} color={COLORS._6B7280}>
              Form Status:{' '}
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Bold}
                color="#629DFF"
              >
                Signed
              </AppText>
            </AppText>
          </View>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Card */}
        <View style={styles.successCard}>
          <View style={styles.successTopBar} />
          <View style={styles.successContent}>
            <View style={styles.checkContainer}>
              <Image
                source={IMAGES.serviceCompletedCheck}
                style={styles.checkIcon}
              />
            </View>

            <AppText
              font={FONTS.Inter.Bold}
              size={getScaleSize(32)}
              color={COLORS._1A1D1F}
              style={styles.successTitle}
            >
              Service Completed
            </AppText>

            <AppText
              size={getScaleSize(14)}
              color={COLORS._6F767E}
              align="center"
              style={styles.successDesc}
            >
              This service has been completed and the record is now locked.
            </AppText>

            <View style={styles.timePill}>
              <Image
                source={IMAGES.serviceCompletedClock}
                style={styles.pillIcon}
              />
              <AppText size={getScaleSize(12)} color={COLORS._64748B}>
                Completed on {completedDate}
              </AppText>
            </View>

            <View style={styles.doctorPill}>
              <Image
                source={IMAGES.serviceCompletedDoctor}
                style={styles.doctorIcon}
              />
              <AppText
                size={getScaleSize(12)}
                color={COLORS.submitted}
                font={FONTS.Inter.Medium}
              >
                Doctor: {doctorName}
              </AppText>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image
              source={IMAGES.serviceSummaryIcon}
              style={styles.summaryIcon}
            />
            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(14)}
              color={COLORS._1A1D1F}
            >
              Service Summary
            </AppText>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
                  Patient Name
                </AppText>
                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {patientName}
                </AppText>
              </View>
              <View style={[styles.gridItem, { alignItems: 'flex-end' }]}>
                <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
                  Request ID
                </AppText>
                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {requestId}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
                  Service Type
                </AppText>
                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {serviceType}
                </AppText>
              </View>
              <View style={[styles.gridItem, { alignItems: 'flex-end' }]}>
                <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
                  Duration
                </AppText>
                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {duration}
                </AppText>
              </View>
            </View>

            <View style={styles.providerSection}>
              <AppText
                size={getScaleSize(11)}
                color={COLORS._6B7280}
                style={{ marginBottom: 8 }}
              >
                Provider
              </AppText>
              <View style={styles.providerRow}>
                <Image
                  source={IMAGES.serviceCompletedAvatar}
                  style={styles.providerAvatar}
                />
                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {doctorName}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Recorded Vitals Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image
              source={IMAGES.serviceVitalsIcon}
              style={styles.vitalsTitleIcon}
            />
            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(14)}
              color={COLORS._1A1D1F}
            >
              Recorded Vitals
            </AppText>
          </View>

          <View style={styles.vitalsGrid}>
            <View style={styles.vitalsRow}>
              <VitalsItem label="Blood Pressure" value="120/80" unit="mmHg" />
              <VitalsItem label="Temperature" value="98.6" unit="°F" />
            </View>
            <View style={styles.vitalsRow}>
              <VitalsItem label="Heart Rate" value="72" unit="bpm" />
              <VitalsItem label="Oxygen Level" value="98" unit="%" />
            </View>
          </View>
        </View>

        {/* Clinical Notes Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image
              source={IMAGES.serviceNotesIcon}
              style={styles.summaryIcon}
            />
            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(14)}
              color={COLORS._1A1D1F}
            >
              Clinical Notes
            </AppText>
          </View>
          <View style={styles.notesBox}>
            <AppText
              size={getScaleSize(14)}
              color={COLORS._6F767E}
              style={{ lineHeight: 22 }}
            >
              Patient showed stable vitals. No new complaints. Continued current
              medication plan. Advised to stay hydrated and maintain light
              physical activity. Next follow-up recommended in 4 weeks.
            </AppText>
          </View>
        </View>

        {/* Attachments Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image
              source={IMAGES.serviceAttachmentsIcon}
              style={styles.summaryIcon}
            />
            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(14)}
              color={COLORS._1A1D1F}
            >
              Attachments
            </AppText>
          </View>
          <View style={styles.attachmentsList}>
            <AttachmentItem
              name="wound_healing_day5.jpg"
              meta="Added today, 10:15 AM • 2.4 MB"
              iconBg="#EFF6FF"
            />
            <AttachmentItem
              name="consent_form_signed.pdf"
              meta="Added today, 09:30 AM • 1.1 MB"
              iconBg="#FEF2F2"
            />
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Image
              source={IMAGES.serviceViewActionIcon}
              style={styles.actionIcon}
            />
            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
            >
              View Form
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary}>
            <Image
              source={IMAGES.serviceDownloadActionIcon}
              style={styles.actionIcon}
            />
            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
            >
              Download PDF
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Sub-components for cleaner structure
const VitalsItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) => (
  <View style={styles.vitalsItem}>
    <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
      {label}
    </AppText>
    <View style={styles.vitalsValueRow}>
      <AppText
        font={FONTS.Inter.Bold}
        size={getScaleSize(16)}
        color={COLORS._1A1D1F}
      >
        {value}
      </AppText>
      <AppText size={getScaleSize(10)} color={COLORS._6B7280}>
        {unit}
      </AppText>
    </View>
  </View>
);

const AttachmentItem = ({
  name,
  meta,
  iconBg,
}: {
  name: string;
  meta: string;
  iconBg: string;
}) => (
  <View style={styles.attachmentRow}>
    <View style={[styles.attachmentIconWrap, { backgroundColor: iconBg }]}>
      <Image
        source={
          name.includes('.pdf')
            ? IMAGES.serviceAttachmentPdfIcon
            : IMAGES.serviceAttachmentJpgIcon
        }
        style={styles.attachmentIcon}
      />
    </View>
    <View style={styles.attachmentInfo}>
      <AppText
        font={FONTS.Inter.Medium}
        size={getScaleSize(14)}
        color={COLORS._1A1D1F}
      >
        {name}
      </AppText>
      <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
        {meta}
      </AppText>
    </View>
    <TouchableOpacity>
      <Image source={IMAGES.serviceEyeIcon} style={styles.viewIcon} />
    </TouchableOpacity>
  </View>
);

export default ServiceCompletedScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    height: getScaleSize(79),
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(17),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  backBtn: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: getScaleSize(14),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._1A1A1A,
  },
  headerContent: {
    justifyContent: 'center',
    gap: getScaleSize(2),
  },
  headerTitle: {
    lineHeight: getScaleSize(28),
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: getScaleSize(16),
    gap: getScaleSize(20),
    paddingBottom: getScaleSize(128),
  },
  successCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  successTopBar: {
    height: 8,
    backgroundColor: COLORS.completed,
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: getScaleSize(25),
    paddingVertical: getScaleSize(24),
  },
  checkContainer: {
    width: getScaleSize(64),
    height: getScaleSize(64),
    borderRadius: getScaleSize(32),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    marginBottom: getScaleSize(14),
  },
  checkIcon: {
    width: getScaleSize(30),
    height: getScaleSize(30),
    resizeMode: 'contain',
  },
  successTitle: {
    marginBottom: getScaleSize(8),
    lineHeight: getScaleSize(28),
  },
  successDesc: {
    marginBottom: getScaleSize(14),
    paddingHorizontal: getScaleSize(8),
    lineHeight: getScaleSize(20),
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: getScaleSize(13),
    height: getScaleSize(30),
    borderRadius: getScaleSize(8),
    gap: getScaleSize(8),
    marginBottom: getScaleSize(10),
  },
  pillIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
  },
  doctorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: getScaleSize(13),
    height: getScaleSize(30),
    borderRadius: getScaleSize(8),
    gap: getScaleSize(8),
  },
  doctorIcon: {
    width: getScaleSize(15),
    height: getScaleSize(12),
    resizeMode: 'contain',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: getScaleSize(16),
    padding: getScaleSize(17),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(16),
    borderBottomWidth: 1,
    paddingBottom: getScaleSize(13),
    borderColor: '#F9FAFB',
  },
  summaryIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
  },
  vitalsTitleIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
  },
  summaryGrid: {
    gap: getScaleSize(16),
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: getScaleSize(13),
    borderColor: '#F9FAFB',
  },
  gridItem: {
    flex: 1,
    gap: getScaleSize(2),
  },
  providerSection: {
    paddingTop: getScaleSize(2),
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  providerAvatar: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    borderRadius: getScaleSize(12),
    backgroundColor: '#F1F5F9',
  },
  vitalsGrid: {
    gap: getScaleSize(16),
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: getScaleSize(16),
  },
  vitalsItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F9FAFB',
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(13),
    paddingVertical: getScaleSize(12),
    gap: getScaleSize(4),
  },
  vitalsValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: getScaleSize(4),
  },
  notesBox: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F9FAFB',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(13),
  },
  attachmentsList: {
    gap: getScaleSize(8),
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#F9FAFB',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(13),
    gap: getScaleSize(12),
  },
  attachmentIconWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  attachmentInfo: {
    flex: 1,
    gap: 2,
  },
  viewIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    marginTop: getScaleSize(2),
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: getScaleSize(12),
    height: getScaleSize(72),
    gap: getScaleSize(6),
  },
  actionIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
});
