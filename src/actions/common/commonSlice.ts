import { createSlice } from '@reduxjs/toolkit';

interface CommonSliceProps {
  isLoading: boolean;
  docFormSubmittedModalVisible: boolean;
}

export const initialState: CommonSliceProps = {
  isLoading: false,
  docFormSubmittedModalVisible: false,
};

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setDocFormSubmittedModal: (state, { payload }) => {
      state.docFormSubmittedModalVisible = payload;
    },
    resetCommon: () => initialState,
  },
});

export const { setLoading, setDocFormSubmittedModal, resetCommon } = commonSlice.actions;

export default commonSlice.reducer;
