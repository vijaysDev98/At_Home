import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../../utils';

const ProviderProfile: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.headerAction}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <Image
              source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
              style={styles.avatar}
            />
            <Text style={styles.name}>Sarah Jenkins</Text>
            <Text style={styles.role}>Registered Nurse (RN)</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>sarah.jenkins@athome.com</Text>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Text style={styles.value}>+1 (555) 123-4567</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Assigned Services</Text>
              <Text style={styles.pill}>3 Active</Text>
            </View>
            {[
              {
                title: 'Wound Care Management',
                desc: 'Post-operative wound care, dressing changes, and infection monitoring.',
              },
              {
                title: 'IV Therapy',
                desc: 'Administration of intravenous medications and fluids.',
              },
              {
                title: 'Vitals Monitoring',
                desc: 'Routine check of blood pressure, heart rate, and oxygen levels.',
              },
            ].map((item) => (
              <View key={item.title} style={styles.serviceCard}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProviderProfile;

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
    paddingTop: 12,
    paddingBottom: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    gap: 10,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },
  role: {
    fontSize: 13,
    color: COLORS.primaryMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    gap: 12,
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
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.slate700,
  },
  pill: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate600,
    backgroundColor: COLORS.backgroundAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate600,
  },
  value: {
    fontSize: 14,
    color: COLORS.black,
  },
  serviceCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.backgroundAlt,
    gap: 4,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
  },
  serviceDesc: {
    fontSize: 12,
    color: COLORS.slate600,
  },
});
