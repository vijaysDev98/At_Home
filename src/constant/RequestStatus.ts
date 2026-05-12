export const REQUEST_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    AWAITING_SIGNATURE: 'awaitingSignature',
    SIGNED: 'signed',
    RETURNED: 'returned',
    COMPLETED: 'completed',
} as const;

export const FORM_STATUS = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    AWAITING_SIGNATURE: 'awaitingSignature',
    SIGNED: 'signed',
    RETURNED: 'returned',
    COMPLETED: 'completed',
} as const;

export const getButtonConfig = (formStatus: string) => {
    switch (formStatus?.toLowerCase()) {
        case FORM_STATUS.DRAFT:
            return {
                show: true,
                label: 'Continue Form',
                action: 'edit',
            };
        case FORM_STATUS.SUBMITTED:
            return {
                show: true,
                label: 'Update & Sign',
                action: 'edit',
            };
        case FORM_STATUS.SIGNED:
            return {
                show: false,
                label: null,
                action: null,
            };
        case FORM_STATUS.RETURNED:
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

export const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case REQUEST_STATUS.DRAFT:
            return '#FFA500'; // Orange
        case REQUEST_STATUS.SUBMITTED:
            return '#0066CC'; // Blue
        case REQUEST_STATUS.AWAITING_SIGNATURE:
            return '#FF9800'; // Orange
        case REQUEST_STATUS.SIGNED:
            return '#4CAF50'; // Green
        case REQUEST_STATUS.RETURNED:
            return '#F44336'; // Red
        case REQUEST_STATUS.COMPLETED:
            return '#4CAF50'; // Green
        default:
            return '#999999'; // Gray
    }
};
