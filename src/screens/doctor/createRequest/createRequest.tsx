import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

export type CreateRequestProps = NativeStackScreenProps<RootStackParamList, 'CreateRequest'>;

const patients = [
  {
    id: 'patient_1',
    name: 'Eleanor Pena',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    pid: '#P-8492',
    age: '68yo',
  },
  {
    id: 'patient_2',
    name: 'Albert Flores',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    pid: '#P-3310',
    age: '42yo',
  },
  {
    id: 'patient_3',
    name: 'Kathryn Murphy',
    avatar: null,
    initials: 'KJ',
    pid: '#P-9921',
    age: '55yo',
  },
  {
    id: 'patient_4',
    name: 'Wade Warren',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    pid: '#P-1120',
    age: '38yo',
  },
];

const CreateRequest: React.FC<CreateRequestProps> = ({ navigation }) => {
  const [selectedId, setSelectedId] = useState<string>('patient_1');
  const [filter, setFilter] = useState<'all' | 'recent' | 'active'>('all');
  const canContinue = useMemo(() => !!selectedId, [selectedId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Request</Text>
            <Text style={styles.headerSubtitle}>Step 1/3: Patient</Text>
          </View>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8}>
            <Text style={styles.headerIcon}>❔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Select Patient</Text>

            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or ID..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.filters}>
              {(
                [
                  { key: 'all', label: 'All Patients' },
                  { key: 'recent', label: 'Recent' },
                  { key: 'active', label: 'Active Only' },
                ] as const
              ).map((chip) => {
                const active = filter === chip.key;
                return (
                  <TouchableOpacity
                    key={chip.key}
                    activeOpacity={0.85}
                    onPress={() => setFilter(chip.key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.list}>
              {patients.map((patient) => {
                const isSelected = selectedId === patient.id;
                return (
                  <TouchableOpacity
                    key={patient.id}
                    activeOpacity={0.9}
                    style={[styles.patientCard, isSelected && styles.patientCardActive]}
                    onPress={() => setSelectedId(patient.id)}
                  >
                    <View style={styles.avatarWrap}>
                      {patient.avatar ? (
                        <Image source={{ uri: patient.avatar }} style={styles.avatar} />
                      ) : (
                        <View style={styles.initialsWrap}>
                          <Text style={styles.initials}>{patient.initials}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <View style={styles.patientMetaRow}>
                        <Text style={styles.patientMeta}>ID: {patient.pid}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.patientMeta}>{patient.age}</Text>
                      </View>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.bottomSheet}>
            <TouchableOpacity activeOpacity={0.85} style={styles.createPatientBtn}>
              <Text style={styles.createPatientText}>＋ Create New Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.continueBtn, !canContinue && styles.continueDisabled]}
              disabled={!canContinue}
              onPress={() => navigation.navigate('CreateRequestStep2')}
            >
              <Text style={styles.continueText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  time: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1d1f',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIcon: {
    fontSize: 14,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 18,
    color: '#1a1d1f',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#526674',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  searchWrap: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    color: '#94a3b8',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1d1f',
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: {
    backgroundColor: '#526674',
    borderColor: '#526674',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6f767e',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  list: {
    gap: 10,
    marginTop: 8,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  patientCardActive: {
    borderColor: '#526674',
    backgroundColor: '#f7f9fb',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#e8edf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff4e5',
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f59e0b',
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  patientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientMeta: {
    fontSize: 13,
    color: '#6f767e',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  radioOuterActive: {
    borderColor: '#526674',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#526674',
  },
  spacer: {
    height: 120,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // elevation: 6,
    gap: 10,
  },
  createPatientBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#526674',
    borderStyle: 'dashed',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPatientText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#526674',
  },
  continueBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDisabled: {
    opacity: 0.6,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default CreateRequest;
