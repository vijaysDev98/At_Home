import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AppLoader,
  AppSafeAreaView,
  AppText,
  Input,
  ProfileAvatar,
  AppButton,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { STRING } from '../../../constant';
import { getDoctorsService } from '../../../services/patientService';
import { useTranslation } from 'react-i18next';
import { doctorSpecialities } from '../../../utils/dummyData';
import { API_BASE_URL, IMAGE_BASE_URL } from '../../../api/apiRoutes';

export type DoctorListProps = NativeStackScreenProps<any, 'DoctorList'>;

// Matches actual API response shape
interface Doctor {
  id: string;
  fName: string;
  lName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specialty?: string;
  facilityName?: string;
  practiceType?: string;
  profileImg?: string;
}

interface DoctorItemProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const DoctorItem: React.FC<DoctorItemProps> = React.memo(
  ({ doctor, isSelected, onSelect }) => {
    const { t } = useTranslation();
    return (
      <TouchableOpacity
        key={doctor.id}
        activeOpacity={0.9}
        style={[styles.patientCard, isSelected && styles.patientCardActive]}
        onPress={() => onSelect(doctor.id)}
      >
        <ProfileAvatar
          name={`${doctor.fName} ${doctor.lName}`}
          imageUrl={
            doctor?.profileImg ? IMAGE_BASE_URL + doctor.profileImg : undefined
          }
          size="medium"
        />

        <View style={styles.patientInfo}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {`${doctor.fName} ${doctor.lName}`}
          </AppText>

          {doctor.specialty && (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >
              {t(
                doctorSpecialities.find(spec => spec.value === doctor.specialty)
                  ?.label || doctor.specialty,
              )}
            </AppText>
          )}

          {/* {doctor.facilityName && (
                        <AppText
                            size={getScaleSize(12)}
                            font={FONTS.Inter.Regular}
                            numberOfLines={1}
                            color={COLORS._6F767E}
                        >
                            {doctor.facilityName}
                        </AppText>
                    )} */}

          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Regular}
            color={COLORS._6F767E}
          >
            {doctor.email}
          </AppText>
        </View>

        <View
          style={[styles.radioOuter, isSelected && styles.radioOuterActive]}
        >
          {isSelected ? <View style={styles.radioInner} /> : null}
        </View>
      </TouchableOpacity>
    );
  },
);

// Use doctor specialities as filters with "All" option
const DOCTOR_FILTERS = [
  { label: STRING.all, value: 'all' },
  ...doctorSpecialities,
];

