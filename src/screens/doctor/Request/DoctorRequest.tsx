import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppSafeAreaView, AppText, Header, Input, AppLoader } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation';
import RequestCard from '../../../components/RequestCard';
import { serviceRequestListApi, ServiceRequest, PaginationInfo } from '../../../services/serviceRequestListApi';

export type DoctorRequestProps = NativeStackScreenProps<
  RootStackParamList,
  'DoctorRequest'
>;
// Filter Types
type FilterType = 'all' | 'recent' | 'active';

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
  const [filter, setFilter] = useState<FilterType>('all');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter options
  const filterOptions = useMemo(
    () => [
      { key: 'all' as FilterType, label: 'All ' },
      { key: 'draft' as FilterType, label: 'Draft' },
      { key: 'inprogress' as FilterType, label: 'In Progress' },
      { key: 'active' as FilterType, label: 'Returned' },
    ],
    [],
  );

  // Fetch service requests
  const fetchServiceRequests = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await serviceRequestListApi.listServiceRequests({
        page,
        size: PAGE_SIZE,
      });

      if (response) {
        console.log("requests", response.data.requests);

        setRequests(response.data.requests);
        setPagination(response.data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchServiceRequests(1);
  }, [fetchServiceRequests]);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNextPage) {
      fetchServiceRequests(currentPage + 1);
    }
  }, [pagination, currentPage, fetchServiceRequests]);

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    const initials = item.patient.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    console.log("item", item);

    return (
      <RequestCard
        name={item.patient.fullName}
        initials={initials}
        requestId={item.requestId}
        formStatus={item.service.serviceName}
        status={item.status}
        buttonText="View"
        onButtonPress={() => NavigationService.navigate(SCREENS.FORMS_SCREEN, { request: item })}
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
        />

        <View style={styles.filters}>
          {filterOptions.map(option => (
            <FilterChip
              key={option.key}
              label={option.label}
              isActive={filter === option.key}
              onPress={() => handleFilterChange(option.key)}
            />
          ))}
        </View>

        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._6B7280}
          style={{ marginTop: getScaleSize(16) }}
        >
          {`${pagination?.total || 0} Forms Found `}
        </AppText>
      </View>

      {isLoading && requests.length === 0 ? (
        <AppLoader visible={true} />
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{
            paddingHorizontal: getScaleSize(16),
            marginTop: getScaleSize(12),
            gap: getScaleSize(12),
            backgroundColor: COLORS._F8F9FA,
            paddingBottom: getScaleSize(50),
          }}
        />
      )}
    </AppSafeAreaView>
  );
};

export default DoctorRequest;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(8),
    paddingHorizontal: getScaleSize(20),
  },
  searchInput: {
    paddingHorizontal: 0,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginTop: getScaleSize(16),
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
  footerLoader: {
    paddingVertical: getScaleSize(16),
    alignItems: 'center',
  },
});
