import { createSlice } from '@reduxjs/toolkit';

interface CommonSliceProps {
  isLoading: boolean;
}

export const initialState: CommonSliceProps = {
  isLoading: false,
};

export const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    resetCommon: () => initialState,
  },
});

export const { setLoading, resetCommon } = commonSlice.actions;

export default commonSlice.reducer;
