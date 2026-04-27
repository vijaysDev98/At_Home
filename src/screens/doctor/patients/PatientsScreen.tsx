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
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { PrimaryButton } from '../../../components';
import { STRING } from '../../../constant/strings';

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
    return patients.filter(
      p => p.status.toLowerCase() === selectedChip.toLowerCase(),
    );
  }, [selectedChip]);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Patients</Text>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <Image source={IMAGES.search} style={styles.searchIcon} />
            <TextInput
              placeholder={STRING.searchPatients}
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
                  selectedChip === chip
                    ? styles.chipActive
                    : styles.chipInactive,
                ]}
                onPress={() => setSelectedChip(chip)}
              >
                <Text
                  style={
                    selectedChip === chip
                      ? styles.chipTextActive
                      : styles.chipText
                  }
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Patient list */}
        <ScrollView
          style={{ marginTop: getScaleSize(16) }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredPatients.map(p => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PatientDetail', { id: p.id } as any)
              }
              key={p.id}
              activeOpacity={0.9}
              style={styles.card}
            >
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
                    <Image source={IMAGES.phone} style={styles.phoneIcon} />
                    <Text style={styles.phone}>{p.phone}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardRight}>
                {/* <View style={[styles.badge, { backgroundColor: p.statusBg }]}>
                  <Text style={[styles.badgeText, { color: p.statusColor }]}>
                    {p.status.toUpperCase()}
                  </Text>
                </View> */}
                <Image source={IMAGES.arrow_bottom} style={styles.rightIcon} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title={STRING.addPatient}
            onPress={() => navigation.navigate('AddPatient' as any)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS._E5E7EB,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._E5E7EB,
  },
  header: {
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: getScaleSize(20),
    marginTop: getScaleSize(25),
    fontFamily: FONTS.Inter.Bold,
    color: COLORS._1A1D1F,
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
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F4',
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(16),
    height: getScaleSize(48),
    gap: getScaleSize(10),
  },
  searchIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: '#6F767E',
  },
  searchInput: {
    flex: 1,
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS._1A1D1F,
    paddingVertical: 0,
  },
  chipsRow: {
    gap: getScaleSize(8),
    alignItems: 'center',
    marginTop: getScaleSize(12),
  },
  chip: {
    paddingHorizontal: getScaleSize(22),
    borderRadius: getScaleSize(25),
    borderWidth: 1,
    height: getScaleSize(45),
    alignItems: 'center',
    justifyContent: 'center',
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
    color: COLORS.white,
    fontSize: getScaleSize(13),
    fontFamily: FONTS.Inter.Medium,
  },
  chipText: {
    color: COLORS._6F767E,
    fontSize: getScaleSize(13),
    fontFamily: FONTS.Inter.Medium,
  },
  listContent: {
    paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(120),
    gap: getScaleSize(12),
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
    height: getScaleSize(15),
    width: getScaleSize(10),
    resizeMode: 'contain',
  },
  rightIcon: {
    height: getScaleSize(18),
    width: getScaleSize(8),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
    transform: [{ rotate: '270deg' }],
  },
  phone: {
    fontFamily: FONTS.Inter.Regular,
    fontSize: getScaleSize(13),
    color: COLORS._6F767E,
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
  footer: {
    paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(20),
    backgroundColor: COLORS._E5E7EB,
  },
});

export default PatientsScreen;
