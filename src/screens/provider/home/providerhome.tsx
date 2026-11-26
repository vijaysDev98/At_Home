import React, { useState, useCallback, useRef } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import {
  AppText,
  ReviewRequestSheet,
  AppLoader,
  ProfileAvatar,
  AppSafeAreaView,
  HomeChatNotificationActions,
} from '../../../components';
import { SHOW_TOAST } from '../../../constant/showToast';
import { setLoading as setGlobalLoading } from '../../../actions/common/commonSlice';
import NavigationService from '../../../navigation/NavigationService';
import { PROVIDER_TAB_SCREENS, SCREENS } from '../../../navigation/routes';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { DISABLE_API_LOGS, IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { FORM_STATUS, STRING } from '../../../constant';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { dashboardApi } from '../../../services/dashboard';
import { getUnreadCountService } from '../../../services/notificationService';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import RequestCardProvider from '../../../components/RequestCardProvider';
import {
  DISPLAY_FORM_STATUS,
  getButtonConfigProvider,
  REQUEST_STATUS,
} from '../../../constant/RequestStatus';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useTranslation } from 'react-i18next';
import { fetchProfile } from '../../../actions/profile/profileAction';
import FastImage from 'react-native-fast-image';
import {
  capitalizeFirstLetter,
  isDelegatedToProvider,
} from '../../../constant/smallFunctions';
import { useChatUnreadBadge } from '../../../hooks/useChatUnreadBadge';

// Dashboard interfaces
interface DashboardPatient {
  id: string;
  fullName: string;
}

interface DashboardService {
  id: string;
  serviceName: string;
}

interface DashboardRecentQueue {
  id: string;
  requestId: string;
  status: string;
  formStatus: string;
  updatedAt: string;
  patient?: DashboardPatient | null;
  service?: DashboardService | null;
  isPreRequest?: boolean;
  preRequestStatus?: string;
  voiceMessageUrl?: string | null;
  initialNotes?: string | null;
  priorityLevel?: string | null;
  doctor?: any;
}

interface DashboardRequestsOverview {
  inProgressCount: number;
  submittedAvailableCount: number;
  returnedCount: number;
  completedTodayCount?: number;
}

interface DashboardData {
  overview: DashboardRequestsOverview;
  recentQueue: DashboardRecentQueue[];
}

