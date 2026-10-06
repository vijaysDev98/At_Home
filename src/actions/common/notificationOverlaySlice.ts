import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationOverlayPayload {
  requestId?: string;
  formId?: string;
  patientName?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
  [key: string]: any;
}

export interface ShowOverlayPayload {
  type: string;
  title?: string;
  message?: string;
  payload?: NotificationOverlayPayload;
}

export interface NotificationOverlayState {
  visible: boolean;
  type: string | null;
  title: string | null;
  message: string | null;
  payload: NotificationOverlayPayload | null;
}

const initialState: NotificationOverlayState = {
  visible: false,
  type: null,
  title: null,
  message: null,
  payload: null,
};

export const notificationOverlaySlice = createSlice({
  name: 'notificationOverlay',
  initialState,
  reducers: {
    showNotificationOverlay: (
      state,
      action: PayloadAction<ShowOverlayPayload>,
    ) => {
      state.visible = true;
      state.type = action.payload.type;
      state.title = action.payload.title || null;
      state.message = action.payload.message || null;
      state.payload = action.payload.payload || null;
    },
    hideNotificationOverlay: state => {
      state.visible = false;
      state.type = null;
      state.title = null;
      state.message = null;
      state.payload = null;
    },
    resetNotificationOverlay: () => initialState,
  },
});

export const {
  showNotificationOverlay,
  hideNotificationOverlay,
  resetNotificationOverlay,
} = notificationOverlaySlice.actions;

export default notificationOverlaySlice.reducer;
