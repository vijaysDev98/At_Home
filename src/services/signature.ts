import { API } from '../api';

export interface SignatureResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface SignatureStatusResponse {
  requestId: string;
  status: string;
  formStatus: string;
  isLocked: boolean;
  signatureMetadata: {
    signatureMethod: string;
    signatureStatus: string;
    expiresAt: number;
  };
  docusignEnvelopeId: string;
  envelopeStatus: string;
  signedPdfUrl: string;
}

export const signatureApi = {
  /**
   * Initiate digital signature process
   */
  initiateSignature: async (requestId: string): Promise<SignatureResponse> => {
    try {
      const response: any = await API.Instance.post(
        `/digital-signature/${requestId}/sign`,
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
          message: nestedMessage || 'Signature process initiated successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to initiate signature process',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Failed to initiate signature process';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },

  /**
   * Check signature status continuously
   */
  getSignatureStatus: async (requestId: string): Promise<SignatureResponse> => {
    try {
      const response: any = await API.Instance.get(
        `/digital-signature/${requestId}/signature-status`,
      );

      console.log('signature status response', response);

      const nestedData: SignatureStatusResponse =
        response.data?.data || response.data;

      const nestedMessage = response.data?.message || response.message;

      if (
        response.status === true ||
        response.code === 200 ||
        response.status === 200
      ) {
        return {
          success: true,
          message: nestedMessage || 'Signature status fetched successfully',
          data: nestedData,
        };
      } else {
        return {
          success: false,
          message: nestedMessage || 'Failed to fetch signature status',
          error: nestedMessage,
        };
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch signature status';

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  },
};

export default signatureApi;