const ProviderHome: React.FC = () => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { profileData } = useSelector((state: RootState) => state.profile);
  const isLoading = useSelector((state: RootState) => state.common.isLoading);
  const reviewSheetRef = useRef<ActionSheetRef>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const unreadChatCount = useChatUnreadBadge();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<DashboardRecentQueue | null>(null);

  // Fetch dashboard data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      dispatch(fetchProfile());
    }, []),
  );

  const fetchDashboardData = async () => {
    // dispatch(setGlobalLoading(true));
    try {
      const [dashboardResponse, count] = await Promise.all([
        dashboardApi.getProviderDashboardOverview(10),
        getUnreadCountService(),
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }
      setUnreadCount(count);
    } catch (error) {
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    dispatch(fetchProfile());
    setRefreshing(false);
  }, []);

  const recentQueue = dashboardData?.recentQueue || [];

  const onReturnRequest = async (
    reason: string,
    details: string,
    requestId: string,
  ) => {
    if (!selectedRequest?.id) {
      SHOW_TOAST(t(STRING.missingID), 'error');
      return;
    }
    dispatch(setGlobalLoading(true));
    try {
      let obj = {
        reasonType: reason,
        comments: details,
      };

      const response = await serviceRequestApi.claimAndReturnRequest(
        selectedRequest.id,
        obj,
      );
      if (response.success) {
        await serviceRequestApi.releaseFormLock(requestId);
        SHOW_TOAST(response.message, 'success');
        reviewSheetRef?.current?.hide();
        await fetchDashboardData();
      } else {
        SHOW_TOAST(response.error, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message, 'error');
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  const openProfileTab = () => {
    NavigationService.navigate(PROVIDER_TAB_SCREENS.PROFILE);
  };

  const handleOrderAmbulance = useCallback(() => {
    NavigationService.navigate(SCREENS.ORDER_AMBULANCE);
  }, []);

  const handleOpenPharmacyAssistant = useCallback(() => {
    NavigationService.navigate(SCREENS.PHARMACY_AI_CHAT);
  }, []);

  return (
    <AppSafeAreaView edges={['top']} style={styles.safe}>
      <AppLoader visible={isFocused && isLoading} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            activeOpacity={0.75}
            onPress={openProfileTab}
            accessibilityRole="button"
            accessibilityLabel={t(STRING.profile)}
          >
            {profileData?.profileImg ? (
              <FastImage
                source={
                  profileData?.profileImg
                    ? { uri: IMAGE_BASE_URL + profileData.profileImg }
                    : IMAGES.ic_profile
                }
                style={styles.avatar}
              />
            ) : (
              <ProfileAvatar size="medium" name={profileData?.providerName} />
            )}
            <View>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._1A1D1F}
              >
                {t(STRING.welcome)}
              </AppText>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS.black}
              >
                {capitalizeFirstLetter(profileData?.providerName || '')}
              </AppText>
            </View>
          </TouchableOpacity>
          <HomeChatNotificationActions
            unreadNotificationCount={unreadCount}
            unreadChatCount={unreadChatCount}
            onNotificationPress={() =>
              NavigationService.navigate(SCREENS.ALERTS)
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Quick Actions */}
          <View style={styles.quickActionRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.quickFeatureCard, styles.quickFeatureCardBlue]}
              onPress={handleOrderAmbulance}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.homeOrderAmbulance)}
            >
              <Image
                source={IMAGES.ic_home_card_ambulance}
                style={styles.quickFeatureIcon}
              />
              <View style={styles.quickFeatureLabelWrap}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  align="center"
                  style={styles.quickFeatureLabel}
                  numberOfLines={4}
                >
                  {t(STRING.homeOrderAmbulance)}
                </AppText>
              </View>
              <Image
                source={IMAGES.arrow_right}
                style={styles.quickFeatureChevron}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.quickFeatureCard, styles.quickFeatureCardPurple]}
              onPress={handleOpenPharmacyAssistant}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.homeCommunityPharmacies)}
            >
              <Image
                source={IMAGES.ic_home_card_pharmacy}
                style={styles.quickFeatureIcon}
              />
              <View style={styles.quickFeatureLabelWrap}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  align="center"
                  style={styles.quickFeatureLabel}
                  numberOfLines={4}
                >
                  {t(STRING.homeCommunityPharmacies)}
                </AppText>
              </View>
              <Image
                source={IMAGES.arrow_right}
                style={styles.quickFeatureChevron}
              />
            </TouchableOpacity>
          </View>

          {/* Recent Queue Section */}
          <View style={[styles.sectionHeader, { marginTop: getScaleSize(24) }]}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.recentQueue)}
            </AppText>
            <TouchableOpacity
              onPress={() => {
                NavigationService.navigate(PROVIDER_TAB_SCREENS.REQUESTS);
              }}
            >
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Medium}
                color={COLORS._526674}
              >
                {t(STRING.seeAll)}
              </AppText>
            </TouchableOpacity>
          </View>

          {recentQueue.length > 0 ? (
            recentQueue.map((item: DashboardRecentQueue, index: number) => {
              const isPreReq = Boolean(
                item.isPreRequest === true ||
                (item.isPreRequest === undefined &&
                  !item.patient &&
                  !item.service &&
                  Boolean(item.preRequestStatus)),
              );
              const formStatus =
                item.formStatus || item.preRequestStatus || item.status || '';

              const doctor = (item as any)?.doctor;
              const doctorName =
                doctor?.fullName ||
                (doctor
                  ? `${doctor.fName || ''} ${doctor.lName || ''}`.trim()
                  : null);

              const isAcceptedPreReq =
                isPreReq &&
                (item?.preRequestStatus === 'accepted' ||
                  item?.status === 'accepted');

              const isDelegated = isDelegatedToProvider(item);

              const buttonConfig = isAcceptedPreReq
                ? isDelegated
                  ? { show: true, label: STRING.fillForm, action: 'fillForm' }
                  : { show: false, label: null, action: null }
                : isPreReq
                  ? {
                    show:
                      item?.status === 'submitted' ||
                      item?.preRequestStatus === 'pending',
                    label: STRING.accept,
                    action: 'accept',
                  }
                  : getButtonConfigProvider(formStatus, item?.status);

              return (
                <View
                  key={item.id || index}
                  style={{
                    marginBottom: getScaleSize(12),
                  }}
                >
                  <RequestCardProvider
                    name={
                      item?.patient?.fullName ||
                      (isPreReq
                        ? t(STRING.preRequest) ||
                        'Pre-Request'
                        : '')
                    }
                    requestId={item?.requestId}
                    requestType={item?.service?.serviceName || ''}
                    formStatus={formStatus}
                    status={item?.status}
                    isPreRequest={isPreReq}
                    preRequestStatus={item?.preRequestStatus}
                    voiceMessageUrl={item?.voiceMessageUrl}
                    initialNotes={item?.initialNotes}
                    priorityLevel={item?.priorityLevel}
                    doctorName={doctorName}
                    doctorSpecialty={doctor?.specialty}
                    delegateFormToProvider={isDelegated}
                    request={item}
                    buttonText={
                      buttonConfig.show && buttonConfig.label
                        ? t(buttonConfig.label)
                        : undefined
                    }
                    onPress={() => {
                      if (isPreReq) {
                        NavigationService.navigate(
                          SCREENS.PROVIDER_PRE_REQUEST_DETAIL,
                          {
                            request: item,
                            action: isAcceptedPreReq ? 'view' : 'accept',
                          },
                        );
                        return;
                      }
                      if (item.status == REQUEST_STATUS.COMPLETED) {
                        NavigationService.navigate(SCREENS.SERVICE_COMPLETED, {
                          request: item,
                        });
                        return;
                      }
                      NavigationService.navigate(
                        SCREENS.PROVIDER_FORMS_SCREEN,
                        {
                          request: item,
                          action: 'view',
                        },
                      );
                    }}
                    onButtonPress={() => {
                      if (isPreReq) {
                        if (buttonConfig.action === 'fillForm') {
                          const itemAny = item as any;
                          const doctorObj =
                            doctor ||
                            (itemAny?.doctorId
                              ? {
                                id: itemAny.doctorId,
                                fullName: doctorName || '',
                              }
                              : null);
                          const assignedProviderId =
                            itemAny?.assignedProviderId ||
                            itemAny?.assignedProvider?._id ||
                            itemAny?.assignedProvider?.id ||
                            itemAny?.providerId ||
                            itemAny?.provider?._id ||
                            itemAny?.provider?.id;

                          NavigationService.navigate(SCREENS.CREATE_REQUEST, {
                            preRequest: item,
                            preRequestId:
                              item.id || itemAny?._id || item.requestId,
                            fromPreRequest: true,
                            doctorId: doctorObj?.id || itemAny?.doctorId,
                            selectedDoctor: doctorObj,
                            assignedProviderId,
                          });
                          return;
                        }

                        NavigationService.navigate(
                          SCREENS.PROVIDER_PRE_REQUEST_DETAIL,
                          {
                            request: item,
                            action: 'accept',
                          },
                        );
                        return;
                      }
                      NavigationService.navigate(
                        SCREENS.PROVIDER_FORMS_SCREEN,
                        {
                          request: item,
                          action: buttonConfig.action,
                          ...(buttonConfig.isComplete && {
                            isComplete: buttonConfig.isComplete,
                          }),
                        },
                      );
                    }}
                    onLeftButtonPress={() => {
                      setSelectedRequest(item);
                      reviewSheetRef.current?.show();
                    }}
                  />
                </View>
              );
            })
          ) : (
            <View
              style={{
                paddingVertical: getScaleSize(20),
                alignItems: 'center',
              }}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
              >
                {t(STRING.noRecentRequests)}
              </AppText>
            </View>
          )}
        </ScrollView>
        <ReviewRequestSheet
          ref={reviewSheetRef}
          onSend={async (reason, details) => {
            // await handleClaimService({
            //   requestId: selectedRequest?.id || '',
            //   dispatch,
            //   onSuccess: async () => {
            //     await onReturnRequest(
            //       reason,
            //       details,
            //       selectedRequest?.id || '',
            //     );
            //   },
            // });
            await onReturnRequest(reason, details, selectedRequest?.id || '');
          }}
        />
      </View>
    </AppSafeAreaView>
  );
};

