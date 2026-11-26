import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IMAGES } from '../../../assets/images';
import { useFormLockRefresh } from '../../../hooks/useFormLockRefresh';

import {
  AppSafeAreaView,
  AppText,
  AppLoader,
  Header,
  FormSignature,
  RequestUnderReviewModal,
  SelectDoctorSheet,
} from '../../../components';
import type { FormSignatureHandle } from '../../../components/FormSignature';
import type { CoordinatorDoctor } from '../../../components/SelectDoctorSheet';
import { ActionSheetRef } from 'react-native-actions-sheet';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';

import { FORM_STATUS, REQUEST_STATUS } from '../../../constant/RequestStatus';

import { serviceRequestApi } from '../../../services/serviceRequestApi';

import {
  ServiceInfo,
  ServiceRequest,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

import FormRequestHeader from '../../../components/FormRequestHeader';
import ServiceFormRenderer from './ServiceFormRenderer';
import { SCREENS } from '../../../navigation/routes';
import { useTranslation } from 'react-i18next';
import { STRING, SHOW_TOAST } from '../../../constant';
import { setLoading } from '../../../actions/common/commonSlice';
import {
  isCareCoordinatorProfile,
} from '../../../constant/getRole';
import { openDoctorChat } from '../../../services/chatService';

const FormReviewScreen: React.FC = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { request, fromCreate } = (route.params as any) || {};

  const requestId =
    request?.id || (request as any)?._id || (route.params as any)?.requestId;

  const [requestData, setRequestData] = useState<ServiceRequestDetail | null>(
    null,
  );

  const [isLeaving, setIsLeaving] = useState(false);

  const handleGoBack = async () => {
    if (isLeaving) return;
    setIsLeaving(true);

    const targetRequestId =
      requestId || requestData?.id || (requestData as any)?._id;
    console.log('targetRequestId', `test-${targetRequestId}, -${requestId}`);

    if (targetRequestId) {
      try {
        await serviceRequestApi.releaseFormLock(targetRequestId);
      } catch (e) {
        console.log('Error releasing form lock on back:', e);
      }
    }

    if (fromCreate) {
      NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
        screen: SCREENS.DOCTOR_REQUEST,
      });
    } else {
      NavigationService.goBack();
    }
  };
  const [hasError, setHasError] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const isLoading = useSelector((state: RootState) => state.common.isLoading);
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );
  const isCareCoordinator = useMemo(
    () => isCareCoordinatorProfile(profileData),
    [profileData],
  );
  const formRef = useRef<any>(null);
  const formSignatureRef = useRef<FormSignatureHandle>(null);
  const selectDoctorSheetRef = useRef<ActionSheetRef>(null);
  const hasLoadedRequestRef = useRef(false);
  const isReadOnly = useMemo(() => {
    return (
      requestData?.status === REQUEST_STATUS.SUBMITTED ||
      requestData?.status === REQUEST_STATUS.IN_PROGRESS ||
      requestData?.status === REQUEST_STATUS.COMPLETED ||
      requestData?.status === REQUEST_STATUS.RETURNED ||
      requestData?.formStatus === FORM_STATUS.AWAITING_SIGNATURE
    );
  }, [requestData]);

  const isSigned = requestData?.formStatus
    ? requestData.formStatus === FORM_STATUS.SIGNED
    : !!requestData?.digitalSignature?.signatureData;

  const currentUserIdForRoleCheck =
    (profileData as any)?._id || (profileData as any)?.id || null;

  const rawAssignedDoctor = useMemo(() => {
    const raw = (requestData as any)?.doctor || (requestData as any)?.doctorId;
    return raw && typeof raw === 'object' ? raw : null;
  }, [requestData]);

  const rawAssignedDoctorId = useMemo(() => {
    const raw = (requestData as any)?.doctorId;
    if (raw && typeof raw === 'object') return raw._id || raw.id || null;
    if (typeof raw === 'string' && raw.trim()) return raw;
    return rawAssignedDoctor?._id || rawAssignedDoctor?.id || null;
  }, [requestData, rawAssignedDoctor]);

  const isSelfOrCoordinatorDoctor = useMemo(() => {
    if (rawAssignedDoctor && isCareCoordinatorProfile(rawAssignedDoctor)) {
      return true;
    }
    if (
      rawAssignedDoctorId &&
      currentUserIdForRoleCheck &&
      String(rawAssignedDoctorId) === String(currentUserIdForRoleCheck)
    ) {
      return true;
    }
    return false;
  }, [rawAssignedDoctor, rawAssignedDoctorId, currentUserIdForRoleCheck]);

  const assignedDoctor = isSelfOrCoordinatorDoctor ? null : rawAssignedDoctor;
  const assignedDoctorId = isSelfOrCoordinatorDoctor ? null : rawAssignedDoctorId;

  const previousSigningDoctor = useMemo<CoordinatorDoctor | null>(() => {
    if (!isCareCoordinator) return null;
    const raw =
      (requestData as any)?.previousSigningDoctor ||
      (request as any)?.previousSigningDoctor ||
      (!isSelfOrCoordinatorDoctor && rawAssignedDoctor
        ? rawAssignedDoctor
        : null);
    const rawId =
      raw?.id ||
      raw?._id ||
      (requestData as any)?.previousSigningDoctorId ||
      (!isSelfOrCoordinatorDoctor ? rawAssignedDoctorId : null);
    if (!raw || !rawId) return null;
    return {
      id: String(rawId),
      fName: raw.fName,
      lName: raw.lName,
      fullName: raw.fullName,
      email: raw.email,
      specialty: raw.specialty,
      profileImg: raw.profileImg,
    };
  }, [
    isCareCoordinator,
    requestData,
    request,
    isSelfOrCoordinatorDoctor,
    rawAssignedDoctor,
    rawAssignedDoctorId,
  ]);

  const assignedDoctorName = useMemo(() => {
    const rawName =
      assignedDoctor?.fullName ||
      [assignedDoctor?.fName, assignedDoctor?.lName].filter(Boolean).join(' ').trim() ||
      '';
    if (!rawName) return '';
    return rawName.toLowerCase().startsWith('dr') ? rawName : `Dr. ${rawName}`;
  }, [assignedDoctor]);

  const handleChatWithAssignedDoctor = useCallback(async () => {
    if (!assignedDoctorId) return;
    dispatch(setLoading(true));
    try {
      const result = await openDoctorChat(String(assignedDoctorId));
      if (!result?.conversationId) {
        SHOW_TOAST(t(STRING.somethingWentWrong), 'error');
        return;
      }
      NavigationService.navigate(SCREENS.CHAT, {
        conversationId: result.conversationId,
        peerName: result.peer?.name || assignedDoctorName || 'Doctor',
        peerProfileImg:
          assignedDoctor?.profileImg || result.peer?.profileImg || undefined,
        peerPhone: assignedDoctor?.phoneNumber || result.peer?.phoneNumber,
        peerCountry: assignedDoctor?.country || result.peer?.country || undefined,
        peerUserId: String(assignedDoctorId),
      });
    } finally {
      dispatch(setLoading(false));
    }
  }, [assignedDoctorId, assignedDoctor, assignedDoctorName, dispatch, t]);

  const creatorObj = useMemo(() => {
    const raw = (requestData as any)?.createdBy || (request as any)?.createdBy;
    return raw && typeof raw === 'object' ? raw : null;
  }, [requestData, request]);

  const coordinatorCreatorId = useMemo(() => {
    if (!creatorObj || !isCareCoordinatorProfile(creatorObj)) return null;
    return creatorObj._id || creatorObj.id || null;
  }, [creatorObj]);

  const coordinatorCreatorName = useMemo(() => {
    if (!coordinatorCreatorId || !creatorObj) return '';
    return (
      creatorObj.fullName ||
      [creatorObj.fName, creatorObj.lName].filter(Boolean).join(' ').trim() ||
      t(STRING.careCoordinator)
    );
  }, [coordinatorCreatorId, creatorObj, t]);

  const isDoctorViewingCoordinatorRequest =
    !isCareCoordinator && Boolean(coordinatorCreatorId);

  const handleChatWithCoordinator = useCallback(async () => {
    if (!coordinatorCreatorId) return;
    dispatch(setLoading(true));
    try {
      const result = await openDoctorChat(String(coordinatorCreatorId));
      if (!result?.conversationId) {
        SHOW_TOAST(t(STRING.somethingWentWrong), 'error');
        return;
      }
      NavigationService.navigate(SCREENS.CHAT, {
        conversationId: result.conversationId,
        peerName: result.peer?.name || coordinatorCreatorName,
        peerProfileImg:
          creatorObj?.profileImg || result.peer?.profileImg || undefined,
        peerPhone: creatorObj?.phoneNumber || result.peer?.phoneNumber,
        peerCountry: creatorObj?.country || result.peer?.country || undefined,
        peerUserId: String(coordinatorCreatorId),
      });
    } finally {
      dispatch(setLoading(false));
    }
  }, [
    coordinatorCreatorId,
    coordinatorCreatorName,
    creatorObj,
    dispatch,
    t,
  ]);

  const [showUnderReviewModal, setShowUnderReviewModal] = useState(false);
  const hasDismissedReviewModalRef = useRef(false);

  useEffect(() => {
    if (!isFetched || hasDismissedReviewModalRef.current) return;

    const currentStatus = (requestData?.status || request?.status || '')
      .toString()
      .trim()
      .toLowerCase();
    const currentFormStatus = (
      requestData?.formStatus ||
      request?.formStatus ||
      ''
    )
      .toString()
      .trim()
      .toLowerCase();

    const isSubmitted = currentStatus === 'submitted';
    const formIsSigned = currentFormStatus
      ? currentFormStatus === 'signed'
      : isSigned;
    const isUnclaimed =
      currentStatus !== 'inprogress' && currentStatus !== 'in_progress';

    if (isSubmitted && formIsSigned && isUnclaimed) {
      setShowUnderReviewModal(true);
    } else {
      setShowUnderReviewModal(false);
    }
  }, [
    isFetched,
    isSigned,
    requestData?.status,
    requestData?.formStatus,
    request?.status,
    request?.formStatus,
  ]);

  useFocusEffect(
    useCallback(() => {
      hasDismissedReviewModalRef.current = false;
    }, []),
  );

  /** Doctor: DocuSign when submitted or awaiting signature. */
  const showDoctorSignInFooter = useMemo(() => {
    if (isCareCoordinator || isSigned) return false;
    const formStatus = requestData?.formStatus;
    return (
      formStatus === FORM_STATUS.AWAITING_SIGNATURE ||
      formStatus === FORM_STATUS.SUBMITTED
    );
  }, [requestData?.formStatus, isSigned, isCareCoordinator]);

  /** Coordinator: pick signing doctor when form is ready (not yet sent). */
  const showCoordinatorSignInFooter = useMemo(() => {
    if (!isCareCoordinator || isSigned) return false;
    return (
      requestData?.formStatus === FORM_STATUS.SUBMITTED ||
      (requestData?.formStatus === FORM_STATUS.AWAITING_SIGNATURE &&
        !assignedDoctorId)
    );
  }, [isCareCoordinator, isSigned, requestData?.formStatus, assignedDoctorId]);

  const showSignInFooter =
    showDoctorSignInFooter || showCoordinatorSignInFooter;

  const handleCoordinatorDoctorSelected = useCallback(
    async (doctor: CoordinatorDoctor) => {
      const targetRequestId =
        requestId ||
        requestData?.id ||
        (requestData as any)?._id;
      if (!targetRequestId) {
        SHOW_TOAST(t(STRING.somethingWentWrong), 'error');
        return;
      }

      dispatch(setLoading(true));
      try {
        const response = await serviceRequestApi.sendToDoctorForSignature(
          String(targetRequestId),
          doctor.id,
        );
        if (!response.success) {
          SHOW_TOAST(
            response.message || response.error || t(STRING.somethingWentWrong),
            'error',
          );
          return;
        }

        try {
          await serviceRequestApi.releaseFormLock(String(targetRequestId));
        } catch {
          // non-fatal
        }

        SHOW_TOAST(
          response.message || t(STRING.formSentToDoctorForSignature),
          'success',
        );
        if (fromCreate) {
          NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
            screen: SCREENS.DOCTOR_REQUEST,
          });
        } else {
          NavigationService.goBack();
        }
      } catch (error: any) {
        SHOW_TOAST(
          error?.message || t(STRING.somethingWentWrong),
          'error',
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [requestId, requestData, dispatch, t, fromCreate],
  );

  // Use custom hook for lock refresh
  const currentUserId = (profileData as any)?._id || (profileData as any)?.id;
  useFormLockRefresh({
    requestId,
    isLocked: requestData?.isLocked,
    lockedBy: requestData?.formLock?.lockedBy || undefined,
    expiresAt: requestData?.formLock?.expiresAt || undefined,
    currentUserId,
    readOnly: false,
    enabled: !isLeaving && isFetched && !!requestData && !hasError,
    onLockConflict: () => {
      // warningSheetRef.current?.show();
    },
  });

  const patientData = useMemo(() => {
    return (
      request?.patient ||
      (requestData as any)?.patient ||
      requestData?.patientId ||
      {}
    );
  }, [request, requestData]);

  const handleLeftButtonPress = async () => {
    if (formRef.current?.editForm) {
      const result = await formRef.current.editForm();
      if (result?.success) {
        // Navigate to FormsScreen with edit action
        NavigationService.replace(SCREENS.FORMS_SCREEN, {
          request: request,
          action: 'edit',
          from: 'review',
        });
      }
    }
  };

  const service: ServiceInfo =
    (requestData as any)?.service ||
    requestData?.serviceId ||
    request?.service ||
    ({} as any);

  const serviceId = service?._id || service?.id;

  const serviceName = service?.serviceName;

  const assignedProvider = useMemo(() => {
    const raw =
      requestData?.assignedProviderId || (request as any)?.assignedProviderId;
    return typeof raw === 'object' && raw ? raw : null;
  }, [request, requestData]);

  const fetchServiceRequestDetails = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!requestId) {
        setIsFetched(true);
        setHasError(true);
        return;
      }
      try {
        setHasError(false);

        const data = await serviceRequestApi.getServiceRequestDetails(
          requestId,
          options,
        );
        if (data) {
          setRequestData(data);
        } else {
          setHasError(true);
        }
      } catch (error) {
        setHasError(true);
      } finally {
        setIsFetched(true);
      }
    },
    [requestId],
  );

  useFocusEffect(
    useCallback(() => {
      fetchServiceRequestDetails({ silent: hasLoadedRequestRef.current });
      hasLoadedRequestRef.current = true;
    }, [fetchServiceRequestDetails]),
  );
  const handleSigningStart = () => {
    setIsSigning(true);
  };

  const handleSigningEnd = () => {
    setIsSigning(false);
  };

  return (
    <AppSafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: COLORS.white }}
    >
      <AppLoader visible={isLoading} signing={isSigning} />
      <View style={styles.container}>
        <Header
          title={t(STRING.reviewAndSign)}
          isBack={true}
          onBackPress={handleGoBack}
          style={styles.header}
        />

        {!isFetched ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <AppText color={COLORS.primary}>Loading...</AppText>
          </View>
        ) : isFetched && hasError ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <AppText color={COLORS.primary}>
              {t(STRING.somethingWentWrong)}
            </AppText>
          </View>
        ) : !requestData ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <AppText color={COLORS.primary}>No data available</AppText>
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {patientData && (
                  <FormRequestHeader
                    fromReview={
                      requestData?.formStatus == FORM_STATUS.AWAITING_SIGNATURE
                    }
                    patientData={patientData}
                    serviceName={serviceName}
                    requestData={requestData}
                    serviceRequestId={requestId}
                    requestIdLabel={requestData?.requestId}
                    chatPeerName={
                      assignedProvider?.fullName ||
                      assignedProvider?.name ||
                      null
                    }
                    chatPeerProfileImg={assignedProvider?.profileImg || null}
                    hideChat={isDoctorViewingCoordinatorRequest}
                  />
                )}

                {isDoctorViewingCoordinatorRequest ? (
                  <View style={styles.coordinatorBanner}>
                    <View style={styles.coordinatorBannerLeft}>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.SemiBold}
                        color="#0F766E"
                      >
                        {t(STRING.careCoordinator)}
                      </AppText>
                      <AppText
                        size={getScaleSize(13)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        numberOfLines={1}
                      >
                        {t(STRING.preparedByCoordinator, {
                          coordinatorName: coordinatorCreatorName,
                        })}
                      </AppText>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.coordinatorChatBtn}
                      onPress={handleChatWithCoordinator}
                    >
                      <Image
                        source={IMAGES.chat_conversation}
                        style={styles.coordinatorChatIcon}
                      />
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Bold}
                        color={COLORS.white}
                      >
                        {t(STRING.chat)}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {isCareCoordinator &&
                assignedDoctorName &&
                requestData?.formStatus === FORM_STATUS.AWAITING_SIGNATURE ? (
                  <View style={styles.assignedDoctorBanner}>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.SemiBold}
                      color={COLORS._2563EB}
                      style={{ flex: 1 }}
                    >
                      {t(STRING.assignedToDoctorForSignature, {
                        doctorName: assignedDoctorName,
                      })}
                    </AppText>
                  </View>
                ) : null}

                <View
                  style={{
                    backgroundColor: COLORS._F9FAFB,
                  }}
                >
                  {serviceId && (
                    <ServiceFormRenderer
                      formRef={formRef}
                      serviceId={serviceId || ''}
                      initialData={requestData}
                      patient={patientData}
                      prescriber={
                        (requestData as any)?.doctor ||
                        (requestData as any)?.doctorId
                      }
                      readOnly={isReadOnly}
                    />
                  )}
                </View>

              </ScrollView>
            </View>

            {showDoctorSignInFooter ? (
              <FormSignature
                ref={formSignatureRef}
                readOnly
                hideUI
                requestData={requestData}
                patientData={patientData}
                onSignatureCompleted={fetchServiceRequestDetails}
                onSigningStart={handleSigningStart}
                onSigningEnd={handleSigningEnd}
                onGoBack={handleGoBack}
              />
            ) : null}

            <View style={styles.bottomBar}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.footerBtn,
                  styles.saveBtn,
                  !(showSignInFooter || (isCareCoordinator && assignedDoctorId)) &&
                    styles.footerBtnFull,
                  showCoordinatorSignInFooter && styles.saveBtnCoordinator,
                ]}
                onPress={handleLeftButtonPress}
              >
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1A1D1F}
                  align="center"
                  numberOfLines={1}
                >
                  {t(STRING.editForm)}
                </AppText>
              </TouchableOpacity>

              {showSignInFooter ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.footerBtn,
                    styles.submitBtn,
                    showCoordinatorSignInFooter && styles.submitBtnCoordinator,
                  ]}
                  onPress={() => {
                    if (showCoordinatorSignInFooter) {
                      selectDoctorSheetRef.current?.show();
                    } else {
                      formSignatureRef.current?.triggerSign();
                    }
                  }}
                >
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                    align="center"
                    numberOfLines={1}
                  >
                    {t(
                      showCoordinatorSignInFooter
                        ? STRING.submitToDoctorForSign
                        : STRING.formReviewSignForm,
                    )}
                  </AppText>
                </TouchableOpacity>
              ) : isCareCoordinator && assignedDoctorId ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[styles.footerBtn, styles.submitBtn]}
                  onPress={handleChatWithAssignedDoctor}
                >
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                    align="center"
                    numberOfLines={1}
                  >
                    {t(STRING.chatWithDoctor)}
                  </AppText>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}
      </View>
      <RequestUnderReviewModal
        visible={showUnderReviewModal}
        onClose={() => {
          hasDismissedReviewModalRef.current = true;
          setShowUnderReviewModal(false);
        }}
      />
      <SelectDoctorSheet
        ref={selectDoctorSheetRef}
        previousDoctor={previousSigningDoctor}
        onSelectDoctor={handleCoordinatorDoctorSelected}
      />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },

  content: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS._F9FAFB,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },

  scrollContent: {
    backgroundColor: COLORS._F9FAFB,
    paddingBottom: 160,
    gap: 18,
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
  },

  footerBtn: {
    flex: 1,
    minHeight: getScaleSize(50),
    maxHeight: getScaleSize(52),
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerBtnFull: {
    flex: 1,
  },

  saveBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },

  submitBtn: {
    flex: 1.05,
    backgroundColor: COLORS.primary,
  },

  saveBtnCoordinator: {
    flex: 0.34,
    maxWidth: '38%',
  },

  submitBtnCoordinator: {
    flex: 1,
  },

  nextDisabled: {
    opacity: 0.6,
  },

  assignedDoctorBanner: {
    marginHorizontal: getScaleSize(16),
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(10),
    flexDirection: 'row',
    alignItems: 'center',
  },

  coordinatorBanner: {
    marginHorizontal: getScaleSize(16),
    backgroundColor: '#F0FDFA',
    borderColor: '#99F6E4',
    borderWidth: 1,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: getScaleSize(10),
  },
  coordinatorBannerLeft: {
    flex: 1,
    gap: getScaleSize(2),
  },
  coordinatorChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    backgroundColor: '#0D9488',
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(10),
  },
  coordinatorChatIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
});

export default FormReviewScreen;
