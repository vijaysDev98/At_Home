// utils/user.ts

import { RootState } from "../redux/store";

export const ROLES = {
    DOCTOR: 'doctor',
    PROVIDER: 'serviceProvider',
};

// hooks/useUserRole.ts

import { useSelector } from 'react-redux';

export const useUserRole = () => {
    return useSelector(
        (state: RootState) => state.profile.profileData?.roles?.[0] || '',
    );
};