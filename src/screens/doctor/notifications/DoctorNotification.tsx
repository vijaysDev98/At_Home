import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const today = [
  {
    id: 'today-1',
    title: 'Form Returned',
    desc: 'Provider Sarah M. requested clarification on medication list for John Doe (#REQ-8294).',
    time: '10:42 AM',
    icon: '↺',
    iconColor: '#f59e0b',
    unread: true,
  },
  {
    id: 'today-2',
    title: 'Service Completed',
    desc: 'Wound care service for Maria Garcia (#REQ-8288) has been marked as completed.',
    time: '08:15 AM',
    icon: '✓',
    iconColor: '#10b981',
    unread: false,
  },
];

const week = [
  {
    id: 'week-1',
    title: 'Status Update',
    desc: 'Request #REQ-8290 for Robert Smith is now In Progress.',
    time: 'Yesterday',
    icon: '⟳',
    iconColor: '#3b82f6',
  },
  {
    id: 'week-2',
    title: 'Form Returned',
    desc: 'Missing signature on authorization form for Emma Davis (#REQ-8285).',
    time: 'Mon',
    icon: '↺',
    iconColor: '#f59e0b',
  },
  {
    id: 'week-3',
    title: 'Service Completed',
    desc: 'IV Therapy for James Wilson (#REQ-8280) successfully completed.',
    time: 'Oct 22',
    icon: '✓',
    iconColor: '#10b981',
  },
];

const DoctorNotification: React.FC = () => {
  const renderItem = (
    item: typeof today[number] | typeof week[number],
    isUnread = false,
  ) => {
    return (
      <View key={item.id} style={[styles.card, isUnread ? styles.unreadCard : null]}>
        {isUnread ? <View style={styles.unreadDot} /> : null}
        <View style={[styles.iconWrap, { borderColor: `${item.iconColor}22` }] }>
          <Text style={[styles.icon, { color: item.iconColor }]}>{item.icon}</Text>
        </View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Today</Text>
            <View style={styles.sectionCard}>
              {today.map((item, idx) => (
                <View key={item.id}>
                  {renderItem(item, item.unread)}
                  {idx < today.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>This Week</Text>
            <View style={styles.sectionCard}>
              {week.map((item, idx) => (
                <View key={item.id}>
                  {renderItem(item)}
                  {idx < week.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
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
  card: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#f4f7ff',
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#526674',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
  },
  textCol: {
    flex: 1,
    gap: 4,
    paddingRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 52,
  },
});

export default DoctorNotification;
