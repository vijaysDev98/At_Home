import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import { useRoute } from '@react-navigation/native';
import { useFormLockRefresh } from '../../../hooks/useFormLockRefresh';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppSafeAreaView,
  AppText,
  AppLoader,
  AppButton,
  CompleteServiceSheet,
  WarningSheet,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { RootStackParamList } from '../../../navigation';
import {
  getFormScreenButtons,
  FormScreenButtonConfig,
  FormScreenHandlerKey,
  REQUEST_STATUS,
  FORM_STATUS,
} from '../../../constant/RequestStatus';
import { SHOW_TOAST } from '../../../constant/showToast';
import {
  ServiceInfo,
  ServiceRequest,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

// Import all form components
import { ActionSheetRef } from 'react-native-actions-sheet';
import ServiceFormRenderer from '../../doctor/forms/ServiceFormRenderer';
import HeaderProvider from '../../../components/HeaderProvider';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { SCREENS } from '../../../navigation/routes';
import { useTranslation } from 'react-i18next';
import { STRING } from '../../../constant';
import { ROLES } from '../../../constant/getRole';
import { viewSignedPdf } from '../../../hooks/pdfDownloader';

export type ProviderFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProviderFormScreen'
>;

const ProviderFormScreen: React.FC = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const request: ServiceRequest = (route.params as any)?.request;
  const service: ServiceInfo = request?.service || {};
  const action = (route.params as any)?.action;
  const isComplete = (route.params as any)?.isComplete;
  const requestId = request?.id;
    
  const dispatch = useDispatch();
  const { profileData } = useSelector((state: RootState) => state.profile);

  // Extract service and patient from request object
  const patientData = request?.patient || {};
  const [hasError, setHasError] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  // Use patient from request, or fallback to Redux
  const [requestData, setRequestData] = useState<ServiceRequestDetail | null>(
    null,
  );

  const readOnly = useMemo(
    () =>
      action === 'view' ||
      action === 'claim' ||
      requestData?.formStatus === FORM_STATUS.AWAITING_SIGNATURE ||
      requestData?.formStatus == FORM_STATUS.SIGNED,
    [action, requestData?.formStatus],
  );

  const status = requestData?.status || request?.status;
  const formStatus = requestData?.formStatus || request?.formStatus;

  const isInProgress = useMemo(
    () =>
      status === REQUEST_STATUS.IN_PROGRESS ||
      status === REQUEST_STATUS.RETURNED ||
      status !== REQUEST_STATUS.COMPLETED,
    [status],
  );

  const isCancelled = useMemo(
    () => status === REQUEST_STATUS.CANCELLED,
    [status],
  );

  const serviceId =
    service?.id ||
    service?._id ||
    requestData?.serviceId._id ||
    requestData?.serviceId.id;

  const warningSheetRef = useRef<ActionSheetRef>(null);
  const completeSheetRef = useRef<ActionSheetRef>(null);

  // Use global loader state from Redux
  const isLoading = useSelector((state: RootState) => state.common.isLoading);
  // Ref to store form ref
  const formRef = useRef<any>(null);

  // Use custom hook for lock refresh
  const currentUserId = (profileData as any)?._id || (profileData as any)?.id;

  useFormLockRefresh({
    requestId,
    isLocked: requestData?.isLocked,
    lockedBy: requestData?.formLock?.lockedBy || undefined,
    expiresAt: requestData?.formLock?.expiresAt || undefined,
    currentUserId,
    readOnly,
    enabled: isFetched && !!requestData && !hasError,
    onLockConflict: () => {
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          requestAnimationFrame(() => {
            warningSheetRef.current?.show();
          });
        }, 1000);
      } else {
        warningSheetRef.current?.show();
      }
    },
  });

  // ─── Named action handlers ─────────────────────────────────────────────────
  // Provider-only handlers
  const handlerMap: Record<FormScreenHandlerKey, () => Promise<void>> = {
    // Provider: submit pre-claim form for doctor review
    submitForReview: async () => {
      if (formRef.current?.submitForReview) {
        await formRef.current.submitForReview();
      }
    },

    // Provider: persist pre-claim without submitting
    saveProgress: async () => {
      if (formRef.current?.saveProgress) {
        const result = await formRef.current.saveProgress();
        if (!result.success) return;
        if (result.success) {
          // NavigationService.goBack();
          return;
        }
      }
    },

    // Provider: claim a signed service
    claimService: async () => {
      if (!requestId) {
        SHOW_TOAST(t(STRING.missingID), 'error');
        return;
      }
      dispatch(setLoading(true));
      try {
        const response = await serviceRequestApi.claimRequest(requestId);
        if (response.success) {
          SHOW_TOAST(
            response.message || t(STRING.requestClaimedSuccessfully),
            'success',
          );
          NavigationService.goBack();
        } else {
          SHOW_TOAST(response.error || t(STRING.failedToClaimRequest), 'error');
        }
      } catch (error: any) {
        SHOW_TOAST(error?.message, 'error');
      } finally {
        dispatch(setLoading(false));
      }
    },

    // Unused doctor handlers (kept for type safety)
    updateFormData: async () => {},
    saveAsDraft: async () => {},
    submitRequest: async () => {},
    updateAndSign: async () => {},
    updateAndResign: async () => {},
  };

  // Fetch service request details when in view mode
  useEffect(() => {
    if (requestId) {
      fetchServiceRequestDetails(isInProgress);
      handleViewRequest();
    }
  }, [requestId]);

  const fetchServiceRequestDetails = async (isInProgress: boolean) => {
    try {
      setHasError(false);

      const data =
        isInProgress && status !== REQUEST_STATUS.SUBMITTED
          ? await serviceRequestApi.getServiceRequestDetails(requestId || '')
          : await serviceRequestApi.getPreClaimDetails(requestId || '');

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
  };

  const handleCompleteRequest = async () => {
    if (!requestId) {
      SHOW_TOAST(t(STRING.missingID), 'error');
      return;
    }
    dispatch(setLoading(true));
    try {
      const response = await serviceRequestApi.completeRequest(requestId);
      if (response.success) {
        SHOW_TOAST(
          response.message || t(STRING.serviceCompletedSuccessfully),
          'success',
        );
        completeSheetRef?.current?.hide();
        NavigationService.replace(SCREENS.SERVICE_COMPLETED, {
          requestId: requestId,
        });
      } else {
        SHOW_TOAST(response.error, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleViewRequest = async () => {
    if (!requestId) {
      SHOW_TOAST(t(STRING.missingID), 'error');
      return;
    }
    dispatch(setLoading(true));
    try {
      await serviceRequestApi.providerViewRequest(requestId);
    } catch (error: any) {
      SHOW_TOAST(error?.message, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Derive which buttons to show — pure data, no JSX branching
  const buttonConfig: FormScreenButtonConfig = useMemo(
    () => getFormScreenButtons(ROLES.PROVIDER, status, formStatus, action),
    [status, formStatus, action],
  );

  const renderBottomBar = () => {
    const { left, right } = buttonConfig;
    if (!left && !right) return null;

    return (
      <View style={styles.bottomBar}>
        {left && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.saveBtn}
            onPress={handlerMap[left.handler]}
          >
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              align="center"
              color={COLORS._1A1D1F}
            >
              {t(left.label)}
            </AppText>
          </TouchableOpacity>
        )}
        {right && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.submitBtn, right.fullWidth && styles.submitBtnFull]}
            onPress={handlerMap[right.handler]}
          >
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(right.label)}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <HeaderProvider
          title={
            readOnly
              ? t(STRING.viewForm)
              : isInProgress
              ? t(STRING.service)
              : t(STRING.updateForm)
          }
          onViewFormPress={() => {
            viewSignedPdf(
              requestData?.signedPdfUrl,
              undefined,
              requestData?.requestId || request?.requestId,
            );
          }}
          isBack
          isViewForm={requestData?.status === REQUEST_STATUS.IN_PROGRESS}
          formStatus={requestData?.formStatus}
          status={requestData?.status}
          style={
            {
              ...styles.header,
              marginBottom: getScaleSize(12),
            } as any
          }
        />
        {isFetched && hasError ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <AppText color={COLORS.primary}>
              {t(STRING.somethingWentWrong)}
            </AppText>
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableAutomaticScroll={true}
              >
                <View>
                  <View
                    style={{
                      backgroundColor: COLORS._F9FAFB,
                    }}
                  >
                    <ServiceFormRenderer
                      formRef={formRef}
                      serviceId={serviceId || ''}
                      initialData={requestData}
                      patient={patientData}
                      prescriber={
                        (requestData as any)?.doctor ||
                        (requestData as any)?.doctorId 
                      }
                      readOnly={readOnly}
                    />
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </View>
            <CompleteServiceSheet
              ref={completeSheetRef}
              onComplete={async () => {
                handleCompleteRequest();
              }}
            />
            {!readOnly && <WarningSheet isLock={true} ref={warningSheetRef} />}
            {renderBottomBar()}
            {!isCancelled && isInProgress && isComplete && (
              <AppButton
                title={t(STRING.markAsCompleted)}
                onPress={() => {
                  completeSheetRef?.current?.show();
                }}
                style={styles.completeBtn}
              />
            )}
          </>
        )}
      </View>
      {/* <AppLoader visible={isLoading} /> */}
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
  completeBtn: {
    marginBottom: getScaleSize(16),
    marginHorizontal: getScaleSize(16),
    backgroundColor: COLORS.completed,
    elevation: 5,
    shadowColor: COLORS.completed,
  },
  header: {
    // height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    // shadowColor: COLORS.black,
    // shadowOpacity: 0.04,
    // shadowRadius: 4,
    // elevation: 1,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
  },

  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 2,
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
  sectionTitleRow: {
    marginTop: 6,
    backgroundColor: COLORS.white,
  },
  summaryCard: {
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    paddingVertical: getScaleSize(14),
    paddingHorizontal: getScaleSize(17),
    gap: getScaleSize(12),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRowDivider: {
    height: getScaleSize(1),
    backgroundColor: COLORS._EFEFEF,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  avatarWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._E8EDF1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconWrap: {
    backgroundColor: COLORS._EDF2F7,
  },
  summaryTextBlock: {
    gap: getScaleSize(2),
  },
  formGroup: {
    gap: getScaleSize(10),
  },
  priorityRow: {
    flexDirection: 'row',
    gap: getScaleSize(10),
  },
  priorityPill: {
    flex: 1,
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  priorityRoutine: {
    borderColor: COLORS._526674,
    backgroundColor: COLORS._E8EDF1,
  },
  priorityUrgent: {
    borderColor: COLORS._F59E0B,
    backgroundColor: COLORS._FFF4E5,
  },
  priorityEmergency: {
    borderColor: COLORS._B42318,
    backgroundColor: COLORS._FEF2F2,
  },
  doubleRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  inputBlock: {
    flex: 1,
    gap: getScaleSize(8),
  },
  inputField: {
    paddingHorizontal: getScaleSize(0),
  },
  textArea: {
    minHeight: getScaleSize(110),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(12),
    textAlignVertical: 'top',
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    padding: getScaleSize(16),
    gap: getScaleSize(16),
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
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
  saveBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // full-width variant for single-button rows (e.g. Claim Service)
  submitBtnFull: {
    flex: 1,
  },
  nextDisabled: {
    opacity: 0.6,
  },
});

export default ProviderFormScreen;
