import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { AppText } from '../../../components';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ProviderHome: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
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
                color={COLORS._1A1D1F}
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
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              Overview
            </AppText>
          </View>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6B7280}
                >
                  Submitted
                </AppText>
                <Image source={IMAGES.ic_submitted} style={[styles.kpiIcon]} />
              </View>
              <AppText
                size={getScaleSize(24)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                12
              </AppText>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6B7280}
                >
                  In Progress
                </AppText>

                <Image source={IMAGES.ic_inprogress} style={[styles.kpiIcon]} />
              </View>
              <AppText
                size={getScaleSize(24)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                3
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.kpiWide}
            onPress={() => navigation.navigate('Forms')}
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
                  color={COLORS._1A1D1F}
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
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              Recent Queue
            </AppText>
            <TouchableOpacity onPress={() => {}}>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._6F767E}
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
              navigation.navigate('ProviderForm', {
                mode: item.status === 'InProgress' || item.status === 'Submitted' ? 'update' : 'view',
                requestStatus: item.status,
                formStatus: item.formStatus,
              });
            };

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
                        color={COLORS._1A1D1F}
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
                      color={COLORS._1A1D1F}
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
                      color={COLORS._1A1D1F}
                    >
                      {item.formStatus}
                    </AppText>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.startServiceBtn}
                  onPress={handlePress}
                >
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                  >
                    Start a Service
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
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    overflow: 'hidden',
    backgroundColor: COLORS._F8F9FA,
    marginRight: getScaleSize(12),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(40),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: getScaleSize(20),
    marginBottom: getScaleSize(16),
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getScaleSize(12),
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getScaleSize(10),
  },
  kpiIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
  },
  kpiWide: {
    marginTop: getScaleSize(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
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
    width: getScaleSize(10),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(20),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(16),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
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
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(12),
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
    borderRadius: getScaleSize(12),
    height: getScaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
