import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import AppButton from './AppButton';
import { DISPLAY_FORM_STATUS, REQUEST_STATUS } from '../constant/RequestStatus';
import ProfileAvatar from './ProfileAvatar';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

interface RequestCardProps {
  name?: string;
  initials?: string;
  requestType?: string;
  status?: string;
  requestId?: string;
  formStatus?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  onPress?: () => void;
}

const RequestCardDoctor: React.FC<RequestCardProps> = ({
  name,
  requestType,
  status,
  requestId,
  formStatus,
  buttonText,
  onButtonPress = () => { },
  onPress,
}) => {
  const { t } = useTranslation();
  let initials = '';
  if (name) {
    initials = name
      .split('')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={styles.requestCardContainer}
    >
      <View style={styles.requestHeaderRow}>
        <ProfileAvatar
          name={initials}
          size="small"
          backgroundColor={COLORS._E5E7EB}
        />

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
            {t(requestType || '')}
          </AppText>
        </View>
        <View
          style={[
            styles.statusBadgeContainer,
            { backgroundColor: `${COLORS[status]}10` },
          ]}
        >
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Regular}
            color={COLORS[status]}
          >
            {t(DISPLAY_FORM_STATUS[status])}
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
            align={'left'}
          >
            {t(STRING.requestId)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
            align={'left'}
          >
            {requestId}
          </AppText>
        </View>
        <View>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._6F767E}
            align={'right'}
          >
            {t(STRING.formStatus)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
            align={'right'}
          >
            {t(DISPLAY_FORM_STATUS[formStatus])}
          </AppText>
        </View>
      </View>
      {buttonText && (
        <AppButton
          title={buttonText}
          onPress={onButtonPress}
          textSize={getScaleSize(13)}
          style={styles.updateButtonStyle}
        />
      )}
    </TouchableOpacity>
  );
};

export default RequestCardDoctor;

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
    flex: 1,
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
});
