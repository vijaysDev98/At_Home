import React from 'react';
import {
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { AppSafeAreaView, AppText, Header } from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const today = [
  {
    id: 'today-1',
    title: 'Form Returned',
    desc: 'Provider Sarah M. requested clarification on medication list for John Doe (#REQ-8294).',
    time: '10:42 AM',
    icon: IMAGES.ic_reload,
    iconColor: COLORS._FFF4E5,
    unread: true,
  },
  {
    id: 'today-2',
    title: 'Service Completed',
    desc: 'Wound care service for Maria Garcia (#REQ-8288) has been marked as completed.',
    time: '08:15 AM',
    icon: IMAGES.ic_ServiceCompleted,
    iconColor: COLORS._E6F9F0,
    unread: false,
  },
];

const week = [
  {
    id: 'week-1',
    title: 'Status Update',
    desc: 'Request #REQ-8290 for Robert Smith is now In Progress.',
    time: 'Yesterday',
    icon: IMAGES.ic_inprogress,
    iconColor: COLORS.primary,
  },
  {
    id: 'week-2',
    title: 'Form Returned',
    desc: 'Missing signature on authorization form for Emma Davis (#REQ-8285).',
    time: 'Mon',
    icon: IMAGES.ic_reload,
    iconColor: COLORS._FFF4E5,
  },
  {
    id: 'week-3',
    title: 'Service Completed',
    desc: 'IV Therapy for James Wilson (#REQ-8280) successfully completed.',
    time: 'Oct 22',
    icon: IMAGES.ic_ServiceCompleted,
    iconColor: COLORS._E6F9F0,
  },
];

// SectionList data structure
const notificationSections = [
  {
    title: 'Today',
    data: today,
  },
  {
    title: 'This Week',
    data: week,
  },
];

const DoctorNotification: React.FC = () => {
  const renderItem = ({ item, index }: { item: typeof today[number]; index: number; }) => {
    const isUnread = item.unread || false;
    return (
      <View style={[styles.notificationItem, isUnread ? styles.unreadCard : null]}>
        {isUnread ? <View style={styles.unreadDot} /> : null}
        <View style={[styles.iconWrap, { borderColor: `${item.iconColor}22` }]}>
          <Image source={item.icon} style={[styles.iconImage, { tintColor: item.iconColor }]} />
        </View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS._1A1D1F}>{item.title}</AppText>
            <AppText size={getScaleSize(10)} color={COLORS._6B7280}>{item.time}</AppText>
          </View>
          <AppText size={getScaleSize(12)} color={COLORS._6F767E}>{item.desc}</AppText>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: typeof notificationSections[number] }) => (
    <View style={styles.sectionHeader}>
      <AppText size={getScaleSize(12)} font={FONTS.Inter.Bold} color={COLORS._6B7280}>{section.title}</AppText>
    </View>
  );

  return (
    <AppSafeAreaView>
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          title="Notifications"
          leftContent={() => (
            <TouchableOpacity activeOpacity={0.7}>
              <AppText size={getScaleSize(13)} font={FONTS.Inter.Bold} color={COLORS._526674}>Mark all read</AppText>
            </TouchableOpacity>
          )}
        />

        <SectionList
          style={styles.sectionList}
          sections={notificationSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sectionListContent}
        />
      </View>
   </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(20),
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  markRead: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526674',
  },
  sectionList: {
    flex: 1,
  },
  sectionListContent: {
    // paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(12),
  },
  sectionHeader: {
    marginBottom: getScaleSize(8),
  },
  sectionSeparator: {
    height: getScaleSize(16),
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(14),
    gap: getScaleSize(12),
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    // marginHorizontal: getScaleSize(20),
    borderRadius: getScaleSize(14),
    // borderWidth: 1,
  },
  unreadCard: {
    backgroundColor: '#f4f7ff',
  },
  unreadDot: {
    position: 'absolute',
    left: getScaleSize(8),
    top: '50%',
    marginTop: -4,
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: COLORS._526674,
  },
  iconWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  iconImage: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
  textCol: {
    flex: 1,
    gap: getScaleSize(4),
    paddingRight: getScaleSize(6),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: getScaleSize(8),
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  desc: {
    fontSize: 12,
    color: '#4b5563',
    lineHeight: 18,
  },
});

export default DoctorNotification;
