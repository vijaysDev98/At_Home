import moment from 'moment';
import i18next from 'i18next';
import {
  ChatConversationItem,
  ChatMessage,
} from '../services/chatService';
import { STRING } from '../constant';
import { getActiveChatConversationId } from './chatActiveSession';

/** Matches backend `CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT` */
export const CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT =
  'notifications.previews.sharedAttachment';

export const formatChatLastMessagePreview = (
  preview?: string | null,
  lastMessageType?: string | null,
  lastMessageAt?: string | null,
): string => {
  if (
    lastMessageType === 'attachment' ||
    preview === CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT
  ) {
    return i18next.t(STRING.chatSharedAttachment);
  }
  const trimmed = preview?.trim() || '';
  if (!trimmed) {
    // API may leave preview empty when the latest message was deleted (no BE list fix).
    if (lastMessageAt) {
      return i18next.t(STRING.chatMessageDeleted);
    }
    return '';
  }
  return trimmed;
};

export const buildMessageListPreview = (message: ChatMessage): string => {
  if (message.isDeleted) {
    return i18next.t(STRING.chatMessageDeleted);
  }
  const body = message.body?.trim() || '';
  if (body) {
    return body.length > 120 ? `${body.slice(0, 117)}...` : body;
  }
  if (message.attachments?.length) {
    return CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT;
  }
  return '';
};

const isMessageLatestInConversation = (
  conversation: ChatConversationItem,
  message: ChatMessage,
): boolean => {
  if (!conversation.lastMessageAt) {
    return true;
  }
  return (
    new Date(message.createdAt).getTime() >=
    new Date(conversation.lastMessageAt).getTime()
  );
};

export const mergeConversationWithMessageUpdate = (
  list: ChatConversationItem[],
  message: ChatMessage,
): { list: ChatConversationItem[]; needsRefetch: boolean } => {
  const idx = list.findIndex(c => c.id === message.conversationId);
  if (idx < 0) {
    return { list, needsRefetch: true };
  }

  const existing = list[idx];
  if (!isMessageLatestInConversation(existing, message)) {
    return { list, needsRefetch: false };
  }

  if (message.isDeleted) {
    const updated: ChatConversationItem = {
      ...existing,
      lastMessagePreview: buildMessageListPreview(message),
      lastMessageType: message.messageType,
    };
    const without = list.filter((_, i) => i !== idx);
    return {
      list: sortConversationsByLatest([updated, ...without]),
      needsRefetch: false,
    };
  }

  const updated: ChatConversationItem = {
    ...existing,
    lastMessagePreview: buildMessageListPreview(message),
    lastMessageType: message.messageType,
  };

  const without = list.filter((_, i) => i !== idx);
  return {
    list: sortConversationsByLatest([updated, ...without]),
    needsRefetch: false,
  };
};

export const filterConversationsBySearch = (
  list: ChatConversationItem[],
  query: string,
): ChatConversationItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return list;
  }
  return list.filter(item => {
    const name = (item.peerName || '').trim().toLowerCase();
    return name.includes(q);
  });
};

export const sortConversationsByLatest = (
  list: ChatConversationItem[],
): ChatConversationItem[] => {
  return [...list].sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return tb - ta;
  });
};

export const formatChatListTime = (date?: string | null): string => {
  if (!date) {
    return '';
  }
  const m = moment(date);
  if (!m.isValid()) {
    return '';
  }
  const lang = i18next.language === 'fr' ? 'fr' : 'en';
  m.locale(lang);
  if (moment().diff(m, 'seconds') < 60) {
    return i18next.t(STRING.justNow);
  }
  if (m.isSame(moment(), 'day')) {
    return m.format('HH:mm');
  }
  if (m.isSame(moment().subtract(1, 'day'), 'day')) {
    return i18next.t(STRING.chatDateYesterday);
  }
  return m.format('DD MMM');
};

export const mergeConversationWithMessage = (
  list: ChatConversationItem[],
  message: ChatMessage,
  currentUserId?: string | null,
): { list: ChatConversationItem[]; needsRefetch: boolean } => {
  const idx = list.findIndex(c => c.id === message.conversationId);
  if (idx < 0) {
    return { list, needsRefetch: true };
  }

  const existing = list[idx];
  const isOwnMessage =
    !!currentUserId && message.senderId === currentUserId;
  const activeConversationId = getActiveChatConversationId();
  const isActiveThread =
    !!activeConversationId &&
    message.conversationId === activeConversationId;

  const incrementUnread =
    !isOwnMessage && !isActiveThread
      ? (existing.unreadCount ?? (existing.unread ? 1 : 0)) + 1
      : 0;

  const updated: ChatConversationItem = {
    ...existing,
    lastMessageAt: message.createdAt,
    lastMessagePreview: buildMessageListPreview(message),
    lastMessageType: message.messageType,
    unread: isOwnMessage || isActiveThread ? false : true,
    unreadCount:
      isOwnMessage || isActiveThread ? 0 : incrementUnread,
  };

  const without = list.filter((_, i) => i !== idx);
  return {
    list: sortConversationsByLatest([updated, ...without]),
    needsRefetch: false,
  };
};
