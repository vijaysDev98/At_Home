import { COLORS } from '../utils';
import { ROLES } from './getRole';
import { STRING } from './strings';

export const REQUEST_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'inProgress',
  AWAITING_SIGNATURE: 'awaitingSignature',
  SIGNED: 'signed',
  RETURNED: 'returned',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const FORM_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'inProgress',
  AWAITING_SIGNATURE: 'awaitingSignature',
  SIGNED: 'signed',
  RETURNED: 'returned',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const DISPLAY_FORM_STATUS: Record<string, string> = {
  [FORM_STATUS.DRAFT]: STRING.Draft,
  [FORM_STATUS.SUBMITTED]: STRING.Submitted,
  [FORM_STATUS.APPROVED]: STRING.Approved,
  [FORM_STATUS.REJECTED]: STRING.Rejected,
  [FORM_STATUS.IN_PROGRESS]: STRING.InProgress,
  [FORM_STATUS.AWAITING_SIGNATURE]: STRING.AwaitingSignature,
  [FORM_STATUS.SIGNED]: STRING.Signed,
  [FORM_STATUS.RETURNED]: STRING.Returned,
  [FORM_STATUS.COMPLETED]: STRING.Completed,
  [FORM_STATUS.CANCELLED]: STRING.cancelled,
  pending: STRING.Submitted,
  inprogress: STRING.InProgress,
  awaitingsignature: STRING.AwaitingSignature,
};

export const getButtonConfig = (formStatus: string, status: string) => {
  switch (status) {
    case REQUEST_STATUS.DRAFT:
      return {
        show: true,
        label: STRING.continueForm,
        action: 'edit',
      };
    case REQUEST_STATUS.SUBMITTED:
      if (formStatus == FORM_STATUS.AWAITING_SIGNATURE) {
        return {
          show: true,
          label: STRING.continueSign,
          action: 'sign',
        };
      } else if (formStatus == FORM_STATUS.SIGNED) {
        return {
          show: false,
          label: null,
          action: null,
        };
      } else {
        return {
          show: true,
          label: STRING.updateAndSign,
          action: 'edit',
        };
      }
    case REQUEST_STATUS.RETURNED:
      return {
        show: true,
        label: STRING.updateAndResign,
        action: 'edit',
      };
    case FORM_STATUS.COMPLETED:
    case FORM_STATUS.CANCELLED:
      return {
        show: false,
        label: null,
        action: null,
      };
    default:
      return {
        show: false,
        label: null,
        action: null,
      };
  }
};

export const getButtonConfigProvider = (formStatus: string, status: string) => {
  switch (status) {
    case REQUEST_STATUS.SUBMITTED:
      if (formStatus === FORM_STATUS.SIGNED) {
        return {
          show: true,
          label: STRING.claimService,
          action: 'claim',
        };
      } else if (formStatus == FORM_STATUS.AWAITING_SIGNATURE) {
        return {
          show: false,
          label: null,
          action: null,
        };
      } else {
        return {
          show: true,
          label: STRING.openForm,
          action: 'edit',
        };
      }

    case REQUEST_STATUS.RETURNED:
      return {
        show: false,
        label: null,
        action: null,
      };
    case REQUEST_STATUS.IN_PROGRESS:
      return {
        show: true,
        isComplete: true,
        label: STRING.viewService,
        action: 'view',
      };
    case REQUEST_STATUS.COMPLETED:
    case REQUEST_STATUS.CANCELLED:
      return {
        show: false,
        label: null,
        action: null,
      };
    case REQUEST_STATUS.DRAFT:
      return {
        show: true,
        label: STRING.editForm,
        action: 'edit',
      };
    default:
      return {
        show: false,
        label: null,
        action: null,
      };
  }
};

// ─── FormsScreen bottom-bar button matrix ───────────────────────────────────
//
// Each entry describes up to two buttons (left = outline, right = primary).
// `fullWidth: true` on the right means no left button and right takes full row.
//
// Named actions — add a new entry here whenever a new button action is needed.
export type FormScreenHandlerKey =
  | 'updateFormData'
  | 'saveAsDraft' // Doctor/Provider: persist form without submitting
  | 'submitRequest' // Doctor: first-time submit (draft → submitted)
  | 'updateAndSign' // Doctor: update submitted form and go to review/sign
  | 'updateAndResign' // Doctor: re-edit returned form and re-sign
  | 'submitForReview' // Provider: submit pre-claim for doctor review
  | 'saveProgress' // Provider: save pre-claim without submitting
  | 'claimService'; // Provider: claim a signed service

export type FormScreenButton = {
  label: string;
  variant: 'primary' | 'outline';
  handler: FormScreenHandlerKey;
  fullWidth?: boolean;
};

export type FormScreenButtonConfig = {
  left?: FormScreenButton;
  right?: FormScreenButton;
};

