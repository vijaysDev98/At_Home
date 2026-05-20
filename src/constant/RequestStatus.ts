import { COLORS } from '../utils';

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
} as const;

export const DISPLAY_FORM_STATUS = {
  [FORM_STATUS.DRAFT]: 'Draft',
  [FORM_STATUS.SUBMITTED]: 'Submitted',
  [FORM_STATUS.APPROVED]: 'Approved',
  [FORM_STATUS.REJECTED]: 'Rejected',
  [FORM_STATUS.IN_PROGRESS]: 'In Progress',
  [FORM_STATUS.AWAITING_SIGNATURE]: 'Awaiting\nSignature',
  [FORM_STATUS.SIGNED]: 'Signed',
  [FORM_STATUS.RETURNED]: 'Returned',
  [FORM_STATUS.COMPLETED]: 'Completed',
};

export const getButtonConfig = (formStatus: string, status: string) => {
  switch (status) {
    case REQUEST_STATUS.DRAFT:
      return {
        show: true,
        label: 'Continue Form',
        action: 'edit',
      };
    case REQUEST_STATUS.SUBMITTED:
      if (formStatus == FORM_STATUS.AWAITING_SIGNATURE) {
        return {
          show: true,
          label: 'Continue Sign',
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
          label: 'Update & Sign',
          action: 'edit',
        };
      }
    case REQUEST_STATUS.RETURNED:
      return {
        show: true,
        label: 'Update & Re-sign',
        action: 'edit',
      };
    case FORM_STATUS.COMPLETED:
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
      return {
        show: true,
        label: 'Open Form',
        action: 'edit',
      };
    case REQUEST_STATUS.RETURNED:
      return {
        show: false,
        label: null,
        action: null,
      };
    case REQUEST_STATUS.IN_PROGRESS:
      return {
        show: true,
        label: 'View Service',
        action: 'view',
      };
    case REQUEST_STATUS.COMPLETED:
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
): FormScreenButtonConfig => {
  // ── Doctor flow ──────────────────────────────────────────────────────────
  if (role === 'doctor') {
    // View-only → no buttons
    if (action === 'view') return {};

    // Draft request, draft form → Save Progress + Submit Request
    if (status === REQUEST_STATUS.DRAFT && formStatus === FORM_STATUS.DRAFT) {
      return {
        left: {
          label: 'Save Progress',
          variant: 'outline',
          handler: 'saveAsDraft',
        },
        right: {
          label: 'Submit Request',
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
          label: 'Save Progress',
          variant: 'outline',
          handler: 'updateFormData',
        },
        right: {
          label: 'Update & Sign',
          variant: 'primary',
          handler: 'updateAndSign',
        },
      };
    }

    // Returned request, returned form → Save Progress + Update & Re-sign
    if (
      status === REQUEST_STATUS.RETURNED &&
      formStatus === FORM_STATUS.RETURNED
    ) {
      return {
        left: {
          label: 'Save Progress',
          variant: 'outline',
          handler: 'saveProgress',
        },
        right: {
          label: 'Update & Re-sign',
          variant: 'primary',
          handler: 'updateAndResign',
        },
      };
    }

    return {};
  }

  // ── Provider flow ────────────────────────────────────────────────────────
  if (role === 'serviceProvider') {
    // Submitted request, submitted form → Submit for Review + Save Progress
    if (
      status === REQUEST_STATUS.SUBMITTED &&
      formStatus === FORM_STATUS.SUBMITTED
    ) {
      return {
        left: {
          label: 'Submit for Review',
          variant: 'outline',
          handler: 'submitForReview',
        },
        right: {
          label: 'Save Progress',
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
          label: 'Claim Service',
          variant: 'primary',
          handler: 'claimService',
          fullWidth: true,
        },
      };
    }

    return {};
  }

  return {};
};

// ─────────────────────────────────────────────────────────────────────────────

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case REQUEST_STATUS.DRAFT:
      return COLORS.draft;
    case REQUEST_STATUS.IN_PROGRESS:
      return COLORS.inProgress;
    case REQUEST_STATUS.SUBMITTED:
      return COLORS.submitted;
    case REQUEST_STATUS.AWAITING_SIGNATURE:
      return COLORS.awaitingSignature;
    case REQUEST_STATUS.SIGNED:
      return COLORS.signed; // Green
    case REQUEST_STATUS.RETURNED:
      return COLORS.returned; // Red
    case REQUEST_STATUS.COMPLETED:
      return COLORS.completed; // Green
    default:
      return COLORS.primary; // Gray
  }
};
