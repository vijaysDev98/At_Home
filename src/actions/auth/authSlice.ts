import {createSlice} from '@reduxjs/toolkit';

interface AuthSliceProps {
  isLoading: boolean;
  userData: any |  undefined;
}

export const initialState: AuthSliceProps = {
  isLoading: false,
  userData: undefined,
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, {payload}) => {
      state.isLoading = payload;
    },
    setUserData: (state, {payload}) => {
      state.userData = payload;
    },
    resetAuth: state => {
      state = undefined;
    },
  },
});

export const {
  setLoading,
  setUserData,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
