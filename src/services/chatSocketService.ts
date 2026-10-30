import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../api/apiRoutes';
import { Storage } from '../constant';
import { CHAT_SOCKET_EVENTS } from '../constant/chatConstants';
import type { ChatMessage } from './chatService';

let socket: Socket | null = null;

const socketBaseUrl = () => API_BASE_URL.replace(/\/$/, '');

export const connectChatSocket = async (): Promise<Socket | null> => {
  const token = await Storage.get(Storage.USER_TOKEN);
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(socketBaseUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  return socket;
};

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinChatRoom = async (
  serviceRequestId?: string | null,
  conversationId?: string | null,
): Promise<boolean> => {
  const activeSocket = await connectChatSocket();
  if (!activeSocket) {
    return false;
  }

  if (!serviceRequestId && !conversationId) {
    return false;
  }

  const payload = conversationId
    ? { conversationId }
    : serviceRequestId
      ? { serviceRequestId }
      : null;

  if (!payload) {
    return false;
  }

  return new Promise(resolve => {
    activeSocket.emit(
      CHAT_SOCKET_EVENTS.JOIN,
      payload,
      (ack: { ok?: boolean }) => {
        resolve(!!ack?.ok);
      },
    );
  });
};

export const subscribeToChatMessages = (
  handler: (message: ChatMessage) => void,
): (() => void) => {
  let activeSocket: Socket | null = null;
  let cancelled = false;

  const listener = (payload: ChatMessage) => {
    handler(payload);
  };

  connectChatSocket().then(s => {
    if (cancelled || !s) {
      return;
    }
    activeSocket = s;
    s.on(CHAT_SOCKET_EVENTS.MESSAGE, listener);
  });

  return () => {
    cancelled = true;
    activeSocket?.off(CHAT_SOCKET_EVENTS.MESSAGE, listener);
  };
};

export type ChatReadReceiptPayload = {
  conversationId: string;
  readAt: string;
  readerId: string;
};

export const subscribeToChatMessageUpdates = (
  handler: (message: ChatMessage) => void,
): (() => void) => {
  let activeSocket: Socket | null = null;
  let cancelled = false;
  const listener = (payload: ChatMessage) => handler(payload);

  connectChatSocket().then(s => {
    if (cancelled || !s) {
      return;
    }
    activeSocket = s;
    s.on(CHAT_SOCKET_EVENTS.MESSAGE_UPDATED, listener);
  });

  return () => {
    cancelled = true;
    activeSocket?.off(CHAT_SOCKET_EVENTS.MESSAGE_UPDATED, listener);
  };
};

export const subscribeToChatReadReceipts = (
  handler: (payload: ChatReadReceiptPayload) => void,
): (() => void) => {
  let activeSocket: Socket | null = null;
  let cancelled = false;
  const listener = (payload: ChatReadReceiptPayload) => handler(payload);

  connectChatSocket().then(s => {
    if (cancelled || !s) {
      return;
    }
    activeSocket = s;
    s.on(CHAT_SOCKET_EVENTS.READ_RECEIPT, listener);
  });

  return () => {
    cancelled = true;
    activeSocket?.off(CHAT_SOCKET_EVENTS.READ_RECEIPT, listener);
  };
};
