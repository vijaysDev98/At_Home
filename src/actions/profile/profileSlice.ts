import { createSlice } from '@reduxjs/toolkit';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  rppsNumber: string;
  finessNumber: string;
  specialty: string;
  businessAddress: string;
  practiceType: string;
  country: string;
  assignedServices: any[];
  emailNotificationsEnabled?: boolean;
  digitalSignatureKey?: string | null;
  submittedFormCount?: number;
  roles: string[];
  status: string;
  isVerified: boolean;
  isFirstLogin: boolean;
  isBlocked: boolean;
  updatedBy?: {
    id: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileSliceProps {
  isLoading: boolean;
  profileData: ProfileData | null;
}

export const initialState: ProfileSliceProps = {
  isLoading: false,
  profileData: null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileLoading: (state, { payload }) => {
      state.isLoading = payload;
    },
    setProfileData: (state, { payload }) => {
      state.profileData = payload;
    },
    resetProfile: () => initialState,
  },
});

export const { setProfileLoading, setProfileData, resetProfile } =
  profileSlice.actions;

export default profileSlice.reducer;
