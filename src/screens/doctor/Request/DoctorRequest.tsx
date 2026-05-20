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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getButtonConfig } from '../../../constant';
import { FORM_STATUS, REQUEST_STATUS } from '../../../constant/RequestStatus';
import { useRoute } from '@react-navigation/native';

export type DoctorRequestProps = NativeStackScreenProps<
  RootStackParamList,
  'DoctorRequest'
>;
// Filter Types
type FilterType =
  | 'all'
  | typeof REQUEST_STATUS.DRAFT
  // | typeof REQUEST_STATUS.IN_PROGRESS
  | typeof REQUEST_STATUS.RETURNED
  | typeof REQUEST_STATUS.SUBMITTED
  | typeof REQUEST_STATUS.SIGNED
  | typeof REQUEST_STATUS.COMPLETED
  | string;

interface FilterChipProps {
  key: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = React.memo(
  ({ key, label, isActive, onPress }) => (
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
  ),
);

const DoctorRequest: React.FC<DoctorRequestProps> = ({ navigation }) => {
  const route = useRoute();
  const formStatus = (route.params as any)?.formStatus || 'all';
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchText, setSearchText] = useState('');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const PAGE_SIZE = 10;

  // Filter options
  const filterOptions = useMemo(
    () => [
      { key: 'all' as FilterType, label: 'All ' },
      { key: REQUEST_STATUS.DRAFT as FilterType, label: 'Draft' },
      // { key: REQUEST_STATUS.IN_PROGRESS as FilterType, label: 'In Progress' },
      { key: REQUEST_STATUS.SUBMITTED as FilterType, label: 'Submitted' },
      { key: REQUEST_STATUS.SIGNED as FilterType, label: 'Signed' },
      { key: REQUEST_STATUS.RETURNED as FilterType, label: 'Returned' },
      { key: REQUEST_STATUS.COMPLETED as FilterType, label: 'Completed' },
    ],
    [],
  );

  // Fetch service requests
  const fetchServiceRequests = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      if (!isRefresh) setIsLoading(true);
      try {
        const response = await serviceRequestListApi.listServiceRequests({
          page,
          size: PAGE_SIZE,
        });
        if (response) {
          // For page 1, replace the entire list
          // For subsequent pages, append to the existing list
          if (page === 1) {
            setRequests(response.data.requests);
          } else {
            setRequests(prev => [...prev, ...response.data.requests]);
          }

          setPagination(response.data.pagination);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error('Error fetching service requests:', error);
      } finally {
        if (!isRefresh) setIsLoading(false);
      }
    },
    [],
  );

  // Load initial data
  useEffect(() => {
    fetchServiceRequests(1);
  }, [fetchServiceRequests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchServiceRequests(1, true);
    setRefreshing(false);
  }, [fetchServiceRequests]);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  useEffect(() => {
    setFilter(formStatus);
  }, [formStatus]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Search filter
      const searchStr = searchText.toLowerCase();
      const patientName = `${request.patient.fullName}`.toLowerCase();
      const serviceName = request.service.serviceName.toLowerCase();
      const matchesSearch =
        !searchText ||
        patientName.includes(searchStr) ||
        serviceName.includes(searchStr);

      // Status filter
      let matchesStatus = true;
      if (filter !== 'all') {
        const status = request.status;
        matchesStatus = status === filter;
      }
      if (filter == FORM_STATUS.SIGNED) {
        const status = request.formStatus;
        matchesStatus = status === filter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchText, filter]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNextPage) {
      fetchServiceRequests(currentPage + 1);
    }
  }, [pagination, currentPage, fetchServiceRequests]);

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    // Get button configuration based on form status (default to status if formStatus not available)
    const formStatus = item?.formStatus;
    const buttonConfig = getButtonConfig(formStatus || '', item?.status);
    return (
      <RequestCardDoctor
        name={item?.patient?.fullName || ''}
        requestId={item.id}
        requestType={item.service.serviceName}
        formStatus={formStatus}
        status={item.status}
        buttonText={
          buttonConfig.show ? buttonConfig.label || undefined : undefined
        }
        onPress={() => {
          NavigationService.navigate(SCREENS.FORMS_SCREEN, {
            request: item,
            action: 'view',
          });
        }}
        onButtonPress={() => {
          if (buttonConfig.action === 'edit') {
            NavigationService.navigate(SCREENS.FORMS_SCREEN, {
              request: item,
              action: buttonConfig.action,
            });
          } else if (buttonConfig.action === 'sign') {
            NavigationService.navigate(SCREENS.FORM_REVIEW_SCREEN, {
              request: item,
              action: buttonConfig.action,
            });
          } else if (buttonConfig.action === 'view') {
            NavigationService.navigate(SCREENS.FORMS_SCREEN, {
              request: item,
              action: buttonConfig.action,
            });
          }
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!isLoading || requests.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <AppLoader visible={true} />
      </View>
    );
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <Header
        title="Service Request"
        subTitle="Manage your service requests"
        style={{ paddingHorizontal: getScaleSize(20) }}
      />
      <View style={styles.container}>
        <Input
          leftIcon={IMAGES.search}
          style={styles.searchInput}
          inputWrapperStyle={{ backgroundColor: COLORS._F8F9FA }}
          placeholder="Search patients, services..."
          placeholderTextColor={COLORS._6F767E}
          value={searchText}
          onChangeText={setSearchText}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
        >
          {filterOptions.map(option => (
            <FilterChip
              key={option.key}
              label={option.label}
              isActive={filter === option.key}
              onPress={() => handleFilterChange(option.key)}
            />
          ))}
        </ScrollView>

        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._6B7280}
          style={{ marginVertical: getScaleSize(16) }}
        >
          {`${filteredRequests.length} Forms Found `}
        </AppText>
      </View>
      <View style={{ flex: 1, backgroundColor: COLORS._F8F9FA }}>
        {isLoading && requests.length === 0 ? (
          <AppLoader visible={true} />
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS._526674]}
                tintColor={COLORS._526674}
              />
            }
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              !isLoading ? (
                <View
                  style={{ alignItems: 'center', marginTop: getScaleSize(40) }}
                >
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6F767E}
                  >
                    No any request found
                  </AppText>
                </View>
              ) : null
            }
            contentContainerStyle={[
              {
                paddingHorizontal: getScaleSize(16),
                marginTop: getScaleSize(12),
                gap: getScaleSize(12),
                paddingBottom: getScaleSize(50),
              },
              filteredRequests.length === 0 && { flexGrow: 1 },
            ]}
          />
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default DoctorRequest;

const styles = StyleSheet.create({
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
});
