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
  delegateFormToProvider?: boolean;
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
  delegateFormToProvider,
}) => {
  const { t } = useTranslation();

  // Top right status badge: if it is pre-request, display preRequestStatus, else as it is
  const effectiveStatus = isPreRequest
    ? preRequestStatus || 'submitted'
    : status || 'submitted';

  const badgeColor = getStatusBadgeColor(effectiveStatus);
  const badgeBgColor = getStatusBadgeBgColor(effectiveStatus);

  const statusKey = effectiveStatus.toLowerCase().replace(/[-_ ]/g, '');
  const displayStatus =
    (DISPLAY_FORM_STATUS as Record<string, string>)[statusKey] ||
    (DISPLAY_FORM_STATUS as Record<string, string>)[effectiveStatus] ||
    (effectiveStatus ? t(effectiveStatus) : 'Submitted');

  // Title and subtitle
  const displayName = isPreRequest
    ? t(STRING.preRequest) || 'Pre-Request'
    : name || '';

  const displaySubtitle = isPreRequest
    ? ''
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
          <View style={styles.avatarContainer}>
            <Image
              source={IMAGES.ic_file}
              style={styles.avatarIcon}
            />
          </View>
        ) : (
          <ProfileAvatar
            name={displayName}
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
          {!isPreRequest && !!displaySubtitle && (
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Regular}
              color={COLORS._6B7280}
              numberOfLines={1}
            >
              {displaySubtitle}
            </AppText>
          )}
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

      {/* Awaiting Physician Banner for Accepted Pre-Requests */}
      {isPreRequest && (effectiveStatus === 'accepted' || preRequestStatus === 'accepted') && (
        <View style={styles.awaitingPhysicianBanner}>
          <Image source={IMAGES.info} style={styles.awaitingPhysicianIcon} />
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Medium}
            color={COLORS._2563EB}
            style={{ flex: 1, lineHeight: getScaleSize(16) }}
          >
            {delegateFormToProvider
              ? t(STRING.physicianRequestedYouToFillForm) ||
                'Physician has requested you to complete the form and assign a patient'
              : t(STRING.awaitingPhysicianToAssignPatient)}
          </AppText>
        </View>
      )}

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
  avatarContainer: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._E5E7EB,
    borderWidth: 0.5,
    borderColor: COLORS._1E293B80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS._1A1D1F,
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
  awaitingPhysicianBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: getScaleSize(10),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    marginTop: getScaleSize(12),
    gap: getScaleSize(8),
  },
  awaitingPhysicianIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    resizeMode: 'contain',
    tintColor: '#2563EB',
  },
});
