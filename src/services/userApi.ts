import { Alert } from 'react-native';
import { API } from '../api';
import { API_ROUTES } from '../api/apiRoutes';
import store from '../redux/store';
import { setLoading } from '../actions/common/commonSlice';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../constant/showToast';

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const userApi = {
  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<DeleteAccountResponse> => {
    try {
      store.dispatch(setLoading(true));

      const response = await API.Instance.delete(API.API_ROUTES.deleteAccount);

      if (response.status === 200) {
        // Use API response message or fallback
        const successMessage = response.data?.message || 'Account deleted successfully';
        SHOW_SUCCESS_TOAST(successMessage);
        return {
          success: true,
          message: successMessage,
          data: response.data,
        };
      } else {
        // Use API error message or fallback
        const errorMessage = response.data?.message || 'Failed to delete account';
        SHOW_TOAST(errorMessage);
        return {
          success: false,
          message: errorMessage,
          error: response.data?.message || 'Unknown error',
        };
      }
    } catch (error: any) {
      console.error('Delete account error:', error);
      // Use API error message or fallback
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete account';
      SHOW_TOAST(errorMessage);
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  /**
   * Supervising Doctor: Get interns assigned to this doctor
   */
  getSupervisedInterns: async (status?: string): Promise<any> => {
    try {
      const response: any = await API.Instance.get(
        API.API_ROUTES.doctorInterns,
        {
          params: status ? { status } : undefined,
        },
      );
      return response?.data?.data || response?.data || response || [];
    } catch (error) {
      console.log('Error fetching interns:', error);
      return [];
    }
  },

  /**
   * Supervising Doctor: Approve intern
   */
  approveIntern: async (internId: string): Promise<boolean> => {
    try {
      store.dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        `${API.API_ROUTES.doctorInterns}/${internId}/approve`,
      );
      store.dispatch(setLoading(false));
      if (response?.status || response?.code === 200) {
        SHOW_SUCCESS_TOAST(response?.message || 'Intern approved successfully');
        return true;
      }
      SHOW_TOAST(response?.message || 'Failed to approve intern');
      return false;
    } catch (error) {
      store.dispatch(setLoading(false));
      SHOW_TOAST(undefined, 'error');
      return false;
    }
  },

  /**
   * Supervising Doctor: Reject intern
   */
  rejectIntern: async (internId: string, reason?: string): Promise<boolean> => {
    try {
      store.dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        `${API.API_ROUTES.doctorInterns}/${internId}/reject`,
        { reason },
      );
      store.dispatch(setLoading(false));
      if (response?.status || response?.code === 200) {
        SHOW_SUCCESS_TOAST(response?.message || 'Intern rejected');
        return true;
      }
      SHOW_TOAST(response?.message || 'Failed to reject intern');
      return false;
    } catch (error) {
      store.dispatch(setLoading(false));
      SHOW_TOAST(undefined, 'error');
      return false;
    }
  },
};
