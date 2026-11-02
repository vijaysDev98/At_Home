import React, { useState, useCallback, useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  View,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  AppSafeAreaView,
  AppText,
  ProfileAvatar,
  HomeChatNotificationActions,
} from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant/strings';
import { SHOW_TOAST } from '../../../constant/showToast';
import NavigationService from '../../../navigation/NavigationService';
import { DOCTOR_TAB_SCREENS, SCREENS } from '../../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { dashboardApi } from '../../../services/dashboard';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../../../constant/smallFunctions';
import { setLoading } from '../../../actions/common/commonSlice';
import { fetchProfile } from '../../../actions/profile/profileAction';
import { getUnreadCountService } from '../../../services/notificationService';
import FastImage from 'react-native-fast-image';
import { useChatUnreadBadge } from '../../../hooks/useChatUnreadBadge';

// Dashboard interfaces
interface DashboardRequestsOverview {
  inProgressCount: number;
  submittedCount: number;
  returnedCount: number;
  completedCount?: number;
}

interface DashboardActionRequired {
  awaitingSignatureCount: number;
  awaitingSignatureByService?: Record<string, number>;
}

interface DashboardPatients {
  totalPatients: number;
}

interface DashboardData {
  requestsOverview?: DashboardRequestsOverview;
  actionRequired?: DashboardActionRequired;
  patients?: DashboardPatients;
  serviceWiseCount?: Record<string, number>;
  serviceCounts?: Record<string, number>;
  servicesOverview?: Record<string, number>;
  [key: string]: any;
}

const DOCHOME_LOGO_ASPECT = {
  en: 2019 / 528,
  fr: 1024 / 268,
} as const;

const HOME_BTN_ASPECT = {
  en: 984 / 352,
  fr: 960 / 338,
} as const;

