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
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import {
  AppText,
  ReviewRequestSheet,
  AppLoader,
  ProfileAvatar,
  AppSafeAreaView,
} from '../../../components';
import { SHOW_TOAST } from '../../../constant/showToast';
import { setLoading as setGlobalLoading } from '../../../actions/common/commonSlice';
import LinearGradient from 'react-native-linear-gradient';
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
import { handleClaimService } from '../../doctor/forms/formActionHandlers';
import { useTranslation } from 'react-i18next';
import { fetchProfile } from '../../../actions/profile/profileAction';

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
  patient: DashboardPatient;
  service: DashboardService;
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
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { profileData } = useSelector((state: RootState) => state.profile);
  const isLoading = useSelector((state: RootState) => state.common.isLoading);
  const reviewSheetRef = useRef<ActionSheetRef>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);
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
        dashboardApi.getProviderDashboardOverview(5),
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

  return (
    <AppSafeAreaView edges={['top']} style={styles.safe}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {profileData?.profileImg ? (
              <Image
                source={
                  profileData?.profileImg
                    ? { uri: IMAGE_BASE_URL + profileData.profileImg }
                    : IMAGES.ic_profile
                }
                style={styles.avatar}
              />
            ) : (
              <ProfileAvatar size="medium" name={profileData?.fullName} />
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
                {profileData?.providerName}
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              NavigationService.navigate(SCREENS.ALERTS)
            }
            activeOpacity={0.7}
            style={styles.notificationBtn}
          >
            <View style={styles.notificationIconContainer}>
              <Image
                source={IMAGES.notification_icon}
                style={styles.notificationIcon}
              />
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <AppText
                    size={getScaleSize(8)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                    style={styles.badgeText}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </AppText>
                </View>
              )}
            </View>
          </TouchableOpacity>
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
          {/* Overview Section */}
          <View style={styles.sectionHeader}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color="#374151"
            >
              {t(STRING.overview)}
            </AppText>
          </View>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <LinearGradient
                colors={[COLORS.white, COLORS._3B82F6]}
                start={{ x: -0.1, y: -0.7 }}
                end={{ x: 2, y: -2 }}
                style={styles.glowGradient}
              />
              <View style={styles.kpiTopRow}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={styles.kpiTitle}
                >
                  {t(STRING.available)}
                </AppText>
                <Image source={IMAGES.ic_submitted} style={styles.kpiIcon} />
              </View>
              <AppText
                size={getScaleSize(24)}
                font={FONTS.Inter.Bold}
                color="#111827"
                style={{ marginTop: getScaleSize(4) }}
              >
                {dashboardData?.overview?.submittedAvailableCount || '0'}
              </AppText>
            </View>

            <View style={styles.kpiCard}>
              <LinearGradient
                colors={[COLORS.white, COLORS._F59E0B]}
                start={{ x: -0.1, y: -0.7 }}
                end={{ x: 2, y: -2 }}
                style={styles.glowGradient}
              />
              <View style={styles.kpiTopRow}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                >
                  {t(STRING.inProgress)}
                </AppText>
                <Image source={IMAGES.ic_inprogress} style={styles.kpiIcon} />
              </View>
              <AppText
                size={getScaleSize(24)}
                font={FONTS.Inter.Bold}
                color="#111827"
                style={{ marginTop: getScaleSize(4) }}
              >
                {dashboardData?.overview?.inProgressCount || '0'}
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.kpiWide}
            onPress={() =>
              NavigationService.navigate(PROVIDER_TAB_SCREENS.REQUESTS, {
                status: 'Completed',
                refreshKey: Date.now(),
              })
            }
          >
            <View style={styles.kpiWideLeft}>
              <Image
                source={IMAGES.ic_completed}
                style={[styles.completedIcon]}
              />
              <View style={{ marginLeft: getScaleSize(12) }}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                >
                  {t(STRING.completedToday)}
                </AppText>
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color="#111827"
                >
                  {dashboardData?.overview?.completedTodayCount || '0'}{' '}
                  {t(STRING.services)}
                </AppText>
              </View>
            </View>
            <Image source={IMAGES.arrow_right} style={styles.chevron} />
          </TouchableOpacity>

          {/* Recent Queue Section */}
          <View style={[styles.sectionHeader, { marginTop: getScaleSize(24) }]}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color="#374151"
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
              const formStatus = item.formStatus;
              const buttonConfig = getButtonConfigProvider(
                formStatus,
                item?.status,
              );
              return (
                <View
                  key={item.id || index}
                  style={{
                    marginBottom: getScaleSize(12),
                  }}
                >
                  <RequestCardProvider
                    name={item?.patient?.fullName || ''}
                    requestId={item?.requestId}
                    requestType={item?.service?.serviceName || ''}
                    formStatus={item?.formStatus}
                    status={item?.status}
                    buttonText={
                      buttonConfig.show && buttonConfig.label
                        ? t(buttonConfig.label)
                        : undefined
                    }
                    onPress={() => {
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
                    onButtonPress={() =>
                      NavigationService.navigate(
                        SCREENS.PROVIDER_FORMS_SCREEN,
                        {
                          request: item,
                          action: buttonConfig.action,
                          ...(buttonConfig.isComplete && {
                            isComplete: buttonConfig.isComplete,
                          }),
                        },
                      )
                    }
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
    borderBottomWidth: 0.5,
    borderColor: COLORS._EFEFEF,
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
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getScaleSize(12),
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    height: getScaleSize(96),
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(16),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  glowGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: getScaleSize(80),
    height: getScaleSize(80),
    zIndex: 0,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // fine to keep
  },
  kpiTitle: {
    flex: 1,
    marginRight: getScaleSize(8),
  },
  kpiIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
    flexShrink: 0, // icon stays fixed size, never gets pushed/squeezed
  },
  kpiWide: {
    marginTop: getScaleSize(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(12),
    padding: getScaleSize(17),
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiWideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedIcon: {
    height: getScaleSize(40),
    width: getScaleSize(40),
    resizeMode: 'contain',
  },
  chevron: {
    width: getScaleSize(9),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: '#CBD5E1',
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
