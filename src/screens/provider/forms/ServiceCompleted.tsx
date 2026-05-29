import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';

import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import AppText from '../../../components/AppText';
import NavigationService from '../../../navigation/NavigationService';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { API_BASE_URL } from '../../../api/apiRoutes';
import HeaderProvider, {
  openPdfInBrowser,
} from '../../../components/HeaderProvider';
import { AppLoader, ProfileAvatar } from '../../../components';
import { downloadPdfFromUrl } from '../../../hooks/pdfDownloader';
import { useTranslation } from 'react-i18next';
import { STRING } from '../../../constant';

const ServiceCompletedScreen: React.FC = () => {
  const route = useRoute<any>();
  const { t } = useTranslation();
  const requestId = route?.params?.request?.id || route?.params?.requestId;

  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState<any>(null);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestApi.getServiceRequestDetails(
        requestId || '',
      );

      if (response) {
        setRequestData(response);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  const patientName = requestData?.patientId
    ? `${requestData?.patientId?.fName || ''} ${requestData?.patientId?.lName || ''
    }`
    : '-';

  const providerName = requestData?.assignedProviderId
    ? `${requestData?.assignedProviderId?.fName || ''} ${requestData?.assignedProviderId?.lName || ''
    }`
    : '-';

  const doctorName = requestData?.doctorId
    ? `${requestData?.doctorId?.fName || ''} ${requestData?.doctorId?.lName || ''
    }`
    : '-';

  const completedDate = requestData?.updatedAt
    ? moment(requestData?.updatedAt).format('MMM DD, YYYY')
    : '-';

  const serviceType = requestData?.serviceId?.serviceName || '-';

  const dob = requestData?.patientId?.dateOfBirth
    ? moment(requestData?.patientId?.dateOfBirth).format('DD/MM/YYYY')
    : '-';

  const weight = requestData?.patientId?.weight || '-';


  return (
    <SafeAreaView style={styles.safe}>
      <HeaderProvider
        title={t(STRING.serviceCompleted)}
        isBack
        style={styles.header}
        status={requestData?.status}
        formStatus={requestData?.formStatus}
      />

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
              {t(STRING.serviceCompleted)}
            </AppText>

            <AppText
              size={getScaleSize(14)}
              color={COLORS._6F767E}
              align="center"
              style={styles.successDesc}
            >
              {t(STRING.serviceCompletedDescription)}
            </AppText>

            <View style={styles.timePill}>
              <Image
                source={IMAGES.serviceCompletedClock}
                style={styles.pillIcon}
              />

              <AppText size={getScaleSize(12)} color={COLORS._64748B}>
                {t(STRING.completedOn)} {completedDate}
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
                {t(STRING.doctor)}: {doctorName}
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
              {t(STRING.serviceSummary)}
            </AppText>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
                  {t(STRING.patientName)}
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
                  {t(STRING.requestId)}
                </AppText>

                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                  numberOfLines={1}
                  allowFontScaling
                  adjustsFontSizeToFit
                >
                  {requestData?.requestId || '-'}
                </AppText>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
                  {t(STRING.serviceType)}
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
                  {t(STRING.priority)}
                </AppText>

                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {requestData?.priorityLevel || '-'}
                </AppText>
              </View>
            </View>

            <View style={styles.providerSection}>
              <AppText
                size={getScaleSize(11)}
                color={COLORS._6B7280}
                style={{ marginBottom: 8 }}
              >
                {t(STRING.provider)}
              </AppText>

              <View style={styles.providerRow}>
                <ProfileAvatar size="small" name={providerName} />

                <AppText
                  font={FONTS.Inter.Medium}
                  size={getScaleSize(14)}
                  color={COLORS._1A1D1F}
                >
                  {providerName}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Patient Details */}
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
              {t(STRING.patientDetails)}
            </AppText>
          </View>

          <View style={styles.vitalsGrid}>
            <View style={styles.vitalsRow}>
              <VitalsItem
                label={t(STRING.gender)}
                value={requestData?.patientId?.gender || '-'}
              />
              <VitalsItem label={t(STRING.weight)} value={`${weight} kg`} />
            </View>

            <View style={styles.vitalsRow}>
              <VitalsItem label={t(STRING.dateOfBirth)} value={dob} />
              <VitalsItem
                label={t(STRING.phone)}
                value={requestData?.patientId?.phoneNumber || '-'}
              />
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => {
              if (requestData?.signedPdfUrl) {
                openPdfInBrowser(API_BASE_URL + requestData?.signedPdfUrl);
              }
            }}
          >
            <Image
              source={IMAGES.serviceViewActionIcon}
              style={styles.actionIcon}
            />

            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
            >
              {t(STRING.viewForm)}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={async () => {
              if (requestData?.signedPdfUrl) {
                await downloadPdfFromUrl(API_BASE_URL + requestData?.signedPdfUrl);
              }
            }}
          >
            <Image
              source={IMAGES.serviceDownloadActionIcon}
              style={styles.actionIcon}
            />

            <AppText
              font={FONTS.Inter.SemiBold}
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
            >
              {t(STRING.downloadPdf)}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppLoader visible={loading} />
    </SafeAreaView>
  );
};

const VitalsItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.vitalsItem}>
    <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
      {label}
    </AppText>

    <View style={styles.vitalsValueRow}>
      <AppText
        font={FONTS.Inter.Bold}
        size={getScaleSize(15)}
        color={COLORS._1A1D1F}
      >
        {value}
      </AppText>
    </View>
  </View>
);

export default ServiceCompletedScreen;

// KEEP YOUR EXISTING STYLES

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    // height: getScaleSize(79),
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
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
