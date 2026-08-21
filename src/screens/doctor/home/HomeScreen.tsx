import React, { useState, useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  Platform,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppSafeAreaView, AppText, ProfileAvatar } from '../../../components';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant/strings';
import { FORM_STATUS, REQUEST_STATUS } from '../../../constant/RequestStatus';
import NavigationService from '../../../navigation/NavigationService';
import { DOCTOR_TAB_SCREENS, SCREENS } from '../../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { getButtonConfig } from '../../../constant';
import { dashboardApi } from '../../../services/dashboard';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../../../constant/smallFunctions';
import { setLoading } from '../../../actions/common/commonSlice';
import { fetchProfile } from '../../../actions/profile/profileAction';
import { getUnreadCountService } from '../../../services/notificationService';
import FastImage from 'react-native-fast-image';
import { MASTER_SERVICES_LIST, ServiceConfig } from '../../../constant/services';
import { getServiceIcon } from '../createRequest/createRequestStep2';

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
  completedCount?: number;
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
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllServices, setShowAllServices] = useState<boolean>(false);

  const doctorName =
    (profileData?.fName || '') + ' ' + (profileData?.lName || '');

  // Fetch dashboard data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      dispatch(fetchProfile());
    }, []),
  );

  const fetchDashboardData = async () => {
    try {
      const [response, count] = await Promise.all([
        dashboardApi.getDashboardOverview(10),
        getUnreadCountService(),
      ]);

      if (response.success) {
        setDashboardData(response.data);
      }
      setUnreadCount(count);
    } catch (error) {
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    dispatch(fetchProfile());
    setRefreshing(false);
  }, []);

  const handleServicePress = (service: ServiceConfig) => {
    NavigationService.navigate(SCREENS.SERVICE_SCREEN, {
      selectedService: service,
      serviceId: service.id,
    });
  };

  const handleEmergencyCall = () => {
    NavigationService.navigate(SCREENS.PROVIDERS_CALL_LIST);
  };

  const displayedServices = showAllServices
    ? MASTER_SERVICES_LIST
    : MASTER_SERVICES_LIST.slice(0, 6);

  const recentQueue = dashboardData?.recentQueue || [];

  return (
    <AppSafeAreaView edges={['top']} style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {profileData?.profileImg ? (
              <FastImage
                source={{ uri: IMAGE_BASE_URL + profileData.profileImg }}
                style={styles.avatar}
              />
            ) : (
              <ProfileAvatar
                size="medium"
                name={`${profileData?.fName || ''} ${
                  profileData?.lName || ''
                }`.trim()}
              />
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
                Dr. {capitalizeFirstLetter(doctorName)}
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
          showsVerticalScrollIndicator={false}
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
          {/* Main Title Heading */}
          <View style={styles.headingSection}>
            <AppText
              size={getScaleSize(24)}
              font={FONTS.Inter.Bold}
              color={COLORS.primary}
              style={styles.titleLine}
            >
              {t(STRING.homeDischarge)}
            </AppText>
            <AppText
              size={getScaleSize(24)}
              font={FONTS.Inter.Bold}
              color={COLORS.primary}
              style={styles.titleLine}
            >
              {t(STRING.supportServices)}
            </AppText>
          </View>

          {/* Services Section Header with "See All" */}
          <View style={styles.servicesHeaderRow}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS.primary}
            >
              {t(STRING.services)} ({displayedServices.length}/12)
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAllServices(!showAllServices)}
              style={styles.seeAllBtn}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS.primary}
              >
                {showAllServices ? t(STRING.showLess) : t(STRING.seeAll)}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* 6 Services Grid (or 12 when expanded) */}
          <View style={styles.servicesGrid}>
            {displayedServices.map(service => (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.9}
                onPress={() => handleServicePress(service)}
                style={[styles.serviceCard, { backgroundColor: service.bgColor }]}
              >
                <View style={styles.cardIconBox}>
                  <Image source={getServiceIcon(service.id)} style={styles.serviceIcon} />
                </View>
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                  style={styles.cardTitleText}
                  numberOfLines={2}
                >
                  {t(service.name)}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Badges Row */}
          <View style={styles.infoBadgesRow}>
            <View style={styles.infoPill}>
              <Image source={(IMAGES as any).ic_clock_info || IMAGES.ic_clock} style={styles.infoPillIcon} />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1E293B}
                style={styles.infoPillText}
              >
                {t(STRING.responseWithin2Hours)}
              </AppText>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => NavigationService.navigate(SCREENS.PROVIDERS_CALL_LIST)}
              style={styles.infoPill}
            >
              <Image source={(IMAGES as any).ic_vitale_info || IMAGES.card} style={styles.infoPillIconBadge} />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1E293B}
                style={styles.infoPillText}
              >
                {t(STRING.approvedProvider)}{'\n'}{t(STRING.multidisciplinaryTeam)}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Main CTA Button: HOME DISCHARGE REQUEST */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => NavigationService.navigate(SCREENS.CREATE_REQUEST)}
            style={styles.mainCtaBtn}
          >
            <View style={styles.ctaIconCircle}>
              <Image source={(IMAGES as any).ic_house_cta || IMAGES.tab_home} style={styles.ctaHouseIcon} />
            </View>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={{ flex: 1, marginLeft: getScaleSize(4) }}
            >
              {t(STRING.homeDischargeRequest)}
            </AppText>
          </TouchableOpacity>

          {/* Quick Action Buttons: NEW PATIENT & NEW FORM */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => NavigationService.navigate(SCREENS.ADD_PATIENT)}
              style={[styles.actionBtnItem, { backgroundColor: COLORS._5BBA47 }]}
            >
              <Image
                source={IMAGES.add_patient}
                style={styles.actionBtnIcon}
              />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
                numberOfLines={2}
                style={{ textAlign: 'center' }}
              >
                {t(STRING.newPatient)}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => NavigationService.navigate(SCREENS.CREATE_REQUEST)}
              style={[styles.actionBtnItem, { backgroundColor: COLORS._6C4A9C }]}
            >
              <Image
                source={IMAGES.add_form}
                style={styles.actionBtnIcon}
              />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
                numberOfLines={2}
                style={{ textAlign: 'center' }}
              >
                {t(STRING.newForm)}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Centered Floating CALL Button */}
          <View style={styles.callButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleEmergencyCall}
              style={styles.callCircleBtn}
            >
              <Image source={IMAGES.phone} style={styles.callPhoneIcon} />
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.Bold}
                color={COLORS._48B02C}
                style={{ marginTop: 2 }}
              >
                {t(STRING.call)}
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Recent Queue Section */}
          {/* <View style={styles.recentQueueSection}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1A1A}
              style={styles.sectionTitle}
            >
              {t(STRING.recentQueue)}
            </AppText>
            {recentQueue.length > 0 ? (
              recentQueue.map((item: DashboardRecentQueue, index: number) => {
                const formStatus = item.formStatus;
                const buttonConfig = getButtonConfig(formStatus, item.status);
                return (
                  <View key={item.id || index} style={styles.queueCardWrapper}>
                    <RequestCardDoctor
                      name={item.patient?.fullName || ''}
                      requestId={item.requestId}
                      requestType={item.service?.serviceName || ''}
                      formStatus={formStatus}
                      status={item.status}
                      buttonText={
                        buttonConfig.show
                          ? t(buttonConfig.label || '') || undefined
                          : undefined
                      }
                      onPress={() => {
                        if (item.status === REQUEST_STATUS.COMPLETED) {
                          NavigationService.navigate(
                            SCREENS.SERVICE_COMPLETED,
                            { request: item },
                          );
                          return;
                        }
                        NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                          request: item,
                          action: 'view',
                        });
                      }}
                      onButtonPress={() => {
                        if (buttonConfig.action === 'edit') {
                          NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                            request: item,
                            action: buttonConfig.action,
                          });
                        } else if (buttonConfig.action === 'sign') {
                          NavigationService.navigate(
                            SCREENS.FORM_REVIEW_SCREEN,
                            {
                              request: item,
                              action: buttonConfig.action,
                            },
                          );
                        } else {
                          NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                            request: item,
                            action: 'view',
                          });
                        }
                      }}
                    />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyQueueBox}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._6F767E}
                >
                  {t(STRING.noRecentRequests)}
                </AppText>
              </View>
            )}
          </View> */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
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
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
  },
  notificationBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS._EFEFEF,
  },
  notificationIconContainer: {
    position: 'relative',
    width: getScaleSize(24),
    height: getScaleSize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: getScaleSize(16),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
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
  scrollContent: {
    paddingBottom: getScaleSize(60),
    paddingTop: getScaleSize(16),
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: getScaleSize(16),
  },
  titleLine: {
    textAlign: 'center',
    lineHeight: getScaleSize(30),
    letterSpacing: -0.3,
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    marginBottom: getScaleSize(12),
  },
  seeAllBtn: {
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(4),
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(18),
    gap: getScaleSize(10),
  },
  serviceCard: {
    width: '48%',
    height: getScaleSize(84),
    borderRadius: getScaleSize(16),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardIconBox: {
    width: getScaleSize(42),
    height: getScaleSize(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: {
    width: getScaleSize(40),
    height: getScaleSize(50),
    resizeMode: 'contain',
  },
  cardTitleText: {
    flex: 1,
    lineHeight: getScaleSize(17),
  },
  infoBadgesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(18),
    marginTop: getScaleSize(14),
    gap: getScaleSize(10),
  },
  infoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF1F7',
    borderRadius: getScaleSize(14),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(10),
    minHeight: getScaleSize(58),
    gap: getScaleSize(8),
  },
  infoPillIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
  },
  infoPillIconBadge: {
    width: getScaleSize(32),
    height: getScaleSize(28),
    resizeMode: 'contain',
  },
  infoPillText: {
    flex: 1,
    lineHeight: getScaleSize(14),
  },
  mainCtaBtn: {
    backgroundColor: '#00509E',
    marginHorizontal: getScaleSize(18),
    marginTop: getScaleSize(16),
    height: getScaleSize(72),
    borderRadius: getScaleSize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(16),
    gap: getScaleSize(12),
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ctaIconCircle: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaHouseIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
  },
  ctaText: {
    letterSpacing: 0.4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(18),
    marginTop: getScaleSize(12),
    gap: getScaleSize(10),
  },
  actionBtnItem: {
    flex: 1,
    height: getScaleSize(64),
    borderRadius: getScaleSize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(6),
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingHorizontal: getScaleSize(8),
  },
  actionBtnIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    tintColor:COLORS.white,
    resizeMode: 'contain',
  },
  callButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getScaleSize(16),
    marginBottom: getScaleSize(8),
  },
  callCircleBtn: {
    width: getScaleSize(76),
    height: getScaleSize(76),
    borderRadius: getScaleSize(38),
    backgroundColor: COLORS.white,
    borderWidth: 2.5,
    borderColor: COLORS._48B02C,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
  },
  callPhoneIcon: {
    width: getScaleSize(28),
    height: getScaleSize(28),
    resizeMode: 'contain',
    tintColor: COLORS._48B02C,
  },
  recentQueueSection: {
    marginTop: getScaleSize(20),
  },
  sectionTitle: {
    paddingHorizontal: getScaleSize(20),
    marginBottom: getScaleSize(14),
  },
  queueCardWrapper: {
    marginHorizontal: getScaleSize(20),
    marginBottom: getScaleSize(12),
  },
  emptyQueueBox: {
    marginHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(20),
    alignItems: 'center',
  },
});

export default HomeScreen;
