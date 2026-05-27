import React, { memo, useEffect, useMemo, useState } from 'react';
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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { RootStackParamList } from '../../../navigation';
import { fetchPatients } from '../../../actions/patient/patientAction';
import {
  AppLoader,
  AppSafeAreaView,
  AppText,
  PrimaryButton,
} from '../../../components';
import { STRING } from '../../../constant/strings';
import { SCREENS } from '../../../navigation/routes';
import NavigationService from '../../../navigation/NavigationService';
import { RootState } from '../../../redux/store';
import { PATIENT_FILTERS } from '../../../constant/constantData';
import { useTranslation } from 'react-i18next';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const PatientsScreen: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const { patients, pagination } = useSelector(
    (state: RootState) => state.patient,
  );
  const { isLoading: globalLoading } = useSelector(
    (state: RootState) => state.common,
  );

  const [selectedChip, setSelectedChip] = useState('All');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map chip selection to filter parameter
  const getFilterValue = (chip: string): string | undefined => {
    switch (chip) {
      case STRING.all:
        return undefined;
      case STRING.recentlyAdded:
        return 'recently_added';
      case STRING.recentlyUpdated:
        return 'recently_updated';
      default:
        return undefined;
    }
  };

  const fetchPatientsData = async (
    p: number = 1,
    s: string = '',
    refresh: boolean = false,
    f?: string,
  ) => {
    if (p > 1) setIsFetchingNextPage(true);
    await dispatch(fetchPatients(p, s, f));
    setIsFetchingNextPage(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Fetch only on initial mount if the list is empty.
    // Navigating back from Edit/Add screens will not trigger a re-fetch,
    // as those actions already update the Redux state directly.
    if (patients.length === 0) {
      setPage(1);
      const filter = getFilterValue(selectedChip);
      fetchPatientsData(1, search, false, filter);
    }
  }, []);

  // Handle filter changes
  useEffect(() => {
    setPage(1);
    const filter = getFilterValue(selectedChip);
    fetchPatientsData(1, search, false, filter);
  }, [selectedChip]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const filter = getFilterValue(selectedChip);
      if (search !== '') {
        setPage(1);
        fetchPatientsData(1, search, false, filter);
      } else {
        // If search is cleared, fetch all with current filter
        setPage(1);
        fetchPatientsData(1, '', false, filter);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedChip]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    const filter = getFilterValue(selectedChip);
    fetchPatientsData(1, search, true, filter);
  };

  const onLoadMore = () => {
    if (pagination?.hasNextPage && !isFetchingNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      const filter = getFilterValue(selectedChip);
      fetchPatientsData(nextPage, search, false, filter);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const PatientItem = memo(
    ({ item, onPress }: { item: any; onPress: () => void }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={onPress}
      >
        <View style={styles.cardLeft}>
          <View style={styles.avatarWrapper}>
            <View style={styles.initialsWrap}>
              <Text style={styles.initials}>
                {getInitials(item.fName + ' ' + item.lName)}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.name}>{item.fName + ' ' + item.lName}</Text>
            <View style={styles.phoneRow}>
              <Image source={IMAGES.phone} style={styles.phoneIcon} />
              <Text style={styles.phone}>{item.phoneNumber}</Text>
            </View>
          </View>
        </View>
        <Image source={IMAGES.forwardIcon} style={styles.rightIcon} />
      </TouchableOpacity>
    ),
  );

  const renderItem = ({ item }: { item: any }) => (
    <PatientItem
      item={item}
      onPress={() =>
        NavigationService.navigate(SCREENS.PATIENT_DETAIL, {
          id: item.id,
        } as any)
      }
    />
  );

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AppText
            size={getScaleSize(20)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={styles.headerTitle}
          >
            {t(STRING.patients)}
          </AppText>

          {/* Search */}
          <View style={styles.searchWrapper}>
            <Image source={IMAGES.search} style={styles.searchIcon} />
            <TextInput
              placeholder={t(STRING.searchPatients)}
              placeholderTextColor="#6F767E"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {PATIENT_FILTERS.map((chip, idx) => (
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
                <AppText
                  color={selectedChip === chip ? COLORS.white : COLORS._6F767E}
                  size={getScaleSize(12)}
                  font={
                    selectedChip === chip
                      ? FONTS.Inter.SemiBold
                      : FONTS.Inter.Regular
                  }
                >
                  {t(chip)}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Patient list */}

        <FlatList
          data={patients}
          style={styles.flatListContainer}
          contentContainerStyle={[
            styles.listContent,
            patients.length === 0 && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                {t(STRING.noPatientsFound)}
              </AppText>
            </View>
          )}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20 }}>
                <AppLoader visible={true} />
              </View>
            ) : null
          }
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
            title={t(STRING.addPatient)}
            onPress={() => NavigationService.navigate(SCREENS.ADD_PATIENT)}
          />
        </View>
      </View>
      <AppLoader visible={globalLoading && page === 1 && !isRefreshing} />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
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
    // gap: getScaleSize(8),
    alignItems: 'center',
    marginTop: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
  },
  chip: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(18),
    marginRight: getScaleSize(5),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
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
    backgroundColor: COLORS._F8F9FA,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(60),
  },
});

export default PatientsScreen;