const HomeScreen: React.FC = () => {
  const { profileData } = useSelector((state: RootState) => state.profile);
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const { width: windowWidth } = useWindowDimensions();
  const { t, i18n } = useTranslation();
  const isFrench = (currentLanguage || i18n.language)?.startsWith('fr');
  const docHomeLogo = isFrench
    ? IMAGES.ic_dochome_logo_fr
    : IMAGES.ic_dochome_logo_en;
  const homeBtnImage = isFrench ? IMAGES.ic_home_btn_fr : IMAGES.ic_home_btn_en;
  const contentWidth = windowWidth;
  const docHomeLogoHeight =
    contentWidth / DOCHOME_LOGO_ASPECT[isFrench ? 'fr' : 'en'];
  const homeBtnAspect = HOME_BTN_ASPECT[isFrench ? 'fr' : 'en'];
  const homeBtnWidth = contentWidth - getScaleSize(36);
  const homeBtnHeight = homeBtnWidth / homeBtnAspect;
  const dispatch = useDispatch<AppDispatch>();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const unreadChatCount = useChatUnreadBadge();
  const [refreshing, setRefreshing] = useState(false);

  const doctorName =
    (profileData?.fName || '') + ' ' + (profileData?.lName || '');

  const pendingSignatureCount =
    dashboardData?.actionRequired?.awaitingSignatureCount ?? 0;

  const hasPendingFormActions = useMemo(
    () => pendingSignatureCount > 0,
    [pendingSignatureCount],
  );

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
        dashboardApi.getDashboardOverview(20),
        getUnreadCountService(),
      ]);

      if (response.success && response.data) {
        setDashboardData(response.data);
      }
      setUnreadCount(count);
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
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

  const handleOpenActionServices = () => {
    NavigationService.navigate(SCREENS.DOCTOR_HOME_SERVICES);
  };

  const handleEmergencyCall = () => {
    NavigationService.navigate(SCREENS.PROVIDERS_CALL_LIST);
  };

  const showFeatureUnderDevelopmentToast = () => {
    SHOW_TOAST(t(STRING.featureUnderDevelopment), 'info');
  };

  const openTreatedPatients = () => {
    NavigationService.navigate(DOCTOR_TAB_SCREENS.PATIENTS);
  };

  const openProfileTab = () => {
    NavigationService.navigate(DOCTOR_TAB_SCREENS.PROFILE);
  };

  return (
    <AppSafeAreaView edges={['top']} style={{ backgroundColor: COLORS.white }}>
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
                source={{ uri: IMAGE_BASE_URL + profileData.profileImg }}
                style={styles.avatar}
              />
            ) : (
              <ProfileAvatar
                size="medium"
                name={`${profileData?.fName || ''} ${profileData?.lName || ''
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
          </TouchableOpacity>

          <HomeChatNotificationActions
            unreadNotificationCount={unreadCount}
            unreadChatCount={unreadChatCount}
            onNotificationPress={() =>
              NavigationService.navigate(SCREENS.DOCTOR_NOTIFICATION)
            }
          />
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
          <Image
            source={docHomeLogo}
            style={[
              styles.docHomeLogo,
              { width: contentWidth, height: docHomeLogoHeight },
            ]}
            resizeMode="contain"
          />

          {hasPendingFormActions ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenActionServices}
              style={styles.actionAlertCard}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.homeNewActionToComplete)}
            >
              <Image
                source={IMAGES.ic_home_action_alert}
                style={styles.actionAlertIcon}
              />
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                style={styles.actionAlertText}
              >
                {t(STRING.homeNewActionToComplete)}
              </AppText>
              <Image
                source={IMAGES.arrow_right}
                style={styles.actionAlertChevron}
              />
            </TouchableOpacity>
          ) : null}

          <View style={styles.homeFeatureRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.homeFeatureCard, styles.homeFeatureCardMint]}
              onPress={openTreatedPatients}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.homeYourTreatedPatients)}
            >
              <Image
                source={IMAGES.ic_home_card_patients}
                style={styles.homeFeatureIcon}
              />
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                align="center"
                style={styles.homeFeatureLabel}
                numberOfLines={4}
              >
                {t(STRING.homeYourTreatedPatients)}
              </AppText>
              <Image
                source={IMAGES.arrow_right}
                style={styles.homeFeatureChevron}
              />
            </TouchableOpacity>

            <Pressable
              style={({ pressed }) => [
                styles.homeFeatureCard,
                styles.homeFeatureCardBlue,
                pressed ? styles.homeFeatureCardPressed : null,
              ]}
              onPress={showFeatureUnderDevelopmentToast}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.homeOrderAmbulance)}
            >
              <Image
                source={IMAGES.ic_home_card_ambulance}
                style={styles.homeFeatureIcon}
              />
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                align="center"
                style={styles.homeFeatureLabel}
                numberOfLines={4}
              >
                {t(STRING.homeOrderAmbulance)}
              </AppText>
              <Image
                source={IMAGES.arrow_right}
                style={styles.homeFeatureChevron}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.homeFeatureCard,
                styles.homeFeatureCardPurple,
                pressed ? styles.homeFeatureCardPressed : null,
              ]}
              onPress={showFeatureUnderDevelopmentToast}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.homeCommunityPharmacies)}
            >
              <Image
                source={IMAGES.ic_home_card_pharmacy}
                style={styles.homeFeatureIcon}
              />
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                align="center"
                style={styles.homeFeatureLabel}
                numberOfLines={4}
              >
                {t(STRING.homeCommunityPharmacies)}
              </AppText>
              <Image
                source={IMAGES.arrow_right}
                style={styles.homeFeatureChevron}
              />
            </Pressable>
          </View>

          {/* Info Badges Row */}
          {/* <View style={styles.infoBadgesRow}>
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
              onPress={handleEmergencyCall}
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
          </View> */}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              NavigationService.navigate(SCREENS.CREATE_DISCHARGE_REQUEST)
            }
            style={[styles.homeBtnTouchable, { width: homeBtnWidth }]}
          >
            <Image
              source={homeBtnImage}
              style={[
                styles.homeBtnImage,
                { width: homeBtnWidth, height: homeBtnHeight },
              ]}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Quick Action Buttons: NEW PATIENT & NEW MEDICAL PRESCRIPTION FORM */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => NavigationService.navigate(SCREENS.ADD_PATIENT)}
              style={[styles.actionBtnItem, { backgroundColor: COLORS._0072CE }]}
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
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={styles.actionBtnText}
              >
                {t(STRING.newPatient)}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => NavigationService.navigate(SCREENS.CREATE_REQUEST)}
              style={[styles.actionBtnItem, { backgroundColor: COLORS._7C3AED }]}
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
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={styles.actionBtnText}
              >
                {t(STRING.newMedicalPrescriptionForm)}
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
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: getScaleSize(8),
    minWidth: getScaleSize(16),
    height: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(3),
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    textAlign: 'center',
    lineHeight: getScaleSize(13),
  },
  scrollContent: {
    paddingBottom: getScaleSize(60),
    // paddingTop: getScaleSize(8),
  },
  docHomeLogo: {
    alignSelf: 'center',
    marginBottom: getScaleSize(12),
    borderRadius: getScaleSize(16),
  },
  actionAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: getScaleSize(18),
    marginBottom: getScaleSize(14),
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(14),
    borderRadius: getScaleSize(16),
    backgroundColor: '#FDF2F4',
    gap: getScaleSize(12),
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  actionAlertIcon: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    resizeMode: 'contain',
  },
  actionAlertText: {
    flex: 1,
    lineHeight: getScaleSize(20),
  },
  actionAlertChevron: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  homeFeatureRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: getScaleSize(18),
    marginBottom: getScaleSize(14),
    gap: getScaleSize(8),
  },
  homeFeatureCard: {
    flex: 1,
    borderRadius: getScaleSize(16),
    paddingHorizontal: getScaleSize(8),
    paddingTop: getScaleSize(12),
    paddingBottom: getScaleSize(10),
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: getScaleSize(168),
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  homeFeatureCardMint: {
    backgroundColor: '#EBF7F3',
  },
  homeFeatureCardBlue: {
    backgroundColor: '#E8F2FE',
  },
  homeFeatureCardPurple: {
    backgroundColor: '#F2F0FF',
  },
  homeFeatureCardPressed: {
    opacity: 0.88,
  },
  homeFeatureIcon: {
    width: getScaleSize(72),
    height: getScaleSize(72),
    resizeMode: 'contain',
    marginBottom: getScaleSize(8),
  },
  homeFeatureLabel: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    lineHeight: getScaleSize(14),
  },
  homeFeatureChevron: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
    alignSelf: 'center',
    marginTop: getScaleSize(6),
  },
  homeBtnTouchable: {
    alignSelf: 'center',
    marginTop: getScaleSize(4),
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  homeBtnImage: {
    borderRadius: getScaleSize(16),
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
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(18),
    marginTop: getScaleSize(12),
    gap: getScaleSize(10),
  },
  actionBtnItem: {
    flex: 1,
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    height: getScaleSize(64),
    borderRadius: getScaleSize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(6),
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    paddingHorizontal: getScaleSize(8),
  },
  actionBtnIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  actionBtnText: {
    flexShrink: 1,
    textAlign: 'center',
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

});

export default HomeScreen;
