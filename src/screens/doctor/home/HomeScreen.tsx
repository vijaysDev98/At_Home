import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const avatarUri = 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg';

const metrics = [
  {
    id: 'active',
    title: 'Active Requests',
    value: '12',
    icon: '📋',
    bg: '#E9EDF3',
  },
  {
    id: 'forms',
    title: 'Pending Forms',
    value: '5',
    icon: '🧾',
    bg: '#FFF3DD',
  },
];

const activities = [
  {
    id: 'form',
    title: 'Form Signed',
    subtitle: 'Sarah Jenkins • 10m ago',
    icon: '�',
  },
  {
    id: 'patient',
    title: 'Patient Added',
    subtitle: 'Michael Chen • 1h ago',
    icon: '➕',
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            </View>
            <View>
              <Text style={styles.subtle}>Good morning,</Text>
              <Text style={styles.title}>Dr. Patel</Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.bellButton}
            onPress={() => navigation.navigate('DoctorNotification')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Metrics grid */}
          <View style={styles.metricsGrid}>
            {metrics.map((item) => (
              <View key={item.id} style={styles.metricCard}>
                <View style={[styles.metricIconWrap, { backgroundColor: item.bg }]}>
                  <Text style={styles.metricIcon}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.metricValue}>{item.value}</Text>
                  <Text style={styles.metricLabel}>{item.title}</Text>
                </View>
              </View>
            ))}
            <View style={[styles.metricCard, styles.metricWide]}>
              <View style={styles.metricWideLeft}>
                <View style={[styles.metricIconWrap, { backgroundColor: '#E5F7ED' }] }>
                  <Text style={styles.metricIcon}>👥</Text>
                </View>
                <View>
                  <Text style={styles.metricLabel}>Total Patients</Text>
                  <Text style={styles.metricValue}>148</Text>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.link}>View All ›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity activeOpacity={0.9} style={[styles.actionCard, styles.actionPrimary]}>
              <Text style={styles.actionIcon}>＋</Text>
              <Text style={styles.actionTextPrimary}>New Request</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={[styles.actionCard, styles.actionSecondary]}>
              <Text style={styles.actionIconSecondary}>➕</Text>
              <Text style={styles.actionTextSecondary}>Add Patient</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          <View style={styles.activityCard}>
            {activities.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.activityRow, idx === 0 && styles.activityRowBorder]}
              >
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconWrap}>
                    <Text style={styles.activityIcon}>{item.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E8EDF1',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  subtle: {
    fontSize: 12,
    color: '#6F767E',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    color: '#1A1D1F',
    fontWeight: '700',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  bellIcon: {
    fontSize: 18,
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4D4F',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 16,
    gap: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    width: '48%',
    gap: 12,
  },
  metricWide: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    fontSize: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6F767E',
    marginTop: 2,
  },
  metricWideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  link: {
    color: '#526674',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  actionPrimary: {
    backgroundColor: '#526674',
  },
  actionSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  actionIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  actionIconSecondary: {
    fontSize: 24,
    color: '#526674',
  },
  actionTextPrimary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionTextSecondary: {
    color: '#526674',
    fontSize: 14,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activityRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 18,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6F767E',
  },
  chevron: {
    fontSize: 18,
    color: '#6F767E',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  navItem: {
    alignItems: 'center',
    gap: 6,
  },
  navItemActive: {
    alignItems: 'center',
    gap: 6,
  },
  navIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EDF1',
  },
  navIconText: {
    fontSize: 18,
    color: '#526674',
  },
  navIconTextMuted: {
    fontSize: 16,
    color: '#6F767E',
  },
  navLabel: {
    fontSize: 10,
    color: '#6F767E',
    fontWeight: '600',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#526674',
    fontWeight: '700',
  },
  navFab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  navFabIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
});

export default HomeScreen;
