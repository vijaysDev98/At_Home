// utils/user.ts

import { RootState } from "../redux/store";
import { STRING } from "./strings";

export const ROLES = {
    DOCTOR: 'doctor',
    PROVIDER: 'serviceProvider',
    CARE_COORDINATOR: 'careCoordinator',
};

export type ProfileLike = {
    roles?: string[];
    isCareCoordinator?: boolean;
    isMedicalResident?: boolean | string;
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

export type RoleVisualTheme = {
    roleKey: 'doctor' | 'intern' | 'careCoordinator';
    labelKey: string;
    accentColor: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    headerBg: string;
    showDrPrefix: boolean;
};

/** Visual tag + subtle accent theme to differentiate Doctor, Intern, and Care Coordinator. */
export const getRoleVisualTheme = (profile: ProfileLike): RoleVisualTheme => {
    if (isCareCoordinatorProfile(profile)) {
        return {
            roleKey: 'careCoordinator',
            labelKey: STRING.careCoordinator,
            accentColor: '#0D9488',
            badgeBg: '#ECFDF5',
            badgeBorder: '#A7F3D0',
            badgeText: '#047857',
            headerBg: '#F4FBF9',
            showDrPrefix: false,
        };
    }
    const isResident =
        profile?.isMedicalResident === true ||
        profile?.isMedicalResident === 'true';
    if (isResident) {
        return {
            roleKey: 'intern',
            labelKey: STRING.medicalResidentIntern,
            accentColor: '#5B4FE9',
            badgeBg: '#EEF2FF',
            badgeBorder: '#C7D2FE',
            badgeText: '#4338CA',
            headerBg: '#F6F7FF',
            showDrPrefix: false,
        };
    }
    return {
        roleKey: 'doctor',
        labelKey: STRING.doctor,
        accentColor: '#0072CE',
        badgeBg: '#EFF6FF',
        badgeBorder: '#BFDBFE',
        badgeText: '#1D4ED8',
        headerBg: '#FFFFFF',
        showDrPrefix: true,
    };
};

// hooks/useUserRole.ts

import { useSelector } from 'react-redux';

export const useUserRole = () => {
    return useSelector(
        (state: RootState) => state.profile.profileData?.roles?.[0] || '',
    );
};