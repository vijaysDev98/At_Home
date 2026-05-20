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
import { AppText, ReviewRequestSheet, AppLoader } from '../../../components';
import { SHOW_TOAST } from '../../../constant/showToast';
import { setLoading as setGlobalLoading } from '../../../actions/common/commonSlice';
import LinearGradient from 'react-native-linear-gradient';
import NavigationService from '../../../navigation/NavigationService';
import { PROVIDER_TAB_SCREENS, SCREENS } from '../../../navigation/routes';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { FORM_STATUS, STRING } from '../../../constant';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { dashboardApi } from '../../../services/dashboard';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import RequestCardProvider from '../../../components/RequestCardProvider';
import { getButtonConfigProvider } from '../../../constant/RequestStatus';
import { ActionSheetRef } from 'react-native-actions-sheet';

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
  const dispatch = useDispatch();
  const { profileData } = useSelector((state: RootState) => state.profile);
  const isLoading = useSelector((state: RootState) => state.common.isLoading);
  const reviewSheetRef = useRef<ActionSheetRef>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<DashboardRecentQueue | null>(null);

  // Fetch dashboard data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, []),
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getProviderDashboardOverview(5);
      console.log('provider dashdata', response);

      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log('Error fetching provider dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const recentQueue = dashboardData?.recentQueue || [];

  const onReturnRequest = async (reason: string, details: string) => {
    console.log('onReturnRequest', selectedRequest, reason, details);
    if (!selectedRequest?.id) {
      SHOW_TOAST('Missing Request ID', 'error');
      return;
    }
    dispatch(setGlobalLoading(true));
    try {
      let obj = {
        reasonType: reason,
        comments: details,
      };

      const response = await serviceRequestApi.returnRequest(
        selectedRequest.id,
        obj,
      );
      if (response.success) {
        SHOW_TOAST(
          response.message || 'Request returned successfully',
          'success',
        );
        reviewSheetRef?.current?.hide();
        await fetchDashboardData();
      } else {
        SHOW_TOAST(response.error || 'Failed to return request', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message || 'Failed to return request', 'error');
    } finally {
      dispatch(setGlobalLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={
                profileData?.profileImg
                  ? { uri: IMAGE_BASE_URL + profileData.profileImg }
                  : IMAGES.ic_profile
              }
              style={styles.avatar}
            />
            <View>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._1A1D1F}
              >
                {STRING.welcomeBack}
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
              NavigationService.navigate(SCREENS.DOCTOR_NOTIFICATION)
            }
            activeOpacity={0.7}
            style={styles.notificationBtn}
          >
            <Image
              source={IMAGES.notification_icon}
              style={styles.notificationIcon}
            />
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
              Overview
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
                >
                  Submitted
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
                  In Progress
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
            // onPress={() => NavigationService.navigate('Forms' as never)}
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
                  Completed Today
                </AppText>
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color="#111827"
                >
                  {dashboardData?.overview?.completedTodayCount || '0'} Services
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
              Recent Queue
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
                See All
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
                    requestId={item?.id}
                    requestType={item?.service?.serviceName || ''}
                    formStatus={item?.formStatus}
                    status={item?.status}
                    buttonText={
                      buttonConfig.show
                        ? buttonConfig.label || undefined
                        : undefined
                    }
                    onPress={() =>
                      NavigationService.navigate(
                        SCREENS.PROVIDER_FORMS_SCREEN,
                        {
                          request: item,
                          action: 'view',
                        },
                      )
                    }
                    onButtonPress={() =>
                      NavigationService.navigate(
                        SCREENS.PROVIDER_FORMS_SCREEN,
                        {
                          request: item,
                          action: buttonConfig.action,
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
                No recent requests
              </AppText>
            </View>
          )}
        </ScrollView>
        <ReviewRequestSheet
          ref={reviewSheetRef}
          onSend={async (reason, details) => {
            onReturnRequest(reason, details);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProviderHome;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(24),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
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
});
