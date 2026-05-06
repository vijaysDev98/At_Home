import {createSlice} from '@reduxjs/toolkit';

interface AuthSliceProps {
  userData: any |  undefined;
}

export const initialState: AuthSliceProps = {
  userData: undefined,
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, {payload}) => {
      state.userData = payload;
    },
    resetAuth: () => initialState,
  },
});

export const {
  setUserData,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
