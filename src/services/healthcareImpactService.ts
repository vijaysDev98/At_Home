import { API } from '../api';

export type HealthcareImpactEvent = {
  id: string;
  requestId: string;
  requestRef: string;
  serviceName: string;
  eligibleDays: number;
  estimatedSavingsEuro: number;
  countedAt: string;
};

export type HealthcareImpactData = {
  cumulativeSavingsEuro: number;
  cumulativeEligibleDays: number;
  eventCount: number;
  tariffs?: {
    hospitalDailyEuro: number;
    homeDailyEuro: number;
    savingsPerDayEuro: number;
    tariffVersion: string;
  };
  lastContribution?: HealthcareImpactEvent | null;
  recentEvents: HealthcareImpactEvent[];
};

const unwrap = (response: any) => response?.data?.data ?? response?.data;

export const healthcareImpactApi = {
  getDoctorHealthcareImpact: async (
    limit = 20,
  ): Promise<{ success: boolean; data?: HealthcareImpactData; message?: string }> => {
    try {
      const response: any = await API.Instance.get(
        `/doctor/healthcare-impact?limit=${limit}`,
      );
      const ok =
        response?.status === true ||
        response?.code === 200 ||
        response?.status === 200;
      if (!ok) {
        return {
          success: false,
          message: response?.message || 'Failed to load healthcare impact',
        };
      }
      return { success: true, data: unwrap(response) as HealthcareImpactData };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to load healthcare impact',
      };
    }
  },
};

export const formatEuro = (amount: number): string => {
  const value = Math.round(Number(amount) || 0);
  return `€${value.toLocaleString('fr-FR')}`;
};