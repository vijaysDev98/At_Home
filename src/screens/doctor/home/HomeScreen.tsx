import React, { useState, useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppSafeAreaView, AppText } from '../../../components';
import RequestCard from '../../../components/RequestCard';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant/strings';
import { FORM_STATUS, REQUEST_STATUS } from '../../../constant/RequestStatus';
import NavigationService from '../../../navigation/NavigationService';
import { DOCTOR_TAB_SCREENS, SCREENS } from '../../../navigation/routes';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { getButtonConfig } from '../../../constant';
import { dashboardApi } from '../../../services/dashboard';

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
  submittedCount: number;
  returnedCount: number;
}

interface DashboardActionRequired {
  awaitingSignatureCount: number;
}

interface DashboardPatients {
  totalPatients: number;
}

interface DashboardData {
  requestsOverview: DashboardRequestsOverview;
  actionRequired: DashboardActionRequired;
  patients: DashboardPatients;
  recentQueue: DashboardRecentQueue[];
}

const HomeScreen: React.FC = () => {
  const { profileData } = useSelector((state: RootState) => state.profile);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, []),
  );

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getDashboardOverview(5);
      console.log('dashdata', response);

      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  // Prepare metrics from API data or use defaults
  const metrics = [
    {
      id: REQUEST_STATUS.SUBMITTED,
      value: dashboardData?.requestsOverview?.submittedCount?.toString() || '0',
      label: STRING.submitted,
      icon: IMAGES.document_icon,
    },
    {
      id: REQUEST_STATUS.RETURNED,
      value: dashboardData?.requestsOverview?.returnedCount?.toString() || '0',
      label: STRING.returned,
      icon: IMAGES.document_icon,
    },
    {
      id: REQUEST_STATUS.COMPLETED,
      value: dashboardData?.requestsOverview?.completedCount?.toString() || '0',
      label: STRING.completed,
      icon: IMAGES.clipboard,
    },
  ];

  const actionRequired = [
    {
      id: 'signature',
      title: STRING.formAwaitingSignature,
      value:
        dashboardData?.actionRequired?.awaitingSignatureCount?.toString() ||
        '0',
      icon: IMAGES.document_icon,
    },
  ];

  const patientMetrics = [
    {
      id: 'patients',
      title: STRING.totalPatients,
      value: dashboardData?.patients?.totalPatients?.toString() || '0',
      icon: IMAGES.patients_icon,
    },
  ];

  const recentQueue = dashboardData?.recentQueue || [];

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else if (hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
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
                {getGreeting()}
              </AppText>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS.black}
              >
                Dr. {profileData?.fName + ' ' + profileData?.lName}
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
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: getScaleSize(20) }}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Requests Overview */}
          <View>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={styles.sectionTitle}
            >
              {STRING.requestsOverview}
            </AppText>
            <View style={styles.activeContainer}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                style={styles.tabLabel}
              >
                {STRING.active}
              </AppText>

              <View style={styles.metricsList}>
                {metrics.map(item => (
                  <View key={item.id} style={styles.metricCard}>
                    <Image source={item.icon} style={styles.metricIcon} />
                    <AppText
                      size={getScaleSize(24)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                      style={{
                        marginTop: getScaleSize(15),
                        marginBottom: getScaleSize(2),
                      }}
                    >
                      {item.value}
                    </AppText>
                    <AppText
                      size={getScaleSize(13)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                    >
                      {item.label}
                    </AppText>
                  </View>
                ))}
              </View>
              {/* Action Required */}
              <View>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  style={styles.tabLabel}
                >
                  {STRING.actionRequired}
                </AppText>

                <View style={styles.actionList}>
                  {actionRequired.map(item => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        if (item.id === 'signature') {
                          NavigationService.navigate(
                            SCREENS.DOCTOR_BOTTOM_TABS,
                            {
                              screen: DOCTOR_TAB_SCREENS.DOCTOR_REQUEST,
                              params: {
                                formStatus: FORM_STATUS.RETURNED,
                              },
                            },
                          );
                        }
                      }}
                      key={item.id}
                      style={styles.actionItem}
                    >
                      <Image source={item.icon} style={styles.actionIcon} />
                      <View style={styles.actionContent}>
                        <AppText
                          size={getScaleSize(14)}
                          font={FONTS.Inter.Medium}
                          color={COLORS._6F767E}
                        >
                          {item.title}
                        </AppText>
                        <AppText
                          size={getScaleSize(20)}
                          font={FONTS.Inter.Bold}
                          color={COLORS._1A1D1F}
                        >
                          {item.value}
                        </AppText>
                      </View>
                      <AppText
                        size={getScaleSize(13)}
                        font={FONTS.Inter.SemiBold}
                        color={COLORS._526674}
                      >
                        {STRING.viewAll} {'>'}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Patients Section */}
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  style={[styles.tabLabel]}
                >
                  {STRING.patients}
                </AppText>

                <View style={styles.actionList}>
                  {patientMetrics.map(item => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
                          screen: DOCTOR_TAB_SCREENS.PATIENTS,
                        });
                      }}
                      key={item.id}
                      style={styles.actionItem}
                    >
                      <Image source={item.icon} style={styles.actionIcon} />
                      <View style={styles.actionContent}>
                        <AppText
                          size={getScaleSize(14)}
                          font={FONTS.Inter.Medium}
                          color={COLORS._6F767E}
                        >
                          {item.title}
                        </AppText>
                        <AppText
                          size={getScaleSize(20)}
                          font={FONTS.Inter.Bold}
                          color={COLORS._1A1D1F}
                        >
                          {item.value}
                        </AppText>
                      </View>

                      <AppText
                        size={getScaleSize(13)}
                        font={FONTS.Inter.SemiBold}
                        color={COLORS._526674}
                      >
                        {STRING.viewAll} {'>'}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={[styles.sectionTitle, { marginTop: getScaleSize(24) }]}
            >
              {STRING.quickActions}
            </AppText>

            <View style={styles.quickGrid}>
              <TouchableOpacity
                onPress={() =>
                  NavigationService.navigate(SCREENS.CREATE_REQUEST)
                }
                activeOpacity={0.9}
                style={[styles.quickBtn, styles.quickBtnPrimary]}
              >
                <Image
                  source={IMAGES.new_request}
                  style={[styles.quickActionIcon, { tintColor: COLORS.white }]}
                />
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {STRING.newRequest}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => NavigationService.navigate(SCREENS.ADD_PATIENT)}
                style={[styles.quickBtn, styles.quickBtnSecondary]}
              >
                <Image
                  source={IMAGES.add_patient}
                  style={styles.quickActionIcon}
                />
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.primary}
                >
                  {STRING.addPatient}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Queue */}
          <View style={{ marginTop: getScaleSize(24) }}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1A1A}
              style={[styles.sectionTitle]}
            >
              {STRING.recentQueue}
            </AppText>
            {recentQueue.length > 0 ? (
              recentQueue.map((item: DashboardRecentQueue, index: number) => {
                const initials =
                  item.patient?.fullName
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || '';

                const formStatus = item.formStatus || item.status;
                const buttonConfig = getButtonConfig(formStatus);

                console.log('recentQueue', item);

                return (
                  <View
                    key={item.id || index}
                    style={{
                      marginHorizontal: getScaleSize(24),
                      marginBottom: getScaleSize(12),
                    }}
                  >
                    <RequestCard
                      name={item.patient?.fullName || ''}
                      initials={initials}
                      requestId={item.id}
                      requestType={item.service?.serviceName || ''}
                      formStatus={formStatus}
                      status={item.status}
                      buttonText={
                        buttonConfig.show
                          ? buttonConfig.label || undefined
                          : undefined
                      }
                      onButtonPress={() =>
                        NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                          request: item,
                        })
                      }
                    />
                  </View>
                );
              })
            ) : (
              <View
                style={{
                  marginHorizontal: getScaleSize(24),
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
          </View>
        </ScrollView>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  notificationIcon: {
    width: getScaleSize(16),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  quickActionIcon: {
    height: getScaleSize(22),
    width: getScaleSize(18),
    resizeMode: 'contain',
  },
  activeContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: getScaleSize(20),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(16),
    borderRadius: getScaleSize(20),
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
  bellPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: getScaleSize(12),
    right: getScaleSize(12),
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: '#FF4D4F',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: getScaleSize(100),
  },
  sectionTitle: {
    paddingHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(20),
    // marginTop: getScaleSize(24),
  },
  tabLabel: {
    // paddingHorizontal: getScaleSize(24),
    // marginBottom: getScaleSize(16),
  },
  metricsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: getScaleSize(12),
    gap: getScaleSize(10),
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(20),
    padding: getScaleSize(17),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  iconBox: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    resizeMode: 'contain',
  },
  actionList: {
    paddingVertical: getScaleSize(12),
    gap: getScaleSize(10),
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(20),
    padding: getScaleSize(17),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconBox: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: getScaleSize(40),
    height: getScaleSize(40),
  },
  actionContent: {
    flex: 1,
    marginLeft: getScaleSize(16),
    gap: getScaleSize(2),
  },
  viewAllBtn: {
    alignSelf: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    paddingHorizontal: getScaleSize(24),
    gap: getScaleSize(16),
  },
  quickBtn: {
    flex: 1,
    height: getScaleSize(120),
    borderRadius: getScaleSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(12),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  quickBtnPrimary: {
    backgroundColor: '#526674',
  },
  quickBtnSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickIcon: {
    width: getScaleSize(32),
    height: getScaleSize(32),
  },
});

export default HomeScreen;
