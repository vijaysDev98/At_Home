import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../utils';

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
);

const Pill = ({ text, bg, color }: { text: string; bg: string; color: string }) => (
  <View style={[styles.pill, { backgroundColor: bg }]}> 
    <Text style={[styles.pillText, { color }]}>{text}</Text>
  </View>
);

const NotificationItem = ({
  title,
  subtitle,
  time,
  iconBg,
  icon,
  unread,
  action,
  actionColor,
  highlightBg,
  highlight,
}: {
  title: string;
  subtitle: string;
  time: string;
  iconBg: string;
  icon: string;
  unread?: boolean;
  action?: string;
  actionColor?: string;
  highlightBg?: string;
  highlight?: boolean;
}) => (
  <View style={styles.cardWrapper}>
    <View style={[styles.card, highlightBg ? { backgroundColor: highlightBg } : null]}>
      <View style={styles.rowTop}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {action ? (
            <Pill text={action} bg={(highlight && '#fee2e2') || '#e0ecff'} color={actionColor || COLORS.primary} />
          ) : null}
        </View>
        {unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </View>
  </View>
);

const ProviderNotification: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerAction}>✔︎</Text>
        </View>

        <View style={styles.tabs}>
          <Text style={[styles.tab, styles.tabActive]}>All</Text>
          <View style={styles.tabUnreadWrap}>
            <Text style={styles.tab}>Unread</Text>
            <View style={styles.unreadBadge} />
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SectionHeader title="New Requests" />
          <NotificationItem
            title="New Patient Assignment"
            subtitle="You have been assigned to Michael Chen for Post-Op Care starting tomorrow."
            time="10m ago"
            iconBg="#e0ecff"
            icon="👤"
            unread
            action="Action Required"
            actionColor="#1d4ed8"
            highlightBg="#e8f1ff"
            highlight
          />
          <NotificationItem
            title="Schedule Updated"
            subtitle="New visit scheduled for Sarah Jenkins on Thursday at 2:00 PM."
            time="2h ago"
            iconBg="#f1f5f9"
            icon="📅"
          />

          <SectionHeader title="Returned Forms" />
          <NotificationItem
            title="Form Needs Revision"
            subtitle="Wound Care assessment for Alice Smith was returned. Missing vitals data."
            time="Yesterday"
            iconBg="#fee2e2"
            icon="📄"
            unread
            action="Review Form"
            actionColor="#b91c1c"
            highlightBg="#fff4f4"
            highlight
          />

          <SectionHeader title="System Updates" />
          <NotificationItem
            title="App Maintenance"
            subtitle="Scheduled maintenance this Sunday from 2 AM to 4 AM EST."
            time="Oct 22"
            iconBg="#e8edf1"
            icon="📢"
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
    backgroundColor: COLORS.backgroundAlt,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.slate200,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.slate200,
  },
  tab: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  tabActive: {
    color: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 6,
  },
  tabUnreadWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
    gap: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.slate600,
    marginTop: 12,
    marginBottom: 4,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },
  rowTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
    flex: 1,
  },
  time: {
    fontSize: 10,
    color: COLORS.slate600,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.slate600,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
});
