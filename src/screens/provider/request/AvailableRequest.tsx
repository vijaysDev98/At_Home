import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
import { AppText, AppLoader, ReviewRequestSheet } from '../../../components';
import {
  serviceRequestListApi,
  ServiceRequest,
  PaginationInfo,
} from '../../../services/serviceRequestListApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import {
  getButtonConfigProvider,
  REQUEST_STATUS,
} from '../../../constant/RequestStatus';
import RequestCardProvider from '../../../components/RequestCardProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { SHOW_TOAST } from '../../../constant/showToast';
import { setLoading } from '../../../actions/common/commonSlice';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { handleClaimService } from '../../doctor/forms/formActionHandlers';

const TABS = ['All', 'Submitted', 'In Progress', 'Returned', 'Completed'];

const AvailableRequest: React.FC = () => {
  const dispatch = useDispatch();
  const isGlobalLoading = useSelector(
    (state: RootState) => state.common.isLoading,
  );
  const reviewSheetRef = useRef<ActionSheetRef>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState('All');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const PAGE_SIZE = 10;

  // Fetch service requests
  const fetchAvailableRequests = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      statusParam?: string,
    ) => {
      if (!isRefresh) setIsLoading(true);
      try {
        let availableRequests: ServiceRequest[] = [];
        let assignedRequests: ServiceRequest[] = [];
        let hasNextPage = false;
        let availableTotal = 0;
        let assignedTotal = 0;
        let availableTotalPages = 0;
        let assignedTotalPages = 0;

        // Map tab to backend status
        let mappedStatus: string | undefined = undefined;
        const currentTab = statusParam !== undefined ? statusParam : activeTab;
        if (currentTab === 'Submitted') mappedStatus = 'submitted';
        else if (currentTab === 'In Progress') mappedStatus = 'inProgress';
        else if (currentTab === 'Returned') mappedStatus = 'returned';
        else if (currentTab === 'Completed') mappedStatus = 'completed';

        // Check if we should call listAvailableRequestsForProvider
        const shouldCallAvailable = false;
        const shouldCallAssigned = page === 1;

        const promises: Promise<any>[] = [];

        // if (shouldCallAvailable) {
        //   promises.push(
        //     serviceRequestListApi.listAvailableRequestsForProvider({
        //       page,
        //       size: PAGE_SIZE,
        //     }),
        //   );
        // } else {
        //   promises.push(Promise.resolve(null));
        // }
        promises.push(Promise.resolve(null));

        if (shouldCallAssigned) {
          promises.push(
            serviceRequestListApi.listAssignedRequestsForProvider({
              page,
              size: PAGE_SIZE,
              status: mappedStatus,
            }),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        const [availableResponse, assignedResponse] = await Promise.all(
          promises,
        );

        if (availableResponse?.data) {
          availableRequests = availableResponse.data.requests || [];
          hasNextPage =
            hasNextPage ||
            availableResponse.data.pagination?.hasNextPage ||
            false;
          availableTotal = availableResponse.data.pagination?.total || 0;
          availableTotalPages =
            availableResponse.data.pagination?.totalPages || 0;
        }

        if (assignedResponse) {
          const data = assignedResponse.data;
          assignedRequests = Array.isArray(data) ? data : data?.requests || [];
          if (!Array.isArray(data) && data?.pagination) {
            hasNextPage = hasNextPage || data.pagination.hasNextPage || false;
            assignedTotal = data.pagination.total || 0;
            assignedTotalPages = data.pagination.totalPages || 0;
          }
        }

        const combined = [...assignedRequests, ...availableRequests];
        // Deduplicate requests by id
        const uniqueCombined = combined.filter(
          (item, idx, self) => self.findIndex(t => t.id === item.id) === idx,
        );

        if (page === 1) {
          setRequests(uniqueCombined);
        } else {
          setRequests(prev => {
            const combinedPrev = [...prev, ...uniqueCombined];
            return combinedPrev.filter(
              (item, idx, self) =>
                self.findIndex(t => t.id === item.id) === idx,
            );
          });
        }

        setPagination({
          hasNextPage,
          page,
          size: PAGE_SIZE,
          total: availableTotal + assignedTotal,
          totalPages: Math.max(availableTotalPages, assignedTotalPages),
          totalRange: '',
          hasPrevPage: page > 1,
        });

        setCurrentPage(page);
      } catch (error) {
        console.error('Error fetching combined requests:', error);
      } finally {
        if (!isRefresh) setIsLoading(false);
      }
    },
    [activeTab],
  );

  // Load initial data and refresh when activeTab changes
  useEffect(() => {
    fetchAvailableRequests(1, false, activeTab);
  }, [activeTab, fetchAvailableRequests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRequests(1, true, activeTab);
    setRefreshing(false);
  }, [fetchAvailableRequests, activeTab]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNextPage) {
      fetchAvailableRequests(currentPage + 1, false, activeTab);
    }
  }, [pagination, currentPage, fetchAvailableRequests, activeTab]);

  const filteredRequests = useMemo(() => {
    console.log('requests', requests);

    return requests.filter(item => {
      if (activeTab === 'All') return true;
      const formStatus = item.status;
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
    const formStatus = item?.formStatus || '';

    const buttonConfig = getButtonConfigProvider(formStatus, item?.status);

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
          onPress={() => {
            if (item.status == REQUEST_STATUS.COMPLETED) {
              NavigationService.navigate(SCREENS.SERVICE_COMPLETED, {
                request: item,
              });
              return;
            }
            NavigationService.navigate(SCREENS.PROVIDER_FORMS_SCREEN, {
              request: item,
              action: 'view',
            });
          }}
          onButtonPress={() =>
            NavigationService.navigate(SCREENS.PROVIDER_FORMS_SCREEN, {
              request: item,
              action: buttonConfig.action,
              ...(buttonConfig.isComplete && {
                isComplete: buttonConfig.isComplete,
              }),
            })
          }
          onLeftButtonPress={() => {
            setSelectedRequest(item);
            reviewSheetRef.current?.show();
          }}
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

  const onReturnRequest = async (reason: string, details: string) => {
    if (!selectedRequest?.id) {
      SHOW_TOAST('Missing Request ID', 'error');
      return;
    }
    dispatch(setLoading(true));
    try {
      let obj = {
        reasonType: reason,
        comments: details,
      };

      const response = await serviceRequestApi.returnRequest(
        selectedRequest.id,
        obj,
      );
      if (response.success) {
        SHOW_TOAST(
          response.message || 'Request returned successfully',
          'success',
        );
        reviewSheetRef?.current?.hide();
        await fetchAvailableRequests(1, true);
      } else {
        SHOW_TOAST(response.error || 'Failed to return request', 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message || 'Failed to return request', 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppLoader visible={isGlobalLoading} />
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
        <ReviewRequestSheet
          ref={reviewSheetRef}
          onSend={async (reason, details) => {
            await handleClaimService({
              requestId: selectedRequest?.id,
              dispatch,
              onSuccess: async () => {
                await onReturnRequest(reason, details);
              },
            });
            // onReturnRequest(reason, details);
          }}
        />
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
