import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

const chips = ['All', 'Active', 'New', 'Needs Follow-up'];

const patients = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    phone: '(555) 123-4567',
    status: 'Active',
    statusColor: '#2ECA7F',
    statusBg: '#E5F7ED',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '(555) 987-6543',
    status: 'Follow-up',
    statusColor: '#FFB800',
    statusBg: '#FFF4E5',
    initials: 'MC',
  },
  {
    id: '3',
    name: 'Robert Davis',
    phone: '(555) 456-7890',
    status: 'New',
    statusColor: '#526674',
    statusBg: '#E8EDF1',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  },
  {
    id: '4',
    name: 'Emily Wilson',
    phone: '(555) 234-5678',
    status: 'Active',
    statusColor: '#2ECA7F',
    statusBg: '#E5F7ED',
    avatar:
      'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
  },
  {
    id: '5',
    name: 'James Taylor',
    phone: '(555) 876-5432',
    status: 'Follow-up',
    statusColor: '#FFB800',
    statusBg: '#FFF4E5',
    initials: 'JT',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const PatientsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedChip, setSelectedChip] = useState('All');

  const filteredPatients = useMemo(() => {
    if (selectedChip === 'All') return patients;
    return patients.filter((p) => p.status.toLowerCase() === selectedChip.toLowerCase());
  }, [selectedChip]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Patients</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.sortButton}>
            <Text style={styles.sortIcon}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search patients..."
            placeholderTextColor="#6F767E"
            style={styles.searchInput}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {chips.map((chip, idx) => (
            <TouchableOpacity
              key={chip}
              activeOpacity={0.8}
              style={[
                styles.chip,
                selectedChip === chip ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => setSelectedChip(chip)}
            >
              <Text style={selectedChip === chip ? styles.chipTextActive : styles.chipText}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Patient list */}
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredPatients.map((p) => (
            <TouchableOpacity 
            onPress={() => navigation.navigate('PatientDetail', { id: p.id } as any)}
            key={p.id} activeOpacity={0.9} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.avatarWrapper}>
                  {p.avatar ? (
                    <Image source={{ uri: p.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.initialsWrap}>
                      <Text style={styles.initials}>{p.initials}</Text>
                    </View>
                  )}
                </View>
                <View>
                  <Text style={styles.name}>{p.name}</Text>
                  <View style={styles.phoneRow}>
                    <Text style={styles.phoneIcon}>📞</Text>
                    <Text style={styles.phone}>{p.phone}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: p.statusBg },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: p.statusColor }]}>
                    {p.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddPatient')}
        >
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  sortButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F4',
  },
  sortIcon: {
    fontSize: 16,
    color: '#1A1D1F',
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    color: '#6F767E',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1D1F',
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
    height:50,
    alignItems:'center',
    marginTop:12
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    height:45,
    alignItems:'center',
    justifyContent:'center'
  },
  chipActive: {
    backgroundColor: '#526674',
    borderColor: '#526674',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFEFEF',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chipText: {
    color: '#6F767E',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#526674',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D1F',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneIcon: {
    fontSize: 12,
    color: '#6F767E',
  },
  phone: {
    fontSize: 13,
    color: '#6F767E',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 18,
    color: '#6F767E',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
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
  fabIcon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
});

export default PatientsScreen;
