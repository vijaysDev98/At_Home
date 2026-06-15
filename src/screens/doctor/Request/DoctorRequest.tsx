import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import {
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  AppLoader,
} from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import {
  serviceRequestListApi,
  ServiceRequest,
  PaginationInfo,
} from '../../../services/serviceRequestListApi';
import { getButtonConfig, STRING } from '../../../constant';
import { FORM_STATUS, REQUEST_STATUS } from '../../../constant/RequestStatus';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export type DoctorRequestProps = NativeStackScreenProps<
  RootStackParamList,
  'DoctorRequest'
>;

type FilterType =
  | 'all'
  | typeof REQUEST_STATUS.DRAFT
  | typeof REQUEST_STATUS.RETURNED
  | typeof REQUEST_STATUS.SUBMITTED
  | typeof REQUEST_STATUS.SIGNED
  | typeof REQUEST_STATUS.COMPLETED
  | string;

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = React.memo(
  ({ label, isActive, onPress }) => (
    <TouchableOpacity
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
  ),
);

const PAGE_SIZE = 25;

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: REQUEST_STATUS.DRAFT, label: 'Draft' },
  { key: REQUEST_STATUS.SUBMITTED, label: 'Submitted' },
  { key: REQUEST_STATUS.SIGNED, label: 'Signed' },
  { key: REQUEST_STATUS.RETURNED, label: 'Returned' },
  { key: REQUEST_STATUS.COMPLETED, label: 'Completed' },
];

