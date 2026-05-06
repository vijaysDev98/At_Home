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
  },
});

export const { setLoading } = commonSlice.actions;

export default commonSlice.reducer;
