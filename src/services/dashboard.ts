import { API } from '../api';
import { ServiceRequestResponse } from './serviceRequestApi';

export const dashboardApi = {
  /**
   * Get doctor dashboard overview
   */
  getDashboardOverview: async (
    recentLimit: number = 20,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.get(
        `/doctor/dashboard/overview?recentLimit=${recentLimit}`,
      );
      const nestedData = response.data?.data ?? response.data;
      const nestedMessage = response.data?.msg ?? response.data?.message ?? response.message;

      if (
        response.code === 200 ||
        response.status === true ||
        response.status === 200 ||
        response.data?.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage || 'Dashboard data retrieved successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to retrieve dashboard data',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to retrieve dashboard data';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },
  /**
   * Get provider dashboard overview
   */
  getProviderDashboardOverview: async (
    recentLimit: number = 5,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.get(
        `/provider/dashboard/overview?recentLimit=${recentLimit}`,
      );
      console.log('provider dashboard response', response);

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.msg || response.message;

      if (response.code === 200) {
        return {
          success: true,
          message: nestedMessage || 'Dashboard data retrieved successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to retrieve dashboard data',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to retrieve dashboard data';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },
};
