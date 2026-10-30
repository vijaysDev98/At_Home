import { API } from '../api';
import { SHOW_TOAST } from '../constant';
import { ChatDeliveryStatus } from '../constant/chatConstants';

export interface ChatAccess {
  canChat: boolean;
  conversationId?: string | null;
}

export interface ChatConversationItem {
  id: string;
  serviceRequestId?: string | null;
  doctorId: string;
  providerId: string;
  status: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  lastMessageType?: string | null;
  lastReadAt?: string | null;
  requestId?: string | null;
  peerUserId?: string | null;
  peerName?: string | null;
  peerProfileImg?: string | null;
  peerRole?: string | null;
  peerPhone?: string | null;
  unread?: boolean;
  unreadCount?: number;
}

export interface ChatReplyPreview {
  id: string;
  senderId: string;
  body: string;
  messageType: string;
  isDeleted?: boolean;
  attachments?: ChatMessageAttachment[];
}

export interface ChatPeerPresence {
  peerUserId: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
  peerPhone?: string | null;
}

export interface ChatMessageAttachment {
  url: string;
  fileName?: string;
  mimeType?: string;
  kind?: 'image' | 'file';
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  serviceRequestId?: string | null;
  senderId: string;
  body: string;
  messageType: string;
  attachments?: ChatMessageAttachment[];
  createdAt: string;
  isDeleted?: boolean;
  editedAt?: string | null;
  replyTo?: ChatReplyPreview | null;
  deliveryStatus?: ChatDeliveryStatus | null;
  /** Client-only: optimistic message still uploading/sending */
  sendStatus?: 'sending' | 'failed';
}

export type SendChatMessagePayload = {
  body?: string;
  attachments?: ChatMessageAttachment[];
  replyToMessageId?: string;
};

export const fetchChatUnreadCount = async (): Promise<number> => {
  try {
    const response: any = await API.Instance.get(
      API.API_ROUTES.chatUnreadCount,
    );
    const count = response?.data?.data?.unreadCount;
    if (response?.status && typeof count === 'number') {
      return count;
    }
    return 0;
  } catch {
    return 0;
  }
};

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

export type OpenProviderChatResult = {
  conversationId: string;
  canChat?: boolean;
  peer?: ChatPeerMeta;
};

export const openProviderChat = async (
  providerId: string,
): Promise<OpenProviderChatResult | null> => {
  try {
    const response: any = await API.Instance.post(
      `${API.API_ROUTES.chatProviders}/${providerId}/conversation`,
    );
    if (response?.status && response?.data?.data?.conversationId) {
      return response.data.data as OpenProviderChatResult;
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

/** Resolve thread id when entering chat from a service request (lookup only). */
export const resolveConversationIdFromServiceRequest = async (
  serviceRequestId: string,
): Promise<string | null> => {
  const access = await getChatAccess(serviceRequestId);
  return access?.conversationId ?? null;
};

export const CHAT_MESSAGES_PAGE_SIZE = 25;

export type ChatMessagesPagination = {
  total: number;
  page: number;
  size: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ChatMessagesPageResult = {
  messages: ChatMessage[];
  pagination: ChatMessagesPagination;
  conversationId?: string | null;
};

const emptyMessagesPage = (page = 1, size = CHAT_MESSAGES_PAGE_SIZE): ChatMessagesPageResult => ({
  messages: [],
  pagination: {
    total: 0,
    page,
    size,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
});

export const fetchChatMessagesPage = async (
  conversationId: string,
  page = 1,
  size = CHAT_MESSAGES_PAGE_SIZE,
): Promise<ChatMessagesPageResult> => {
  try {
    if (!conversationId) {
      return emptyMessagesPage(page, size);
    }
    const url = `${API.API_ROUTES.chatConversations}/${conversationId}/messages`;
    const response: any = await API.Instance.get(url, { params: { page, size } });
    if (response?.status && response?.data?.data?.messages) {
      const data = response.data.data;
      return {
        messages: data.messages as ChatMessage[],
        pagination: data.pagination as ChatMessagesPagination,
        conversationId: data.conversationId ?? null,
      };
    }
    return emptyMessagesPage(page, size);
  } catch (error: any) {
    SHOW_TOAST(error?.message || 'Failed to load messages', 'error');
    return emptyMessagesPage(page, size);
  }
};

/** Latest page first (page 1 = most recent messages). */
export const fetchChatMessages = async (
  conversationId: string,
  page = 1,
  size = CHAT_MESSAGES_PAGE_SIZE,
): Promise<ChatMessage[]> => {
  const result = await fetchChatMessagesPage(conversationId, page, size);
  return result.messages;
};

export const sendChatMessage = async (
  conversationId: string,
  payload: string | SendChatMessagePayload,
): Promise<ChatMessage | null> => {
  const body =
    typeof payload === 'string'
      ? payload
      : typeof payload?.body === 'string'
        ? payload.body
        : '';
  const attachments =
    typeof payload === 'object' && payload?.attachments
      ? payload.attachments
      : undefined;

  try {
    if (!conversationId) {
      SHOW_TOAST('Failed to send message', 'error');
      return null;
    }
    const url = `${API.API_ROUTES.chatConversations}/${conversationId}/messages`;
    const replyToMessageId =
      typeof payload === 'object' ? payload?.replyToMessageId : undefined;
    const response: any = await API.Instance.post(url, {
      body,
      attachments,
      replyToMessageId,
    });
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

export const markChatRead = async (conversationId: string): Promise<void> => {
  try {
    if (!conversationId) {
      return;
    }
    const url = `${API.API_ROUTES.chatConversations}/${conversationId}/read`;
    await API.Instance.patch(url);
  } catch {
    // non-blocking
  }
};

export const fetchChatPeerPresence = async (
  conversationId: string,
): Promise<ChatPeerPresence | null> => {
  try {
    const response: any = await API.Instance.get(
      `${API.API_ROUTES.chatConversations}/${conversationId}/presence`,
    );
    if (response?.status && response?.data?.data) {
      return response.data.data as ChatPeerPresence;
    }
    return null;
  } catch {
    return null;
  }
};

export const deleteChatMessage = async (
  messageId: string,
): Promise<ChatMessage | null> => {
  try {
    const response: any = await API.Instance.delete(
      `chat/messages/${messageId}`,
    );
    if (response?.status && response?.data?.data) {
      return response.data.data as ChatMessage;
    }
    return null;
  } catch (error: any) {
    SHOW_TOAST(error?.message || 'Failed to delete message', 'error');
    return null;
  }
};

export const editChatMessage = async (
  messageId: string,
  body: string,
): Promise<ChatMessage | null> => {
  try {
    const response: any = await API.Instance.patch(`chat/messages/${messageId}`, {
      body,
    });
    if (response?.status && response?.data?.data) {
      return response.data.data as ChatMessage;
    }
    return null;
  } catch (error: any) {
    SHOW_TOAST(error?.message || 'Failed to edit message', 'error');
    return null;
  }
};