const DoctorRequest: React.FC<DoctorRequestProps> = ({ navigation }) => {
  const route = useRoute();
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  const initialFilter = (route.params as any)?.formStatus || 'all';

  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchText, setSearchText] = useState('');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter]);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);
  const searchInputRef = useRef<any>(null);
  const searchTextRef = useRef('');
  const currentPageRef = useRef(1);

  const fetchServiceRequests = useCallback(
    async (
      page: number = 1,
      search: string = '',
      opts: { isRefresh?: boolean; isLoadMore?: boolean } = {},
    ) => {
      const { isRefresh = false, isLoadMore = false } = opts;

      const thisFetchId = ++fetchIdRef.current;

      if (isLoadMore) {
        setIsLoadingMore(true);
      } else if (!isRefresh) {
        setIsLoading(true);
      }

      try {
        const params: Record<string, unknown> = {
          page,
          size: PAGE_SIZE,
          search: search || "",
        };

        const response =
          await serviceRequestListApi.listServiceRequests(params);
        console.log("searched res", response);

        if (thisFetchId !== fetchIdRef.current) return;

        if (response?.data) {
          setRequests(prev =>
            page === 1
              ? response.data.requests
              : [...prev, ...response.data.requests],
          );

          setPagination(response.data.pagination);
          setCurrentPage(page);
          currentPageRef.current = page;
        }
      } catch (error) {
        if (thisFetchId !== fetchIdRef.current) return;
        console.error('Error fetching service requests:', error);
      } finally {
        if (thisFetchId === fetchIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);

          if (isRefresh) {
            setRefreshing(false);
          }
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchServiceRequests(1, '');
  }, [fetchServiceRequests]);

  const isFirstFocus = useRef(true);

  useEffect(() => {
    if (isFirstFocus.current) {
      isFirstFocus.current = false;
      return;
    }

    if (isFocused) {
      setSearchText('');
      searchTextRef.current = '';
      searchInputRef.current?.clear();
      fetchServiceRequests(1, '');
    }
  }, [isFocused, fetchServiceRequests]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchServiceRequests(1, searchTextRef.current, { isRefresh: true });
  }, [fetchServiceRequests]);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      searchTextRef.current = text;

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = setTimeout(() => {
        currentPageRef.current = 1;
        setCurrentPage(1);

        fetchServiceRequests(1, text);
      }, 300);
    },
    [fetchServiceRequests],
  );

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoadingMore) {
      fetchServiceRequests(currentPageRef.current + 1, searchTextRef.current, {
        isLoadMore: true,
      });
    }
  }, [pagination, isLoadingMore, fetchServiceRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      if (filter === 'all') return true;

      if (filter === FORM_STATUS.SIGNED) {
        return request.formStatus === filter;
      }

      return request.status === filter;
    });
  }, [requests, filter]);

  const renderItem = useCallback(
    ({ item }: { item: ServiceRequest }) => {
      const formStatus = item?.formStatus;
      const buttonConfig = getButtonConfig(formStatus || '', item?.status);

      return (
        <RequestCardDoctor
          name={item?.patient?.fullName || ''}
          requestId={item.requestId}
          requestType={item.service.serviceName}
          formStatus={formStatus}
          status={item.status}
          buttonText={
            buttonConfig.show
              ? t(buttonConfig.label || '') || undefined
              : undefined
          }
          onPress={() => {
            if (item.status === REQUEST_STATUS.COMPLETED) {
              NavigationService.navigate(SCREENS.SERVICE_COMPLETED, {
                request: item,
              });
              return;
            }

            NavigationService.navigate(SCREENS.FORMS_SCREEN, {
              request: item,
              action: 'view',
            });
          }}
          onButtonPress={() => {
            const targetScreen =
              buttonConfig.action === 'sign'
                ? SCREENS.FORM_REVIEW_SCREEN
                : SCREENS.FORMS_SCREEN;

            NavigationService.navigate(targetScreen, {
              request: item,
              action: buttonConfig.action,
            });
          }}
        />
      );
    },
    [t],
  );

  const renderFooter = useCallback(
    () =>
      isLoadingMore ? (
        <View style={styles.footerLoader}>
          <AppLoader visible={true} />
        </View>
      ) : null,
    [isLoadingMore],
  );

  const renderEmpty = useCallback(
    () =>
      !isLoading ? (
        <View style={styles.emptyState}>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
          >
            {t(STRING.noRequestsFound)}
          </AppText>
        </View>
      ) : null,
    [isLoading, t],
  );

  const keyExtractor = useCallback((item: ServiceRequest) => item.id, []);

  return (
    <AppSafeAreaView edges={['top']} style={styles.safeArea}>
      <Header
        title={t(STRING.serviceRequest)}
        subTitle={t(STRING.manageYourServiceRequests)}
        style={{ paddingHorizontal: getScaleSize(20) }}
      />

      <View style={styles.container}>
        <Input
          ref={searchInputRef}
          value={searchText}
          leftIcon={IMAGES.search}
          style={styles.searchInput}
          inputWrapperStyle={{ backgroundColor: COLORS._F8F9FA }}
          placeholder={t(STRING.searchPatientsServices)}
          placeholderTextColor={COLORS._6F767E}
          onChangeText={handleSearchChange}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_OPTIONS.map(option => (
            <FilterChip
              key={option.key}
              label={t(option.label)}
              isActive={filter === option.key}
              onPress={() => handleFilterChange(option.key)}
            />
          ))}
        </ScrollView>

        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._6B7280}
          style={styles.resultCount}
        >
          {`${filteredRequests.length} ${t(STRING.form)}${filteredRequests.length !== 1 ? 's' : ''
            } ${t(STRING.found)}`}
        </AppText>
      </View>

      <View style={styles.listContainer}>
        {isLoading && requests.length === 0 ? (
          <AppLoader visible={true} />
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS._526674]}
                tintColor={COLORS._526674}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              filteredRequests.length === 0 && styles.listContentEmpty,
            ]}
          />
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default DoctorRequest;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  container: {
    paddingTop: getScaleSize(10),
    paddingHorizontal: getScaleSize(20),
  },
  searchInput: {
    paddingHorizontal: 0,
  },
  filters: {
    flexDirection: 'row',
    marginTop: getScaleSize(16),
    marginBottom: 4,
  },
  filtersContent: {
    paddingRight: getScaleSize(8),
  },
  resultCount: {
    marginVertical: getScaleSize(16),
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    marginTop: getScaleSize(12),
    gap: getScaleSize(12),
    paddingBottom: getScaleSize(50),
  },
  listContentEmpty: {
    flexGrow: 1,
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
    backgroundColor: COLORS._526674,
    borderColor: COLORS._526674,
  },
  footerLoader: {
    paddingVertical: getScaleSize(16),
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: getScaleSize(40),
  },
});