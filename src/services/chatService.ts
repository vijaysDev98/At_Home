import { API } from '../api';
import { SHOW_TOAST } from '../constant';

export interface ChatAccess {
  canChat: boolean;
  serviceRequestId: string;
  requestId?: string;
  conversationId?: string | null;
}

export interface ChatConversationItem {
  id: string;
  serviceRequestId: string;
  doctorId: string;
  providerId: string;
  status: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  lastReadAt?: string | null;
  requestId?: string | null;
  peerUserId?: string | null;
  peerName?: string | null;
  peerProfileImg?: string | null;
  peerRole?: string | null;
  unread?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  serviceRequestId: string;
  senderId: string;
  body: string;
  messageType: string;
  createdAt: string;
}

export const fetchChatConversations = async (
  page = 1,
  size = 20,
): Promise<ChatConversationItem[]> => {
  try {
    const response: any = await API.Instance.get(
      API.API_ROUTES.chatConversations,
      { params: { page, size } },
    );
    if (response?.status && response?.data?.data?.conversations) {
      return response.data.data.conversations as ChatConversationItem[];
    }
    return [];
  } catch {
    return [];
  }
};

export interface ChatPeerMeta {
  id?: string | null;
  name?: string | null;
  profileImg?: string | null;
  phoneNumber?: string | null;
}

export const fetchChatPeerMeta = async (
  serviceRequestId: string,
): Promise<ChatPeerMeta | null> => {
  try {
    const response: any = await API.Instance.get(
      `${API.API_ROUTES.chatAccess}/${serviceRequestId}`,
    );
    if (response?.status && response?.data?.data?.peer) {
      return response.data.data.peer as ChatPeerMeta;
    }
    return null;
  } catch {
    return null;
  }
};

export const getChatAccess = async (
  serviceRequestId: string,
): Promise<ChatAccess | null> => {
  try {
    const response: any = await API.Instance.get(
      `${API.API_ROUTES.chatAccess}/${serviceRequestId}/access`,
    );
    if (response?.status && response?.data?.data) {
      return response.data.data as ChatAccess;
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchChatMessages = async (
  serviceRequestId: string,
  page = 1,
  size = 50,
): Promise<ChatMessage[]> => {
  try {
    const response: any = await API.Instance.get(
      `${API.API_ROUTES.chatAccess}/${serviceRequestId}/messages`,
      { params: { page, size } },
    );
    if (response?.status && response?.data?.data?.messages) {
      return response.data.data.messages as ChatMessage[];
    }
    return [];
  } catch (error: any) {
    SHOW_TOAST(error?.message || 'Failed to load messages', 'error');
    return [];
  }
};

export const sendChatMessage = async (
  serviceRequestId: string,
  body: string,
): Promise<ChatMessage | null> => {
  try {
    const response: any = await API.Instance.post(
      `${API.API_ROUTES.chatAccess}/${serviceRequestId}/messages`,
      { body },
    );
    if (response?.status && response?.data?.data) {
      return response.data.data as ChatMessage;
    }
    SHOW_TOAST(response?.message || 'Failed to send message', 'error');
    return null;
  } catch (error: any) {
    SHOW_TOAST(error?.message || 'Failed to send message', 'error');
    return null;
  }
};

export const markChatRead = async (serviceRequestId: string): Promise<void> => {
  try {
    await API.Instance.patch(
      `${API.API_ROUTES.chatAccess}/${serviceRequestId}/read`,
    );
  } catch {
    // non-blocking
  }
};
