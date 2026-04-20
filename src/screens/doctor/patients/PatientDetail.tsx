import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PatientDetail: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Info Card */}
          <View style={styles.card}> 
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>

            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.name}>Eleanor Pena</Text>
                <Text style={styles.meta}>DOB: Oct 24, 1955 (68yo)</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active Patient</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📞</Text>
                <View>
                  <Text style={styles.infoLabel}>Primary Contact</Text>
                  <Text style={styles.infoValue}>(555) 019-2834</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <View>
                  <Text style={styles.infoLabel}>Home Address</Text>
                  <Text style={styles.infoValue}>
                    4140 Parker Rd. Allentown,{"\n"}New Mexico 31134
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Medical Notes */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Notes</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Text style={styles.link}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              <Text style={styles.bold}>Allergies:</Text> Penicillin, Peanuts{"\n"}
              <Text style={styles.bold}>Chronic Conditions:</Text> Type 2 Diabetes, Hypertension.{"\n"}
              <Text style={styles.bold}>Recent Notes:</Text> Patient requires regular blood pressure monitoring. Experiences mild dizziness in the mornings. Ensure hydration is maintained. Last checkup showed improved blood sugar levels.
            </Text>
          </View>

          {/* Linked Requests */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linked Requests</Text>
            <TouchableOpacity style={styles.plusBtn} activeOpacity={0.8}>
              <Text style={styles.plusIcon}>＋</Text>
            </TouchableOpacity>
          </View>

          {[{
            id: '1',
            title: 'Wound Care',
            code: 'Req #8492',
            badge: 'PENDING',
            badgeColor: '#FFB800',
            badgeBg: '#FFF4E5',
            icon: '🩹',
            date: 'Today, 2:30 PM',
            next: 'Awaiting Doctor',
          }, {
            id: '2',
            title: 'IV Therapy',
            code: 'Req #8310',
            badge: 'COMPLETED',
            badgeColor: '#2ECA7F',
            badgeBg: '#E5F7ED',
            icon: '💧',
            date: 'Oct 12, 10:00 AM',
            next: 'None',
          }].map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <View style={styles.requestTop}>
                <View style={styles.requestLeft}>
                  <View style={[styles.requestIconWrap, { backgroundColor: item.badgeBg }]}> 
                    <Text style={[styles.requestIcon, { color: item.badgeColor }]}>{item.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.requestTitle}>{item.title}</Text>
                    <Text style={styles.requestCode}>{item.code}</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: item.badgeBg }]}> 
                  <Text style={[styles.badgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.requestBottom}>
                <View>
                  <Text style={styles.mutedLabel}>Date</Text>
                  <Text style={styles.requestMeta}>{item.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.mutedLabel}>Next Step</Text>
                  <Text style={[styles.requestMeta, { color: '#526674' }]}>{item.next}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 14,
    color: '#526674',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8EDF1',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileMeta: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  meta: {
    fontSize: 13,
    color: '#6F767E',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECA7F',
  },
  statusText: {
    fontSize: 12,
    color: '#2ECA7F',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 14,
    color: '#6F767E',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6F767E',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1F',
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  link: {
    fontSize: 13,
    color: '#526674',
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 14,
    color: '#1A1D1F',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 16,
    color: '#526674',
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  requestTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  requestIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestIcon: {
    fontSize: 16,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  requestCode: {
    fontSize: 12,
    color: '#6F767E',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  requestBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mutedLabel: {
    fontSize: 11,
    color: '#6F767E',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  requestMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F',
  },
});

export default PatientDetail;
