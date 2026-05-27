import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, ProfileAvatar } from '.';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { PatientInfo } from '../services/serviceRequestListApi';
import { ServiceRequestDetail } from '../services/serviceRequestListApi';
import { FORM_STATUS, STRING } from '../constant';
import { DISPLAY_FORM_STATUS } from '../constant/RequestStatus';
import { useTranslation } from 'react-i18next';

interface FormRequestHeaderProps {
  patientData?: PatientInfo;
  serviceName?: string;
  requestData?: ServiceRequestDetail | null;
  fromReview?: boolean;
}

// ─── Shared status badges row ─────────────────────────────────────────────────
const StatusBadges: React.FC<{
  requestData?: ServiceRequestDetail | null;
  fromReview?: boolean;
}> = ({ requestData, fromReview }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.statusRow}>
      <View style={styles.statusBadge}>
        <AppText
          size={getScaleSize(12)}
          color={COLORS._526674}
          font={FONTS.Inter.Regular}
        >
          {t(STRING.requestStatus)}:
        </AppText>
        <AppText
          size={getScaleSize(12)}
          color={COLORS[requestData?.status]}
          font={FONTS.Inter.SemiBold}
          style={styles.statusValue}
        >
          {t(DISPLAY_FORM_STATUS[requestData?.status] ||
            t(DISPLAY_FORM_STATUS[FORM_STATUS.DRAFT]))}
        </AppText>
      </View>

      <View style={styles.statusBadge}>
        <AppText
          size={getScaleSize(12)}
          color={COLORS._526674}
          font={FONTS.Inter.Regular}
        >
          {t(STRING.formStatus)}:
        </AppText>
        <AppText
          size={getScaleSize(12)}
          color={
            COLORS[
            fromReview
              ? FORM_STATUS.AWAITING_SIGNATURE
              : requestData?.formStatus
            ]
          }
          font={FONTS.Inter.SemiBold}
          style={styles.statusValue}
        >
          {fromReview
            ? t(DISPLAY_FORM_STATUS[FORM_STATUS.AWAITING_SIGNATURE])
            : t(DISPLAY_FORM_STATUS[requestData?.formStatus] || 'Draft')}
        </AppText>
      </View>
    </View>
  );
};

// ─── With avatar (Doctor view) ────────────────────────────────────────────────
const FormRequestHeader: React.FC<FormRequestHeaderProps> = ({
  patientData,
  serviceName,
  requestData,
  fromReview = false,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ProfileAvatar
          name={`${patientData?.fullName}`}
          size="medium"
          backgroundColor={COLORS._E5E7EB}
        />
        <View style={styles.detailsContainer}>
          <AppText
            size={getScaleSize(16)}
            color={COLORS._1A1D1F}
            font={FONTS.Inter.Bold}
            numberOfLines={1}
          >
            {`${patientData?.fullName}` || t(STRING.patient)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._526674}
            font={FONTS.Inter.Regular}
            numberOfLines={1}
          >
            {serviceName} • ID #
            {(requestData?._id || requestData?.id)?.slice(-4).toUpperCase() || ''}
          </AppText>
          <StatusBadges requestData={requestData} fromReview={fromReview} />
        </View>
      </View>
    </View>
  );
};

// ─── Without avatar (Provider view) ──────────────────────────────────────────
const FormRequestHeaderForProvider: React.FC<FormRequestHeaderProps> = ({
  patientData,
  serviceName,
  requestData,
  fromReview = false,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        <AppText
          size={getScaleSize(16)}
          color={COLORS._1A1D1F}
          font={FONTS.Inter.Bold}
          numberOfLines={1}
        >
          {`${patientData?.fullName}` || t(STRING.patient)}
        </AppText>
        <AppText
          size={getScaleSize(13)}
          color={COLORS._526674}
          font={FONTS.Inter.Regular}
          numberOfLines={1}
        >
          {serviceName} • ID #
          {(requestData?._id || requestData?.id)?.slice(-4).toUpperCase() || ''}
        </AppText>
        <StatusBadges requestData={requestData} fromReview={fromReview} />
      </View>
    </View>
  );
};

export default FormRequestHeader;
export { FormRequestHeaderForProvider };

const styles = StyleSheet.create({
  container: {
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    gap: getScaleSize(4),
    // flex: 1 ensures the container never exceeds available width,
    // preventing children from overflowing off-screen
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',       // badges wrap to next line instead of clipping
    gap: getScaleSize(8),
    marginTop: getScaleSize(4),
  },
  statusBadge: {
    flexDirection: 'row',
    flexShrink: 1,          // shrink if not enough space before wrapping
    gap: getScaleSize(4),
    alignItems: 'center',
  },
  statusValue: {
    flexShrink: 1,          // value text truncates gracefully if truly tight
  },
});
