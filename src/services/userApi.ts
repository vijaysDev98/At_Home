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
};
