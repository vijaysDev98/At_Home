import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  AppState,
  AppStateStatus,
  Linking,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useTranslation } from 'react-i18next';
import { useSound } from 'react-native-nitro-sound';
import moment from 'moment';
import { ActionSheetRef } from 'react-native-actions-sheet';

import {
  AppSafeAreaView,
  AppText,
  AppLoader,
  AppButton,
  ProfileAvatar,
  WarningSheet,
} from '../../../components';
import HeaderProvider from '../../../components/HeaderProvider';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant';
import {
  DISPLAY_FORM_STATUS,
  getStatusBadgeBgColor,
  getStatusBadgeColor,
  REQUEST_STATUS,
} from '../../../constant/RequestStatus';
import { SHOW_TOAST } from '../../../constant/showToast';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { useFormLockRefresh } from '../../../hooks/useFormLockRefresh';
import NavigationService from '../../../navigation/NavigationService';
import { ServiceRequest } from '../../../services/serviceRequestListApi';

export const ProviderPreRequestDetailScreen: React.FC = () => {
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const initialRequest: ServiceRequest = (route.params as any)?.request;
  const requestId =
    (route.params as any)?.requestId ||
    initialRequest?.id ||
    (initialRequest as any)?._id ||
    initialRequest?.requestId ||
    '';

  const { profileData } = useSelector((state: RootState) => state.profile);
  const currentUserId = (profileData as any)?._id || (profileData as any)?.id;

  const [requestData, setRequestData] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [hasError, setHasError] = useState(false);

  const warningSheetRef = useRef<ActionSheetRef>(null);

  // Sound playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentSecs, setCurrentSecs] = useState(0);
  const [totalSecs, setTotalSecs] = useState(0);

  const voiceUrl = requestData?.voiceMessageUrl;

  const sound = useSound({
    subscriptionDuration: 0.1,
    onPlayback: e => {
      if (e.duration > 0 && e.currentPosition != null) {
        setTotalSecs(Math.floor(e.duration / 1000));
        setCurrentSecs(Math.floor(e.currentPosition / 1000));
        const prog = (e.currentPosition / e.duration) * 100;
        setPlaybackProgress(Math.min(prog, 100));
      }
    },
    onPlaybackEnd: () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentSecs(0);
    },
  });

  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Stop playback helper
  const stopAudioPlayback = useCallback(async () => {
    if (isPlayingRef.current) {
      try {
        await soundRef.current?.stopPlayer();
      } catch (e) {
        // ignore
      }
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentSecs(0);
    }
  }, []);

  // 1. Stop playback when screen loses focus (user navigates to another screen or tab)
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAudioPlayback();
      };
    }, [stopAudioPlayback]),
  );

  // 2. Stop playback on app state changes (phone locked, app minimized, incoming phone call)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState !== 'active') {
          stopAudioPlayback();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [stopAudioPlayback]);

  const handleTogglePlay = async () => {
    if (!voiceUrl) return;
    try {
      if (isPlaying) {
        await sound.pausePlayer();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await sound.startPlayer(voiceUrl);
      }
    } catch (err: any) {
      console.warn('Audio playback toggle error:', err);
      setIsPlaying(false);
      SHOW_TOAST(t('Failed to play audio') || 'Failed to play audio', 'error');
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Status & Lock calculations
  const effectiveStatus = (
    requestData?.preRequestStatus ||
    requestData?.status ||
    'submitted'
  ).toLowerCase();

  const isReadOnly =
    effectiveStatus === REQUEST_STATUS.COMPLETED ||
    effectiveStatus === REQUEST_STATUS.CANCELLED;

  const isLocked =
    Boolean((requestData as any)?.isLocked || (requestData as any)?.formLock?.isLocked);
  const lockedBy =
    (requestData as any)?.formLock?.lockedBy ||
    (requestData as any)?.lockedBy ||
    undefined;
  const expiresAt =
    (requestData as any)?.formLock?.expiresAt ||
    (requestData as any)?.lockedAt ||
    undefined;

  // Form lock refresh hook
  useFormLockRefresh({
    requestId,
    isLocked,
    lockedBy,
    expiresAt,
    currentUserId,
    readOnly: isReadOnly,
    enabled: !!requestId && !hasError,
    onLockConflict: () => {
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          requestAnimationFrame(() => {
            warningSheetRef.current?.show();
          });
        }, 800);
      } else {
        warningSheetRef.current?.show();
      }
    },
  });

  // Fetch pre-claim details & record provider view
  useEffect(() => {
    if (requestId) {
      fetchDetails();
      recordView();
    }
  }, [requestId]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const data = await serviceRequestApi.getPreClaimDetails(requestId);
      if (data) {
        setRequestData(data);
      } else {
        // Fallback to getServiceRequestDetails if pre-claim returns null
        const fallbackData = await serviceRequestApi.getServiceRequestDetails(
          requestId,
        );
        if (fallbackData) {
          setRequestData(fallbackData);
        } else {
          setRequestData(null);
        }
      }
    } catch (e) {
      console.log('Error fetching pre-claim details:', e);
      try {
        const fallbackData = await serviceRequestApi.getServiceRequestDetails(
          requestId,
        );
        if (fallbackData) {
          setRequestData(fallbackData);
        } else {
          setHasError(true);
        }
      } catch (err) {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
      setIsFetched(true);
    }
  };

  const recordView = async () => {
    try {
      await serviceRequestApi.providerViewRequest(requestId);
    } catch (e) {
      // Non-blocking view tracking
    }
  };

  // Handle Accept Action
  const handleAccept = async () => {
    if (!requestId) return;
    try {
      setIsAccepting(true);
      const response = await serviceRequestApi.acceptRequest(requestId);
      if (response && response.success !== false) {
        if (response?.message) {
          SHOW_TOAST(response.message, 'success');
        }
        // Release lock before navigating back
        try {
          await serviceRequestApi.releaseFormLock(requestId);
        } catch (e) {
          // ignore
        }
        NavigationService.goBack();
      } else {
        SHOW_TOAST(
          response?.error || response?.message || 'Failed to accept request',
          'error',
        );
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.message || 'Failed to accept request',
        'error',
      );
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!requestId) return;
    try {
      setIsRejecting(true);
      const response = await serviceRequestApi.rejectRequest(requestId);
      if (response && response.success !== false) {
        if (response?.message) {
          SHOW_TOAST(response.message, 'success');
        }
        // Release lock before navigating back
        try {
          await serviceRequestApi.releaseFormLock(requestId);
        } catch (e) {
          // ignore
        }
        NavigationService.goBack();
      } else {
        SHOW_TOAST(
          response?.error || response?.message || 'Failed to reject request',
          'error',
        );
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.message || 'Failed to reject request',
        'error',
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const handleBack = async () => {
    try {
      await sound.stopPlayer();
    } catch (e) {
      // ignore
    }
    NavigationService.goBack();
  };

  // Doctor / Physician Info
  const doctor =
    (requestData as any)?.doctor || (requestData as any)?.doctorId;
  const doctorName =
    doctor?.fullName ||
    (doctor ? `${doctor.fName || ''} ${doctor.lName || ''}`.trim() : null) ||
    (requestData as any)?.doctorName;
  const doctorPhone =
    doctor?.phoneNumber ||
    doctor?.phone ||
    doctor?.mobileNumber ||
    doctor?.contactNumber ||
    (requestData as any)?.doctorPhone ||
    '';

  const handleCall = () => {
    if (doctorPhone) {
      Linking.openURL(`tel:${doctorPhone}`).catch(() => {
        SHOW_TOAST(
          t(STRING.unableToOpenPhoneDialer) || 'Unable to open phone dialer',
          'error',
        );
      });
    } else {
      SHOW_TOAST(
        t(STRING.noPhoneNumberAvailable) ||
          'No phone number available for this physician',
        'info',
      );
    }
  };

  const handleChat = () => {
    SHOW_TOAST(
      t(STRING.chatUnderDevelopment) ||
        'Chat feature is under development and will be available soon!',
      'info',
    );
  };

  const displayStatus =
    (DISPLAY_FORM_STATUS as Record<string, string>)[effectiveStatus] ||
    effectiveStatus;
  const badgeColor = getStatusBadgeColor(effectiveStatus);
  const badgeBgColor = getStatusBadgeBgColor(effectiveStatus);

  const isAssignedToProvider = Boolean(
    (requestData as any)?.assignedProviderId 
  );

  const canAccept =
    (effectiveStatus === 'submitted' ||
      effectiveStatus === 'pending' ||
      effectiveStatus === 'unassigned') &&
    requestData?.preRequestStatus !== 'accepted' &&
    requestData?.preRequestStatus !== 'rejected';

  const createdAt = requestData?.createdAt;
  const createdAtFormatted = createdAt
    ? moment(createdAt).locale(i18n?.language || 'en').format('DD MMM YYYY')
    : null;

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Top Header */}
        <HeaderProvider
          title={t(STRING.preRequest) || 'Pre-Request'}
          subTitle={
            createdAtFormatted
              ? `${requestData?.requestId || requestId || '—'} • ${createdAtFormatted}`
              : requestData?.requestId || requestId || '—'
          }
          isBack
          style={styles.header}
          leftContent={() => (
            <View
              style={[
                styles.statusBadge,
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
          )}
        />

        {isLoading || !requestData ? (
          <AppLoader visible={true} />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Awaiting Physician Notice */}
            {(effectiveStatus === 'accepted' || requestData?.preRequestStatus === 'accepted') && (
              <View style={styles.acceptedBanner}>
                <Image source={IMAGES.info} style={styles.acceptedBannerIcon} />
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._2563EB}
                  style={{ flex: 1, lineHeight: getScaleSize(18) }}
                >
                  {t(STRING.awaitingPhysicianToAssignPatient)}
                </AppText>
              </View>
            )}

            {/* Physician Information Card */}
            {!!doctorName && (
              <View style={styles.cardContainer}>
                <View style={styles.cardHeaderRow}>
                  <Image source={IMAGES.stethoscope} style={styles.cardHeaderIcon} />
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(STRING.physicianInformation) || 'Physician Information'}
                  </AppText>
                </View>

                <View style={styles.doctorInfoRow}>
                  <ProfileAvatar
                    name={doctorName}
                    size="medium"
                    backgroundColor="#e8edf1"
                  />
                  <View style={{ flex: 1, marginLeft: getScaleSize(12) }}>
                    <AppText
                      size={getScaleSize(15)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {`Dr. ${doctorName.replace(/^Dr\.?\s*/i, '')}`}
                    </AppText>
                    {!!doctor?.specialty && (
                      <AppText
                        size={getScaleSize(13)}
                        font={FONTS.Inter.Medium}
                        color={COLORS.primary}
                        style={{
                          marginTop: getScaleSize(2),
                          textTransform: 'capitalize',
                        }}
                      >
                        {doctor.specialty}
                      </AppText>
                    )}
                    {!!doctor?.email && (
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        style={{ marginTop: getScaleSize(2) }}
                      >
                        {doctor.email}
                      </AppText>
                    )}
                    {!!doctorPhone && (
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        style={{ marginTop: getScaleSize(2) }}
                      >
                        {doctorPhone}
                      </AppText>
                    )}
                  </View>
                </View>

                {/* Quick Actions: Chat Now & Call Now */}
                <View style={styles.doctorActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.doctorActionBtnChat}
                    onPress={handleChat}
                  >
                    <Image
                      source={IMAGES.mail}
                      style={styles.doctorActionIconChat}
                    />
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.SemiBold}
                      color={COLORS.primary}
                    >
                      {t(STRING.chatNow) || 'Chat Now'}
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.doctorActionBtnCall}
                    onPress={handleCall}
                  >
                    <Image
                      source={IMAGES.phone}
                      style={styles.doctorActionIconCall}
                    />
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.SemiBold}
                      color={COLORS.white}
                    >
                      {t(STRING.callNow) || 'Call Now'}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Voice Recording Player */}
            {!!voiceUrl && (
              <View style={styles.cardContainer}>
                <View style={styles.cardHeaderRow}>
                  <Image source={IMAGES.ic_mic} style={styles.cardHeaderIcon} />
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(STRING.voiceInstructions) || 'Voice Instructions'}
                  </AppText>
                </View>

                <View style={styles.audioPlayerCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.playPauseBtn}
                    onPress={handleTogglePlay}
                  >
                    {isPlaying ? (
                      <Image
                        source={IMAGES.ic_pause}
                        style={styles.playPauseIcon}
                      />
                    ) : (
                      <AppText
                        size={getScaleSize(16)}
                        font={FONTS.Inter.Bold}
                        color={COLORS.white}
                        style={{ marginLeft: getScaleSize(2) }}
                      >
                        {'▶'}
                      </AppText>
                    )}
                  </TouchableOpacity>

                  <View style={styles.audioProgressCol}>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${playbackProgress}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.audioTimeRow}>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6F767E}
                      >
                        {formatSeconds(currentSecs)}
                      </AppText>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6F767E}
                      >
                        {totalSecs > 0 ? formatSeconds(totalSecs) : '--:--'}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Written Notes Section */}
            {!!requestData?.initialNotes && (
              <View style={styles.cardContainer}>
                <View style={styles.cardHeaderRow}>
                  <Image source={IMAGES.ic_file} style={styles.cardHeaderIcon} />
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(STRING.textInstructions) || 'Written Instructions'}
                  </AppText>
                </View>

                <View style={styles.notesTextBox}>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._1A1D1F}
                    style={{ lineHeight: getScaleSize(22) }}
                  >
                    {requestData.initialNotes}
                  </AppText>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Bottom Action Bar */}
        {canAccept && (
          <View style={styles.bottomBar}>
            {isAssignedToProvider ? (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.rejectBtn}
                onPress={handleReject}
                disabled={isAccepting || isRejecting}
              >
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.error}
                  align="center"
                >
                  {isRejecting
                    ? t(STRING.rejecting) || 'Rejecting...'
                    : t(STRING.reject) || 'Reject'}
                </AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.cancelBtn}
                onPress={handleBack}
                disabled={isAccepting || isRejecting}
              >
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  align="center"
                >
                  {t(STRING.cancel) || 'Cancel'}
                </AppText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.acceptBtn}
              onPress={handleAccept}
              disabled={isAccepting || isRejecting}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
                align="center"
              >
                {isAccepting
                  ? t(STRING.accepting) || 'Accepting...'
                  : t(STRING.accept) || 'Accept'}
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Warning Sheet for Lock Conflict */}
        {!isReadOnly && <WarningSheet isLock={true} ref={warningSheetRef} />}
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  statusBadge: {
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(20),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(100),
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: getScaleSize(14),
    padding: getScaleSize(14),
    marginBottom: getScaleSize(14),
    gap: getScaleSize(10),
  },
  acceptedBannerIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: '#2563EB',
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    marginBottom: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: getScaleSize(10),
  },
  cardHeaderIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
    marginTop: getScaleSize(14),
    paddingTop: getScaleSize(12),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  doctorActionBtnChat: {
    flex: 1,
    height: getScaleSize(40),
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
  },
  doctorActionIconChat: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.primary,
    resizeMode: 'contain',
  },
  doctorActionBtnCall: {
    flex: 1,
    height: getScaleSize(40),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  doctorActionIconCall: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  audioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(14),
    padding: getScaleSize(12),
    gap: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  playPauseBtn: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playPauseIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  audioProgressCol: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: getScaleSize(6),
    backgroundColor: '#E2E8F0',
    borderRadius: getScaleSize(3),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: getScaleSize(3),
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getScaleSize(6),
  },
  notesTextBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cancelBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtn: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProviderPreRequestDetailScreen;
