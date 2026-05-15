import { API } from '../api';
import { API_ROUTES } from '../api/apiRoutes';

export interface CreateServiceRequestPayload {
  serviceId: string;
  patientId: string;
  requestedDate: string; // YYYY-MM-DD format
  requestedTime: string; // HH:mm format
  initialNotes?: string;
  formData: any;
}

export interface UpdateServiceRequestPayload {
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
      const response: any = await API.Instance.post(
        API_ROUTES.createServiceRequest,
        payload,
      );

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

  /**
   * Submit service request for review and lock it
   */
  submitForReview: async (
    requestId: string,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/submit-for-review`,
        {},
      );

      // Handle nested response structure
      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message:
            nestedMessage ||
            'Service request submitted for review successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message:
            nestedMessage || 'Failed to submit service request for review',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to submit service request for review';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Acquire lock for a form
   */
  acquireFormLock: async (
    requestId: string,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/form-lock/acquire`,
        {},
      );
      console.log('lock response', response);

      if (response.status || response.code === 200) {
        return {
          success: true,
          message: response.data?.message || 'Form lock acquired successfully',
          data: response.data?.data || response.data,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to acquire form lock',
          error: response.message,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to acquire form lock';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Update an existing draft request
   */
  updateDraft: async (
    requestId: string,
    payload: UpdateServiceRequestPayload,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.put(
        `/forms/${requestId}/draft`,
        payload,
      );

      console.log('Update draft response:', requestId, response);

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage || 'Draft updated successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to update draft',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update draft';

      // Handle 403 - Form is locked
      if (error.response?.status === 403 || error.code === 403) {
        return {
          success: false,
          message: 'Form is locked - already signed',
          error: 'Form is locked - already signed',
        };
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Submit an existing draft request
   */
  submitDraft: async (
    requestId: string,
    payload: UpdateServiceRequestPayload,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/forms/${requestId}/resubmit`,
        payload,
      );

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage || 'Draft submitted successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to submit draft',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to submit draft';

      // Handle 403 - Form is locked
      if (error.response?.status === 403 || error.code === 403) {
        return {
          success: false,
          message: 'Form is locked - already signed',
          error: 'Form is locked - already signed',
        };
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Update form data for an already-submitted request (before re-signing)
   */
  updateFormData: async (
    requestId: string,
    payload: { formData: any },
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.put(
        `/service-requests/${requestId}/form-data`,
        payload,
      );

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage || 'Form data updated successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to update form data',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update form data';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Get form data for review
   */
  getReviewData: async (requestId: string): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.get(
        `/digital-signature/review/${requestId}`,
      );

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;

      if (response.code === 200) {
        return {
          success: true,
          message: nestedMessage || 'Form data retrieved for review',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to retrieve form data',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to retrieve form data';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },
};

export default serviceRequestApi;
