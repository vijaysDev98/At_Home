import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { AppText, AppButton } from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import {
  SectionHeader,
  NotificationItem,
} from '../../../components/NotificationComponents';

// Components moved to NotificationComponents.tsx

const ProviderNotification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Notifications
          </AppText>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tabWrap}
            activeOpacity={0.7}
            onPress={() => setActiveTab('All')}
          >
            <AppText
              size={getScaleSize(15)}
              font={activeTab === 'All' ? FONTS.Inter.Bold : FONTS.Inter.Medium}
              color={activeTab === 'All' ? COLORS._526674 : COLORS._6F767E}
            >
              All
            </AppText>
            {activeTab === 'All' && <View style={styles.activeBorder} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabWrap}
            activeOpacity={0.7}
            onPress={() => setActiveTab('Unread')}
          >
            <AppText
              size={getScaleSize(15)}
              font={
                activeTab === 'Unread' ? FONTS.Inter.Bold : FONTS.Inter.Medium
              }
              color={activeTab === 'Unread' ? COLORS._526674 : COLORS._6F767E}
            >
              Unread
            </AppText>
            <View style={styles.unreadBadge} />
            {activeTab === 'Unread' && <View style={styles.activeBorder} />}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader title="New Requests" />
          <NotificationItem
            title="New Patient Assignment"
            subtitle="You have been assigned to John Doe for Physiotherapy."
            time="10m ago"
            iconSource={IMAGES.alert_newPatient}
            unread
            action="Open Form"
          />
          <NotificationItem
            title="Form Updated by Doctor"
            subtitle="Physiotherapy form for John Doe has been updated."
            time="2h ago"
            iconSource={IMAGES.alert_formUpdate}
            action="Start Service"
          />
          <NotificationItem
            title="Service In Progress"
            subtitle="Continue your service for John Doe."
            time="2h ago"
            iconSource={IMAGES.alert_serviceInProgress}
            action="Open Service"
          />
          <NotificationItem
            title="Service Completed"
            subtitle="You completed Physiotherapy for John Doe."
            time="2h ago"
            iconSource={IMAGES.alert_serviceCompleted}
            action="View Details"
          />

          <SectionHeader title="System Updates" />
          <NotificationItem
            title="App Maintenance"
            subtitle="Scheduled maintenance this Sunday from 2 AM to 4 AM EST."
            time="Oct 22"
            iconSource={IMAGES.notification_icon}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProviderNotification;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#526674',
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabWrap: {
    position: 'relative',
    paddingBottom: 12,
  },
  tab: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabActive: {
    color: '#526674',
  },
  activeBorder: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#526674',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  scroll: {
    flex: 1,
    paddingTop: getScaleSize(15),
  },
  scrollContent: {
    paddingBottom: 32,
  },
  actionBtn: {
    height: getScaleSize(36),
    borderRadius: getScaleSize(8),
    alignSelf: 'flex-start',
    paddingHorizontal: getScaleSize(16),
  },
});
