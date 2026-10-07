import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { Storage } from '../constant';
import { ROLES } from '../constant/getRole';
import store from '../redux/store';

export interface NormalizedNotificationInfo {
  type: string;
  requestId: string;
  serviceRequestId: string;
  formId: string;
  patientName: string;
  isSubmitForReview: boolean;
  metadata: any;
  title?: string;
  body?: string;
}

/**
 * Normalizes notification data from any source:
 * - Firebase remoteMessage (remoteMessage.data)
 * - Notifee notification (notification.data)
 * - Raw backend notification document
 */
export function normalizeNotificationData(raw: any): NormalizedNotificationInfo {
  if (!raw) {
    return {
      type: '',
      requestId: '',
      serviceRequestId: '',
      formId: '',
      patientName: '',
      isSubmitForReview: false,
      metadata: {},
    };
  }

  // Handle Firebase RemoteMessage wrapping
  const data = raw?.data || raw;

  let metadata: any = {};
  if (typeof data.metadata === 'string') {
    try {
      metadata = JSON.parse(data.metadata);
    } catch {
      metadata = {};
    }
  } else if (data.metadata && typeof data.metadata === 'object') {
    metadata = data.metadata;
  }

  const type = String(
    data.type ||
    data.notificationType ||
    data.notification_type ||
    metadata?.type ||
    metadata?.notificationType ||
    metadata?.notification_type ||
    '',
  ).trim();

  // Priority order for exact request ID (MongoDB _id):
  // 1. exact serviceRequestId if explicitly passed by backend
  // 2. referenceId if referenceType is serviceRequest
  // 3. metadata.requestId / metadata.serviceRequestId
  // 4. data.requestId
  // 5. fallback referenceId
  const exactRequestId =
    data.serviceRequestId ||
    (data.referenceType === 'serviceRequest' && data.referenceId
      ? data.referenceId
      : '') ||
    (metadata?.referenceType === 'serviceRequest' && metadata?.referenceId
      ? metadata?.referenceId
      : '') ||
    metadata?.serviceRequestId ||
    metadata?.requestId ||
    data.requestId ||
    data.referenceId ||
    metadata?.referenceId ||
    '';

  const formId =
    data.formId || metadata?.formId || data.form_id || metadata?.form_id || '';

  const patientName =
    data.patientName ||
    metadata?.patientName ||
    data.patient_name ||
    metadata?.patient_name ||
    data.patientFullName ||
    metadata?.patientFullName ||
    (typeof data.patient === 'object'
      ? data.patient?.fullName || data.patient?.name
      : typeof data.patient === 'string'
        ? data.patient
        : '') ||
    (typeof metadata?.patient === 'object'
      ? metadata?.patient?.fullName || metadata?.patient?.name
      : typeof metadata?.patient === 'string'
        ? metadata?.patient
        : '') ||
    '';

  const isSubmitForReview =
    data.submitForReview === true ||
    data.submitForReview === 'true' ||
    metadata?.submitForReview === true ||
    metadata?.submitForReview === 'true' ||
    data.action === 'sign' ||
    metadata?.action === 'sign' ||
    data.status === 'awaitingSignature' ||
    metadata?.status === 'awaitingSignature';

  return {
    type,
    requestId: exactRequestId ? String(exactRequestId).trim() : '',
    serviceRequestId: exactRequestId ? String(exactRequestId).trim() : '',
    formId: formId ? String(formId).trim() : '',
    patientName: patientName ? String(patientName).trim() : '',
    isSubmitForReview,
    metadata,
    title: raw?.notification?.title || data.title,
    body: raw?.notification?.body || data.message || data.body,
  };
}

let pendingNotificationPayload: any = null;

export function setPendingNotification(raw: any) {
  if (!raw) return;
  pendingNotificationPayload = raw;
}

export function getPendingNotification(): any {
  return pendingNotificationPayload;
}

export function hasPendingNotification(): boolean {
  return pendingNotificationPayload !== null;
}

export function consumePendingNotification(): any {
  const payload = pendingNotificationPayload;
  pendingNotificationPayload = null;
  return payload;
}

/**
 * Smart notification router:
 * Analyzes notification data + user role to determine the exact screen to navigate to.
 * Informative notifications seamlessly redirect to DoctorNotification or ProviderNotification.
 */
