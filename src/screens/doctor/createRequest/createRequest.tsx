import React, { useMemo, useState, useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { AppSafeAreaView, AppText, Input } from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { creatRequestPatientsList } from '../../../utils/dummyData';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

export type CreateRequestProps = NativeStackScreenProps<RootStackParamList, 'CreateRequest'>;

// Filter Types
type FilterType = 'all' | 'recent' | 'active';

interface FilterChipProps {
  key: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

// FilterChip Component
const FilterChip: React.FC<FilterChipProps> = React.memo(({ key, label, isActive, onPress }) => (
  <TouchableOpacity
    key={key}
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.chip, isActive && styles.chipActive]}
  >
    <AppText
      color={isActive ? COLORS.white : COLORS._6F767E}
      size={getScaleSize(12)}
      font={isActive ? FONTS.Inter.SemiBold : FONTS.Inter.Regular}
    >
      {label}
    </AppText>
  </TouchableOpacity>
));

// PatientItem Component
interface PatientItemProps {
  patient: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PatientItem: React.FC<PatientItemProps> = React.memo(({ patient, isSelected, onSelect }) => (
  <TouchableOpacity
    key={patient.id}
    activeOpacity={0.9}
    style={[styles.patientCard, isSelected && styles.patientCardActive]}
    onPress={() => onSelect(patient.id)}
  >
    <View style={styles.avatarWrap}>
      {patient.avatar ? (
        <Image source={{ uri: patient.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.initialsWrap}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {patient.initials}
          </AppText>
        </View>
      )}
    </View>
    <View style={styles.patientInfo}>
      <AppText
        size={getScaleSize(16)}
        font={FONTS.Inter.Bold}
        color={COLORS._1A1D1F}
      >
        {patient.name}
      </AppText>
      <AppText
        size={getScaleSize(12)}
        font={FONTS.Inter.Regular}
        color={COLORS._6F767E}
      >
        {patient.pid} • {patient.age}
      </AppText>
    </View>
    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
      {isSelected ? <View style={styles.radioInner} /> : null}
    </View>
  </TouchableOpacity>
));

const CreateRequest: React.FC<CreateRequestProps> = ({ navigation }) => {
  const [selectedId, setSelectedId] = useState<string>('patient_1');
  const [filter, setFilter] = useState<FilterType>('all');

  // Memoized values
  const canContinue = useMemo(() => !!selectedId, [selectedId]);

  // Filter options
  const filterOptions = useMemo(() => [
    { key: 'all' as FilterType, label: 'All Patients' },
    { key: 'recent' as FilterType, label: 'Recent' },
    { key: 'active' as FilterType, label: 'Active Only' },
  ], []);

  // Event handlers
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePatientSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const handleContinue = useCallback(() => {
    NavigationService.navigate(SCREENS.CREATE_REQUEST_STEP2);
  }, []);

  const handleCreateNewPatient = useCallback(() => {
    // TODO: Navigate to create patient screen
    console.log('Create new patient');
  }, []);

  return (
    <AppSafeAreaView
    edges={true}
    style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8} onPress={handleGoBack}>
            <Image
              source={IMAGES.crossIcon}
              style={styles.crossIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >Create Request</AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >Step 1/3: Patient</AppText>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AppText
              size={getScaleSize(18)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >Select Patient</AppText>

            <Input
              leftIcon={IMAGES.search}
              style={styles.searchInput}
              placeholder="Search by name or ID..."
            />

            <View style={styles.filters}>
              {filterOptions.map((option) => (
                <FilterChip
                  key={option.key}
                  label={option.label}
                  isActive={filter === option.key}
                  onPress={() => handleFilterChange(option.key)}
                />
              ))}
            </View>

            <View style={styles.list}>
              {creatRequestPatientsList.map((patient) => (
                <PatientItem
                  key={patient.id}
                  patient={patient}
                  isSelected={selectedId === patient.id}
                  onSelect={handlePatientSelect}
                />
              ))}
            </View>

            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.bottomSheet}>
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={styles.createPatientBtn}
              onPress={handleCreateNewPatient}
            >
              <Image 
                source={IMAGES.new_request} 
                style={styles.newRequestIcon} 
              />
              <AppText
                size={getScaleSize(15)}
                color={COLORS._526674}
                font={FONTS.Inter.Bold}
              > Create New Patient</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.continueBtn, !canContinue && styles.continueDisabled]}
              disabled={!canContinue}
              onPress={handleContinue}
            >
              <AppText
                size={getScaleSize(15)}
                color={COLORS.white}
                font={FONTS.Inter.Bold}
              >Continue</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    color: COLORS._1A1D1F,
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
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
    color: COLORS._1A1D1F,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(160),
    paddingTop: getScaleSize(20),
  },
    searchInput: {
    paddingHorizontal: 0
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
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  chipActive: {
    backgroundColor: COLORS._526674,
    borderColor: COLORS._526674,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS._6F767E,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  list: {
    gap: 10,
    marginTop: 8,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS._E5E7EB,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  patientCardActive: {
    borderColor: COLORS._526674,
    backgroundColor: COLORS._F8F9FA,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS._EFEFEF,
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
    backgroundColor: COLORS._EFF6FF,
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS._2563EB,
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS._1A1D1F,
  },
  patientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientMeta: {
    fontSize: 13,
    color: COLORS._6F767E,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS._E5E7EB,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  radioOuterActive: {
    borderColor: COLORS._526674,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS._526674,
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
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
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
    borderColor: COLORS._526674,
    borderStyle: 'dashed',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8
  },
  createPatientText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS._526674,
  },
  continueBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueDisabled: {
    opacity: 0.6,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  // Inline styles moved to StyleSheet
  crossIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
  },
  newRequestIcon: {
    height: getScaleSize(15),
    width: getScaleSize(12),
    tintColor: COLORS.primary,
  },
});

export default CreateRequest;
