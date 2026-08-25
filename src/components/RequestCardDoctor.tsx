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
import {
  DISPLAY_FORM_STATUS,
  REQUEST_STATUS,
  getStatusBadgeColor,
  getStatusBadgeBgColor,
} from '../constant/RequestStatus';
import ProfileAvatar from './ProfileAvatar';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';
import { IMAGES } from '../assets/images';

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
  isPreRequest?: boolean;
  preRequestStatus?: string;
  voiceMessageUrl?: string | null;
  initialNotes?: string;
  priorityLevel?: string;
}

const RequestCardDoctor: React.FC<RequestCardProps> = ({
  name,
  requestType,
  status,
  requestId,
  formStatus,
  buttonText,
  onButtonPress = () => {},
  onPress,
  isPreRequest = false,
  preRequestStatus,
  voiceMessageUrl,
  initialNotes,
  priorityLevel,
}) => {
  const { t } = useTranslation();

  // Determine display name and subtitle
  const displayName =
    name ||
    (isPreRequest
      ? t(STRING.dischargePreRequest) || 'Discharge Pre-Request'
      : 'Patient');

  const displaySubtitle = requestType
    ? t(requestType)
    : isPreRequest
    ? voiceMessageUrl && initialNotes
      ? t(STRING.voiceAndTextInstructions) || 'Voice & Written Summary'
      : voiceMessageUrl
      ? t(STRING.voiceInstructions) || 'Voice Instructions'
      : t(STRING.textInstructions) || 'Written Notes'
    : '';

  // Avatar initials
  let avatarInitials = '';
  if (name) {
    avatarInitials = name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  } else if (isPreRequest) {
    avatarInitials = 'PR';
  }

  // Safe status badge color & text (follows Blue theme for submitted / pending)
  const effectiveStatus = isPreRequest
    ? preRequestStatus || status || formStatus || 'submitted'
    : status || 'draft';

  const badgeColor = getStatusBadgeColor(effectiveStatus);
  const badgeBgColor = getStatusBadgeBgColor(effectiveStatus);

  const displayStatus =
    DISPLAY_FORM_STATUS[effectiveStatus.toLowerCase()] ||
    (effectiveStatus ? t(effectiveStatus) : 'Submitted');

  // Form Status display for bottom row
  const formStatusKey = (
    formStatus ||
    preRequestStatus ||
    status ||
    'submitted'
  ).toLowerCase();

  const displayFormStatus =
    DISPLAY_FORM_STATUS[formStatusKey] ||
    (formStatus
      ? t(formStatus)
      : formStatusKey.charAt(0).toUpperCase() + formStatusKey.slice(1));

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.requestCardContainer,
        isPreRequest && styles.preRequestCardBorder,
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.requestHeaderRow}>
        {isPreRequest ? (
          <View style={styles.preRequestIconBadge}>
            <Image
              source={voiceMessageUrl ? IMAGES.ic_mic : IMAGES.ic_file}
              style={styles.preRequestBadgeIcon}
            />
          </View>
        ) : (
          <ProfileAvatar
            name={avatarInitials}
            size="small"
            backgroundColor={COLORS._E5E7EB}
          />
        )}

        <View style={styles.patientInfoContainer}>
          <View style={styles.titleRow}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1A1A}
              numberOfLines={1}
            >
              {displayName}
            </AppText>
          </View>

          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Regular}
            color={COLORS._6B7280}
            numberOfLines={1}
            style={{ marginTop: getScaleSize(2) }}
          >
            {displaySubtitle}
          </AppText>
        </View>

        <View
          style={[
            styles.statusBadgeContainer,
            { backgroundColor: badgeBgColor },
          ]}
        >
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.SemiBold}
            color={badgeColor}
          >
            {t(displayStatus)}
          </AppText>
        </View>
      </View>

      {/* Pre-Request Preview Sections */}
      {isPreRequest && (
        <View style={styles.preRequestExtrasContainer}>
          {/* Voice note indicator */}
          {!!voiceMessageUrl && (
            <View style={styles.voiceNotePill}>
              <Image source={IMAGES.ic_mic} style={styles.voiceNotePillIcon} />
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.Medium}
                color={COLORS.primary}
              >
                {t(STRING.voiceRecordingAttached)}
              </AppText>
            </View>
          )}

          {/* Written notes preview */}
          {!!initialNotes && (
            <View style={styles.notePreviewBox}>
              <Image
                source={IMAGES.ic_file}
                style={styles.notePreviewIcon}
              />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._526674}
                numberOfLines={2}
                style={styles.notePreviewText}
              >
                {initialNotes}
              </AppText>
            </View>
          )}
        </View>
      )}

      <View style={styles.dividerLine} />

      {/* Details Row */}
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
            {requestId || '—'}
          </AppText>
        </View>
        <View>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._6F767E}
            align={'right'}
          >
            {isPreRequest
              ? t(STRING.preRequest) || 'Pre-Request'
              : t(STRING.formStatus)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
            align={'right'}
          >
            {t(displayFormStatus)}
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
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderColor: COLORS._EFEFEF,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    backgroundColor: COLORS.white,
  },
  preRequestCardBorder: {
    borderColor: '#D0E1FD',
  },
  requestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preRequestIconBadge: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: '#e8edf1',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preRequestBadgeIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  patientInfoContainer: {
    marginLeft: getScaleSize(12),
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
  },
  statusBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getScaleSize(20),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
  },
  preRequestExtrasContainer: {
    marginTop: getScaleSize(10),
    gap: getScaleSize(6),
  },
  voiceNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    backgroundColor: '#e8edf1',
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(5),
    borderRadius: getScaleSize(8),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceNotePillIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  notePreviewBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(6),
    backgroundColor: '#F8FAFC',
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notePreviewIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
    marginTop: getScaleSize(2),
  },
  notePreviewText: {
    flex: 1,
    lineHeight: getScaleSize(16),
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
    marginVertical: getScaleSize(12),
  },
  requestDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateButtonStyle: {
    marginTop: getScaleSize(12),
  },
});
