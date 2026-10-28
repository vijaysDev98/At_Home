import moment from 'moment';
import i18next from 'i18next';
import {
  ChatConversationItem,
  ChatMessage,
} from '../services/chatService';
import { STRING } from '../constant';

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
    c => c.serviceRequestId === message.serviceRequestId,
  );
  if (idx < 0) {
    return { list, needsRefetch: true };
  }

  const existing = list[idx];
  const isOwnMessage =
    !!currentUserId && message.senderId === currentUserId;

  const updated: ChatConversationItem = {
    ...existing,
    lastMessageAt: message.createdAt,
    lastMessagePreview: message.body,
    unread: isOwnMessage ? existing.unread : true,
  };

  const without = list.filter((_, i) => i !== idx);
  return {
    list: sortConversationsByLatest([updated, ...without]),
    needsRefetch: false,
  };
};
