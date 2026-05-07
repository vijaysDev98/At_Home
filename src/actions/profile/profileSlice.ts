import { createSlice } from '@reduxjs/toolkit';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  username?: string;
  profileImg?: string;
  rppsNumber: string;
  finessNumber: string;
  phoneNumber: string;
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
  profileData: ProfileData | null;
}

export const initialState: ProfileSliceProps = {
  profileData: null,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileData: (state, { payload }) => {
      state.profileData = payload;
    },
    resetProfile: () => initialState,
  },
});

export const { setProfileData, resetProfile } = profileSlice.actions;

export default profileSlice.reducer;
