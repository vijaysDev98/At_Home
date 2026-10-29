import moment from 'moment';
import i18next from 'i18next';
import {
  ChatConversationItem,
  ChatMessage,
} from '../services/chatService';
import { STRING } from '../constant';
import {
  getActiveChatConversationId,
  getActiveChatServiceRequestId,
} from './chatActiveSession';

/** Matches backend `CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT` */
export const CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT =
  'notifications.previews.sharedAttachment';

export const formatChatLastMessagePreview = (
  preview?: string | null,
  lastMessageType?: string | null,
): string => {
  if (
    lastMessageType === 'attachment' ||
    preview === CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT
  ) {
    return i18next.t(STRING.chatSharedAttachment);
  }
  if (!preview) {
    return '';
  }
  return preview;
};

const buildMessageListPreview = (message: ChatMessage): string => {
  const body = message.body?.trim() || '';
  if (body) {
    return body.length > 120 ? `${body.slice(0, 117)}...` : body;
  }
  if (message.attachments?.length) {
    return CHAT_LAST_MESSAGE_PREVIEW_SHARED_ATTACHMENT;
  }
  return '';
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
    return lang === 'fr' ? 'Hier' : 'Yesterday';
  }
  return m.format('DD MMM');
};

export const mergeConversationWithMessage = (
  list: ChatConversationItem[],
  message: ChatMessage,
  currentUserId?: string | null,
): { list: ChatConversationItem[]; needsRefetch: boolean } => {
  const idx = list.findIndex(
    c =>
      c.id === message.conversationId ||
      (!!message.serviceRequestId &&
        c.serviceRequestId === message.serviceRequestId),
  );
  if (idx < 0) {
    return { list, needsRefetch: true };
  }

  const existing = list[idx];
  const isOwnMessage =
    !!currentUserId && message.senderId === currentUserId;
  const activeConversationId = getActiveChatConversationId();
  const isActiveThread =
    (!!activeConversationId &&
      message.conversationId === activeConversationId) ||
    message.serviceRequestId === getActiveChatServiceRequestId();

  const updated: ChatConversationItem = {
    ...existing,
    lastMessageAt: message.createdAt,
    lastMessagePreview: buildMessageListPreview(message),
    lastMessageType: message.messageType,
    unread: isOwnMessage || isActiveThread ? false : true,
  };

  const without = list.filter((_, i) => i !== idx);
  return {
    list: sortConversationsByLatest([updated, ...without]),
    needsRefetch: false,
  };
};
