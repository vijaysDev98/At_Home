import { API } from '../api';
import { API_ROUTES } from '../api/apiRoutes';

export interface CreateServiceRequestPayload {
  serviceId: string;
  patientId: string;
  priorityLevel: 'routine' | 'urgent' | 'emergency';
  requestedDate: string; // YYYY-MM-DD format
  requestedTime: string; // HH:mm format
  initialNotes?: string;
  formData: any;
}

export interface ServiceRequestResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const serviceRequestApi = {
  /**
   * Create a new service request
   */
  createServiceRequest: async (
    payload: CreateServiceRequestPayload,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(API_ROUTES.createServiceRequest, payload);

      if (response.status) {
        return {
          success: true,
          message: 'Service request created successfully',
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to create service request',
          error: response.message,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create service request';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },
};

export default serviceRequestApi;
