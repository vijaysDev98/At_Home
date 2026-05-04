import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppSafeAreaView, AppText } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant/strings';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

const avatarUri =
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg';

const metrics = [
  {
    id: 'inprogress',
    value: '12',
    label: STRING.inprogress,
    icon: IMAGES.clipboard,
  },
  {
    id: 'submitted',
    value: '5',
    label: STRING.submitted,
    icon: IMAGES.document_icon,
  },
  {
    id: 'returned',
    value: '5',
    label: STRING.returned,
    icon: IMAGES.document_icon,
  },
];

const actionRequired = [
  {
    id: 'signature',
    title: STRING.formAwaitingSignature,
    value: '148',
    icon: IMAGES.document_icon, // Fallback for document_icon
  },
];

const patientMetrics = [
  {
    id: 'patients',
    title: STRING.totalPatients,
    value: '148',
    icon: IMAGES.patients_icon, // Fallback for patients_icon
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <AppSafeAreaView
    style={{backgroundColor:COLORS.white}}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS.primaryMuted}
              >
                {STRING.goodMorning}
              </AppText>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS.primary}
              >
                Dr. Patel
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => NavigationService.navigate(SCREENS.DOCTOR_NOTIFICATION)}
            activeOpacity={0.7} style={styles.notificationBtn}>
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
              <View style={styles.section}>
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
                    <View key={item.id} style={styles.actionItem}>
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
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.viewAllBtn}
                      >
                        <AppText
                          size={getScaleSize(13)}
                          font={FONTS.Inter.SemiBold}
                          color={COLORS._526674}
                        >
                          {STRING.viewAll} {'>'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
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
                    <View key={item.id} style={styles.actionItem}>
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
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.viewAllBtn}
                      >
                        <AppText
                          size={getScaleSize(13)}
                          font={FONTS.Inter.SemiBold}
                          color={COLORS._526674}
                        >
                          {STRING.viewAll} {'>'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
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
          <View >
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1A1A}
              style={[styles.sectionTitle, { marginTop: getScaleSize(24) }]}
            >
              {STRING.recentQueue}
            </AppText>
            <View
              style={{
                borderWidth: 1,
                borderColor: COLORS._EFEFEF,
                borderRadius: getScaleSize(16),
                padding: getScaleSize(16),
                backgroundColor: COLORS.white,
                marginHorizontal: getScaleSize(24)
              }}
            >
              <View style={{
                flexDirection: 'row', alignItems: 'center',
              }}>
                {/* <Image
               source={IMAGES.patient}
               style={{width:getScaleSize(40), height:getScaleSize(40), resizeMode:'contain'}}
               /> */}
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: getScaleSize(40),
                  width: getScaleSize(40),
                  borderWidth: 1,
                  borderColor: COLORS._DBEAFE,
                  backgroundColor: COLORS._EFF6FF, borderRadius: getScaleSize(20)
                }}>
                  <AppText
                    size={getScaleSize(16)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._2563EB}
                  >{"JD"}</AppText>
                </View>

                <View
                  style={{ marginLeft: getScaleSize(12), flex: 0.8 }}
                >
                  <AppText
                    size={getScaleSize(16)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1A1A}
                  >
                    {"John Doe"}
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6B7280}
                  >
                    {"Physical Therapy"}
                  </AppText>
                </View>
                <View style={{
                  alignItems: 'center',
                  backgroundColor: COLORS._EFF6FF, borderRadius: getScaleSize(20),
                  paddingHorizontal: getScaleSize(8),
                  paddingVertical: getScaleSize(3)
                }}>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._2563EB}
                  >
                    {"Submitted"}
                  </AppText>
                </View>
              </View>

              <View
                style={{ height: 1, backgroundColor: COLORS._E5E7EB, marginVertical: getScaleSize(12) }}
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._6F767E}
                  >{"Request ID"}</AppText>
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._1A1D1F}
                  >{"#6534"}</AppText>
                </View>
                <View>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.SemiBold}
                    color={COLORS._6F767E}
                  >{"Form Status"}</AppText>
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._1A1D1F}
                  >{"Submitted"}</AppText>
                </View>
              </View>

              <AppButton
                title={"Update & Sign"}
                onPress={() => { }}
                style={{ marginTop: getScaleSize(12) }}
              />

            </View>
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
