import React, {
  useState,
  useEffect,
  useCallback,
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
import { isDelegatedToProvider } from '../../../constant/smallFunctions';

const TABS = ['All', 'Submitted', 'In Progress', 'Returned', 'Completed'];
const PAGE_SIZE = 25;

const getItemId = (item: any) => item?.id || item?._id || item?.requestId;

const sortByNewest = (list: ServiceRequest[]) =>
  [...list].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

const parsePagedResponse = (response: any) => {
  if (!response) {
    return { requests: [] as ServiceRequest[], hasNextPage: false, total: 0 };
  }
  const data = response.data;
  if (Array.isArray(data)) {
    return {
      requests: data as ServiceRequest[],
      hasNextPage: data.length >= PAGE_SIZE,
      total: data.length,
    };
  }
  const requests: ServiceRequest[] = data?.requests || [];
  const pagination = data?.pagination;
  return {
    requests,
    hasNextPage:
      pagination?.hasNextPage ?? requests.length >= PAGE_SIZE,
    total: pagination?.total || 0,
  };
};

const mapTabToStatus = (statusParam?: string) => {
  if (statusParam === 'Submitted') return 'submitted';
  if (statusParam === 'In Progress') return 'inProgress';
  if (statusParam === 'Returned') return 'returned';
  if (statusParam === 'Completed') return 'completed';
  return undefined;
};

const shouldFetchAvailableList = (statusParam?: string) =>
  statusParam !== 'Returned' &&
  statusParam !== 'In Progress' &&
  statusParam !== 'Completed';

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
  const [refreshing, setRefreshing] = useState(false);

  const fetchRef = useRef<typeof fetchAvailableRequests | null>(null);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const isFetchingRef = useRef(false);
  const fetchSeqRef = useRef(0);
  const skipNextFocusFetchRef = useRef(true);
  const availablePageRef = useRef(0);
  const assignedPageRef = useRef(0);
  const availableHasMoreRef = useRef(true);
  const assignedHasMoreRef = useRef(true);

  const fetchAvailableRequests = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      statusParam?: string,
    ) => {
      const isReset = page === 1 || isRefresh;
      if (!isReset && isFetchingRef.current) return;

      const seq = ++fetchSeqRef.current;
      isFetchingRef.current = true;
      if (!isRefresh) setIsLoading(true);

      try {
        const mappedStatus = mapTabToStatus(statusParam);
        const canFetchAvailable = shouldFetchAvailableList(statusParam);

        if (isReset) {
          availablePageRef.current = 0;
          assignedPageRef.current = 0;
          availableHasMoreRef.current = canFetchAvailable;
          assignedHasMoreRef.current = true;
        }

        const nextAvailablePage = availablePageRef.current + 1;
        const nextAssignedPage = assignedPageRef.current + 1;
        const fetchAvailable =
          canFetchAvailable && availableHasMoreRef.current;
        const fetchAssigned = assignedHasMoreRef.current;

        if (!fetchAvailable && !fetchAssigned) {
          setPagination(prev =>
            prev ? { ...prev, hasNextPage: false } : prev,
          );
          return;
        }

        const [availableResponse, assignedResponse] = await Promise.all([
          fetchAvailable
            ? serviceRequestListApi.listAvailableRequestsForProvider({
                page: nextAvailablePage,
                size: PAGE_SIZE,
                status: mappedStatus,
              })
            : Promise.resolve(null),
          fetchAssigned
            ? serviceRequestListApi.listAssignedRequestsForProvider({
                page: nextAssignedPage,
                size: PAGE_SIZE,
                status: mappedStatus,
              })
            : Promise.resolve(null),
        ]);

        if (seq !== fetchSeqRef.current) return;

        const availableParsed = fetchAvailable
          ? parsePagedResponse(availableResponse)
          : { requests: [] as ServiceRequest[], hasNextPage: false, total: 0 };
        const assignedParsed = fetchAssigned
          ? parsePagedResponse(assignedResponse)
          : { requests: [] as ServiceRequest[], hasNextPage: false, total: 0 };

        if (fetchAvailable) {
          availablePageRef.current = nextAvailablePage;
          availableHasMoreRef.current = availableParsed.hasNextPage;
        }
        if (fetchAssigned) {
          assignedPageRef.current = nextAssignedPage;
          assignedHasMoreRef.current = assignedParsed.hasNextPage;
        }

        const seen = new Set<string>();
        const uniqueCombined = [
          ...assignedParsed.requests,
          ...availableParsed.requests,
        ].filter(item => {
          const id = String(getItemId(item) || '');
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });

        if (isReset) {
          setRequests(sortByNewest(uniqueCombined));
        } else {
          setRequests(prev => {
            const existing = new Set(prev.map(item => String(getItemId(item))));
            const appended = uniqueCombined.filter(
              item => !existing.has(String(getItemId(item))),
            );
            return [...prev, ...appended];
          });
        }

        const hasNextPage =
          availableHasMoreRef.current || assignedHasMoreRef.current;
        const displayPage = Math.max(
          availablePageRef.current,
          assignedPageRef.current,
          1,
        );

        setPagination({
          hasNextPage,
          page: displayPage,
          size: PAGE_SIZE,
          total: availableParsed.total + assignedParsed.total,
          totalPages: 0,
          totalRange: '',
          hasPrevPage: displayPage > 1,
        });
      } catch (error) {
        console.error('Error fetching combined requests:', error);
      } finally {
        if (seq === fetchSeqRef.current) {
          isFetchingRef.current = false;
          if (!isRefresh) setIsLoading(false);
        }
      }
    },
    [],
  );

  fetchRef.current = fetchAvailableRequests;

  useEffect(() => {
    setRequests([]);
    setPagination(null);
    fetchAvailableRequests(1, false, activeTab);
  }, [activeTab, fetchAvailableRequests]);

  useEffect(() => {
    if (route?.params?.status) {
      setActiveTab(route.params.status);
    }
  }, [route?.params?.refreshKey]);

  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusFetchRef.current) {
        skipNextFocusFetchRef.current = false;
        return;
      }
      fetchRef.current?.(1, true, activeTabRef.current);
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAvailableRequests(1, true, activeTab);
    setRefreshing(false);
  }, [fetchAvailableRequests, activeTab]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetchingRef.current || !pagination?.hasNextPage) return;
    fetchAvailableRequests(2, false, activeTab);
  }, [isLoading, pagination, fetchAvailableRequests, activeTab]);

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    const isPreReq = Boolean(
      item?.isPreRequest === true ||
        (item?.isPreRequest === undefined &&
          !item?.patient &&
          !item?.service &&
          Boolean(item?.preRequestStatus)),
    );
    const formStatus =
      item?.formStatus || item?.preRequestStatus || item?.status || '';

    const doctor = (item as any)?.doctor;
    const doctorName =
      // doctor?.fullName ||
      (doctor ? `${doctor.fName || ''} ${doctor.lName || ''}`.trim() : null);

    const isAcceptedPreReq =
      isPreReq &&
      (item?.preRequestStatus === 'accepted' || item?.status === 'accepted');

    const isDelegated = isDelegatedToProvider(item);

    const buttonConfig = isAcceptedPreReq
      ? isDelegated
        ? { show: true, label: STRING.fillForm, action: 'fillForm' }
        : { show: false, label: null, action: null }
      : isPreReq
      ? {
          show:
            item?.status === 'submitted' || item?.preRequestStatus === 'pending',
          label: STRING.accept,
          action: 'accept',
        }
      : getButtonConfigProvider(formStatus, item?.status);

    return (
      <View style={{ marginBottom: getScaleSize(16) }}>
        <RequestCardProvider
          name={
            item?.patient?.fullName ||
            (isPreReq
              ? t(STRING.preRequest) || 'Pre-Request'
              : '')
          }
          requestId={item.requestId}
          requestType={item?.service?.serviceName || ''}
          formStatus={formStatus}
          status={item.status}
          isPreRequest={isPreReq}
          preRequestStatus={item.preRequestStatus}
          voiceMessageUrl={item.voiceMessageUrl}
          initialNotes={item.initialNotes}
          priorityLevel={item.priorityLevel}
          doctorName={doctorName}
          doctorSpecialty={doctor?.specialty}
          delegateFormToProvider={isDelegated}
          request={item}
          buttonText={
            buttonConfig.show && buttonConfig.label
              ? t(buttonConfig.label)
              : undefined
          }
          onPress={() => {
            if (isPreReq) {
              NavigationService.navigate(SCREENS.PROVIDER_PRE_REQUEST_DETAIL, {
                request: item,
                action: isAcceptedPreReq ? 'view' : 'accept',
              });
              return;
            }
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
          onButtonPress={() => {
            if (isPreReq) {
              if (buttonConfig.action === 'fillForm') {
                const itemAny = item as any;
                const doctorObj =
                  doctor ||
                  (itemAny?.doctorId
                    ? {
                        id: itemAny.doctorId,
                        fullName: doctorName || '',
                      }
                    : null);
                const assignedProviderId =
                  itemAny?.assignedProviderId ||
                  itemAny?.assignedProvider?._id ||
                  itemAny?.assignedProvider?.id ||
                  itemAny?.providerId ||
                  itemAny?.provider?._id ||
                  itemAny?.provider?.id;

                NavigationService.navigate(SCREENS.CREATE_REQUEST, {
                  preRequest: item,
                  preRequestId: item.id || itemAny?._id || item.requestId,
                  fromPreRequest: true,
                  doctorId: doctorObj?.id || itemAny?.doctorId,
                  selectedDoctor: doctorObj,
                  assignedProviderId,
                });
                return;
              }

              NavigationService.navigate(SCREENS.PROVIDER_PRE_REQUEST_DETAIL, {
                request: item,
                action: 'accept',
              });
              return;
            }
            NavigationService.navigate(SCREENS.PROVIDER_FORMS_SCREEN, {
              request: item,
              action: buttonConfig.action,
              ...(buttonConfig.isComplete && {
                isComplete: buttonConfig.isComplete,
              }),
            });
          }}
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
        await fetchAvailableRequests(1, true, activeTab);
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
              data={requests}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS._526674]}
                  tintColor={COLORS._526674}
                />
              }
              keyExtractor={item =>
                item?.id || (item as any)?._id || item?.requestId
              }
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
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
