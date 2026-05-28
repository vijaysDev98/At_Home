import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { SHOW_TOAST } from '../../../constant';
import {
  AppSafeAreaView,
  AppText,
  Header,
  AppLoader,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { NotificationItem } from '../../../components/NotificationComponents';
import {
  getNotificationsService,
  markNotificationAsReadService,
  markAllAsReadService,
  getUnreadCountService,
  Notification,
  PaginationInfo,
} from '../../../services/notificationService';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

const DoctorNotification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotificationsData = async (
    p: number = 1,
    statusFilter?: string,
    refresh: boolean = false,
  ) => {
    if (p > 1) {
      setIsFetchingNextPage(true);
    } else if (!refresh) {
      setInitialLoading(true);
    }

    const params = {
      page: p,
      size: 10,
      status: statusFilter,
    };

    try {
      const response = await getNotificationsService(params);
      if (response && response.status === 200) {
        const fetchedNotifications = response.data?.notifications || [];
        const pag = response.data?.pagination || null;
        console.log('fetchedNotifications', fetchedNotifications);

        if (refresh || p === 1) {
          setNotifications(fetchedNotifications);
        } else {
          setNotifications(prev => [...prev, ...fetchedNotifications]);
        }
        setPagination(pag);

        // Fetch unread count separately
        const count = await getUnreadCountService();
        setUnreadCount(count);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setInitialLoading(false);
      setIsFetchingNextPage(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      const statusFilter = activeTab === 'Unread' ? 'unread' : undefined;
      fetchNotificationsData(1, statusFilter, true);
    }, [activeTab]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    const statusFilter = activeTab === 'Unread' ? 'unread' : undefined;
    fetchNotificationsData(1, statusFilter, true);
  };

  const onLoadMore = () => {
    const hasNextPage = pagination ? page < pagination.totalPages : false;
    if (hasNextPage && !isFetchingNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      const statusFilter = activeTab === 'Unread' ? 'unread' : undefined;
      fetchNotificationsData(nextPage, statusFilter, false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const success = await markAllAsReadService();
      if (success) {
        // Optimistically update all notifications to 'read'
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: 'read' as const })),
        );
        // Update unread count to 0
        setUnreadCount(0);
        // SHOW_TOAST(success?.data?.message, 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const hasUnreadNotifications = unreadCount > 0;

  const handleNotificationPress = async (item: Notification) => {
    console.log("NOTIFICATION ITEM", item);

    const action = getNotificationAction(item);
    if (typeof action === 'object' && action?.onPress) {
      action.onPress();
    }
    if (item.status === 'unread') {
      // Optimistically update the UI notification's status to 'read'
      setNotifications(prev =>
        prev.map(n =>
          n.id === item.id ? { ...n, status: 'read' as const } : n,
        ),
      );

      const success = await markNotificationAsReadService(item.id);
      if (success) {
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        // Rollback state if the API failed
        setNotifications(prev =>
          prev.map(n =>
            n.id === item.id ? { ...n, status: 'unread' as const } : n,
          ),
        );
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'formSubmission':
        return IMAGES.ic_submitted;
      case 'formUpdate':
        return IMAGES.alert_formUpdate;
      case 'formReturned':
        return IMAGES.ic_reload;
      case 'requestCompleted':
        return IMAGES.alert_serviceCompleted;
      case 'doctorRegistration':
        return IMAGES.ic_register_done;
      case 'serviceProviderAssignment':
        return IMAGES.alert_newPatient;
      case 'adminManual':
        return IMAGES.ic_warning;
      case 'systemMaintenance':
        return IMAGES.ic_announcement;
      case 'securityAlert':
        return IMAGES.securityIcon;
      default:
        return IMAGES.ic_announcement;
    }
  };

  const getNotificationAction = (item: any) => {
    let label = {
      txt: '',
      onPress: null as (() => void) | null,
    }
    switch (item.type) {
      case 'formSubmission':
        label.txt = 'View Request';
        label.onPress = () => NavigationService.navigate(SCREENS.SERVICE_COMPLETED, { request: item });
        return label;
      case 'formUpdate':
        label.txt = 'View Form';
        label.onPress = () => NavigationService.navigate(SCREENS.FORMS_SCREEN, { request: item, action: 'view' });
        return label;
      case 'formReturned':
        label.txt = 'Review Form';
        return label;
      case 'requestCompleted': //DONE
        label.txt = 'View Details';
        label.onPress = () => NavigationService.navigate(SCREENS.SERVICE_COMPLETED, { request: item });
        return label;
      case 'doctorRegistration':
        // label.txt = 'View Profile';
        return label;
      case 'serviceProviderAssignment':
        return label;
      case 'adminManual':
        return label;
      case 'systemMaintenance':
        return label;
      case 'securityAlert':
        return label;
      default:
        return label;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = item.status === 'unread';
    return (
      <NotificationItem
        title={item.title}
        subtitle={item.message}
        time={moment(item.createdAt).fromNow()}
        iconSource={getNotificationIcon(item.type)}
        unread={isUnread}
        action={getNotificationAction(item).txt}
        onPress={() => handleNotificationPress(item)}
        onActionPress={() => handleNotificationPress(item)}
      />
    );
  };

  return (
    <AppSafeAreaView edges style={{ backgroundColor: COLORS.white }}>
      <AppLoader visible={(initialLoading && !isRefreshing) || isMarkingAllRead} />
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          title="Notifications"
          isBack
          isNotification={true}
          onNotificationPress={handleMarkAllAsRead}
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={styles.tabWrap}
            activeOpacity={0.7}
            onPress={() => setActiveTab('All')}
          >
            <AppText
              size={getScaleSize(15)}
              font={activeTab === 'All' ? FONTS.Inter.Bold : FONTS.Inter.Medium}
              color={activeTab === 'All' ? COLORS._526674 : COLORS._6F767E}
            >
              All
            </AppText>
            {activeTab === 'All' && <View style={styles.activeBorder} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabWrap}
            activeOpacity={0.7}
            onPress={() => setActiveTab('Unread')}
          >
            <AppText
              size={getScaleSize(15)}
              font={
                activeTab === 'Unread' ? FONTS.Inter.Bold : FONTS.Inter.Medium
              }
              color={activeTab === 'Unread' ? COLORS._526674 : COLORS._6F767E}
            >
              Unread
            </AppText>
            {notifications.some(n => n.status === 'unread') && (
              <View style={styles.unreadBadge} />
            )}
            {activeTab === 'Unread' && <View style={styles.activeBorder} />}
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            notifications.length === 0 && { flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                No notifications found
              </AppText>
            </View>
          )}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS._526674} />
              </View>
            ) : null
          }
        />
      </View>
    </AppSafeAreaView>
  );
};

export default DoctorNotification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(20),
    backgroundColor: COLORS.white,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabWrap: {
    position: 'relative',
    paddingBottom: 12,
  },
  activeBorder: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#526674',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  scroll: {
    flex: 1,
    paddingTop: getScaleSize(15),
  },
  scrollContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(60),
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerActions: {
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(12),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  markAllReadButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(8),
    backgroundColor: 'transparent',
  },
});
