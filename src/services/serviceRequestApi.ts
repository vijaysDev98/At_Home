import { Alert } from 'react-native';
import { API } from '../api';
import { API_ROUTES } from '../api/apiRoutes';
import store from '../redux/store';
import { setLoading } from '../actions/common/commonSlice';
import { SHOW_TOAST } from '../constant/showToast';

export interface CreateServiceRequestPayload {
  serviceId: string;
  patientId: string;
  doctorId?: string; // Optional doctor ID for provider-created requests
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
   * Get service request details by ID
   * Handles loader and error toasts internally. Returns data or null.
   */
  getServiceRequestDetails: async (requestId: string): Promise<any> => {
    store.dispatch(setLoading(true));
    try {
      const response: any = await API.Instance.get(
        `/service-requests/${requestId}`,
      );
      if (response?.status) {
        return response.data.data;
      } else {
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
        return null;
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.message || 'Failed to fetch service request details',
        'error',
      );
      return null;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

  /**
   * Get pre-claim service request details for provider
   * Handles loader and error toasts internally. Returns data or null.
   */
  getPreClaimDetails: async (requestId: string): Promise<any> => {
    store.dispatch(setLoading(true));
    try {
      const response: any = await API.Instance.get(
        `/service-requests/${requestId}/pre-claim`,
      );

      if (response?.data?.status) {
        return response.data.data;
      } else {
        SHOW_TOAST('Failed to fetch pre-claim details', 'error');
        return null;
      }
    } catch (error: any) {
      SHOW_TOAST(
        error?.message || 'Failed to fetch pre-claim details',
        'error',
      );
      return null;
    } finally {
      store.dispatch(setLoading(false));
    }
  },

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
          message: response.data?.message || response.message,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.message,
          error: response.message,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message;

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
   * Release lock for a form
   */
  releaseFormLock: async (
    requestId: string,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/form-lock/release`,
        {},
      );
      console.log('unlock response', response);

      if (response.status || response.code === 200) {
        return {
          success: true,
          message: response.data?.message || 'Form lock released successfully',
          data: response.data?.data || response.data,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to release form lock',
          error: response.message,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to release form lock';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Refresh lock for a form (extends expiration)
   */
  refreshFormLock: async (
    requestId: string,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/form-lock/refresh`,
        {},
      );
      console.log('refresh lock response', response);

      if (response.status || response.code === 200) {
        return {
          success: true,
          message: response.data?.message || 'Form lock refreshed successfully',
          data: response.data?.data || response.data,
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to refresh form lock',
          error: response.message,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh form lock';
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

  updateProgress: async (
    requestId: string,
    payload: { formData: any },
  ): Promise<ServiceRequestResponse> => {
    try {
      console.log('to update', requestId, JSON.stringify(payload));

      const response: any = await API.Instance.put(
        `/service-requests/${requestId}/provider-form`,
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

  /**
   * Claim a signed service request
   */
  claimRequest: async (requestId: string): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/claim`,
        {},
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
          message: nestedMessage || 'Request claimed successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to claim request',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to claim request';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Return a service request back to doctor
   */
  returnRequest: async (
    requestId: string,
    obj: { reasonType: string; comments: string },
  ): Promise<ServiceRequestResponse> => {
    console.log('obj', obj);

    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/return`,
        obj,
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
          message: nestedMessage || 'Request returned successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to return request',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to return request';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Claim and return a service request (single API call)
   */
  claimAndReturnRequest: async (
    requestId: string,
    obj: { reasonType: string; comments: string },
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/claim-return`,
        obj,
      );
      console.log('response from return', response);

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage,
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage,
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Complete a service request
   * Endpoint: POST /service-requests/{requestId}/complete
   */
  completeRequest: async (
    requestId: string,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/complete`,
        {},
      );

      const nestedData = response.data?.data || response.data;
      const nestedMessage = response.data?.message || response.message;
      console.log('response from completed', response);

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage || 'Request completed successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to complete request',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to complete request';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Submit provider form for doctor review
   * Endpoint: POST /service-requests/{requestId}/provider-form/submit-for-review
   */
  providerSubmitForReview: async (
    requestId: string,
    payload: { formData: any },
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/provider-form/submit-for-review`,
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
          message: nestedMessage || 'Submitted for review successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to submit for review',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit for review';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  providerViewRequest: async (
    requestId: string,
  ): Promise<ServiceRequestResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/service-requests/${requestId}/viewed`,
        {},
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
          message: nestedMessage || 'Request viewed successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to mark request as viewed',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to mark request as viewed';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },
};

export default serviceRequestApi;
