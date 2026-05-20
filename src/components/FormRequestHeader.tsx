import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, ProfileAvatar } from '.';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { PatientInfo } from '../services/serviceRequestListApi';
import { ServiceRequestDetail } from '../services/serviceRequestListApi';
import { FORM_STATUS } from '../constant';
import { DISPLAY_FORM_STATUS } from '../constant/RequestStatus';

interface FormRequestHeaderProps {
  patientData?: PatientInfo;
  serviceName?: string;
  requestData?: ServiceRequestDetail | null;
  fromReview?: boolean;
}

const FormRequestHeader: React.FC<FormRequestHeaderProps> = ({
  patientData,
  serviceName,
  requestData,
  fromReview = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Patient Avatar */}
        <ProfileAvatar
          name={`${patientData?.fullName}`}
          size="medium"
          backgroundColor={COLORS._E5E7EB}
        />

        {/* Patient Details */}
        <View style={styles.detailsContainer}>
          <AppText
            size={getScaleSize(16)}
            color={COLORS._1A1D1F}
            font={FONTS.Inter.Bold}
          >
            {`${patientData?.fullName}` || 'Patient'}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._526674}
            font={FONTS.Inter.Regular}
          >
            {serviceName} • ID #
            {(requestData?._id || requestData?.id)?.slice(-4).toUpperCase() ||
              ''}
          </AppText>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <AppText
                size={getScaleSize(12)}
                color={COLORS._526674}
                font={FONTS.Inter.Regular}
              >
                Request Status:
              </AppText>
              <AppText
                size={getScaleSize(12)}
                color={COLORS[requestData?.status]}
                font={FONTS.Inter.SemiBold}
              >
                {DISPLAY_FORM_STATUS[requestData?.status] ||
                  DISPLAY_FORM_STATUS[FORM_STATUS.DRAFT]}
              </AppText>
            </View>
            <View style={styles.statusBadge}>
              <AppText
                size={getScaleSize(12)}
                color={COLORS._526674}
                font={FONTS.Inter.Regular}
              >
                Form Status:
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
              >
                {fromReview
                  ? DISPLAY_FORM_STATUS[FORM_STATUS.AWAITING_SIGNATURE]
                  : DISPLAY_FORM_STATUS[requestData?.formStatus] || 'Draft'}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const FormRequestHeaderForProvider: React.FC<FormRequestHeaderProps> = ({
  patientData,
  serviceName,
  requestData,
  fromReview = false,
}) => {
  console.log('requestData', requestData);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Patient Avatar */}
        {/* <ProfileAvatar
          name={`${patientData?.fullName}`}
          size="medium"
          backgroundColor={COLORS._E5E7EB}
        /> */}

        {/* Patient Details */}
        <View style={styles.detailsContainer}>
          <AppText
            size={getScaleSize(16)}
            color={COLORS._1A1D1F}
            font={FONTS.Inter.Bold}
          >
            {`${patientData?.fullName}` || 'Patient'}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._526674}
            font={FONTS.Inter.Regular}
          >
            {serviceName} • ID #
            {(requestData?._id || requestData?.id)?.slice(-4).toUpperCase() ||
              ''}
          </AppText>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <AppText
                size={getScaleSize(12)}
                color={COLORS._526674}
                font={FONTS.Inter.Regular}
              >
                Request Status:
              </AppText>
              <AppText
                size={getScaleSize(12)}
                color={COLORS[requestData?.status]}
                font={FONTS.Inter.SemiBold}
              >
                {DISPLAY_FORM_STATUS[requestData?.status] ||
                  DISPLAY_FORM_STATUS[FORM_STATUS.DRAFT]}
              </AppText>
            </View>
            <View style={styles.statusBadge}>
              <AppText
                size={getScaleSize(12)}
                color={COLORS._526674}
                font={FONTS.Inter.Regular}
              >
                Form Status:
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
              >
                {fromReview
                  ? DISPLAY_FORM_STATUS[FORM_STATUS.AWAITING_SIGNATURE]
                  : DISPLAY_FORM_STATUS[requestData?.formStatus] || 'Draft'}
              </AppText>
            </View>
          </View>
        </View>
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
  },
  patientName: {
    fontSize: getScaleSize(16),
    color: COLORS._1A1D1F,
    fontWeight: '700',
  },
  serviceInfo: {
    fontSize: getScaleSize(13),
    color: COLORS._526674,
  },
  statusRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    marginTop: getScaleSize(4),
  },
  statusBadge: {
    flexDirection: 'row',
    gap: getScaleSize(4),
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: getScaleSize(12),
    color: COLORS._526674,
  },
  statusValue: {
    fontSize: getScaleSize(12),
    color: '#0066CC',
    fontWeight: '600',
  },
});
