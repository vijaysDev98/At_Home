import React, { memo, useEffect, useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { fetchPatients } from '../../../actions/patient/patientAction';
import {
  AppLoader,
  AppSafeAreaView,
  AppText,
  Header,
  PrimaryButton,
  ProfileAvatar,
} from '../../../components';
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

  const { isLoading: globalLoading } = useSelector(
    (state: RootState) => state.common,
  );

  const [selectedChip, setSelectedChip] = useState(STRING.all);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (globalLoading && !refresh && p === 1) return;

    if (p > 1) {
      setIsFetchingNextPage(true);
    }

    try {
      await dispatch(fetchPatients(p, s, f));
    } finally {
      setIsFetchingNextPage(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const filter = getFilterValue(selectedChip);
    fetchPatientsData(1, '', false, filter);
  }, []);

  useEffect(() => {
    setPage(1);
    const filter = getFilterValue(selectedChip);
    fetchPatientsData(1, search, false, filter);
  }, [selectedChip]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filter = getFilterValue(selectedChip);

      setPage(1);
      fetchPatientsData(1, search, false, filter);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);

    const filter = getFilterValue(selectedChip);
    fetchPatientsData(1, search, true, filter);
  };

  const onLoadMore = () => {
    if (
      pagination?.hasNextPage &&
      !isFetchingNextPage &&
      !globalLoading
    ) {
      const nextPage = page + 1;
      setPage(nextPage);

      const filter = getFilterValue(selectedChip);
      fetchPatientsData(nextPage, search, false, filter);
    }
  };

  const PatientItem = memo(
    ({ item, onPress }: { item: any; onPress: () => void }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={onPress}
      >
        <View style={styles.cardLeft}>
          <ProfileAvatar
            name={`${item.fName} ${item.lName}`}
            size='medium'
          />

          <View>
            <AppText font={FONTS.Inter.Bold} style={styles.name}>
              {item.fName} {item.lName}
            </AppText>

            <View style={styles.phoneRow}>
              <Image
                source={IMAGES.phone}
                style={styles.phoneIcon}
              />

              <Text style={styles.phone}>
                {getCountryCode(item?.country)} {item.phoneNumber}
              </Text>
            </View>
          </View>
        </View>

        <Image
          source={IMAGES.forwardIcon}
          style={styles.rightIcon}
        />
      </TouchableOpacity>
    ),
  );

  const renderItem = ({ item }: { item: any }) => (
    <PatientItem
      item={item}
      onPress={() =>
        NavigationService.navigate(
          SCREENS.PATIENT_DETAIL,
          {
            id: item.id,
          } as never,
        )
      }
    />
  );

  return (
    <AppSafeAreaView
      edges={['top']}
      style={{ backgroundColor: COLORS.white }}
    >
      <AppLoader
        visible={
          globalLoading &&
          page === 1 &&
          !isRefreshing
        }
      />
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
            <Image
              source={IMAGES.search}
              style={styles.searchIcon}
            />

            <TextInput
              placeholder={t(STRING.searchPatients)}
              placeholderTextColor="#6F767E"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
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
                  onPress={() => setSelectedChip(chip)}
                >
                  <AppText
                    color={
                      selectedChip === chip
                        ? COLORS.white
                        : COLORS._6F767E
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
                <AppLoader visible />
              </View>
            ) : null
          }
          removeClippedSubviews
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />

        <View style={styles.footer}>
          <PrimaryButton
            title={t(STRING.addPatient)}
            onPress={() =>
              NavigationService.navigate(SCREENS.ADD_PATIENT)
            }
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
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
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