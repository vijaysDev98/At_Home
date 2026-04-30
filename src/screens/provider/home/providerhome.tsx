import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { AppText } from '../../../components';
import LinearGradient from 'react-native-linear-gradient';

const ProviderHome: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri: 'https://www.figma.com/api/mcp/asset/28aa6b07-8ea7-4df4-b030-811de0bb6c4e',
                }}
                style={styles.avatar}
              />
            </View>
            <View>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
              >
                Welcome back,
              </AppText>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color="#111827"
              >
                Sarah Jenkins
              </AppText>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
                12
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
                3
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.kpiWide}
            onPress={() => navigation.navigate('Forms' as never)}
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
                  5 Services
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
            <TouchableOpacity onPress={() => {}}>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Medium}
                color={COLORS._526674}
              >
                See All
              </AppText>
            </TouchableOpacity>
          </View>

          {[
            {
              initials: 'MJ',
              name: 'Michael Johnson',
              specialty: 'Physical Therapy',
              status: 'Submitted',
              requestId: 'SR-2023-10456',
              formStatus: 'Signed',
              badgeBg: '#E8F1FF',
              badgeColor: '#2F80ED',
            },
            {
              initials: 'MJ',
              name: 'Michael Johnson',
              specialty: 'Physical Therapy',
              status: 'InProgress',
              requestId: 'SR-2023-10456',
              formStatus: 'Signed',
              badgeBg: '#FFF7E8',
              badgeColor: '#F2994A',
            },
          ].map((item, index) => {
            const handlePress = () => {
              navigation.navigate(
                'ProviderForm' as never,
                {
                  mode:
                    item.status === 'InProgress' || item.status === 'Submitted'
                      ? 'update'
                      : 'view',
                  requestStatus: item.status,
                  formStatus: item.formStatus,
                } as never,
              );
            };

            const handleServicePress = () => {
              navigation.navigate(
                'ServiceScreen' as never,
                {
                  requestStatus: item.status,
                  formStatus: item.formStatus,
                  patientName: item.name,
                  service: item.specialty,
                  requestId: item.requestId,
                } as never,
              );
            };

            const buttonText =
              item.status === 'InProgress' ? 'Open Service' : 'Start a Service';

            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={handlePress}
                style={styles.queueCard}
              >
                <View style={styles.queueTopRow}>
                  <View style={styles.queueUserInfo}>
                    <View style={styles.initialsBox}>
                      <AppText
                        size={getScaleSize(14)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._6F767E}
                      >
                        {item.initials}
                      </AppText>
                    </View>
                    <View style={{ marginLeft: getScaleSize(12) }}>
                      <AppText
                        size={getScaleSize(15)}
                        font={FONTS.Inter.Bold}
                        color="#111827"
                      >
                        {item.name}
                      </AppText>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6F767E}
                      >
                        {item.specialty}
                      </AppText>
                    </View>
                  </View>
                  <View
                    style={[styles.badge, { backgroundColor: item.badgeBg }]}
                  >
                    <AppText
                      size={getScaleSize(11)}
                      font={FONTS.Inter.Bold}
                      color={item.badgeColor}
                    >
                      {item.status}
                    </AppText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsRow}>
                  <View>
                    <AppText
                      size={getScaleSize(11)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                      style={{ marginBottom: getScaleSize(4) }}
                    >
                      Request ID
                    </AppText>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color="#1A1A1A"
                    >
                      {item.requestId}
                    </AppText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <AppText
                      size={getScaleSize(11)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                      style={{ marginBottom: getScaleSize(4) }}
                    >
                      Form Status
                    </AppText>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color="#1A1D1F"
                    >
                      {item.formStatus}
                    </AppText>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.startServiceBtn}
                  onPress={handleServicePress}
                >
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                  >
                    {buttonText}
                  </AppText>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
    height: getScaleSize(68),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 0,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    backgroundColor: '#E4E9EE',
    marginRight: getScaleSize(12),
  },
  avatar: {
    width: '100%',
    height: '100%',
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
