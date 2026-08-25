import React from 'react';
import {
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
  FORM_STATUS,
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
  requestType?: string;
  status?: string;
  requestId?: string;
  formStatus?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  onLeftButtonPress?: () => void;
  onPress?: () => void;
  isPreRequest?: boolean;
  preRequestStatus?: string;
  voiceMessageUrl?: string | null;
  initialNotes?: string | null;
  priorityLevel?: string | null;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
}

const RequestCardProvider: React.FC<RequestCardProps> = ({
  name,
  requestType,
  status,
  requestId,
  formStatus,
  buttonText,
  onButtonPress = () => {},
  onLeftButtonPress = () => {},
  onPress,
  isPreRequest,
  preRequestStatus,
  voiceMessageUrl,
  initialNotes,
  priorityLevel,
  doctorName,
  doctorSpecialty,
}) => {
  const { t } = useTranslation();

  // Top right status badge follows `status` directly as it was originally
  const badgeColor = getStatusBadgeColor(status || 'submitted');
  const badgeBgColor = getStatusBadgeBgColor(status || 'submitted');

  const statusKey = (status || 'submitted').toLowerCase().replace(/[-_ ]/g, '');
  const displayStatus =
    (DISPLAY_FORM_STATUS as Record<string, string>)[statusKey] ||
    (status ? (DISPLAY_FORM_STATUS as Record<string, string>)[status] : '') ||
    status ||
    '';

  // Title and subtitle
  const displayName = isPreRequest
    ? name || t(STRING.dischargePreRequest) || 'Discharge Pre-Request'
    : name || '';

  const displaySubtitle = isPreRequest
    ? requestType
      ? t(requestType)
      : voiceMessageUrl && initialNotes
      ? t(STRING.voiceAndTextInstructions) || 'Voice & Written Summary'
      : voiceMessageUrl
      ? t(STRING.voiceInstructions) || 'Voice Instructions'
      : initialNotes
      ? t(STRING.textInstructions) || 'Written Notes'
      : t(STRING.preRequest) || 'Pre-Request'
    : t(requestType || '');

  let initials = '';
  if (displayName) {
    initials = displayName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .slice(0, 2)
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
      {/* Header Row */}
      <View style={styles.requestHeaderRow}>
        {isPreRequest ? (
          <View style={styles.preRequestIconBadge}>
            <Image
              source={
                voiceMessageUrl
                  ? IMAGES.ic_mic
                  : IMAGES.ic_file
              }
              style={styles.preRequestIcon}
            />
          </View>
        ) : (
          <ProfileAvatar
            name={initials}
            size="small"
            backgroundColor={COLORS._E5E7EB}
          />
        )}

        <View style={styles.patientInfoContainer}>
          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1A1A}
            numberOfLines={1}
          >
            {displayName}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Regular}
            color={COLORS._6B7280}
            numberOfLines={1}
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
            font={FONTS.Inter.Regular}
            color={badgeColor}
          >
            {t(
              (DISPLAY_FORM_STATUS as Record<string, string>)[status || ''] ||
                displayStatus,
            )}
          </AppText>
        </View>
      </View>

      {/* Voice note indicator pill */}
      {isPreRequest && !!voiceMessageUrl && (
        <View style={styles.voiceNotePill}>
          <Image source={IMAGES.ic_mic} style={styles.voiceIcon} />
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.SemiBold}
            color={COLORS.primary}
          >
            {t(STRING.voiceNoteAttached)}
          </AppText>
        </View>
      )}

      {/* Notes snippet preview */}
      {isPreRequest && !!initialNotes && (
        <View style={styles.noteSnippetContainer}>
          <Image
            source={IMAGES.ic_file}
            style={styles.noteSnippetIcon}
          />
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Regular}
            color={COLORS._526674}
            numberOfLines={2}
            style={{ flex: 1 }}
          >
            {initialNotes}
          </AppText>
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
            {isPreRequest && doctorName ? t('Doctor') : t(STRING.formStatus)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
            align={'right'}
          >
            {isPreRequest && doctorName
              ? `Dr. ${doctorName.replace(/^Dr\.?\s*/i, '')}`
              : t(
                  (DISPLAY_FORM_STATUS as Record<string, string>)[
                    (formStatus || '').toLowerCase().replace(/[-_ ]/g, '')
                  ] ||
                    (formStatus
                      ? (DISPLAY_FORM_STATUS as Record<string, string>)[
                          formStatus
                        ]
                      : '') ||
                    formStatus ||
                    '—',
                )}
          </AppText>
        </View>
      </View>

      {/* Buttons Row */}
      <View style={{ flexDirection: 'row', gap: getScaleSize(12) }}>
        {!isPreRequest &&
          formStatus === FORM_STATUS.SIGNED &&
          status === REQUEST_STATUS.SUBMITTED && (
            <AppButton
              title={t(STRING.returnRequest)}
              textSize={getScaleSize(13)}
              onPress={() => {
                onLeftButtonPress();
              }}
              textColor={COLORS.primary}
              style={[
                styles.updateButtonStyle,
                {
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS._EFEFEF,
                },
              ]}
            />
          )}

        {!!buttonText && (
          <AppButton
            title={t(buttonText)}
            textSize={getScaleSize(13)}
            onPress={() => {
              onButtonPress();
            }}
            style={[styles.updateButtonStyle, { flex: 1 }]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RequestCardProvider;

const styles = StyleSheet.create({
  requestCardContainer: {
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preRequestIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS.primary,
    resizeMode: 'contain',
  },
  patientInfoContainer: {
    marginLeft: getScaleSize(12),
    flex: 1,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    borderRadius: getScaleSize(20),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
  },
  voiceNotePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    backgroundColor: '#e8edf1',
    borderRadius: getScaleSize(8),
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(4),
    alignSelf: 'flex-start',
    marginTop: getScaleSize(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    tintColor: COLORS.primary,
    resizeMode: 'contain',
  },
  noteSnippetContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(6),
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(8),
    padding: getScaleSize(8),
    marginTop: getScaleSize(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteSnippetIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    tintColor: COLORS._6F767E,
    resizeMode: 'contain',
    marginTop: getScaleSize(2),
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
    height: getScaleSize(46),
    borderRadius: getScaleSize(8),
  },
});