const DoctorList: React.FC<DoctorListProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const patientId = route.params?.patientId;

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedChip, setSelectedChip] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const getFilterValue = (chip: string): string | undefined => {
    // If "All" is selected, no filter
    if (chip === STRING.all || chip === 'all') {
      return undefined;
    }
    // Otherwise, use the specialty value directly
    return chip;
  };

  const fetchDoctorsData = async (
    p: number = 1,
    s: string = '',
    refresh: boolean = false,
    f?: string,
  ) => {
    try {
      if (p === 1) setIsLoading(true);
      const response: any = await getDoctorsService(p, 20, s, f);
      if (response?.status && response?.code === 200) {
        const newDoctors: Doctor[] = response.data?.data?.doctors || [];

        if (refresh || p === 1) {
          setDoctors(newDoctors);
          setPage(1);
        } else {
          setDoctors(prev => [...prev, ...newDoctors]);
        }

        // Update hasMore based on whether we received data
        setHasMore(newDoctors.length > 0);

        // Update page number for pagination
        if (!refresh && p > 1) {
          setPage(p);
        }
      }
    } catch (error) {
      console.log('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctorsData(1, '', false, undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSelectedId('');
      setSelectedChip('all');
      setSearch('');
      // Trigger API call to refresh data for "All" filter
      fetchDoctorsData(1, '', false, undefined);
    }, []),
  );

  // Handle chip filter changes
  useEffect(() => {
    const filter = getFilterValue(selectedChip);
    fetchDoctorsData(1, '', false, filter);
  }, [selectedChip]);

  // Since search is now handled by API, we don't need local filtering
  const filteredDoctors = useMemo(() => doctors, [doctors]);

  // Debounced search handler
  const debouncedSearch = useMemo(() => {
    let timeoutId: any;
    return (text: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const filter = getFilterValue(selectedChip);
        fetchDoctorsData(1, text, false, filter);
      }, 500);
    };
  }, [selectedChip]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      fetchDoctorsData(nextPage, search, false, getFilterValue(selectedChip));
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    const filter = getFilterValue(selectedChip);
    fetchDoctorsData(1, '', true, filter);
  };

  const canContinue = useMemo(() => !!selectedId, [selectedId]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDoctorSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleContinue = useCallback(() => {
    const doctor = doctors.find(d => d.id === selectedId);
    if (doctor) {
      NavigationService.navigate(SCREENS.CREATE_REQUEST_STEP2, {
        patientId,
        doctorId: doctor.id,
        selectedDoctor: doctor, // Pass full doctor object
      });
    }
  }, [selectedId, doctors, patientId]);

  return (
    <AppSafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER (fixed) */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.circleBtn}
              activeOpacity={0.8}
              onPress={handleGoBack}
            >
              <Image source={IMAGES.arrowLeft} style={styles.crossIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >
              {t(STRING.createRequest)}
            </AppText>

            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >
              {t(STRING.step2Of4)}
            </AppText>
          </View>

          <View style={styles.headerLeft} />
        </View>

        {/* BODY */}
        <View style={styles.content}>
          {isLoading && doctors.length === 0 ? (
            <View style={styles.loaderContainer}>
              <AppLoader visible />
            </View>
          ) : (
            <>
              <View
                style={{
                  marginHorizontal: getScaleSize(16),
                  marginTop: getScaleSize(10),
                }}
              >
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  style={{ marginBottom: getScaleSize(10) }}
                >
                  {t(STRING.selectDoctor)}
                </AppText>

                <Input
                  leftIcon={IMAGES.search}
                  style={styles.searchInput}
                  placeholder={t(STRING.searchByNameOrId)}
                  value={search}
                  onChangeText={handleSearchChange}
                />

                {/* Only show filters when there are doctors */}

                <View style={{ paddingBottom: getScaleSize(10) }}>
                  <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filters}
                    data={DOCTOR_FILTERS}
                    keyExtractor={(item, index) =>
                      (typeof item === 'string' ? item : item.value) ||
                      index.toString()
                    }
                    renderItem={({ item: chip }) => {
                      const chipValue =
                        typeof chip === 'string' ? chip : chip.value;
                      const chipLabel =
                        typeof chip === 'string' ? chip : chip.label;

                      return (
                        <TouchableOpacity
                          key={chipValue}
                          activeOpacity={0.8}
                          style={[
                            styles.chip,
                            selectedChip === chipValue
                              ? styles.chipActive
                              : styles.chipInactive,
                          ]}
                          onPress={() => setSelectedChip(chipValue)}
                        >
                          <AppText
                            color={
                              selectedChip === chipValue
                                ? COLORS.white
                                : COLORS._6F767E
                            }
                            size={getScaleSize(12)}
                            font={
                              selectedChip === chipValue
                                ? FONTS.Inter.SemiBold
                                : FONTS.Inter.Regular
                            }
                          >
                            {t(chipLabel)}
                          </AppText>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </View>

              {/* SCROLLABLE AREA ONLY */}
              <FlatList
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                data={filteredDoctors}
                keyExtractor={item => item.id}
                renderItem={({ item: doctor }) => (
                  <DoctorItem
                    key={doctor.id}
                    doctor={doctor}
                    isSelected={selectedId === doctor.id}
                    onSelect={handleDoctorSelect}
                  />
                )}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[COLORS.primary]}
                  />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                  !isLoading ? (
                    <View style={styles.emptyContainer}>
                      <AppText color={COLORS._6F767E}>
                        {t(
                          search
                            ? STRING.noDoctorsFound
                            : STRING.noDoctorsAvailable,
                        )}
                      </AppText>
                    </View>
                  ) : null
                }
                ListFooterComponent={
                  isLoading && page > 1 ? (
                    <View style={styles.paginationLoader}>
                      <AppText color={COLORS._6F767E} size={getScaleSize(14)}>
                        Loading more doctors...
                      </AppText>
                    </View>
                  ) : null
                }
              />

              {/* FIXED BOTTOM ACTIONS (OUTSIDE SCROLL) */}
              <View style={styles.bottomButtonContainer}>
                <AppButton
                  title={t(STRING.continue)}
                  onPress={handleContinue}
                  disabled={!canContinue}
                />
              </View>
            </>
          )}
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

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },

  headerLeft: {
    flex: 0.5,
    alignItems: 'flex-start',
  },

  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingBottom: getScaleSize(20),
  },

  searchInput: {
    paddingHorizontal: 0,
  },

  filters: {
    alignItems: 'center',
    marginTop: getScaleSize(12),
    marginBottom: getScaleSize(4),
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

  list: {
    gap: 10,
    marginTop: 8,
  },

  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 2,
    borderColor: COLORS._E5E7EB,
    padding: getScaleSize(14),
    marginVertical: getScaleSize(5),
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  patientCardActive: {
    borderColor: COLORS._526674,
    backgroundColor: COLORS._F8F9FA,
  },

  patientInfo: {
    flex: 1,
    gap: 4,
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

  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: getScaleSize(17),
    paddingHorizontal: getScaleSize(20),
  },

  crossIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  paginationLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default DoctorList;
