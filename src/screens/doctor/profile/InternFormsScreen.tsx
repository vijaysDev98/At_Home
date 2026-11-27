import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  AppSafeAreaView,
  AppText,
  Header,
} from '../../../components';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { STRING } from '../../../constant';
import { REQUEST_STATUS } from '../../../constant/RequestStatus';
import { isDelegatedToProvider } from '../../../constant/smallFunctions';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import { ServiceRequest } from '../../../services/serviceRequestListApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

type FilterType = 'all' | 'submitted' | 'inProgress' | 'returned' | 'completed';

const InternFormsScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const internId: string = route?.params?.internId || '';
  const internName: string = route?.params?.internName || t(STRING.internFormsTitle);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [pagination, setPagination] = useState<any>(null);
  const currentPageRef = useRef(1);

  const fetchInternForms = useCallback(
    async (page = 1, options?: { isRefresh?: boolean; isLoadMore?: boolean }) => {
      if (!internId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (options?.isLoadMore) {
        setLoadingMore(true);
      } else if (!options?.isRefresh) {
        setLoading(true);
      }

      try {
        const res = await serviceRequestApi.getInternServiceRequests(internId, {
          page,
          size: 15,
        });
        const list = res?.requests || [];
        if (options?.isLoadMore) {
          setRequests(prev => [...prev, ...list]);
        } else {
          setRequests(list);
        }
        setPagination(res?.pagination || null);
        currentPageRef.current = page;
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [internId],
  );

  useFocusEffect(
    useCallback(() => {
      fetchInternForms(1);
    }, [fetchInternForms]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInternForms(1, { isRefresh: true });
  }, [fetchInternForms]);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNextPage && !loadingMore) {
      fetchInternForms(currentPageRef.current + 1, { isLoadMore: true });
    }
  }, [pagination, loadingMore, fetchInternForms]);

  const filteredRequests = useMemo(() => {
    const nonDrafts = requests.filter(
      item => item.status !== REQUEST_STATUS.DRAFT,
    );
    if (filter === 'all') return nonDrafts;
    return nonDrafts.filter(item => item.status === filter);
  }, [requests, filter]);

  const tabs: Array<{ key: FilterType; label: string }> = [
    { key: 'all', label: t(STRING.all) },
    { key: REQUEST_STATUS.SUBMITTED, label: t(STRING.submitted) },
    { key: REQUEST_STATUS.IN_PROGRESS, label: t(STRING.inProgress) },
    { key: REQUEST_STATUS.RETURNED, label: t('Returned') },
    { key: REQUEST_STATUS.COMPLETED, label: t(STRING.completed) },
  ];

  const renderItem = ({ item }: { item: ServiceRequest }) => {
    const isPreReq = Boolean(
      item?.isPreRequest === true ||
        (item?.isPreRequest === undefined &&
          !item?.patient &&
          !item?.service &&
          Boolean(item?.preRequestStatus)),
    );
    const formStatus =
      item?.formStatus || item?.preRequestStatus || item?.status;
    const isDelegated = isDelegatedToProvider(item);
    const provider =
      (item as any)?.assignedProvider ||
      (item as any)?.provider ||
      (item as any)?.acceptedBy;
    const providerName =
      provider?.fullName ||
      provider?.providerName ||
      (provider?.fName
        ? `${provider.fName} ${provider.lName || ''}`.trim()
        : null);

    return (
      <RequestCardDoctor
        name={
          item?.patient?.fullName ||
          (isPreReq ? t(STRING.preRequest) || 'Pre-Request' : '')
        }
        requestId={item.requestId}
        requestType={isPreReq ? '' : item?.service?.serviceName || ''}
        formStatus={formStatus}
        status={item.status}
        isPreRequest={isPreReq}
        preRequestStatus={item.preRequestStatus}
        voiceMessageUrl={item.voiceMessageUrl}
        initialNotes={item.initialNotes}
        priorityLevel={item.priorityLevel}
        delegateFormToProvider={isDelegated}
        request={item}
        providerName={providerName}
        showAssignedProvider={true}
        onPress={() => {
          NavigationService.navigate(SCREENS.FORM_REVIEW_SCREEN, {
            request: item,
            viewOnly: true,
          });
        }}
      />
    );
  };

  return (
    <AppSafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <Header
        isBack
        title={internName}
        style={styles.headerStyle}
      />

      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map(tab => {
            const active = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setFilter(tab.key)}
              >
                <AppText
                  size={getScaleSize(12)}
                  font={active ? FONTS.Inter.SemiBold : FONTS.Inter.Medium}
                  color={active ? COLORS.white : COLORS._526674}
                  numberOfLines={1}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && requests.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item, idx) =>
            String((item as any)?.id || (item as any)?._id || idx)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: getScaleSize(12) }} />}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                {t(STRING.noFormsCreatedByIntern)}
              </AppText>
            </View>
          }
        />
      )}
    </AppSafeAreaView>
  );
};

export default InternFormsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._EFEFEF,
  },
  tabsWrapper: {
    backgroundColor: COLORS.white,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
  },
  tabPill: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(10),
    paddingBottom: getScaleSize(32),
    flexGrow: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(40),
    paddingHorizontal: getScaleSize(24),
  },
  footerLoader: {
    paddingVertical: getScaleSize(16),
    alignItems: 'center',
  },
});
