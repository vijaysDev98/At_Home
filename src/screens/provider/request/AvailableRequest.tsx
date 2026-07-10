import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
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
import {
  AppText,
  AppLoader,
  ReviewRequestSheet,
  AppSafeAreaView,
  Header,
} from '../../../components';
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
import { useTranslation } from 'react-i18next';
import { STRING } from '../../../constant';

const TABS = ['All', 'Submitted', 'In Progress', 'Returned', 'Completed'];

const AvailableRequest: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const route = useRoute<any>();

  const isGlobalLoading = useSelector(
    (state: RootState) => state.common.isLoading,
  );
  const reviewSheetRef = useRef<ActionSheetRef>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState(route?.params?.status || 'All');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const PAGE_SIZE = 25;

  // Ref to always have the latest fetch function without re-creating effects
  const fetchRef = useRef<typeof fetchAvailableRequests | null>(null);
  // Ref to always have the latest activeTab in focus effect without re-subscribing
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  // Lock that prevents ANY concurrent fetch (including isRefresh calls that skip setIsLoading)
  const isFetchingRef = useRef(false);

  // Fetch service requests
  // NOTE: no activeTab in deps — we always receive the tab as statusParam so
  // recreating this on every tab change is not needed and causes extra effect runs.
  const fetchAvailableRequests = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      statusParam?: string,
    ) => {
      if (isFetchingRef.current) return; // block concurrent calls (covers isRefresh too)
      isFetchingRef.current = true;
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
        if (statusParam === 'Submitted') mappedStatus = 'submitted';
        else if (statusParam === 'In Progress') mappedStatus = 'inProgress';
        else if (statusParam === 'Returned') mappedStatus = 'returned';
        else if (statusParam === 'Completed') mappedStatus = 'completed';

        // Available (unassigned) requests can only have status "submitted".
        // Calling the available-requests endpoint for other tabs (Returned, In Progress,
        // Completed) returns ALL submitted items and reports hasNextPage:true, which
        // corrupts the combined hasNextPage and causes infinite load-more loops.
        const isFilteredTab =
          statusParam === 'Returned' ||
          statusParam === 'In Progress' ||
          statusParam === 'Completed';

        const [availableResponse, assignedResponse] = await Promise.all([
          isFilteredTab
            ? Promise.resolve(null)
            : serviceRequestListApi.listAvailableRequestsForProvider({
                page,
                size: PAGE_SIZE,
                status: mappedStatus,
              }),
          serviceRequestListApi.listAssignedRequestsForProvider({
            page,
            size: PAGE_SIZE,
            status: mappedStatus,
          }),
        ]);

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
        isFetchingRef.current = false;
        if (!isRefresh) setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Keep ref in sync so focus effect always calls the latest version
  fetchRef.current = fetchAvailableRequests;

  // Load initial data when activeTab changes
  useEffect(() => {
    setCurrentPage(1);
    setRequests([]);
    setPagination(null); // clear stale pagination so handleLoadMore can't fire with old hasNextPage
    fetchAvailableRequests(1, false, activeTab);
  }, [activeTab]); // fetchAvailableRequests is stable (empty deps) — safe to omit

  useEffect(() => {
    if (route?.params?.status) {
      setActiveTab(route.params.status);
    }
  }, [route?.params?.refreshKey]);

  // Fetch data every time screen comes into focus.
  // Empty deps [] means this ONLY fires on real screen-focus events,
  // never on tab changes — activeTab is read via ref to get the latest value.
  useFocusEffect(
    useCallback(() => {
      fetchRef.current?.(1, true, activeTabRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRequests(1, true, activeTab);
    setRefreshing(false);
  }, [fetchAvailableRequests, activeTab]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetchingRef.current) return; // prevent concurrent calls
    if (pagination && pagination.hasNextPage) {
      fetchAvailableRequests(currentPage + 1, false, activeTab);
    }
  }, [isLoading, pagination, currentPage, fetchAvailableRequests, activeTab]);

  const filteredRequests = useMemo(() => {
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
          requestId={item.requestId}
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

  // Note: condition is correct — footer only shows when loading MORE pages (requests already loaded)

  const onReturnRequest = async (
    reason: string,
    details: string,
    requestId: string,
  ) => {
    if (!selectedRequest?.id) {
      SHOW_TOAST(t(STRING.missingID), 'error');
      return;
    }
    setLoading(true);
    try {
      let obj = {
        reasonType: reason,
        comments: details,
      };

      const response = await serviceRequestApi.claimAndReturnRequest(
        selectedRequest.id,
        obj,
      );
      if (response.success) {
        await serviceRequestApi.releaseFormLock(requestId);

        SHOW_TOAST(response.message, 'success');
        reviewSheetRef?.current?.hide();
        await fetchAvailableRequests(1, true);
      } else {
        SHOW_TOAST(response.error, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppSafeAreaView style={styles.safe} edges={['top']}>
      <AppLoader visible={loading} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <Header style={styles.headerStyle} title={t(STRING.requests)} />
            <TouchableOpacity
              style={styles.myRequestsButton}
              onPress={() =>
                NavigationService.navigate(SCREENS.PROVIDER_REQUESTS)
              }
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS.white}
              >
                {t(STRING.myRequests)}
              </AppText>
            </TouchableOpacity>
          </View>
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
                onPress={() => {
                  setIsLoading(true); // show loader immediately — prevents "No requests found" flash
                  setCurrentPage(1);
                  setRequests([]);
                  setPagination(null);
                  setActiveTab(tab);
                }}
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
                  {t(tab)}
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
                      {t(STRING.noRequestsFound)}
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
            await onReturnRequest(reason, details, selectedRequest?.id || '');
          }}
        />
      </View>
    </AppSafeAreaView>
  );
};

export default AvailableRequest;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(20),
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.white,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: getScaleSize(20),
  },
  myRequestsButton: {
    paddingHorizontal: getScaleSize(12),
    marginHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(6),
    backgroundColor: COLORS.primary,
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1.5,
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
