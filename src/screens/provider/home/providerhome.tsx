import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation';
import { COLORS } from '../../../utils';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ProviderHome: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' }}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text style={styles.welcome}>Welcome back,</Text>
              <Text style={styles.name}>Sarah Jenkins</Text>
            </View>
          </View>
          <View style={styles.bellWrap}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.bellDot} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
          </View>

          <View style={styles.kpiGrid}>
            <View style={styles.kpiCardBlue}>
              <Text style={styles.kpiLabel}>Available</Text>
              <Text style={styles.kpiValue}>12</Text>
            </View>
            <View style={styles.kpiCardOrange}>
              <Text style={styles.kpiLabel}>In Progress</Text>
              <Text style={styles.kpiValue}>3</Text>
            </View>
          </View>

          <View style={styles.kpiWide}>
            <View style={styles.kpiIconCircleSuccess}>
              <Text style={styles.kpiIcon}>✔️</Text>
            </View>
            <View>
              <Text style={styles.kpiLabel}>Completed Today</Text>
              <Text style={styles.kpiWideValue}>5 Services</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryCta}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('ProviderAvailableRequests')}
          >
            <Text style={styles.primaryCtaText}>View Available Requests</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Queue</Text>
            <Text style={styles.sectionLink}>See All</Text>
          </View>

          {[
            {
              initials: 'MJ',
              name: 'Michael Johnson',
              detail: 'Blood Draw • 2.5 miles',
              status: 'Submitted',
              time: 'Today, 2:00 PM',
              action: 'Details',
              badgeColor: COLORS.slate200,
              badgeTextColor: COLORS.slate600,
            },
            {
              initials: 'ED',
              name: 'Emma Davis',
              detail: 'Wound Care • 4.1 miles',
              status: 'In Progress',
              time: 'Started 1h ago',
              action: 'Resume',
              badgeColor: '#fef3c7',
              badgeTextColor: '#f59e0b',
            },
          ].map((item) => (
            <View key={item.name} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardLeft}>
                  <View style={[styles.initials, { backgroundColor: COLORS.backgroundAlt }]}> 
                    <Text style={styles.initialsText}>{item.initials}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardMeta}>{item.detail}</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: item.badgeColor }]}> 
                  <Text style={[styles.badgeText, { color: item.badgeTextColor }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.cardBottomRow}>
                <Text style={styles.cardTime}>🕒 {item.time}</Text>
                <Text style={styles.cardLink}>{item.action}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProviderHome;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.slate200,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.slate200,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  welcome: {
    fontSize: 12,
    color: COLORS.primaryMuted,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
  },
  bellWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bell: {
    fontSize: 16,
    color: COLORS.slate600,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate700,
  },
  sectionLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCardBlue: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },
  kpiCardOrange: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },
  kpiLabel: {
    fontSize: 12,
    color: COLORS.slate600,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
  },
  kpiWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },
  kpiIconCircleSuccess: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
  },
  kpiIcon: {
    fontSize: 18,
  },
  kpiWideValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },
  chevron: {
    marginLeft: 'auto',
    fontSize: 18,
    color: COLORS.slate400,
  },
  primaryCta: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    gap: 10,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontWeight: '800',
    color: COLORS.slate700,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.slate600,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.slate200,
    paddingTop: 8,
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.slate500,
  },
  cardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
