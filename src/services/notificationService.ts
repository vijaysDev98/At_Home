import { API } from '../api';
import { SHOW_TOAST } from '../constant';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceType?: string;
  referenceId?: string;
  actionUrl?: string;
  status: 'read' | 'unread';
  priority?: string;
  channels?: string[];
  readAt?: string;
  createdAt: string;
  metadata?: any;
}

export interface PaginationInfo {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface NotificationListResponse {
  status: number;
  data: {
    notifications: Notification[];
    pagination: PaginationInfo;
  };
}

export interface GetNotificationsParams {
  page?: number;
  size?: number;
  status?: string;
  type?: string;
}

export const getNotificationsService = async (
  params: GetNotificationsParams = { page: 1, size: 10 },
): Promise<NotificationListResponse | null> => {
  try {
    const response: any = await API.Instance.get(API.API_ROUTES.notifications, {
      params: {
        page: params.page || 1,
        size: params.size || 10,
        status: params.status,
        type: params.type,
      },
    });

    if (response.status) {
      return response.data as NotificationListResponse;
    } else {
      SHOW_TOAST(response.message, 'error');
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error.message);
    return null;
  }
};

export const markNotificationAsReadService = async (
  notificationId: string,
): Promise<boolean> => {
  try {
    const response: any = await API.Instance.patch(
      `/notifications/${notificationId}/read`,
    );
    console.log('ressssss', response);

    return response.status === 200 || response.status === true;
  } catch (error: any) {
    SHOW_TOAST(error.message, 'error');
    return false;
  }
};

export const markAllAsReadService = async (): Promise<boolean> => {
  try {
    const response: any = await API.Instance.patch('/notifications/mark-all-read');
    if (response.status === 200 || response.status === true) {
      SHOW_TOAST(response?.data?.message, 'success');
    }
    return response.status === 200 || response.status === true;
  } catch (error: any) {
    SHOW_TOAST(error.message, 'error');
    return false;
  }
};

export const getUnreadCountService = async (): Promise<number> => {
  try {
    const response: any = await API.Instance.get('/notifications/unread-count');
    if (response && response.status) {
      return response.data?.data?.unreadCount || 0;
    }
    SHOW_TOAST(response.message, 'error');
    return 0;
  } catch (error: any) {
    console.error('Error fetching unread count:', error.message);
    return 0;
  }
};
