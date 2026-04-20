import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../utils';

const RequestCard = ({
  initials,
  name,
  service,
  distance,
  time,
  location,
}: {
  initials: string;
  name: string;
  service: string;
  distance: string;
  time: string;
  location: string;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeaderRow}>
      <View style={styles.cardLeft}>
        <View style={styles.initialsWrap}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <View>
          <Text style={styles.cardName}>{name}</Text>
          <Text style={styles.cardMeta}>{service} • {distance}</Text>
        </View>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Submitted</Text>
      </View>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.infoText}>📅 {time}</Text>
      <Text style={styles.infoText}>📍 {location}</Text>
    </View>
    <TouchableOpacity style={styles.cardCta} activeOpacity={0.88}>
      <Text style={styles.cardCtaText}>Start Service</Text>
    </TouchableOpacity>
  </View>
);

const AvailableRequest: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Requests</Text>
          <Text style={styles.headerIcon}>⏷</Text>
        </View>

        <View style={styles.tabRow}>
          <Text style={[styles.tab, styles.tabActive]}>Available</Text>
          <Text style={styles.tab}>In Progress</Text>
          <Text style={styles.tab}>Completed</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {[
            {
              initials: 'MJ',
              name: 'Michael Johnson',
              service: 'Blood Draw',
              distance: '2.5 miles',
              time: 'Today, 2:00 PM',
              location: '123 Main St, Apt 4B',
            },
            {
              initials: 'SR',
              name: 'Sarah Richards',
              service: 'Wound Care',
              distance: '3.8 miles',
              time: 'Tomorrow, 9:00 AM',
              location: '842 Oak Ave',
            },
            {
              initials: 'DT',
              name: 'David Thompson',
              service: 'Physical Therapy',
              distance: '5.1 miles',
              time: 'Tomorrow, 1:30 PM',
              location: '55 Pine Lane',
            },
          ].map((item) => (
            <RequestCard key={item.name} {...item} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AvailableRequest;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate700,
  },
  headerIcon: {
    fontSize: 16,
    color: COLORS.slate500,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  initialsWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundAlt,
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
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.backgroundAlt,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.slate600,
  },
  cardCta: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCtaText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
