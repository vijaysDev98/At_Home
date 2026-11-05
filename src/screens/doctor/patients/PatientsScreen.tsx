import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { fetchPatients } from '../../../actions/patient/patientAction';
import {
  AppSafeAreaView,
  AppText,
  Header,
  PrimaryButton,
  ProfileAvatar,
} from '../../../components';
import { PatientListSkeleton } from '../../../components/patients/PatientListSkeleton';
import { STRING } from '../../../constant/strings';
import { SCREENS } from '../../../navigation/routes';
import NavigationService from '../../../navigation/NavigationService';
import { RootState } from '../../../redux/store';
import { PATIENT_FILTERS } from '../../../constant/constantData';
import { useTranslation } from 'react-i18next';
import App from '../../../../App';
import { getCountryCode } from '../../../constant/getCountryCode';

const PatientsScreen: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();

  const { patients, pagination } = useSelector(
    (state: RootState) => state.patient,
  );

  const [selectedChip, setSelectedChip] = useState(STRING.all);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [visibleNameIds, setVisibleNameIds] = useState<Record<string, boolean>>(
    {},
  );

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageOneInFlightRef = useRef(false);
  const patientsCountRef = useRef(0);
  patientsCountRef.current = patients.length;

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
    if (pageOneInFlightRef.current && !refresh && p === 1) return;

    if (p === 1 && !refresh) {
      pageOneInFlightRef.current = true;
    }

    if (p > 1) {
      setIsFetchingNextPage(true);
    } else if (!refresh && patientsCountRef.current === 0) {
      setListLoading(true);
    }

    try {
      await dispatch(fetchPatients(p, s, f));
    } finally {
      if (p === 1 && !refresh) {
        pageOneInFlightRef.current = false;
      }
      setListLoading(false);
      setIsFetchingNextPage(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatientsData(1, '', false, getFilterValue(selectedChip));
    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState !== 'active') {
        setVisibleNameIds({});
      }
    });
    return () => {
      appStateSub.remove();
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  // Reset screen every time it comes into focus
  useFocusEffect(
    useCallback(() => {
      // Reset search text
      setSearch('');
      // Reset selected chip to "All"
      setSelectedChip(STRING.all);
      // Reset page
      setPage(1);
      // Clear any pending search debounce
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      setVisibleNameIds({});
      // Fetch patients with default filter (All)
      fetchPatientsData(1, '', false, undefined);
      return () => {
        setVisibleNameIds({});
      };
    }, []),
  );

  const handleChipPress = (chip: string) => {
    setVisibleNameIds({});
    setSelectedChip(chip);
    setPage(1);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const filter = getFilterValue(chip);
    fetchPatientsData(1, search, false, filter);
  };

  const handleSearchChange = (text: string) => {
    setVisibleNameIds({});
    setSearch(text);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      const filter = getFilterValue(selectedChip);
      fetchPatientsData(1, text, false, filter);
    }, 500);
  };

  const onRefresh = () => {
    setVisibleNameIds({});
    setIsRefreshing(true);
    setPage(1);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const filter = getFilterValue(selectedChip);
    fetchPatientsData(1, search, true, filter);
  };

  const onLoadMore = () => {
    setVisibleNameIds({});
    if (pagination?.hasNextPage && !isFetchingNextPage && !listLoading) {
      const nextPage = page + 1;
      setPage(nextPage);

      const filter = getFilterValue(selectedChip);
      fetchPatientsData(nextPage, search, false, filter);
    }
  };

  const hideAllNames = useCallback(() => {
    setVisibleNameIds({});
  }, []);

  const toggleNameVisibility = useCallback((id: string) => {
    setVisibleNameIds(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const PatientItem = memo(
    ({
      item,
      revealed,
      onPress,
      onToggleName,
    }: {
      item: any;
      revealed: boolean;
      onPress: () => void;
      onToggleName: () => void;
    }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={onPress}
      >
        <View style={styles.cardLeft}>
          <ProfileAvatar name={`${item.fName} ${item.lName}`} size="medium" />

          <View style={styles.infoCol}>
            <View style={styles.nameLine}>
              <View style={styles.nameMask}>
                {revealed ? (
                  <AppText
                    font={FONTS.Inter.Bold}
                    numberOfLines={1}
                    style={styles.name}
                  >
                    {item.fName} {item.lName}
                  </AppText>
                ) : (
                  <View style={styles.hiddenPart}>
                    <AppText
                      font={FONTS.Inter.Bold}
                      numberOfLines={1}
                      style={[styles.name, styles.nameBlurred]}
                    >
                      {item.fName} {item.lName}
                    </AppText>
                    <View pointerEvents="none" style={styles.nameFog} />
                  </View>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                onPress={onToggleName}
                style={styles.eyeBtn}
              >
                <Image
                  source={
                    revealed ? IMAGES.open_eye_icon : IMAGES.close_eye_icon
                  }
                  style={revealed ? styles.eyeIconOpen : styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.phoneRow}>
              <Image source={IMAGES.phone} style={styles.phoneIcon} />

              <Text style={styles.phone}>
                {getCountryCode(item?.country)} {item.phoneNumber}
              </Text>
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
      revealed={!!visibleNameIds[item.id]}
      onToggleName={() => toggleNameVisibility(String(item.id))}
      onPress={() =>
        NavigationService.navigate(SCREENS.PATIENT_DETAIL, {
          id: item.id,
        } as never)
      }
    />
  );

  const showSkeleton = listLoading && page === 1 && !isRefreshing;

  return (
    <AppSafeAreaView edges={['top']} style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <Header
          title={t(STRING.patients)}
          style={{
            paddingHorizontal: getScaleSize(20),
            backgroundColor: COLORS.white,
          }}
        />

        <View style={styles.header}>
          <View style={styles.searchWrapper}>
            <Image source={IMAGES.search} style={styles.searchIcon} />

            <TextInput
              placeholder={t(STRING.searchPatients)}
              placeholderTextColor="#6F767E"
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearchChange}
            />
          </View>

          {/* Only show filters when there are patients */}
          {/* {patients.length > 0 && ( */}
          <View style={styles.filtersContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {PATIENT_FILTERS.map(chip => (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    selectedChip === chip
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => handleChipPress(chip)}
                >
                  <AppText
                    color={
                      selectedChip === chip ? COLORS.white : COLORS._6F767E
                    }
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
          {/* )} */}
        </View>

        {showSkeleton ? (
          <PatientListSkeleton />
        ) : (
        <FlatList
          data={patients || []}
          style={styles.flatListContainer}
          contentContainerStyle={[
            styles.listContent,
            (!patients || patients.length === 0) && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          onScrollBeginDrag={hideAllNames}
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
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          removeClippedSubviews
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
        )}

        <View style={styles.footer}>
          <PrimaryButton
            title={t(STRING.addPatient)}
            onPress={() => NavigationService.navigate(SCREENS.ADD_PATIENT)}
          />
        </View>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  header: {
    paddingBottom: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS._EFEFEF,
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
  filtersContainer: {
    marginTop: getScaleSize(12),
  },
  chipsRow: {
    alignItems: 'center',
    paddingHorizontal: getScaleSize(20),
  },
  chip: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(18),
    marginRight: getScaleSize(5),
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#526674',
    borderColor: '#526674',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFEFEF',
  },
  flatListContainer: {
    paddingTop: getScaleSize(16),
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
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#526674',
  },
  infoCol: {
    flex: 1,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  nameMask: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
  },
  hiddenPart: {
    flexShrink: 1,
    borderRadius: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  nameBlurred: {
    color: 'transparent',
  },
  nameFog: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E3E9EE',
    borderRadius: 4,
  },
  eyeBtn: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  eyeIconOpen: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
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
  phone: {
    fontFamily: FONTS.Inter.Regular,
    fontSize: getScaleSize(13),
    color: COLORS._6F767E,
  },
  rightIcon: {
    height: getScaleSize(18),
    width: getScaleSize(8),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
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
