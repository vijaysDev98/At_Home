import { createSlice } from '@reduxjs/toolkit';

export interface DocFormSubmittedModalTarget {
  routes?: Array<{ name: string; params?: object }>;
}

interface CommonSliceProps {
  isLoading: boolean;
  docFormSubmittedModalVisible: boolean;
  docFormSubmittedModalTarget?: DocFormSubmittedModalTarget | null;
}

export const initialState: CommonSliceProps = {
  isLoading: false,
  docFormSubmittedModalVisible: false,
  docFormSubmittedModalTarget: null,
};

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setDocFormSubmittedModal: (state, { payload }) => {
      if (typeof payload === 'boolean') {
        state.docFormSubmittedModalVisible = payload;
        if (!payload) {
          state.docFormSubmittedModalTarget = null;
        }
      } else if (payload && typeof payload === 'object') {
        state.docFormSubmittedModalVisible = !!payload.visible;
        state.docFormSubmittedModalTarget = payload.target || null;
      }
    },
    resetCommon: () => initialState,
  },
});

export const { setLoading, setDocFormSubmittedModal, resetCommon } = commonSlice.actions;

export default commonSlice.reducer;
