import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useFormLockRefresh } from '../../../hooks/useFormLockRefresh';

import {
  AppSafeAreaView,
  AppText,
  AppLoader,
  Header,
  FormSignature,
} from '../../../components';
import type { FormSignatureHandle } from '../../../components/FormSignature';

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
import { STRING } from '../../../constant';
const FormReviewScreen: React.FC = () => {
  const route = useRoute();
  const { t } = useTranslation();
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
  const formRef = useRef<any>(null);
  const formSignatureRef = useRef<FormSignatureHandle>(null);
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

  const isSigned = !!requestData?.digitalSignature?.signatureData;

  /** Backend allows signing when formStatus is submitted or awaitingSignature. */
  const showSignInFooter = useMemo(() => {
    if (isSigned) return false;
    const formStatus = requestData?.formStatus;
    return (
      formStatus === FORM_STATUS.AWAITING_SIGNATURE ||
      formStatus === FORM_STATUS.SUBMITTED
    );
  }, [requestData?.formStatus, isSigned]);

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
      request?.patient || requestData?.patient || requestData?.patientId || {}
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
    requestData?.service || requestData?.serviceId || request?.service || {};

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
                  />
                )}

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

            {showSignInFooter ? (
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
                  !showSignInFooter && styles.footerBtnFull,
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
                  style={[styles.footerBtn, styles.submitBtn]}
                  onPress={() => formSignatureRef.current?.triggerSign()}
                >
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                    align="center"
                    numberOfLines={1}
                  >
                    {t(STRING.formReviewSignForm)}
                  </AppText>
                </TouchableOpacity>
              ) : null}
            </View>
          </>
        )}
      </View>
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

  nextDisabled: {
    opacity: 0.6,
  },
});

export default FormReviewScreen;
