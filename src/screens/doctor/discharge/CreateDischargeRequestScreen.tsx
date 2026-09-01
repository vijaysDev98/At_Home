import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
  Easing,
  Platform,
  PermissionsAndroid,
  AppState,
  AppStateStatus,
  Linking,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSound } from 'react-native-nitro-sound';
import LottieView from 'lottie-react-native';
import { ANIMATION } from '../../../assets/lottie';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import {
  AppSafeAreaView,
  AppText,
  AppLoader,
  ProfileAvatar,
} from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST, STRING } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation';
import { ActionSheetRef } from 'react-native-actions-sheet';
import {
  ProviderOptionSheet,
  SelectProviderSheet,
} from '../../../components/ActionSheets';
import { Provider } from '../providers/ProvidersCallList';
import { uploadAudioDirectToS3 } from '../../../services/uploadService';
import {
  serviceRequestApi,
  CreateServiceRequestPayload,
} from '../../../services/serviceRequestApi';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';

export type CreateDischargeRequestScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateDischargeRequest'
>;

type RecordingState = 'idle' | 'recording' | 'recorded';

const MAX_TEXT_LENGTH = 1500;

const CreateDischargeRequestScreen: React.FC<CreateDischargeRequestScreenProps> = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const isEdit = !!route.params?.isEdit;
  const [editRequest, setEditRequest] = useState<any>(
    route.params?.request || null,
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const assignedProvider =
    typeof editRequest?.assignedProviderId === 'object'
      ? editRequest.assignedProviderId
      : null;
  const assignedProviderId =
    assignedProvider?._id ||
    assignedProvider?.id ||
    (typeof editRequest?.assignedProviderId === 'string'
      ? editRequest.assignedProviderId
      : null);

  const fetchPreRequestDetails = async () => {
    const targetId =
      route.params?.requestId ||
      route.params?.request?.id ||
      route.params?.request?._id ||
      editRequest?.id ||
      editRequest?._id;

    if (!targetId) return;
    try {
      setIsLoadingDetails(true);
      const data = await serviceRequestApi.getServiceRequestDetails(targetId);
      if (data) {
        console.log("dataaa",data);
        
        setEditRequest(data);
        if (data.initialNotes) {
          setInstructionsText(data.initialNotes);
        }
        if (data.voiceMessageUrl) {
          setRecordedAudioUri(data.voiceMessageUrl);
          setRecordingState('recorded');
        }
      }
    } catch (e) {
      console.log('Error fetching fresh pre-request details in CreateDischargeRequestScreen:', e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (route.params?.request) {
      setEditRequest(route.params.request);
    }
    if (isEdit || route.params?.request || route.params?.requestId) {
      fetchPreRequestDetails();
    }
  }, [route.params?.request, route.params?.requestId]);
  

  // State management (initialized with editRequest data when in edit mode)
  const [instructionsText, setInstructionsText] = useState<string>(
    editRequest?.initialNotes || '',
  );
  const [recordingState, setRecordingState] = useState<RecordingState>(
    editRequest?.voiceMessageUrl ? 'recorded' : 'idle',
  );
  const [recordDurationSeconds, setRecordDurationSeconds] = useState<number>(0);
  const [currentPlaybackSeconds, setCurrentPlaybackSeconds] = useState<number>(0);
  const [totalAudioDurationSeconds, setTotalAudioDurationSeconds] = useState<number>(0);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(
    editRequest?.voiceMessageUrl || null,
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDelegating, setIsDelegating] = useState<boolean>(false);

  // Bottom sheets
  const providerOptionSheetRef = useRef<ActionSheetRef>(null);
  const selectProviderSheetRef = useRef<ActionSheetRef>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // NitroSound Hook
  const sound = useSound({
    subscriptionDuration: 0.1,
    onRecord: e => {
      if (e.currentPosition != null && e.currentPosition > 0) {
        const secs = Math.floor(e.currentPosition / 1000);
        setRecordDurationSeconds(secs);
        setTotalAudioDurationSeconds(secs);
      }
    },
    onPlayback: e => {
      if (e.duration != null && e.duration > 0) {
        const total = Math.floor(e.duration / 1000);
        setTotalAudioDurationSeconds(total);
        setRecordDurationSeconds(prev => (prev > 0 ? prev : total));
      }
      if (e.currentPosition != null && e.currentPosition >= 0) {
        const curr = Math.floor(e.currentPosition / 1000);
        setCurrentPlaybackSeconds(curr);
      }
      if (e.duration > 0 && e.currentPosition != null) {
        const progress = (e.currentPosition / e.duration) * 100;
        setPlaybackProgress(Math.min(progress, 100));
      }
    },
    onPlaybackEnd: () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentPlaybackSeconds(0);
    },
  });

  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const recordingStateRef = useRef(recordingState);
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Stop playback and recording helper (stable ref-based, does not trigger on state changes)
  const stopAllAudio = useCallback(async () => {
    if (isPlayingRef.current) {
      try {
        await soundRef.current?.stopPlayer();
      } catch (e) {
        // ignore
      }
      setIsPlaying(false);
      setPlaybackProgress(0);
    }
    if (recordingStateRef.current === 'recording') {
      try {
        await soundRef.current?.stopRecorder();
      } catch (e) {
        // ignore
      }
      setRecordingState('idle');
    }
  }, []);

  // 1. Stop audio and recording ONLY when screen loses focus (navigation changes)
  useFocusEffect(
    useCallback(() => {
      return () => {
        stopAllAudio();
      };
    }, [stopAllAudio]),
  );

  // 2. Stop audio and recording on app state changes (phone lock, background, incoming call)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState !== 'active') {
          stopAllAudio();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [stopAllAudio]);

  // Pulse animation for microphone during recording
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (recordingState === 'recording') {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      animation?.stop();
    };
  }, [recordingState, pulseAnim]);

  // Request Android recording permission
  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'At-Home needs access to your microphone to record doctor instructions.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Microphone permission error:', err);
        return false;
      }
    }
    return true;
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Start voice recording with NitroSound
  const handleStartRecording = async () => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        SHOW_TOAST('Microphone permission is required', 'error');
        return;
      }

      setRecordDurationSeconds(0);
      setCurrentPlaybackSeconds(0);
      setTotalAudioDurationSeconds(0);
      setRecordingState('recording');
      setIsPlaying(false);
      setPlaybackProgress(0);
      setRecordedAudioUri(null);

      await sound.startRecorder(undefined, undefined, true);
    } catch (error: any) {
      console.error('Error starting nitro recording:', error);
      SHOW_TOAST(error?.message || 'Failed to start recording', 'error');
      setRecordingState('idle');
    }
  };

  // Stop voice recording with NitroSound
  const handleStopRecording = async () => {
    try {
      const audioUri = await sound.stopRecorder();
      setRecordedAudioUri(audioUri);
      setRecordingState('recorded');
      setTotalAudioDurationSeconds(recordDurationSeconds);
      SHOW_TOAST(t(STRING.voiceRecordingAttached), 'success');
    } catch (error: any) {
      console.error('Error stopping nitro recording:', error);
      setRecordingState('idle');
    }
  };

  // Cancel voice recording
  const handleCancelRecording = async () => {
    try {
      await sound.stopRecorder();
    } catch (e) {}
    setRecordDurationSeconds(0);
    setCurrentPlaybackSeconds(0);
    setTotalAudioDurationSeconds(0);
    setRecordingState('idle');
    setRecordedAudioUri(null);
  };

  // Delete recorded voice note
  const handleDeleteRecording = async () => {
    try {
      if (isPlaying) {
        await sound.stopPlayer();
      }
    } catch (e) {}
    setIsPlaying(false);
    setPlaybackProgress(0);
    setCurrentPlaybackSeconds(0);
    setTotalAudioDurationSeconds(0);
    setRecordDurationSeconds(0);
    setRecordedAudioUri(null);
    setRecordingState('idle');
  };

  // Toggle playback using NitroSound player
  const handleTogglePlayback = async () => {
    try {
      if (isPlaying) {
        await sound.pausePlayer();
        setIsPlaying(false);
      } else {
        if (recordedAudioUri) {
          setIsPlaying(true);
          await sound.startPlayer(recordedAudioUri);
        } else {
          SHOW_TOAST('Audio file not found', 'error');
        }
      }
    } catch (error: any) {
      console.error('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const isAccepted =
    editRequest?.preRequestStatus === 'accepted' || !!route.params?.isAccepted;

  const isRejected =
    editRequest?.preRequestStatus === 'rejected' ||
    editRequest?.status === 'rejected' ||
    !!route.params?.isRejected;

  const isPending =
    editRequest?.preRequestStatus === 'pending' ||
    (isEdit && !isAccepted && !isRejected);

  const isReadOnly = isAccepted || isRejected || isPending;

  // Validate if at least voice or text is provided
  const hasVoice = recordingState === 'recorded' && !!recordedAudioUri;
  const hasText = instructionsText.trim().length > 0;
  const canSubmit = isAccepted || hasVoice || hasText;

  const handleCallAssignedProvider = (phone?: string | null) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        SHOW_TOAST(
          t(STRING.unableToOpenPhoneDialer) || 'Unable to open phone dialer',
          'error',
        );
      });
    } else {
      SHOW_TOAST(
        t(STRING.noProviderPhoneNumberAvailable) ||
          'No phone number available for this provider',
        'info',
      );
    }
  };

  const handleChatAssignedProvider = () => {
    SHOW_TOAST(
      t(STRING.chatUnderDevelopment) ||
        'Chat feature is under development and will be available soon!',
      'info',
    );
  };

  // Handle submit button click
  const handleSubmitPress = () => {
    if (isAccepted) {
      NavigationService.navigate(SCREENS.CREATE_REQUEST, {
        preRequest: editRequest,
        preRequestId:
          editRequest?.id || editRequest?._id || editRequest?.requestId,
        assignedProvider,
        assignedProviderId,
      });
      return;
    }

    if (recordingState === 'recording') {
      handleStopRecording();
      return;
    }

    if (!canSubmit) {
      SHOW_TOAST(t(STRING.pleaseProvideInstructions), 'error');
      return;
    }

    // When editing normally (and NOT rejected), directly submit keeping whatever it was earlier!
    if (isEdit && !isRejected) {
      const recipientType = assignedProviderId ? 'specific' : 'all';
      const providerObj = assignedProviderId
        ? ({
            ...assignedProvider,
            id: assignedProviderId,
            fullName:
              assignedProvider?.fullName ||
              assignedProvider?.providerName ||
              `${assignedProvider?.fName || ''} ${assignedProvider?.lName || ''}`.trim(),
          } as Provider)
        : undefined;

      processDischargeSubmission(recipientType, providerObj);
      return;
    }

    // Open recipient selection sheet (All vs Specific) for new requests or rejected requests
    providerOptionSheetRef.current?.show();
  };

  // Handle delegating form completion to provider
  const handleDelegateToProvider = async () => {
    const targetRequestId =
      editRequest?.id || editRequest?._id || editRequest?.requestId;
    if (!targetRequestId) {
      SHOW_TOAST('Request ID not found', 'error');
      return;
    }

    setIsDelegating(true);
    try {
      const response =
        await serviceRequestApi.delegatePreRequestToProvider(targetRequestId);
      if (response.success) {
        SHOW_SUCCESS_TOAST(
          t(STRING.formDelegatedToProvider) ||
            'Form delegated to provider successfully',
        );
        setEditRequest((prev: any) => ({
          ...prev,
          delegateFormToProvider: true,
        }));
        setTimeout(() => {
          NavigationService.goBack();
        }, 600);
      } else {
        SHOW_TOAST(
          response.error ||
            response.message ||
            'Failed to delegate form to provider',
          'error',
        );
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.message || 'Failed to delegate form to provider',
        'error',
      );
    } finally {
      setIsDelegating(false);
    }
  };

  // Core handler to upload audio to S3 and process discharge submission
  const processDischargeSubmission = async (
    recipientType: 'all' | 'specific',
    provider?: Provider,
    serviceId?: string,
  ) => {
    setIsSubmitting(true);
    let audioS3Url = '';

    try {
      // 1. Upload audio directly to AWS S3 bucket if recorded
      if (recordingState === 'recorded' && recordedAudioUri) {
        if (
          recordedAudioUri.startsWith('http://') ||
          recordedAudioUri.startsWith('https://')
        ) {
          // Already an uploaded S3 URL from existing request
          audioS3Url = recordedAudioUri;
        } else {
          console.log('📤 Uploading recorded audio note to S3...', recordedAudioUri);
          const uploadRes = await uploadAudioDirectToS3(recordedAudioUri, 'm4a');
          audioS3Url = uploadRes?.fileUrl || '';
          console.log('✅ Audio uploaded to S3 successfully:', audioS3Url);
        }
      }

      // 2. Prepare API payload matching the exact backend spec
      const apiPayload: CreateServiceRequestPayload = {
        isPreRequest: true,
      };

      if (instructionsText.trim()) {
        apiPayload.initialNotes = instructionsText.trim();
      }

      if (audioS3Url) {
        apiPayload.voiceMessageUrl = audioS3Url;
      }

      if (recipientType === 'specific' && provider) {
        const pId = provider.id || (provider as any)._id;
        apiPayload.providerId = pId;
        apiPayload.assignedProviderId = pId;
        if (serviceId) {
          apiPayload.serviceId = serviceId;
        }
      }

      const providerName =
        provider?.fullName ||
        provider?.providerName ||
        (provider
          ? `${provider.fName || ''} ${provider.lName || ''}`.trim()
          : null);

      console.log('====================================================');
      console.log(
        isEdit
          ? '🚀 [CALLING UPDATE PRE-REQUEST API]'
          : '🚀 [CALLING CREATE PRE-REQUEST API]',
      );
      console.log('📝 Written Note / Text:', apiPayload.initialNotes || '(None)');
      console.log('🎙️ Audio S3 URL:', apiPayload.voiceMessageUrl || '(None)');
      console.log('👥 Recipient Option:', recipientType);
      if (provider) {
        console.log('👤 Selected Provider:', {
          id: provider.id || (provider as any)._id,
          name: providerName,
          serviceId: serviceId || '(All Services)',
        });
      }
      console.log('📦 API Request Body:', JSON.stringify(apiPayload, null, 2));
      console.log('====================================================');

      // 3. Call backend API to create or update pre-request
      let response;
      if (
        isEdit &&
        (editRequest?.id || editRequest?._id || editRequest?.requestId)
      ) {
        const targetId =
          editRequest?.id || editRequest?._id || editRequest?.requestId;
        response = await serviceRequestApi.updatePreRequest(
          targetId,
          apiPayload,
        );
        // Fallback to create if update route returns error
        if (!response.success && response.message?.includes('404')) {
          response = await serviceRequestApi.createServiceRequest(apiPayload);
        }
      } else {
        response = await serviceRequestApi.createServiceRequest(apiPayload);
      }
      console.log('📥 Service Request Response:', response);

      setIsSubmitting(false);

      if (response.success) {
        SHOW_TOAST(
          response.message ||
            (isEdit
              ? t(STRING.dischargeRequestUpdated)
              : t(STRING.dischargeRequestSubmitted)),
          'success',
        );
        NavigationService.goBack();
      } else {
        SHOW_TOAST(
          response.error ||
            response.message ||
            'Failed to submit discharge request',
          'error',
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to process discharge request:', error);
      setIsSubmitting(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Failed to upload audio or submit request';
      SHOW_TOAST(errorMessage, 'error');
    }
  };

  // Option 1: Send to All Providers
  const handleSendToAllProviders = async () => {
    providerOptionSheetRef.current?.hide();
    await processDischargeSubmission('all');
  };

  // Option 2: Send to Specific Provider
  const handleSendToSpecificProvider = () => {
    providerOptionSheetRef.current?.hide();

    setTimeout(() => {
      selectProviderSheetRef.current?.show();
    }, 250);
  };

  // Callback when a specific provider is chosen from the sheet
  const handleProviderSelected = async (
    provider: Provider,
    serviceId?: string,
  ) => {
    selectProviderSheetRef.current?.hide();
    await processDischargeSubmission('specific', provider, serviceId);
  };

  return (
    <AppSafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <AppLoader visible={isSubmitting} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => NavigationService.goBack()}
        >
          <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {isAccepted || isRejected || isPending
              ? t(STRING.preRequest) || 'Pre-Request'
              : isEdit
              ? t(STRING.editPreRequest) || 'Edit Pre-Request'
              : t(STRING.createPreRequest) || 'Create Pre-Request'}
          </AppText>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Scrollable Content */}
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 140}
        extraHeight={Platform.OS === 'android' ? 160 : 100}
        keyboardOpeningTime={0}
      >
        {/* Instructions Intro Banner */}
        <View
          style={[
            styles.introCard,
            isRejected && styles.introCardRejected,
            editRequest?.delegateFormToProvider && {
              backgroundColor: '#EFF6FF',
              borderColor: '#BFDBFE',
            },
          ]}
        >
          <View
            style={[
              styles.introIconWrap,
              isRejected && styles.introIconWrapRejected,
              editRequest?.delegateFormToProvider && {
                backgroundColor: '#DBEAFE',
              },
            ]}
          >
            <Image
              source={isRejected ? IMAGES.crossIcon : IMAGES.info}
              style={[
                styles.introIcon,
                isRejected && { tintColor: COLORS.error },
                editRequest?.delegateFormToProvider && {
                  tintColor: COLORS._2563EB,
                },
              ]}
            />
          </View>
          <View style={styles.introTextCol}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={
                isRejected
                  ? COLORS.error
                  : editRequest?.delegateFormToProvider
                  ? COLORS._2563EB
                  : COLORS.primary
              }
            >
              {editRequest?.delegateFormToProvider
                ? t(STRING.formDelegated) || 'Form Delegated'
                : isAccepted || isPending
                ? t(STRING.preRequest) || 'Pre-Request'
                : isRejected
                ? t(STRING.preRequestRejected) || 'Pre-Request Rejected'
                : isEdit
                ? t(STRING.editPreRequest) || 'Edit Pre-Request'
                : t(STRING.createPreRequest) || 'Create Pre-Request'}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={
                isRejected
                  ? '#991B1B'
                  : editRequest?.delegateFormToProvider
                  ? '#1E40AF'
                  : COLORS._526674
              }
              style={{ marginTop: 2 }}
            >
              {editRequest?.delegateFormToProvider
                ? t(STRING.waitingForProviderToFillForm) ||
                  'Waiting for provider to complete the form'
                : isAccepted
                ? t(STRING.preRequestAcceptedSubtitle)
                : isRejected
                ? t(STRING.preRequestRejectedSubtitle)
                : t(STRING.dischargeInstructionsSubtitle)}
            </AppText>
          </View>
        </View>

        {/* Accepted, Rejected, or Delegated Provider Card */}
        {(() => {
          const isDelegated = !!editRequest?.delegateFormToProvider;

          if (!assignedProvider && !isAccepted && !isRejected && !isDelegated) {
            return null;
          }

          const providerName =
            assignedProvider?.fullName ||
            assignedProvider?.providerName ||
            `${assignedProvider?.fName || ''} ${assignedProvider?.lName || ''}`.trim() ||
            (isDelegated
              ? t(STRING.assignedProvider) || 'Assigned Provider'
              : 'Healthcare Provider');

          const profileImg = assignedProvider?.profileImg;
          const specialty = assignedProvider?.specialty;
          const phoneNumber = assignedProvider?.phoneNumber;
          const email = assignedProvider?.email;
          const canContactProvider =
            (isAccepted || isDelegated) && !isRejected;

          return (
            <View style={styles.assignedProviderCard}>
              <View style={styles.assignedProviderHeaderRow}>
                <View style={styles.assignedProviderHeaderLeft}>
                  <View
                    style={[
                      styles.assignedProviderBadgeIconWrap,
                      isRejected && { backgroundColor: '#FEF2F2' },
                    ]}
                  >
                    <Image
                      source={IMAGES.ic_provider}
                      style={[
                        styles.assignedProviderBadgeIcon,
                        isRejected && { tintColor: COLORS.error },
                      ]}
                    />
                  </View>
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(STRING.assignedProvider) || 'Assigned Provider'}
                  </AppText>
                </View>

                <View
                  style={
                    isRejected
                      ? styles.rejectedStatusBadge
                      : isDelegated
                      ? styles.delegatedStatusBadge
                      : styles.acceptedStatusBadge
                  }
                >
                  <View
                    style={
                      isRejected
                        ? styles.rejectedStatusDot
                        : isDelegated
                        ? styles.delegatedStatusDot
                        : styles.acceptedStatusDot
                    }
                  />
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Bold}
                    color={
                      isRejected
                        ? COLORS.error
                        : isDelegated
                        ? COLORS._2563EB
                        : COLORS.completed
                    }
                  >
                    {isRejected
                      ? t(STRING.Rejected) || 'Rejected'
                      : isDelegated
                      ? t(STRING.formDelegated) || 'Delegated'
                      : t(STRING.Accepted) || 'Accepted'}
                  </AppText>
                </View>
              </View>

              <View style={styles.assignedProviderDivider} />

              <View style={styles.assignedProviderBodyRow}>
                <ProfileAvatar
                  name={providerName}
                  imageUrl={
                    profileImg ? IMAGE_BASE_URL + profileImg : undefined
                  }
                  size="small"
                />

                <View style={styles.assignedProviderInfoCol}>
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                    numberOfLines={1}
                  >
                    {providerName}
                  </AppText>

                  {!!specialty && (
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                      style={{ marginTop: 2 }}
                    >
                      {specialty}
                    </AppText>
                  )}

                  {!!phoneNumber && (
                    <View
                      style={[
                        styles.providerMetaRow,
                        { marginTop: getScaleSize(4) },
                      ]}
                    >
                      <Image
                        source={IMAGES.phone}
                        style={styles.providerMetaIcon}
                      />
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        numberOfLines={1}
                      >
                        {phoneNumber}
                      </AppText>
                    </View>
                  )}

                  {!!email && !phoneNumber && (
                    <View
                      style={[
                        styles.providerMetaRow,
                        { marginTop: getScaleSize(4) },
                      ]}
                    >
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        numberOfLines={1}
                      >
                        {email}
                      </AppText>
                    </View>
                  )}
                </View>
              </View>

              {canContactProvider && (
                <View style={styles.assignedProviderActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.assignedProviderActionBtnChat}
                    onPress={handleChatAssignedProvider}
                  >
                    <Image
                      source={IMAGES.mail}
                      style={styles.assignedProviderActionIconChat}
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
                    style={styles.assignedProviderActionBtnCall}
                    onPress={() => handleCallAssignedProvider(phoneNumber)}
                  >
                    <Image
                      source={IMAGES.phone}
                      style={styles.assignedProviderActionIconCall}
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
          );
        })()}

          {/* ──────────────────────────────────────────────────────────
              SECTION 1: VOICE RECORDING (POWERED BY NITRO-SOUND)
          ────────────────────────────────────────────────────────── */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionBadge}>
                <Image source={IMAGES.ic_mic} style={styles.sectionBadgeIcon} />
              </View>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.voiceInstructions)}
              </AppText>
            </View>

            {/* IDLE STATE */}
            {recordingState === 'idle' && (
              <View style={styles.recordCard}>
                {isReadOnly ? (
                  <View
                    style={{
                      alignItems: 'center',
                      paddingVertical: getScaleSize(12),
                    }}
                  >
                    <Image
                      source={IMAGES.ic_mic}
                      style={{
                        width: getScaleSize(24),
                        height: getScaleSize(24),
                        tintColor: COLORS._6F767E,
                        resizeMode: 'contain',
                      }}
                    />
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                      style={{ marginTop: getScaleSize(8) }}
                    >
                      {t(STRING.noVoiceInstructionsRecorded)}
                    </AppText>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.micCircleBtn}
                      onPress={handleStartRecording}
                    >
                      <Animated.View
                        style={[
                          styles.micPulseRing,
                          { transform: [{ scale: pulseAnim }] },
                        ]}
                      />
                      <View style={styles.micInnerCircle}>
                        <Image
                          source={IMAGES.ic_mic}
                          style={styles.micIcon}
                        />
                      </View>
                    </TouchableOpacity>

                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                      style={{ marginTop: getScaleSize(12) }}
                    >
                      {t(STRING.tapToRecord)}
                    </AppText>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                      style={{ marginTop: getScaleSize(4), textAlign: 'center' }}
                    >
                      {t('Record patient instructions, orders, or voice summary')}
                    </AppText>
                  </>
                )}
              </View>
            )}

            {/* RECORDING IN PROGRESS STATE */}
            {recordingState === 'recording' && (
              <View style={[styles.recordCard, styles.recordCardActive]}>
                <View style={styles.recordingHeaderRow}>
                  <View style={styles.recordingRedDot} />
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.error}
                  >
                    {t(STRING.recordingInProgress)}
                  </AppText>
                </View>

                {/* Live Timer */}
                <AppText
                  size={getScaleSize(32)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  style={styles.liveTimerText}
                >
                  {formatTime(recordDurationSeconds)}
                </AppText>

                {/* Lottie Recording Waveform Animation */}
                <LottieView
                  source={ANIMATION.recording}
                  autoPlay
                  loop
                  style={styles.lottieRecording}
                />

                {/* Recording Controls */}
                <View style={styles.recordingActionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.cancelRecordBtn}
                    onPress={handleCancelRecording}
                  >
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.SemiBold}
                      color={COLORS._6F767E}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      align="center"
                    >
                      {t(STRING.cancelRecording)}
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.stopRecordBtn}
                    onPress={handleStopRecording}
                  >
                    <View style={styles.stopSquareIcon} />
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.Bold}
                      color={COLORS.white}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                      align="center"
                      style={{ flexShrink: 1 }}
                    >
                      {t(STRING.stopRecording)}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* RECORDED / PLAYBACK STATE */}
            {recordingState === 'recorded' && (
              <View style={[styles.recordCard, styles.recordedCardSuccess]}>
                <View style={styles.recordedTopRow}>
                  <View style={styles.recordedSuccessBadge}>
                    <Image
                      source={IMAGES.ic_doubleTick || IMAGES.serviceCompletedCheck}
                      style={styles.checkIconSmall}
                    />
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Bold}
                      color={COLORS.primary}
                    >
                      {t(STRING.recordedVoiceNote)}
                    </AppText>
                  </View>

                  {!isReadOnly && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleDeleteRecording}
                      style={styles.deleteNoteBtn}
                    >
                      <Image source={IMAGES.trash} style={styles.trashIcon} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Audio Player Controls & Bar */}
                <View style={styles.playerContainer}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleTogglePlayback}
                    style={styles.playPauseBtn}
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

                  <View style={styles.playerTrackCol}>
                    <View style={styles.progressTrackBackground}>
                      <View
                        style={[
                          styles.progressTrackFill,
                          { width: `${playbackProgress}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.durationRow}>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6F767E}
                      >
                        {formatTime(currentPlaybackSeconds)}
                      </AppText>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                      >
                        {formatTime(
                          totalAudioDurationSeconds || recordDurationSeconds,
                        )}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Re-record Action */}
                {!isReadOnly && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.rerecordBtn}
                    onPress={handleStartRecording}
                  >
                    <Image source={IMAGES.ic_reload} style={styles.reloadIcon} />
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.SemiBold}
                      color={COLORS.primary}
                    >
                      {t(STRING.rerecord)}
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* ──────────────────────────────────────────────────────────
              SECTION 2: TEXT / PARAGRAPH INSTRUCTIONS
          ────────────────────────────────────────────────────────── */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionBadge]}>
                <Image
                  source={IMAGES.ic_edit}
                  style={[styles.sectionBadgeIcon]}
                />
              </View>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.textInstructions)}
              </AppText>
            </View>

            <View style={styles.textInputCard}>
              <TextInput
                style={[
                  styles.multilineInput,
                  isReadOnly && { color: COLORS._1A1D1F },
                ]}
                placeholder={t(STRING.enterDischargeNotesPlaceholder)}
                placeholderTextColor={COLORS._6F767E}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={instructionsText}
                onChangeText={setInstructionsText}
                maxLength={MAX_TEXT_LENGTH}
                editable={!isReadOnly}
              />

              <View style={styles.textInputFooter}>
                {!isReadOnly && instructionsText.length > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setInstructionsText('')}
                  >
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Medium}
                      color={COLORS.error}
                    >
                      {t(STRING.clearText)}
                    </AppText>
                  </TouchableOpacity>
                )}
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._6F767E}
                  style={{ marginLeft: 'auto' }}
                >
                  {instructionsText.length}/{MAX_TEXT_LENGTH}{' '}
                  {t(STRING.characters)}
                </AppText>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Fixed Bottom Submit Button: Hidden once delegated to provider */}
        {!isRejected && !isPending && !editRequest?.delegateFormToProvider && (
          <View style={styles.bottomSheet}>
            {isAccepted ? (
              <View style={styles.twoButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.outlineBtn, isDelegating && styles.btnDisabled]}
                  disabled={isDelegating}
                  onPress={handleSubmitPress}
                >
                  <AppText
                    size={getScaleSize(13)}
                    color={COLORS._526674}
                    font={FONTS.Inter.Bold}
                    align="center"
                  >
                    {t(STRING.completeRequest) || 'Complete Request'}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.primaryBtnFlex,
                    isDelegating && styles.btnDisabled,
                  ]}
                  disabled={isDelegating}
                  onPress={handleDelegateToProvider}
                >
                  <AppText
                    size={getScaleSize(13)}
                    color={COLORS.white}
                    font={FONTS.Inter.Bold}
                    align="center"
                  >
                    {isDelegating
                      ? t(STRING.delegating) || 'Delegating...'
                      : t(STRING.delegateToProvider) ||
                        'Delegate to Provider'}
                  </AppText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.continueBtn,
                  !canSubmit && styles.continueDisabled,
                ]}
                disabled={!canSubmit}
                onPress={handleSubmitPress}
              >
                <AppText
                  size={getScaleSize(15)}
                  color={COLORS.white}
                  font={FONTS.Inter.Bold}
                >
                  {t(STRING.submitRequest)}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom Sheet 1: Recipient Selection (All vs Specific) */}
        <ProviderOptionSheet
          ref={providerOptionSheetRef}
          onSendToAll={handleSendToAllProviders}
          onSendToSpecific={handleSendToSpecificProvider}
        />

        {/* Bottom Sheet 2: Specific Provider Selection Entry Point */}
        <SelectProviderSheet
          ref={selectProviderSheetRef}
          onSelectProvider={handleProviderSelected}
        />
      </AppSafeAreaView>
  );
};

export default CreateDischargeRequestScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    height: getScaleSize(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    width: getScaleSize(38),
    height: getScaleSize(38),
    borderRadius: getScaleSize(19),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  backIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRightPlaceholder: {
    width: getScaleSize(38),
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    padding: getScaleSize(16),
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FB',
    borderRadius: getScaleSize(14),
    padding: getScaleSize(14),
    marginBottom: getScaleSize(16),
    borderWidth: 1,
    borderColor: '#D4E6F7',
    gap: getScaleSize(12),
  },
  introCardRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  introIconWrapRejected: {
    backgroundColor: '#FEE2E2',
  },
  assignedProviderCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    marginBottom: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  assignedProviderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignedProviderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  assignedProviderBadgeIconWrap: {
    width: getScaleSize(28),
    height: getScaleSize(28),
    borderRadius: getScaleSize(14),
    backgroundColor: '#EBF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedProviderBadgeIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  acceptedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(5),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: getScaleSize(9),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  acceptedStatusDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS.completed,
  },
  rejectedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(5),
    backgroundColor: '#FEF2F2',
    paddingHorizontal: getScaleSize(9),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  rejectedStatusDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS.error,
  },
  assignedProviderDivider: {
    height: 1,
    backgroundColor: COLORS._F3F4F6,
    marginVertical: getScaleSize(12),
  },
  assignedProviderBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignedProviderInfoCol: {
    flex: 1,
    marginLeft: getScaleSize(12),
    justifyContent: 'center',
  },
  assignedProviderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
    marginTop: getScaleSize(14),
    paddingTop: getScaleSize(12),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  assignedProviderActionBtnChat: {
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
  assignedProviderActionIconChat: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.primary,
    resizeMode: 'contain',
  },
  assignedProviderActionBtnCall: {
    flex: 1,
    height: getScaleSize(40),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
  },
  assignedProviderActionIconCall: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  providerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(3),
  },
  providerMetaIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  introIconWrap: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  introTextCol: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: getScaleSize(20),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
    marginBottom: getScaleSize(10),
  },
  sectionBadge: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  recordCardActive: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF9F9',
  },
  recordedCardSuccess: {
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
    alignItems: 'stretch',
    padding: getScaleSize(16),
  },
  micCircleBtn: {
    width: getScaleSize(76),
    height: getScaleSize(76),
    borderRadius: getScaleSize(38),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: getScaleSize(8),
  },
  micPulseRing: {
    position: 'absolute',
    width: getScaleSize(76),
    height: getScaleSize(76),
    borderRadius: getScaleSize(38),
    backgroundColor: COLORS.primary + '20',
  },
  micInnerCircle: {
    width: getScaleSize(64),
    height: getScaleSize(64),
    borderRadius: getScaleSize(32),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micIcon: {
    width: getScaleSize(26),
    height: getScaleSize(26),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  recordingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(8),
  },
  recordingRedDot: {
    width: getScaleSize(10),
    height: getScaleSize(10),
    borderRadius: getScaleSize(5),
    backgroundColor: COLORS.error,
  },
  liveTimerText: {
    marginVertical: getScaleSize(6),
    letterSpacing: 1.5,
  },
  lottieRecording: {
    width: getScaleSize(180),
    height: getScaleSize(80),
    alignSelf: 'center',
    marginVertical: getScaleSize(6),
  },
  recordingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(10),
    marginTop: getScaleSize(12),
    width: '100%',
    paddingHorizontal: getScaleSize(8),
  },
  cancelRecordBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  stopRecordBtn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(6),
    backgroundColor: COLORS.error,
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    borderRadius: getScaleSize(10),
    elevation: 2,
  },
  stopSquareIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  recordedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(12),
  },
  recordedSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    backgroundColor: '#F3F4F6',
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
  },
  checkIconSmall: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  deleteNoteBtn: {
    padding: getScaleSize(6),
  },
  trashIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS.error,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    backgroundColor: COLORS.white,
    padding: getScaleSize(12),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  playerTrackCol: {
    flex: 1,
    gap: getScaleSize(4),
  },
  progressTrackBackground: {
    height: getScaleSize(6),
    backgroundColor: '#E2E8F0',
    borderRadius: getScaleSize(3),
    overflow: 'hidden',
  },
  progressTrackFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: getScaleSize(3),
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rerecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(6),
    marginTop: getScaleSize(12),
    paddingVertical: getScaleSize(6),
  },
  reloadIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  textInputCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(14),
    borderWidth: 1.5,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  multilineInput: {
    minHeight: getScaleSize(120),
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS._1A1D1F,
    padding: 0,
    lineHeight: getScaleSize(20),
  },
  textInputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS._F3F4F6,
    paddingTop: getScaleSize(10),
    marginTop: getScaleSize(8),
  },
  bottomSheet: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    gap: 10,
    zIndex: 10,
  },
  continueBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDisabled: {
    opacity: 0.6,
  },
  twoButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  outlineBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(6),
  },
  primaryBtnFlex: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(6),
  },
  btnDisabled: {
    opacity: 0.6,
  },
  delegatedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(5),
    backgroundColor: '#EFF6FF',
    paddingHorizontal: getScaleSize(9),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  delegatedStatusDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS._2563EB,
  },
  assignedProviderDelegatedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    marginTop: getScaleSize(12),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: getScaleSize(8),
  },
  assignedProviderDelegatedIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._2563EB,
  },
});
