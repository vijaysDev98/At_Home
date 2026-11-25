// utils/user.ts

import { RootState } from "../redux/store";

export const ROLES = {
    DOCTOR: 'doctor',
    PROVIDER: 'serviceProvider',
    CARE_COORDINATOR: 'careCoordinator',
};

export type ProfileLike = {
    roles?: string[];
    isCareCoordinator?: boolean;
} | null | undefined;

/** Mirrors backend getPrimaryRole / isCareCoordinator (roles[0], not flag alone). */
export const isCareCoordinatorProfile = (profile: ProfileLike): boolean => {
    if (!profile) return false;
    const roles = profile.roles;
    const primary = Array.isArray(roles) && roles.length ? roles[0] : null;
    if (
        primary === ROLES.CARE_COORDINATOR ||
        primary === 'careCoordinator'
    ) {
        return true;
    }
    if (Array.isArray(roles)) {
        return (
            roles.includes(ROLES.CARE_COORDINATOR) ||
            roles.includes('careCoordinator')
        );
    }
    return Boolean(profile.isCareCoordinator);
};

/** Role string for form button config (doctor vs coordinator vs provider). */
export const resolveFormActorRole = (profile: ProfileLike): string => {
    const primary = profile?.roles?.[0];
    if (primary === ROLES.PROVIDER || primary === 'serviceProvider') {
        return ROLES.PROVIDER;
    }
    if (isCareCoordinatorProfile(profile)) {
        return ROLES.CARE_COORDINATOR;
    }
    return primary || ROLES.DOCTOR;
};

export const isDoctorOrCoordinatorProfile = (profile: ProfileLike): boolean => {
    if (!profile?.roles?.length) return true;
    const roles = profile.roles;
    return (
        roles.includes(ROLES.DOCTOR) ||
        roles.includes('doctor') ||
        isCareCoordinatorProfile(profile)
    );
};

// hooks/useUserRole.ts

import { useSelector } from 'react-redux';

export const useUserRole = () => {
    return useSelector(
        (state: RootState) => state.profile.profileData?.roles?.[0] || '',
    );
};