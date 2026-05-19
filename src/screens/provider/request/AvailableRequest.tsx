import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { AppText, AppLoader } from '../../../components';
import { useNavigation } from '@react-navigation/native';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import {
  serviceRequestListApi,
  ServiceRequest,
  PaginationInfo,
} from '../../../services/serviceRequestListApi';
import { getButtonConfig } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import {
  getButtonConfigProvider,
  REQUEST_STATUS,
} from '../../../constant/RequestStatus';
import RequestCardProvider from '../../../components/RequestCardProvider';

const TABS = ['All', 'Submitted', 'In Progress', 'Returned', 'Completed'];

const AvailableRequest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const PAGE_SIZE = 10;

  // Fetch service requests
  const fetchAvailableRequests = useCallback(
    async (page: number = 1, isRefresh: boolean = false) => {
      if (!isRefresh) setIsLoading(true);
      try {
        const response =
          await serviceRequestListApi.listAvailableRequestsForProvider({
            page,
            size: PAGE_SIZE,
          });
        if (response) {
          if (page === 1) {
            setRequests(response.data.requests);
          } else {
            setRequests(prev => [...prev, ...response.data.requests]);
          }

          setPagination(response.data.pagination);
          setCurrentPage(page);
        }
      } catch (error) {
      } finally {
        if (!isRefresh) setIsLoading(false);
      }
    },
    [],
  );

  // Load initial data
  useEffect(() => {
    fetchAvailableRequests(1);
  }, [fetchAvailableRequests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRequests(1, true);
    setRefreshing(false);
  }, [fetchAvailableRequests]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNextPage) {
      fetchAvailableRequests(currentPage + 1);
    }
  }, [pagination, currentPage, fetchAvailableRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(item => {
      if (activeTab === 'All') return true;
      const formStatus = item.formStatus || item.status;
      if (activeTab === 'In Progress') {
        return (
          (formStatus as string) === REQUEST_STATUS.IN_PROGRESS ||
          formStatus === ('InProgress' as any)
        );
      }
      // 'Submitted', 'Returned', 'Completed' generally map directly
      return formStatus?.toLowerCase() === activeTab.toLowerCase();
    });
  }, [requests, activeTab]);

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    // Get button configuration based on form status (default to status if formStatus not available)
    const formStatus = item.formStatus;

    const buttonConfig = getButtonConfigProvider(formStatus || '');

    return (
      <View style={{ marginBottom: getScaleSize(16) }}>
        <RequestCardProvider
          name={item.patient.fullName}
          requestId={item.id}
          requestType={item.service.serviceName}
          formStatus={formStatus}
          status={item.status}
          buttonText={
            buttonConfig.show ? buttonConfig.label || undefined : undefined
          }
          onButtonPress={() =>
            NavigationService.navigate(SCREENS.PROVIDER_FORMS_SCREEN, {
              request: item,
            })
          }
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || requests.length === 0) return null;
    return (
      <View style={{ paddingVertical: getScaleSize(16), alignItems: 'center' }}>
        <AppLoader visible={true} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Requests
          </AppText>
        </View>

        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.tabItemActive,
                ]}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={
                    activeTab === tab ? FONTS.Inter.Bold : FONTS.Inter.Medium
                  }
                  color={activeTab === tab ? COLORS.primary : COLORS._6F767E}
                >
                  {tab}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ flex: 1 }}>
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
                    style={{
                      alignItems: 'center',
                      marginTop: getScaleSize(40),
                    }}
                  >
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                    >
                      No requests found in this category.
                    </AppText>
                  </View>
                ) : null
              }
              contentContainerStyle={styles.scroll}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AvailableRequest;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  tabScroll: {
    paddingHorizontal: getScaleSize(20),
    gap: getScaleSize(24),
  },
  tabItem: {
    paddingVertical: getScaleSize(12),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  scroll: {
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    paddingBottom: getScaleSize(40),
  },
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(20),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(16),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  queueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialsBox: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(12),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(16),
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(16),
  },
  startServiceBtn: {
    backgroundColor: COLORS._526674,
    borderRadius: getScaleSize(12),
    height: getScaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