export default ProviderHome;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(24),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS._EFEFEF,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  avatar: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(24),
    // resizeMode: 'contain'
  },
  notificationBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(22),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS._EFEFEF,
  },
  notificationIcon: {
    width: getScaleSize(16),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(20),
    paddingBottom: getScaleSize(120),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(12),
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: getScaleSize(10),
  },
  quickFeatureCard: {
    flex: 1,
    borderRadius: getScaleSize(16),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: getScaleSize(164),
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  quickFeatureCardBlue: {
    backgroundColor: '#E8F2FE',
  },
  quickFeatureCardPurple: {
    backgroundColor: '#F2F0FF',
  },
  quickFeatureIcon: {
    width: getScaleSize(72),
    height: getScaleSize(72),
    resizeMode: 'contain',
  },
  quickFeatureLabelWrap: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: getScaleSize(4),
  },
  quickFeatureLabel: {
    width: '100%',
    lineHeight: getScaleSize(16),
  },
  quickFeatureChevron: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
    alignSelf: 'center',
  },
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(12),
    padding: getScaleSize(17),
    marginBottom: getScaleSize(12),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  queueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialsBox: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: getScaleSize(12),
    height: getScaleSize(25),
    borderRadius: getScaleSize(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(16),
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(16),
  },
  startServiceBtn: {
    backgroundColor: COLORS._526674,
    borderRadius: getScaleSize(8),
    height: getScaleSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 0,
  },
  notificationIconContainer: {
    position: 'relative',
    width: getScaleSize(24),
    height: getScaleSize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: -7,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: getScaleSize(8),
    minWidth: getScaleSize(16),
    height: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(3),
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    textAlign: 'center',
    lineHeight: getScaleSize(13),
  },
});