export async function navigateFromNotification(raw: any): Promise<boolean> {
  if (!raw) return false;

  try {
    const token = await Storage.get(Storage.USER_TOKEN);
    const storedRole = await Storage.get(Storage.USER_ROLE);

    const state = store.getState();
    const userRole =
      state.profile?.profileData?.roles?.[0] ||
      state.login?.userData?.roles?.[0] ||
      storedRole ||
      '';

    if (!token) {
      NavigationService.reset(SCREENS.WELCOME);
      return false;
    }

    const info = normalizeNotificationData(raw);
    const typeLower = info.type.toLowerCase();

    console.log(
      'NotificationRouter: Routing notification for role:',
      userRole,
      'Type:',
      info.type,
      'RequestId:',
      info.requestId,
    );

    // ==========================================
    // PROVIDER ROLE NAVIGATION
    // ==========================================
    if (userRole === ROLES.PROVIDER || userRole === 'serviceProvider') {
      // 1. Pre-Request Available / Assigned / Submission
      if (
        info.type === 'preRequestSubmission' ||
        info.type === 'preRequestAssignment' ||
        typeLower.includes('prerequestsub') ||
        typeLower.includes('prerequestassign')
      ) {
        if (info.requestId) {
          NavigationService.resetTo([
            { name: SCREENS.PROVIDER_BOTTOM_TABS },
            {
              name: SCREENS.PROVIDER_PRE_REQUEST_DETAIL,
              params: {
                request: { id: info.requestId },
                requestId: info.requestId,
                action: 'accept',
              },
            },
          ]);
          return true;
        }
      }

      // 2. Form Delegated to Provider
      if (info.type === 'formDelegated' || typeLower.includes('formdel')) {
        if (info.requestId) {
          NavigationService.resetTo([
            { name: SCREENS.PROVIDER_BOTTOM_TABS },
            {
              name: SCREENS.PROVIDER_PRE_REQUEST_DETAIL,
              params: {
                request: { id: info.requestId },
                requestId: info.requestId,
                action: 'view',
              },
            },
          ]);
          return true;
        }
      }

      // 3. Form Signed / Request Reset / Details Updated / Provider Assignment
      if (
        info.type === 'formSigned' ||
        info.type === 'preRequestDetailsUpdated' ||
        info.type === 'requestReset' ||
        info.type === 'serviceProviderAssignment' ||
        info.type === 'requestClaimed' ||
        info.type === 'careStarted'
      ) {
        if (info.requestId) {
          NavigationService.resetTo([
            { name: SCREENS.PROVIDER_BOTTOM_TABS },
            {
              name: SCREENS.PROVIDER_FORMS_SCREEN,
              params: {
                request: { id: info.requestId },
                requestId: info.requestId,
                action: 'edit',
              },
            },
          ]);
          return true;
        }
      }

      // 4. Request Completed
      if (info.type === 'requestCompleted' && info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.PROVIDER_BOTTOM_TABS },
          {
            name: SCREENS.SERVICE_COMPLETED,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
            },
          },
        ]);
        return true;
      }

      // 5. Informative / General Notifications -> ProviderNotification (ALERTS tab)
      NavigationService.resetTo([
        {
          name: SCREENS.PROVIDER_BOTTOM_TABS,
          params: { screen: SCREENS.ALERTS },
        },
      ]);
      return true;
    }

    // ==========================================
    // DOCTOR ROLE NAVIGATION
    // ==========================================
    // 1. Form Review / Signing
    if (
      info.isSubmitForReview ||
      info.type === 'formSignature' ||
      info.type === 'signForm' ||
      info.type === 'awaitingSignature' ||
      typeLower.includes('formsig') ||
      typeLower.includes('signform') ||
      typeLower.includes('awaitingsign')
    ) {
      if (info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.FORM_REVIEW_SCREEN,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
              action: 'edit',
            },
          },
        ]);
        return true;
      }
    }

    // 2. Pre-Request Accepted
    if (info.type === 'preRequestAccepted' || typeLower === 'prerequestaccepted') {
      if (info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.CREATE_DISCHARGE_REQUEST,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
              isEdit: true,
              isAccepted: true,
              isRejected: false,
            },
          },
        ]);
        return true;
      }
    }

    // 3. Pre-Request Rejected
    if (info.type === 'preRequestRejected' || typeLower === 'prerequestrejected') {
      if (info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.CREATE_DISCHARGE_REQUEST,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
              isEdit: true,
              isAccepted: false,
              isRejected: true,
            },
          },
        ]);
        return true;
      }
    }

    // 4. Care Started / Request Claimed
    if (
      info.type === 'requestClaimed' ||
      info.type === 'careStarted' ||
      typeLower === 'requestclaimed' ||
      typeLower === 'carestarted'
    ) {
      if (info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.FORMS_SCREEN,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
              actionType: 'read',
            },
          },
        ]);
        return true;
      }
    }

    // 5. Form Submission / Update
    if (info.type === 'formSubmission' || info.type === 'formUpdate') {
      if (info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.FORMS_SCREEN,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
              actionType: 'edit',
            },
          },
        ]);
        return true;
      }
    }

    // 6. Request Completed
    if (info.type === 'requestCompleted' && info.requestId) {
      NavigationService.resetTo([
        { name: SCREENS.DOCTOR_BOTTOM_TABS },
        {
          name: SCREENS.SERVICE_COMPLETED,
          params: {
            request: { id: info.requestId },
            requestId: info.requestId,
          },
        },
      ]);
      return true;
    }

    // 7. Request Cancelled / Reset
    if (info.type === 'requestCancelled' || info.type === 'requestReset') {
      if (info.requestId) {
        NavigationService.resetTo([
          { name: SCREENS.DOCTOR_BOTTOM_TABS },
          {
            name: SCREENS.FORMS_SCREEN,
            params: {
              request: { id: info.requestId },
              requestId: info.requestId,
              actionType: 'view',
            },
          },
        ]);
        return true;
      }
    }

    // 8. Doctor Registration / Profile Under Review
    if (
      info.type === 'doctorRegistration' ||
      info.type === 'profileUnderReview'
    ) {
      NavigationService.resetTo([
        { name: SCREENS.DOCTOR_BOTTOM_TABS },
        { name: SCREENS.REGISTER_SUCCESS },
      ]);
      return true;
    }

    // 9. Informative / General Notifications -> DoctorNotification
    NavigationService.resetTo([
      { name: SCREENS.DOCTOR_BOTTOM_TABS },
      { name: SCREENS.DOCTOR_NOTIFICATION },
    ]);
    return true;
  } catch (error) {
    console.log('NotificationRouter: Error navigating from notification:', error);
    return false;
  }
}
