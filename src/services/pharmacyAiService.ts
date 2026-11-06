import { API } from '../api';

export type PharmacyAiTurn = {
  role: 'user' | 'assistant';
  text: string;
  type?: 'drug_profile' | 'text';
  drugProfile?: DrugProfileData;
};

export type DrugProfileSections = {
  indication?: string;
  dosageForm?: string;
  preparation?: string;
  dilution?: string;
  administrationDuration?: string;
  contraindication?: string;
  availability?: string;
};

export type DrugProfileData = {
  medicineName: string;
  inn?: string;
  strength?: string;
  route?: string;
  sections: DrugProfileSections;
  sources?: string;
  lastUpdated?: string;
};

export type PharmacyAiReply = {
  reply: string;
  inScope: boolean;
  type?: 'drug_profile' | 'text';
  drugProfile?: DrugProfileData;
};

export const askPharmacyAi = async (
  message: string,
  history: PharmacyAiTurn[],
): Promise<PharmacyAiReply> => {
  const response: any = await API.Instance.post(API.API_ROUTES.pharmacyAiChat, {
    message,
    history: history.map(({ role, text }) => ({ role, text })),
  });

  if (!response?.status) {
    throw new Error(response?.message || 'Request failed');
  }

  const payload = response?.data?.data ?? response?.data;
  const reply = String(payload?.reply || '').trim();
  const type = payload?.type === 'drug_profile' ? 'drug_profile' : 'text';
  const drugProfile: DrugProfileData | undefined = payload?.drugProfile;

  if (!reply && !drugProfile) {
    throw new Error(response?.data?.message || 'Empty reply');
  }

  return {
    reply: reply || drugProfile?.medicineName || '',
    inScope: payload?.inScope !== false,
    type,
    drugProfile,
  };
};
