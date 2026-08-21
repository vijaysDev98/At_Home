import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { setLoading } from '../../../actions/common/commonSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useIsFocused,
  useRoute,
} from '@react-navigation/native';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppSafeAreaView,
  AppText,
  Input,
  RequestSummaryCard,
  AppLoader,
  WarningSheet,
  Header,
  FormSignature,
  REVIEW_REASONS,
  ProviderOptionSheet,
  SelectProviderSheet,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import moment from 'moment';
import { RootStackParamList } from '../../../navigation';
import { STRING } from '../../../constant';

import {
  FORM_STATUS,
  REQUEST_STATUS,
  getFormScreenButtons,
  FormScreenButtonConfig,
  FormScreenHandlerKey,
} from '../../../constant/RequestStatus';
import { SHOW_TOAST } from '../../../constant/showToast';
import {
  ServiceDetailInfo,
  ServiceInfo,
  ServiceRequest,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

import FormRequestHeader from '../../../components/FormRequestHeader';
import { getServiceIcon } from '../createRequest/createRequestStep2';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import ServiceFormRenderer from './ServiceFormRenderer';
import { useFormLockRefresh } from '../../../hooks/useFormLockRefresh';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../../../constant/getRole';
import { viewSignedPdf } from '../../../hooks/pdfDownloader';

export type CreateRequestStep3Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateRequestStep3'
>;

const FormsScreen: React.FC = () => {
  const route = useRoute();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const request: ServiceRequest = (route.params as any)?.request;
  const service: ServiceInfo = request?.service || {};
  const action = (route.params as any)?.action;
  const from = (route.params as any)?.from;
  const { profileData } = useSelector((state: RootState) => state.profile);
  const currentUserId = (profileData as any)?._id || (profileData as any)?.id;
  const requestId = request?.id;

  // Extract service and patient from request object
  const patientData = request?.patient || {};

  // Use patient from request, or fallback to Redux
  const [requestData, setRequestData] = useState<ServiceRequestDetail | null>(
    null,
  );
  const serviceName =
    service?.serviceName || requestData?.serviceId?.serviceName;

  const [hasError, setHasError] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const status = requestData?.status;
  const formStatus = requestData?.formStatus;

  const serviceId =
    service?.id ||
    service?._id ||
    requestData?.serviceId?._id ||
    (typeof requestData?.serviceId === 'string'
      ? requestData?.serviceId
      : (requestData?.serviceId as any)?.id) ||
    (request?.service as any)?.id ||
    (request?.service as any)?._id ||
    (request as any)?.serviceId;

  const warningSheetRef = useRef<ActionSheetRef>(null);
  const providerOptionSheetRef = useRef<ActionSheetRef>(null);
  const selectProviderSheetRef = useRef<ActionSheetRef>(null);

  // Use global loader state from Redux
  const isLoading = useSelector((state: RootState) => state.common.isLoading);

  // Ref to store form ref
  const formRef = useRef<any>(null);

  const handleSendToAllProviders = async () => {
    providerOptionSheetRef.current?.hide();
    if (formRef.current?.validateAndSubmit) {
      await formRef.current.validateAndSubmit();
    }
  };

  const handleSendToSpecificProvider = () => {
    providerOptionSheetRef.current?.hide();
    setTimeout(() => {
      selectProviderSheetRef.current?.show(serviceId);
    }, 250);
  };

  const handleProviderSelected = async (provider: any) => {
    const selectedProviderId = provider?.id || provider?._id;
    if (formRef.current?.validateAndSubmit) {
      await formRef.current.validateAndSubmit({
        providerId: selectedProviderId,
      });
    }
  };

  const readOnly = useMemo(() => {
    return (
      action === 'view' ||
      requestData?.formStatus === FORM_STATUS.AWAITING_SIGNATURE ||
      (requestData?.formStatus === FORM_STATUS.SIGNED &&
        requestData?.status !== REQUEST_STATUS.RETURNED)
    );
  }, [action, requestData]);

  // Use custom hook for lock refresh
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

  // config in RequestStatus.ts picks which one gets called.
  const handlerMap: Record<FormScreenHandlerKey, () => Promise<void>> = {
    // Doctor: save current form state without submitting
    saveAsDraft: async () => {
      if (formRef.current?.saveAsDraft) {
        await formRef.current.saveAsDraft();
      }
    },

    // Doctor: first-time submit (draft → submitted) with provider selection
    submitRequest: async () => {
      if (formRef.current?.validateForm) {
        const isValid = formRef.current.validateForm();
        if (!isValid) {
          return;
        }
      }
      providerOptionSheetRef.current?.show();
    },

    // Doctor: update already-submitted form and navigate to review / sign
    updateAndSign: async () => {
      dispatch(setLoading(true));
      try {
        if (formRef.current?.updateAndSign) {
          const result = await formRef.current.updateAndSign();
          if (!result.success) return;
        }
        const reviewResponse = await serviceRequestApi.getReviewData(
          requestId || '',
        );
        if (reviewResponse.success) {
          NavigationService.replace(SCREENS.FORM_REVIEW_SCREEN, {
            request: { ...request, ...reviewResponse.data },
          });
        } else {
          SHOW_TOAST(
            reviewResponse.error || 'Failed to get review data',
            'error',
          );
        }
      } catch (error: any) {
        SHOW_TOAST(error?.message || 'Error preparing review', 'error');
      } finally {
        dispatch(setLoading(false));
      }
    },

    // Doctor: re-edit a returned form and re-sign (same flow as updateAndSign for now)
    updateAndResign: async () => {
      dispatch(setLoading(true));
      try {
        if (formRef.current?.updateAndSign) {
          const result = await formRef.current.updateAndSign();
          if (!result.success) return;
        }
        const reviewResponse = await serviceRequestApi.getReviewData(
          requestId || '',
        );
        if (reviewResponse.success) {
          NavigationService.navigate(SCREENS.FORM_REVIEW_SCREEN, {
            request: { ...request, ...reviewResponse.data },
          });
        } else {
          SHOW_TOAST(reviewResponse.error, 'error');
        }
      } catch (error: any) {
        SHOW_TOAST(error?.message, 'error');
      } finally {
        dispatch(setLoading(false));
      }
    },

    updateFormData: async () => {
      if (formRef.current?.saveProgress) {
        await formRef.current.saveProgress();
      }
    },

    saveProgress: async () => {
      if (formRef.current?.saveProgress) {
        await formRef.current.saveProgress();
      }
    },

    // Unused provider handlers (kept for type safety)
    submitForReview: async () => { },
    claimService: async () => { },
  };

  // Fetch service request details when in view mode
  useEffect(() => {
    if (isFocused && requestId) {
      fetchServiceRequestDetails();
    }
  }, [isFocused, requestId]);

  const fetchServiceRequestDetails = async () => {
    try {
      setHasError(false);
      const data = await serviceRequestApi.getServiceRequestDetails(
        requestId || '',
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
  };

  // Derive which buttons to show — pure data, no JSX branching
  const buttonConfig: FormScreenButtonConfig = useMemo(
    () => getFormScreenButtons(ROLES.DOCTOR, status, formStatus, action, from),
    [status, formStatus, action, from],
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
              color={COLORS._1A1D1F}
              align="center"
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
              align="center"
            >
              {t(right.label)}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <AppSafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: COLORS.white }}
    >
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        <Header
          title={t(STRING.medicalForm)}
          isBack={true}
          style={styles.header}
          isViewForm={requestData?.status === REQUEST_STATUS.IN_PROGRESS}
          onViewFormPress={() => {
            viewSignedPdf(
              requestData?.signedPdfUrl,
              undefined,
              requestData?.requestId || request?.requestId,
            );
          }}
        />
        {isFetched && hasError ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <AppText color={COLORS.primary}>
              {t(STRING.somethingWentWrong)}
            </AppText>
          </View>
        ) : !isFetched ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            {/* <AppLoader visible={true} /> */}
          </View>
        ) : (
          <>
            <View style={styles.content}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Patient Info Header */}
                <FormRequestHeader
                  patientData={requestData?.patientId as any}
                  serviceName={serviceName}
                  requestData={requestData}
                />
                {requestData?.status === REQUEST_STATUS.RETURNED &&
                  requestData?.returnReasons &&
                  requestData.returnReasons.length > 0 && (
                    <>
                      <AppText
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        size={getScaleSize(16)}
                        style={{ marginLeft: getScaleSize(16) }}
                      >
                        {t(STRING.returnReason)}
                      </AppText>
                      <View style={styles.returnCard}>
                        <AppText
                          font={FONTS.Inter.SemiBold}
                          color={COLORS.inProgress}
                        >
                          {t(
                            REVIEW_REASONS.find(
                              reason =>
                                reason.key ===
                                requestData.returnReasons[
                                  requestData.returnReasons.length - 1
                                ].reason,
                            )?.value || '',
                          )}
                        </AppText>
                        <AppText
                          font={FONTS.Inter.Regular}
                          color={COLORS.inProgress}
                        >
                          {requestData?.returnComments}
                        </AppText>
                      </View>
                    </>
                  )}
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
                      readOnly={readOnly}
                    />
                  </View>
                </View>
                {formStatus == FORM_STATUS.SIGNED && (
                  <View style={styles.signatureContainer}>
                    <FormSignature readOnly={true} requestData={requestData} />
                  </View>
                )}
              </ScrollView>
            </View>

            {renderBottomBar()}
            {!readOnly && <WarningSheet isLock={true} ref={warningSheetRef} />}

            {/* Provider Selection Bottom Sheets for submitting Drafts */}
            <ProviderOptionSheet
              ref={providerOptionSheetRef}
              onSendToAll={handleSendToAllProviders}
              onSendToSpecific={handleSendToSpecificProvider}
            />

            <SelectProviderSheet
              ref={selectProviderSheetRef}
              serviceId={serviceId}
              onSelectProvider={handleProviderSelected}
            />
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
  returnCard: {
    // backgroundColor: `${COLORS.inProgress}10`,
    padding: getScaleSize(16),
    marginHorizontal: getScaleSize(12),
    // marginTop: getScaleSize(10),
    // margin: getScaleSize(16),
    borderRadius: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS.inProgress,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  signatureContainer: {
    paddingHorizontal: getScaleSize(16),
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
    // paddingHorizontal: 20,
    paddingBottom: 160,
    // paddingTop: 12,
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

export default FormsScreen;