export const getFormScreenButtons = (
  role: string | undefined,
  status: string | undefined,
  formStatus: string | undefined,
  action?: string,
  from?: string,
): FormScreenButtonConfig => {
  // ── Doctor flow ──────────────────────────────────────────────────────────
  if (role === ROLES.DOCTOR) {
    // View-only → no buttons
    if (action === 'view') return {};
    if (from == 'review') {
      return {
        left: {
          label: STRING.saveProgress,
          variant: 'outline',
          handler: 'updateFormData',
        },
        right: {
          label: STRING.updateAndSign,
          variant: 'primary',
          handler: 'updateAndSign',
        },
      };
    }
    // Draft request, draft form → Save Progress + Submit Request
    if (status === REQUEST_STATUS.DRAFT && formStatus === FORM_STATUS.DRAFT) {
      return {
        left: {
          label: STRING.saveProgress,
          variant: 'outline',
          handler: 'saveAsDraft',
        },
        right: {
          label: STRING.submitRequest,
          variant: 'primary',
          handler: 'submitRequest',
        },
      };
    }

    // Submitted request, submitted form → Save Progress + Update & Sign
    if (
      status === REQUEST_STATUS.SUBMITTED &&
      formStatus === FORM_STATUS.SUBMITTED
    ) {
      return {
        left: {
          label: STRING.saveProgress,
          variant: 'outline',
          handler: 'updateFormData',
        },
        right: {
          label: STRING.updateAndSign,
          variant: 'primary',
          handler: 'updateAndSign',
        },
      };
    }

    // Returned request, returned form → Save Progress + Update & Re-sign
    if (
      status === REQUEST_STATUS.RETURNED &&
      formStatus === FORM_STATUS.SIGNED
    ) {
      return {
        left: {
          label: STRING.saveProgress,
          variant: 'outline',
          handler: 'saveProgress',
        },
        right: {
          label: STRING.updateAndReSign,
          variant: 'primary',
          handler: 'updateAndResign',
        },
      };
    }

    return {};
  }

  // ── Provider flow ────────────────────────────────────────────────────────
  if (role === ROLES.PROVIDER) {
    if (action == 'view') return {};
    // Submitted request, submitted form → Submit for Review + Save Progress
    if (
      status === REQUEST_STATUS.SUBMITTED &&
      formStatus === FORM_STATUS.SUBMITTED
    ) {
      return {
        left: {
          label: STRING.submitForReview,
          variant: 'outline',
          handler: 'submitForReview',
        },
        right: {
          label: STRING.saveProgress,
          variant: 'primary',
          handler: 'saveProgress',
        },
      };
    }

    // Submitted request, signed form → Claim Service (full-width, single btn)
    if (
      status === REQUEST_STATUS.SUBMITTED &&
      formStatus === FORM_STATUS.SIGNED
    ) {
      return {
        right: {
          label: STRING.claimService,
          variant: 'primary',
          handler: 'claimService',
          fullWidth: true,
        },
      };
    }

    if (status === REQUEST_STATUS.CANCELLED) {
      return {};
    }

    return {};
  }

  return {};
};

export const getStatusBadgeColor = (status?: string | null): string => {
  if (!status) return COLORS.submitted;

  const normalized = status.toString().trim().toLowerCase().replace(/[-_\s]/g, '');

  switch (normalized) {
    case 'draft':
      return COLORS.draft; // #FFB800 (Amber)
    case 'inprogress':
      return COLORS.inProgress; // #FFB800 (Amber)
    case 'submitted':
    case 'pending':
      return COLORS.submitted; // #2563EB (Blue theme)
    case 'awaitingsignature':
      return COLORS.awaitingSignature; // #1E3A8A
    case 'signed':
      return COLORS.signed; // #629DFF
    case 'returned':
      return COLORS.returned; // #EF4444
    case 'completed':
    case 'approved':
      return COLORS.completed; // #10B981
    case 'rejected':
    case 'cancelled':
      return COLORS.cancelled; // #EF4444
    default:
      return (COLORS as any)[status] || COLORS.submitted;
  }
};

export const getStatusBadgeBgColor = (status?: string | null): string => {
  const textColor = getStatusBadgeColor(status);
  if (textColor === COLORS.submitted || textColor === '#2563EB') {
    return '#EFF6FF'; // Soft blue badge background
  }
  if (textColor === COLORS.completed || textColor === '#10B981') {
    return '#ECFDF5'; // Soft green badge background
  }
  if (textColor === COLORS.returned || textColor === COLORS.cancelled || textColor === '#ef4444' || textColor === '#EF4444') {
    return '#FEF2F2'; // Soft red badge background
  }
  if (textColor === COLORS.draft || textColor === COLORS.inProgress || textColor === '#FFB800') {
    return '#FFFBEB'; // Soft yellow badge background
  }
  return `${textColor}18`;
};

