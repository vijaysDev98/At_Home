import { API } from '../api';

export type PharmacyAiTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export type PharmacyAiReply = {
  reply: string;
  inScope: boolean;
};

export const askPharmacyAi = async (
  message: string,
  history: PharmacyAiTurn[],
): Promise<PharmacyAiReply> => {
  const response: any = await API.Instance.post(API.API_ROUTES.pharmacyAiChat, {
    message,
    history,
  });

  if (!response?.status) {
    throw new Error(response?.message || 'Request failed');
  }

  const payload = response?.data?.data ?? response?.data;
  const reply = String(payload?.reply || '').trim();
  if (!reply) {
    throw new Error(response?.data?.message || 'Empty reply');
  }

  return {
    reply,
    inScope: payload?.inScope !== false,
  };
};
