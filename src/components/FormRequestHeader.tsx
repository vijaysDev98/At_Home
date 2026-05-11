import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '.';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { PatientInfo } from '../services/serviceRequestListApi';
import { ServiceRequestDetail } from '../services/serviceRequestListApi';

interface FormRequestHeaderProps {
  patientData?: PatientInfo;
  serviceName?: string;
  requestData?: ServiceRequestDetail | null;
}

const FormRequestHeader: React.FC<FormRequestHeaderProps> = ({
  patientData,
  serviceName,
  requestData,
}) => {
  console.log();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Patient Avatar */}
        <View style={styles.avatar}>
          <AppText
            size={getScaleSize(20)}
            color={COLORS.white}
            font={FONTS.Inter.Bold}
          >
            {patientData?.fullName
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase() || 'P'}
          </AppText>
        </View>

        {/* Patient Details */}
        <View style={styles.detailsContainer}>
          <AppText
            size={getScaleSize(16)}
            color={COLORS._1A1D1F}
            font={FONTS.Inter.Bold}
          >
            {patientData?.fullName || 'Patient'}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._526674}
            font={FONTS.Inter.Regular}
          >
            {serviceName} • Req #{requestData?.requestId?.split('-')[1] || 'N/A'}
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
                color={'#0066CC'}
                font={FONTS.Inter.SemiBold}
              >
                {requestData?.status ? requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1) : 'Draft'}
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
                color={'#0066CC'}
                font={FONTS.Inter.SemiBold}
              >
                {requestData?.formStatus ? requestData.formStatus.charAt(0).toUpperCase() + requestData.formStatus.slice(1) : 'Draft'}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FormRequestHeader;
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
  avatar: {
    width: getScaleSize(56),
    height: getScaleSize(56),
    borderRadius: getScaleSize(28),
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
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