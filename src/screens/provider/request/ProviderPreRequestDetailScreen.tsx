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
  Modal,
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
import { SCREENS } from '../../../navigation/routes';
import { ServiceRequest } from '../../../services/serviceRequestListApi';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import {
  isPdfDocument,
  isDocumentFile,
  getDisplayFileName,
} from '../../../utils/documentPickerHelper';

interface ProviderPreRequestDetailScreenProps {}

export const ProviderPreRequestDetailScreen: React.FC<
  ProviderPreRequestDetailScreenProps
> = () => {
  const { t, i18n } = useTranslation();
  const route = useRoute<any>();
  const dispatch = useDispatch();

  const requestId = route.params?.id || route.params?.requestId || route.params?.request?.id;  

  const { profileData } = useSelector((state: RootState) => state.profile);
  const currentUserId = (profileData as any)?._id || (profileData as any)?.id;

  const [requestData, setRequestData] = useState<any>(
    route.params?.request || null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(!route.params?.request);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(
    null,
  );
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
        console.log("dataaaa",data);
        
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
    (requestData as any)?.doctor ||
    (typeof (requestData as any)?.doctorId === 'object'
      ? (requestData as any)?.doctorId
      : null) ||
    (typeof (requestData as any)?.createdBy === 'object'
      ? (requestData as any)?.createdBy
      : null) ;
  const doctorName =
    (doctor
      ? `${doctor.fName || ''} ${doctor.lName || ''}`.trim()
      : null) ||
    (requestData as any)?.doctorName;
  const doctorPhone =
    doctor?.phoneNumber ||
    doctor?.phone ||
    doctor?.mobileNumber ||
    doctor?.contactNumber ||
    (requestData as any)?.doctorPhone ||
    '';
  const canContactDoctor =
    effectiveStatus === 'accepted' ||
    requestData?.preRequestStatus === 'accepted' ||
    !!requestData?.delegateFormToProvider;

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

  const handleFillForm = () => {
    const doctorObj = requestData?.doctorId;

    const assignedProviderId =
      requestData?.assignedProviderId ;

    NavigationService.navigate(SCREENS.CREATE_REQUEST, {
      preRequest: requestData,
      preRequestId:
        requestData?.id,
      fromPreRequest: true,
      doctorId: doctorObj?.id,
      selectedDoctor: doctorObj,
      assignedProviderId,
    });
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
  const displayRequestId =
    requestData?.requestId &&
    String(requestData.requestId) !== String(requestId) &&
    !/^[a-f0-9]{24}$/i.test(String(requestData.requestId))
      ? requestData.requestId
      : null;
  const headerSubtitle = !requestData
    ? undefined
    : [displayRequestId, createdAtFormatted].filter(Boolean).join(' • ') ||
      undefined;
  const showBottomActions = !isLoading && !!requestData;

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Top Header */}
        <HeaderProvider
          title={t(STRING.preRequest) || 'Pre-Request'}
          subTitle={headerSubtitle}
          isBack
          style={styles.header}
          leftContent={() =>
            showBottomActions ? (
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
            ) : null
          }
        />

        {isLoading || !requestData ? (
          <AppLoader visible={true} />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Accepted Pre-Request Notice */}
            {(effectiveStatus === 'accepted' ||
              requestData?.preRequestStatus === 'accepted') && (
              <View
                style={[
                  styles.acceptedBanner,
                  requestData?.delegateFormToProvider && {
                    backgroundColor: '#EFF6FF',
                    borderColor: '#BFDBFE',
                  },
                ]}
              >
                <Image
                  source={IMAGES.info}
                  style={[
                    styles.acceptedBannerIcon,
                    requestData?.delegateFormToProvider && {
                      tintColor: COLORS._2563EB,
                    },
                  ]}
                />
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._2563EB}
                  style={{ flex: 1, lineHeight: getScaleSize(18) }}
                >
                  {requestData?.delegateFormToProvider
                    ? t(STRING.physicianRequestedYouToFillForm) ||
                      'Physician has requested you to complete the form and assign a patient'
                    : t(STRING.awaitingPhysicianToAssignPatient)}
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
                    imageUrl={
                      doctor?.profileImg
                        ? IMAGE_BASE_URL + doctor.profileImg
                        : undefined
                    }
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

                {canContactDoctor && (
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
                )}
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

            {/* Prescription Documents Section */}
            {!!requestData?.prescriptionFiles &&
              requestData.prescriptionFiles.length > 0 && (
                <View style={styles.cardContainer}>
                  <View style={styles.cardHeaderRow}>
                    <Image
                      source={IMAGES.ic_file}
                      style={styles.cardHeaderIcon}
                    />
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {t(STRING.prescriptionDocument) ||
                        'Prescription Document'}
                    </AppText>
                    <View style={styles.prescriptionCountBadge}>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.Bold}
                        color={COLORS.primary}
                      >
                        {requestData.prescriptionFiles.length}{' '}
                        {requestData.prescriptionFiles.length === 1
                          ? t(STRING.file) || 'file'
                          : t(STRING.files) || 'files'}
                      </AppText>
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ width: '100%' }}
                    contentContainerStyle={styles.prescriptionThumbnailsRow}
                  >
                    {requestData.prescriptionFiles.map(
                      (fileUrl: string, idx: number) => {
                        const isDoc = isDocumentFile(fileUrl);
                        const isPdf = isPdfDocument(fileUrl);
                        const displayName = getDisplayFileName(fileUrl, 'Prescription.pdf');
                        const badgeText = isPdf ? 'PDF' : 'DOC';

                        return (
                          <TouchableOpacity
                            key={`presc_file_${idx}`}
                            activeOpacity={0.85}
                            style={[
                              styles.prescriptionThumbWrapper,
                              isDoc && styles.prescriptionPdfThumbWrapper,
                            ]}
                            onPress={() => {
                              if (isDoc) {
                                NavigationService.navigate(SCREENS.PDF_VIEWER, {
                                  pdfUrl: fileUrl,
                                  title:
                                    displayName ||
                                    t(STRING.prescriptionDocument) ||
                                    'Prescription Document',
                                });
                              } else {
                                setSelectedPreviewImage(fileUrl);
                              }
                            }}
                          >
                            {isDoc ? (
                              <View style={styles.prescriptionPdfContent}>
                                <View style={styles.prescriptionPdfBadge}>
                                  <AppText
                                    size={getScaleSize(9)}
                                    font={FONTS.Inter.Bold}
                                    color={COLORS.white}
                                  >
                                    {badgeText}
                                  </AppText>
                                </View>
                                <Image
                                  source={IMAGES.ic_file}
                                  style={styles.prescriptionPdfIcon}
                                  resizeMode="contain"
                                />
                                <AppText
                                  size={getScaleSize(9)}
                                  font={FONTS.Inter.Medium}
                                  color={COLORS._1A1D1F}
                                  numberOfLines={2}
                                  ellipsizeMode="middle"
                                  style={{
                                    marginTop: getScaleSize(4),
                                    paddingHorizontal: getScaleSize(4),
                                    textAlign: 'center',
                                    lineHeight: getScaleSize(12),
                                  }}
                                >
                                  {displayName}
                                </AppText>
                              </View>
                            ) : (
                              <Image
                                source={{ uri: fileUrl }}
                                style={styles.prescriptionThumbImage}
                                resizeMode="cover"
                              />
                            )}
                            <View style={styles.prescriptionViewBadge}>
                              <Image
                                source={IMAGES.serviceEyeIcon || IMAGES.eye}
                                style={styles.prescriptionEyeIcon}
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </ScrollView>
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

        {/* Bottom Action Bar for New Pre-Requests (Accept/Reject) */}
        {showBottomActions && canAccept && (
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

        {/* Bottom Action Bar for Delegated Pre-Requests (Fill Form) */}
        {showBottomActions &&
          (effectiveStatus === 'accepted' ||
            requestData?.preRequestStatus === 'accepted') &&
          !!requestData?.delegateFormToProvider && (
            <View style={styles.bottomBar}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.acceptBtn, { flex: 1 }]}
                onPress={handleFillForm}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                  align="center"
                >
                  {t(STRING.fillForm) || 'Fill Form'}
                </AppText>
              </TouchableOpacity>
            </View>
          )}

        {/* Warning Sheet for Lock Conflict */}
        {!isReadOnly && <WarningSheet isLock={true} ref={warningSheetRef} />}

        {/* Full-Screen Prescription Image Preview Modal */}
        <Modal
          visible={!!selectedPreviewImage}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedPreviewImage(null)}
        >
          <View style={styles.previewModalOverlay}>
            <View style={styles.previewModalHeader}>
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                {t(STRING.prescriptionPreview) || 'Prescription Preview'}
              </AppText>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.previewModalCloseBtn}
                onPress={() => setSelectedPreviewImage(null)}
              >
                <Image
                  source={IMAGES.crossIcon}
                  style={styles.previewModalCloseIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.previewModalBody}>
              {selectedPreviewImage && (
                <Image
                  source={{ uri: selectedPreviewImage }}
                  style={styles.previewFullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </Modal>
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
  prescriptionCountBadge: {
    marginLeft: 'auto',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(2),
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  prescriptionThumbnailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: getScaleSize(12),
    marginTop: getScaleSize(6),
    paddingRight: getScaleSize(12),
  },
  prescriptionThumbWrapper: {
    width: getScaleSize(92),
    height: getScaleSize(110),
    borderRadius: getScaleSize(10),
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    position: 'relative',
  },
  prescriptionPdfThumbWrapper: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  prescriptionPdfContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: getScaleSize(6),
  },
  prescriptionPdfBadge: {
    position: 'absolute',
    top: getScaleSize(4),
    left: getScaleSize(4),
    backgroundColor: '#DC2626',
    paddingHorizontal: getScaleSize(5),
    paddingVertical: getScaleSize(1.5),
    borderRadius: getScaleSize(4),
  },
  prescriptionPdfIcon: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    marginTop:getScaleSize(10),
    tintColor: '#DC2626',
  },
  prescriptionThumbImage: {
    width: '100%',
    height: '100%',
  },
  prescriptionViewBadge: {
    position: 'absolute',
    bottom: getScaleSize(4),
    right: getScaleSize(4),
    width: getScaleSize(22),
    height: getScaleSize(22),
    borderRadius: getScaleSize(11),
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescriptionEyeIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'space-between',
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingTop: Platform.OS === 'ios' ? getScaleSize(50) : getScaleSize(20),
    paddingBottom: getScaleSize(16),
  },
  previewModalCloseBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalCloseIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  previewModalBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: getScaleSize(16),
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProviderPreRequestDetailScreen;
