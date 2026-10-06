import { ImageSourcePropType } from 'react-native';
import { IMAGES } from '../assets/images';
import { SCREENS } from '../navigation/routes';
import { STRING } from './strings';
import { NotificationOverlayPayload } from '../actions/common/notificationOverlaySlice';

export interface OverlayConfigItem {
  image: ImageSourcePropType;
  imageFr?: ImageSourcePropType;
  ctaLabel: string;
  defaultTitle?: string;
  defaultMessage?: string;
  getNavigationTarget: (
    payload?: NotificationOverlayPayload | null,
    fullRequestData?: any,
  ) => Array<{ name: string; params?: object }>;
}

const formSignatureConfig: OverlayConfigItem = {
  image: IMAGES.overlay_forms_sign_en,
  imageFr: IMAGES.overlay_forms_sign_fr,
  ctaLabel: STRING.signNow,
  defaultTitle: 'Forms to Sign',
  defaultMessage:
    'You have received forms to sign according to your instructions. Please review and sign.',
  getNavigationTarget: (payload, fullRequestData) => {
    const targetRequestId =
      payload?.requestId ||
      payload?.referenceId ||
      fullRequestData?.id ||
      (fullRequestData as any)?._id;
    const requestObj =
      fullRequestData ||
      (targetRequestId ? { id: targetRequestId, ...payload } : null);
    return [
      { name: SCREENS.DOCTOR_BOTTOM_TABS },
      {
        name: SCREENS.FORM_REVIEW_SCREEN,
        params: {
          request: requestObj,
          requestId: targetRequestId,
          action: 'edit',
        },
      },
    ];
  },
};

const preRequestAcceptedConfig: OverlayConfigItem = {
  image: IMAGES.overlay_care_accepted_en,
  imageFr: IMAGES.overlay_care_accepted_fr,
  ctaLabel: STRING.continue,
  defaultTitle: 'Healthcare Provider Accepted',
  defaultMessage:
    'The healthcare provider has accepted the care of the patient',
  getNavigationTarget: (payload, fullRequestData) => {
    const targetRequestId =
      payload?.requestId ||
      payload?.referenceId ||
      fullRequestData?.id ||
      (fullRequestData as any)?._id;
    const requestObj =
      fullRequestData ||
      (targetRequestId ? { id: targetRequestId, ...payload } : null);
    return [
      { name: SCREENS.DOCTOR_BOTTOM_TABS },
      {
        name: SCREENS.CREATE_DISCHARGE_REQUEST,
        params: {
          request: requestObj,
          requestId: targetRequestId,
          isEdit: true,
          isAccepted: true,
          isRejected: false,
        },
      },
    ];
  },
};

const requestClaimedConfig: OverlayConfigItem = {
  image: IMAGES.overlay_care_started_en,
  imageFr: IMAGES.overlay_care_started_fr,
  ctaLabel: STRING.continue,
  defaultTitle: 'Care Started',
  defaultMessage:
    'Your healthcare provider has started the care for the patient.',
  getNavigationTarget: (payload, fullRequestData) => {
    const targetRequestId =
      payload?.requestId ||
      payload?.referenceId ||
      fullRequestData?.id ||
      (fullRequestData as any)?._id;
    const requestObj =
      fullRequestData ||
      (targetRequestId ? { id: targetRequestId, ...payload } : null);
    return [
      { name: SCREENS.DOCTOR_BOTTOM_TABS },
      {
        name: SCREENS.FORMS_SCREEN,
        params: {
          request: requestObj,
          actionType: 'read',
        },
      },
    ];
  },
};

const profileUnderReviewConfig: OverlayConfigItem = {
  image: IMAGES.overlay_profile_review_en,
  imageFr: IMAGES.overlay_profile_review_fr,
  ctaLabel: STRING.continue,
  defaultTitle: 'Profile Under Review',
  defaultMessage:
    'Your profile has been completed and is now under review by administrator.',
  getNavigationTarget: () => [
    { name: SCREENS.DOCTOR_BOTTOM_TABS },
    { name: SCREENS.REGISTER_SUCCESS },
  ],
};

const contactProviderConfig: OverlayConfigItem = {
  image: IMAGES.overlay_contact_provider_en,
  imageFr: IMAGES.overlay_contact_provider_fr,
  ctaLabel: STRING.callNow,
  defaultTitle: 'Contact Healthcare Provider',
  defaultMessage: 'You are about to contact a healthcare provider by phone.',
  getNavigationTarget: () => [
    { name: SCREENS.DOCTOR_BOTTOM_TABS },
    { name: SCREENS.PROVIDERS_CALL_LIST },
  ],
};

const careSecuredConfig: OverlayConfigItem = {
  image: IMAGES.overlay_care_secured_en,
  imageFr: IMAGES.overlay_care_secured_fr,
  ctaLabel: STRING.signNow,
  defaultTitle: 'Thank you Doctor',
  defaultMessage:
    'Thank you Doctor, for choosing the AT-Home application to organize home care.',
  getNavigationTarget: (payload) => [
    {
      name: SCREENS.DOCTOR_BOTTOM_TABS,
      params: { screen: SCREENS.DOCTOR_REQUEST },
    },
    {
      name: SCREENS.FORM_REVIEW_SCREEN,
      params: {
        request: payload?.request || { id: payload?.requestId },
        fromCreate: true,
      },
    },
  ],
};

export const NOTIFICATION_OVERLAY_CONFIG: Record<string, OverlayConfigItem> = {
  formSignature: formSignatureConfig,
  formUpdate: formSignatureConfig,
  formSubmission: formSignatureConfig,
  awaitingSignature: formSignatureConfig,
  signForm: formSignatureConfig,
  preRequestAccepted: preRequestAcceptedConfig,
  requestClaimed: requestClaimedConfig,
  careStarted: requestClaimedConfig,
  profileUnderReview: profileUnderReviewConfig,
  doctorRegistration: profileUnderReviewConfig,
  contactProvider: contactProviderConfig,
  careSecured: careSecuredConfig,
  docFormSubmitted: careSecuredConfig,
};

/**
 * Safely parses and normalizes data + metadata from notification payload
 */
export function extractNotificationInfo(data: any) {
  if (!data) {
    return {
      type: '',
      requestId: '',
      formId: '',
      patientName: '',
      isSubmitForReview: false,
      metadata: {} as any,
    };
  }

  let metadata: any = {};
  if (typeof data.metadata === 'string') {
    try {
      metadata = JSON.parse(data.metadata);
    } catch (e) {
      metadata = {};
    }
  } else if (data.metadata && typeof data.metadata === 'object') {
    metadata = data.metadata;
  }

  const type =
    data.type ||
    data.notificationType ||
    data.notification_type ||
    metadata?.type ||
    metadata?.notificationType ||
    metadata?.notification_type ||
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

  // Priority order matching DoctorNotification.tsx:
  // metadata.requestId -> referenceId (serviceRequest) -> data.requestId -> metadata.referenceId
  // NEVER use data.id or data._id because that is the notification document ID in FCM!
  const requestId =
    metadata?.requestId ||
    metadata?.serviceRequestId ||
    (data.referenceType === 'serviceRequest' ? data.referenceId : '') ||
    (metadata?.referenceType === 'serviceRequest'
      ? metadata?.referenceId
      : '') ||
    data.requestId ||
    data.serviceRequestId ||
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

  return {
    type: String(type).trim(),
    requestId: requestId ? String(requestId) : '',
    formId: formId ? String(formId) : '',
    patientName: patientName ? String(patientName) : '',
    isSubmitForReview,
    metadata,
  };
}

/**
 * Resolves the configuration key for an incoming notification data payload.
 * Returns null if this notification should not trigger the illustrated overlay.
 */
export function resolveOverlayKey(data: any): string | null {
  if (!data) return null;

  const info = extractNotificationInfo(data);
  const typeLower = info.type.toLowerCase();

  // Match form signature notifications:
  // e.g. 'formSignature', 'signForm', 'formUpdate', 'formSubmission', 'awaitingSignature'
  if (
    info.type === 'formSignature' ||
    typeLower.includes('formsig') ||
    typeLower.includes('signform') ||
    typeLower.includes('awaitingsign') ||
    info.type === 'formUpdate' ||
    info.type === 'formSubmission' ||
    info.isSubmitForReview
  ) {
    return 'formSignature';
  }

  // Pre-request accepted
  if (
    info.type === 'preRequestAccepted' ||
    typeLower === 'prerequestaccepted'
  ) {
    return 'preRequestAccepted';
  }

  // Care started / claimed
  if (
    info.type === 'requestClaimed' ||
    info.type === 'careStarted' ||
    typeLower === 'requestclaimed' ||
    typeLower === 'carestarted'
  ) {
    return 'requestClaimed';
  }

  return null;
}
