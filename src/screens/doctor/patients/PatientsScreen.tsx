import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { AppSafeAreaView, AppText, PrimaryButton } from '../../../components';
import { STRING } from '../../../constant/strings';
import { SCREENS } from '../../../navigation/routes';
import NavigationService from '../../../navigation/NavigationService';
import { PatientListProps, patientsList } from '../../../utils/dummyData';
import { RootStackParamList } from '../../../navigation';

// Define types for better type safety
type PatientStatus = 'All' | 'Recently Added' | 'Recently Updated';

const chips: PatientStatus[] = ['All', 'Recently Added', 'Recently Updated',];

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const PatientsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedChip, setSelectedChip] = useState('All');

  // Memoize filtered patients to avoid unnecessary recalculations
  const filteredPatients = useMemo(() => {
    if (selectedChip === 'All') return patientsList;
    return patientsList.filter(
      p => p.status.toLowerCase() === selectedChip.toLowerCase(),
    );
  }, [selectedChip]);

  // Extract patient item rendering to separate component for better performance
  const PatientItem = React.memo(({ item, onPress }: { item: PatientListProps; onPress: () => void }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.cardLeft}>
        <View style={styles.avatarWrapper}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsWrap}>
              <Text style={styles.initials}>{item.initials}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.phoneRow}>
            <Image source={IMAGES.phone} style={styles.phoneIcon} />
            <Text style={styles.phone}>{item.phone}</Text>
          </View>
        </View>
      </View>
      {/* <View style={styles.cardRight}> */}
      <Image source={IMAGES.forwardIcon} style={styles.rightIcon} />
      {/* </View> */}
    </TouchableOpacity>
  ));

  // Optimized render item function
  const renderItem = ({ item }: { item: PatientListProps }) => (
    <PatientItem
      item={item}
      onPress={() =>
        NavigationService.navigate(SCREENS.PATIENT_DETAIL, { id: item.id } as any)
      }
    />
  );

  return (
    <AppSafeAreaView
    style={{backgroundColor:COLORS.white}}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AppText
          size={getScaleSize(20)}
    font={ FONTS.Inter.Bold}
    color={ COLORS._1A1D1F}
    style={styles.headerTitle}
          >{"Patients"}</AppText>

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
        <FlatList
          data={filteredPatients}
          style={styles.flatListContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: getScaleSize(80), // Approximate item height
            offset: getScaleSize(80) * index,
            index,
          })}
        />
        <View style={styles.footer}>
          <PrimaryButton
            title={STRING.addPatient}
            onPress={() => NavigationService.navigate(SCREENS.ADD_PATIENT)}
          />
        </View>
      </View>
    </AppSafeAreaView>
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
    // paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    paddingLeft: getScaleSize(20),
    marginTop: getScaleSize(25),
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
    marginHorizontal: getScaleSize(20),
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
    paddingHorizontal: getScaleSize(20)
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
  flatListContainer: {
    paddingTop: getScaleSize(16),
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
    // transform: [{ rotate: '270deg' }],
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
