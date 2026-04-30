import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import AppButton from './AppButton';

interface RequestCardProps {
  name?: string;
  initials?: string;
  requestType?: string;
  status?: string;
  requestId?: string;
  formStatus?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  name = "John Doe",
  initials = "JD",
  requestType = "Physical Therapy",
  status = "Submitted",
  requestId = "#6534",
  formStatus = "Submitted",
  buttonText = "Update & Sign",
  onButtonPress = () => {},
}) => {
  return (
    <View style={styles.requestCardContainer}>
      <View style={styles.requestHeaderRow}>
        <View style={styles.avatarContainer}>
             {/* <Image
               source={IMAGES.patient}
               style={{width:getScaleSize(40), height:getScaleSize(40), resizeMode:'contain'}}
               /> */}
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._2563EB}
          >
            {initials}
          </AppText>
        </View>

        <View style={styles.patientInfoContainer}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1A1A}
          >
            {name}
          </AppText>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Regular}
            color={COLORS._6B7280}
          >
            {requestType}
          </AppText>
        </View>
        <View style={styles.statusBadgeContainer}>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Regular}
            color={COLORS._2563EB}
          >
            {status}
          </AppText>
        </View>
      </View>

      <View style={styles.dividerLine} />

      <View style={styles.requestDetailsRow}>
        <View>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._6F767E}
          >
            {"Request ID"}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
          >
            {requestId}
          </AppText>
        </View>
        <View>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._6F767E}
          >
            {"Form Status"}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
          >
            {formStatus}
          </AppText>
        </View>
      </View>

      <AppButton
        title={buttonText}
        onPress={onButtonPress}
        style={styles.updateButtonStyle}
      />
    </View>
  );
};

export default RequestCard;

const styles = StyleSheet.create({
  requestCardContainer: {
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    backgroundColor: COLORS.white,
  },
  // Request header row
  requestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Avatar container
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: getScaleSize(40),
    width: getScaleSize(40),
    borderWidth: 1,
    borderColor: COLORS._DBEAFE,
    backgroundColor: COLORS._EFF6FF,
    borderRadius: getScaleSize(20),
  },
  // Patient info container
  patientInfoContainer: {
    marginLeft: getScaleSize(12),
    flex: 0.8,
  },
  // Status badge container
  statusBadgeContainer: {
    alignItems: 'center',
    backgroundColor: COLORS._EFF6FF,
    borderRadius: getScaleSize(20),
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(3),
  },
  // Divider line
  dividerLine: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
    marginVertical: getScaleSize(12),
  },
  // Request details row
  requestDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Update button style
  updateButtonStyle: {
    marginTop: getScaleSize(12),
  },
})