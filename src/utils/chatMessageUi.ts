import moment from 'moment';
import i18next from 'i18next';
import { ChatDeliveryStatus } from '../constant/chatConstants';
import { STRING } from '../constant';
import { ChatMessage } from '../services/chatService';

export type ChatMessageSection = {
  key: string;
  title: string;
  data: ChatMessage[];
};

const chatMomentLocale = (): 'en' | 'fr' =>
  i18next.language === 'fr' ? 'fr' : 'en';

export const getChatDateDayKey = (createdAt?: string | null): string => {
  if (!createdAt) {
    return 'unknown';
  }
  const m = moment(createdAt);
  if (!m.isValid()) {
    return 'unknown';
  }
  return m.format('YYYY-MM-DD');
};

export const formatChatDateSectionLabel = (
  createdAt?: string | null,
): string => {
  if (!createdAt) {
    return '';
  }
  const m = moment(createdAt);
  if (!m.isValid()) {
    return '';
  }
  const lang = chatMomentLocale();
  m.locale(lang);
  if (m.isSame(moment(), 'day')) {
    return i18next.t(STRING.chatDateToday);
  }
  if (m.isSame(moment().subtract(1, 'day'), 'day')) {
    return i18next.t(STRING.chatDateYesterday);
  }
  if (m.isSame(moment(), 'year')) {
    return m.format(lang === 'fr' ? 'D MMMM' : 'MMMM D');
  }
  return m.format(lang === 'fr' ? 'D MMMM YYYY' : 'MMMM D, YYYY');
};

export const groupChatMessagesByDate = (
  messages: ChatMessage[],
): ChatMessageSection[] => {
  if (!messages.length) {
    return [];
  }

  const sections: ChatMessageSection[] = [];
  let currentKey = '';
  let bucket: ChatMessage[] = [];

  const flush = () => {
    if (!bucket.length) {
      return;
    }
    const anchor = bucket[0].createdAt;
    sections.push({
      key: currentKey || getChatDateDayKey(anchor),
      title: formatChatDateSectionLabel(anchor),
      data: bucket,
    });
    bucket = [];
  };

  for (const message of messages) {
    const dayKey = getChatDateDayKey(message.createdAt);
    if (dayKey !== currentKey) {
      flush();
      currentKey = dayKey;
    }
    bucket.push(message);
  }
  flush();

  return sections;
};

export const formatChatMessageTime = (createdAt?: string | null): string => {
  if (!createdAt) {
    return '';
  }
  const m = moment(createdAt);
  if (!m.isValid()) {
    return '';
  }
  const lang = i18next.language === 'fr' ? 'fr' : 'en';
  m.locale(lang);
  if (m.isSame(moment(), 'day')) {
    return m.format('HH:mm');
  }
  return m.format('DD MMM, HH:mm');
};

export const formatChatLastSeen = (lastSeenAt?: string | null): string => {
  if (!lastSeenAt) {
    return '';
  }
  const m = moment(lastSeenAt);
  if (!m.isValid()) {
    return '';
  }
  const lang = i18next.language === 'fr' ? 'fr' : 'en';
  m.locale(lang);
  if (m.isSame(moment(), 'day')) {
    return i18next.t(STRING.chatLastSeenToday, { time: m.format('HH:mm') });
  }
  if (m.isSame(moment().subtract(1, 'day'), 'day')) {
    return i18next.t(STRING.chatLastSeenYesterday, { time: m.format('HH:mm') });
  }
  return i18next.t(STRING.chatLastSeenOn, {
    date: m.format(lang === 'fr' ? 'DD MMM YYYY' : 'MMM D, YYYY'),
    time: m.format('HH:mm'),
  });
};

export const deliveryStatusShort = (status?: ChatDeliveryStatus | null): string => {
  switch (status) {
    case 'read':
      return '✓✓';
    case 'delivered':
      return '✓✓';
    case 'sent':
    default:
      return '✓';
  }
};
