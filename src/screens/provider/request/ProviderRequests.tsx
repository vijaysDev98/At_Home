import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

const ProviderRequests = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isGlobalLoading = useSelector(
    (state: RootState) => state.common.isLoading,
  );

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const reviewSheetRef = useRef<ActionSheetRef>(null);
  const PAGE_SIZE = 10;

  // Fetch provider initiated requests
  const fetchProviderRequests = useCallback(
    async (
      page: number = 1,
      isRefresh: boolean = false,
      statusParam?: string,
    ) => {
      if (!isRefresh) setIsLoading(true);
      try {
        let providerRequests: ServiceRequest[] = [];
        let hasNextPage = false;
        let total = 0;
        let totalPages = 0;

        // Map tab to backend status
        let mappedStatus: string | undefined = undefined;
        if (statusParam && statusParam !== 'All') {
          if (statusParam === 'In Progress') {
            mappedStatus = REQUEST_STATUS.IN_PROGRESS;
          } else {
            mappedStatus = statusParam.toLowerCase();
          }
        }

        const response =
          await serviceRequestListApi.listProviderInitiatedRequests({
            page,
            size: PAGE_SIZE,
            status: mappedStatus,
          });

        if (response) {
          providerRequests = response.data.requests;
          hasNextPage = response.data.pagination.hasNextPage;
          total = response.data.pagination.total;
          totalPages = response.data.pagination.totalPages;
        }

        if (isRefresh || page === 1) {
          setRequests(providerRequests);
        } else {
          setRequests(prev => [...prev, ...providerRequests]);
        }

        setPagination(response?.data.pagination || null);
        setCurrentPage(page);
      } catch (error: any) {
        SHOW_TOAST(error?.message || 'Failed to fetch requests', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Initial data fetch
  useEffect(() => {
    fetchProviderRequests(1, false, activeTab);
  }, [activeTab]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchProviderRequests(1, true, activeTab);
    }, [fetchProviderRequests, activeTab]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProviderRequests(1, true, activeTab);
    setRefreshing(false);
  }, [fetchProviderRequests, activeTab]);

  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.hasNextPage) {
      fetchProviderRequests(currentPage + 1, false, activeTab);
    }
  }, [pagination, currentPage, fetchProviderRequests, activeTab]);

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
    const isPreReq = Boolean(
      item?.isPreRequest || (!item?.patient && !item?.service),
    );
    const formStatus =
      item?.formStatus || item?.preRequestStatus || item?.status || '';

    const doctor = (item as any)?.doctor;
    const doctorName =
      doctor?.fullName ||
      (doctor ? `${doctor.fName || ''} ${doctor.lName || ''}`.trim() : null);

    const isAcceptedPreReq =
      isPreReq &&
      (item?.preRequestStatus === 'accepted' || item?.status === 'accepted');

    const buttonConfig = isAcceptedPreReq
      ? { show: false, label: null, action: null }
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
            if (item.status === REQUEST_STATUS.COMPLETED) {
              NavigationService.navigate(SCREENS.SERVICE_COMPLETED, {
                request: item,
              });
              return;
            }
            if (item.status === REQUEST_STATUS.DRAFT) {
              NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                request: item,
                action: 'view',
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
              NavigationService.navigate(SCREENS.PROVIDER_PRE_REQUEST_DETAIL, {
                request: item,
                action: 'accept',
              });
              return;
            }
            if (item.status === REQUEST_STATUS.DRAFT) {
              NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                request: item,
                action: buttonConfig.action,
                ...(buttonConfig.isComplete && {
                  isComplete: buttonConfig.isComplete,
                }),
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

  const onReturnRequest = async (
    reason: string,
    details: string,
    requestId: string,
  ) => {
    dispatch(setLoading(true));
    try {
      const response = await serviceRequestApi.claimAndReturnRequest(
        requestId,
        { reasonType: reason, comments: details },
      );
      if (response.success) {
        await serviceRequestApi.releaseFormLock(requestId);

        SHOW_TOAST(response.message, 'success');
        reviewSheetRef?.current?.hide();
        await fetchProviderRequests(1, true);
      } else {
        SHOW_TOAST(response.error, 'error');
      }
    } catch (error: any) {
      SHOW_TOAST(error?.message, 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <AppSafeAreaView style={styles.safe}>
      <AppLoader visible={isLoading} />
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          title={t('My Requests')}
          isBack={true}
        />

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
                  setCurrentPage(1);
                  setRequests([]);
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

        <FlatList
          data={filteredRequests}
          renderItem={renderItem}
          keyExtractor={item =>
            item?.id || (item as any)?._id || item?.requestId
          }
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <AppText
                  size={getScaleSize(16)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                  style={{ textAlign: 'center' }}
                >
                  {t('No requests found')}
                </AppText>
              </View>
            ) : null
          }
          ListFooterComponent={
            isLoading && currentPage > 1 ? (
              <View style={styles.loadingFooter}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                  align="center"
                >
                  Loading more...
                </AppText>
              </View>
            ) : null
          }
        />

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

export default ProviderRequests;

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getScaleSize(60),
  },
  loadingFooter: {
    paddingVertical: getScaleSize(20),
    alignItems: 'center',
  },
});
