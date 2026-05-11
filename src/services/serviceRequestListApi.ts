import { API } from '../api';
import { API_ROUTES } from '../api/apiRoutes';

export interface DeletedInfo {
  status: boolean;
  by: string | null;
  at: number;
}

// ===== FOR LIST VIEW (DoctorRequest) =====
export interface PatientInfo {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  city: string;
  zip: string;
  medicalDescription: string;
  doctorId: string;
  createdBy: string;
  updatedBy: string;
  deleted: DeletedInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInfo {
  _id: string;
  serviceName: string;
  description: string;
  icon: string | null;
  formTemplateId: string;
  category: string | null;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  deleted: DeletedInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  requestId: string;
  priorityLevel: 'routine' | 'urgent' | 'emergency';
  requestedDate: string;
  requestedTime: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  patient: PatientInfo;
  service: ServiceInfo;
}

// ===== FOR DETAILED VIEW (FormsScreen after API fetch) =====
export interface UserInfo {
  _id: string;
  email?: string;
  fName?: string;
  lName?: string;
  fullName?: string;
}

export interface PatientDetailInfo {
  _id: string;
  fullName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
}

export interface ServiceDetailInfo {
  _id: string;
  serviceName: string;
  description?: string;
  formTemplateId?: string;
}

export interface InfusionProduct {
  product_name: string;
  strength: string;
  diluent_type: string;
  diluent_volume_ml: string;
  duration_minutes: string;
  frequency_per_day: string;
  route_of_access: string;
  mode_of_administration: string;
  ambulatory_required: boolean;
  prepared_in_facility: boolean;
  start_date: string;
  end_date: string;
  treatment_duration_days: string;
  tni: string;
  infuse_alone: boolean;
}

export interface FormData {
  prescription_date: string;
  therapy_type: string;
  patient_last_name: string;
  patient_first_name: string;
  dob: string;
  weight: string;
  nir: string;
  ald_condition: boolean;
  prescriber_last_name: string;
  prescriber_first_name: string;
  prescriber_phone: string;
  rpps_id: string;
  hospital_name: string;
  hospital_address: string;
  finess_number: string;
  physician_signature: string;
  infusion_products?: InfusionProduct[];
  [key: string]: any;
}

export interface DigitalSignature {
  signatureData: string | null;
  signedAt: string | null;
  signedBy: string | null;
}

export interface SignatureMetadata {
  signatureMethod: string;
  signatureStatus: string;
  expiresAt: string | null;
}

export interface FormLock {
  lockedBy: string | null;
  role: string | null;
  lockedAt: string | null;
  expiresAt: string | null;
}

export interface LastAdminAction {
  actionType: string | null;
  performedBy: string | null;
  performedAt: string | null;
  reason: string | null;
}

export interface StaleFlags {
  isStale: boolean;
  staleSince: string | null;
  staleReason: string | null;
}

export interface StatusTimestamps {
  draft: number;
  submitted: number | null;
  inProgress: number | null;
  returned: number | null;
  completed: number | null;
}

export interface ServiceRequestDetail {
  _id: string;
  requestId: string;
  patientId: PatientDetailInfo;
  doctorId: UserInfo;
  serviceId: ServiceDetailInfo;
  priorityLevel: 'routine' | 'urgent' | 'emergency';
  requestedDate: string;
  requestedTime: string;
  initialNotes: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'inProgress' | 'returned' | 'completed';
  formStatus: string;
  formData: FormData;
  formTemplateId: string;
  createdType: string;
  providerFormData: any;
  providerFormCreatedAt: string | null;
  providerFormUpdatedAt: string | null;
  isReadyForDoctorReview: boolean;
  digitalSignature: DigitalSignature;
  docusignEnvelopeId: string | null;
  docusignDocumentId: string | null;
  signedPdfUrl: string | null;
  isLocked: boolean;
  signatureMetadata: SignatureMetadata;
  lastModifiedAt: string | null;
  assignedProviderId: string | null;
  returnComments: string | null;
  statusTimestamps: StatusTimestamps;
  formLock: FormLock;
  lastAdminAction: LastAdminAction;
  staleFlags: StaleFlags;
  createdBy: UserInfo;
  updatedBy: UserInfo;
  deleted: DeletedInfo;
  returnReasons: any[];
  viewedByProviders: any[];
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  size: number;
  totalPages: number;
  totalRange: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ListServiceRequestsResponse {
  status: number;
  message: string;
  data: {
    requests: ServiceRequest[];
    pagination: PaginationInfo;
  };
  timestamp: string;
}

export interface ListServiceRequestsParams {
  page?: number;
  size?: number;
}

export const serviceRequestListApi = {
  /**
   * Fetch list of service requests with pagination
   */
  listServiceRequests: async (
    params: ListServiceRequestsParams = { page: 1, size: 10 },
  ): Promise<ListServiceRequestsResponse | null> => {
    try {
      const response: any = await API.Instance.get(API_ROUTES.listServiceRequests, {
        params: {
          page: params.page || 1,
          size: params.size || 10,
        },
      });

      if (response.status) {
        return response.data as ListServiceRequestsResponse;
      } else {
        console.error('Failed to fetch service requests:', response.message);
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching service requests:', error.message);
      return null;
    }
  },
};

export default serviceRequestListApi;
