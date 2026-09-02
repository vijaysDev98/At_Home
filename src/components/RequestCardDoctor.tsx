import React, { useEffect, useState } from 'react';
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
  getStatusBadgeColor,
  getStatusBadgeBgColor,
} from '../constant/RequestStatus';
import ProfileAvatar from './ProfileAvatar';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';
import { IMAGES } from '../assets/images';
import { isDelegatedToProvider } from '../constant/smallFunctions';
import { serviceRequestApi } from '../services/serviceRequestApi';

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
  delegateFormToProvider?: boolean;
  providerName?: string | null;
  providerSpecialty?: string | null;
  request?: any;
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
  delegateFormToProvider,
  providerName,
  providerSpecialty,
  request,
}) => {
  const { t } = useTranslation();
  const [fetchedDelegated, setFetchedDelegated] = useState(false);
  const isDelegated =
    !!delegateFormToProvider ||
    isDelegatedToProvider(request) ||
    fetchedDelegated;

  // Determine display name and subtitle
  const displayName = isPreRequest
    ? t(STRING.preRequest) || 'Pre-Request'
    : name || 'Patient';

  const displaySubtitle = isPreRequest
    ? ''
    : requestType
    ? t(requestType)
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
  } else if (displayName) {
    avatarInitials = displayName
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Safe status badge color & text: for pre-requests display preRequestStatus, else standard status
  const effectiveStatus = isPreRequest
    ? preRequestStatus || 'submitted'
    : status || 'draft';

  const badgeColor = getStatusBadgeColor(effectiveStatus);
  const badgeBgColor = getStatusBadgeBgColor(effectiveStatus);

  const statusKey = effectiveStatus.toLowerCase().replace(/[-_ ]/g, '');
  const displayStatus =
    (DISPLAY_FORM_STATUS as Record<string, string>)[statusKey] ||
    (DISPLAY_FORM_STATUS as Record<string, string>)[effectiveStatus] ||
    (effectiveStatus ? t(effectiveStatus) : 'Submitted');

  // Form Status display for bottom row
  const formStatusKey = (
    formStatus ||
    preRequestStatus ||
    status ||
    'submitted'
  ).toLowerCase();

  const isAcceptedPreRequest =
    !!isPreRequest &&
    (effectiveStatus === 'accepted' ||
      preRequestStatus === 'accepted' ||
      status === 'accepted');

  useEffect(() => {
    const detailId = request?.id || request?._id;
    if (!detailId || !isAcceptedPreRequest || isDelegated) {
      return;
    }

    let cancelled = false;
    serviceRequestApi
      .getServiceRequestDetails(detailId, { silent: true })
      .then(data => {
        if (!cancelled && isDelegatedToProvider(data)) {
          setFetchedDelegated(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [request?.id, request?._id, isAcceptedPreRequest, isDelegated]);

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
      style={styles.requestCardContainer}
    >
      {/* Top Header Row */}
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
            name={name || displayName}
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

          {!isPreRequest && !!displaySubtitle && (
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Regular}
              color={COLORS._6B7280}
              numberOfLines={1}
              style={{ marginTop: getScaleSize(2) }}
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
            {isPreRequest && providerName
              ? t(STRING.assignedProvider) || 'Assigned Provider'
              : isPreRequest
              ? t(STRING.preRequest) || 'Pre-Request'
              : t(STRING.formStatus)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
            align={'right'}
          >
            {isPreRequest && providerName
              ? providerName
              : t(displayFormStatus)}
          </AppText>
        </View>
      </View>

      {/* Delegated to Provider Banner for Accepted Pre-Requests */}
      {isPreRequest &&
        (effectiveStatus === 'accepted' ||
          preRequestStatus === 'accepted' ||
          status === 'accepted') &&
        isDelegated && (
          <View style={styles.delegatedBanner}>
            <Image source={IMAGES.info} style={styles.delegatedIcon} />
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Medium}
              color={COLORS._2563EB}
              style={{ flex: 1, lineHeight: getScaleSize(16) }}
            >
              {t(STRING.waitingForProviderToFillForm) ||
                'Waiting for provider to complete the form'}
            </AppText>
          </View>
        )}

      {!isDelegated && !!buttonText && (
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
    resizeMode: 'contain',
    tintColor: COLORS._1A1D1F,
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
  delegatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: getScaleSize(12),
    gap: getScaleSize(8),
  },
  delegatedIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._2563EB,
  },
});
