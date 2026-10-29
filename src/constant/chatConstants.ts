export const CHAT_SOCKET_EVENTS = {
  JOIN: 'chat:join',
  JOINED: 'chat:joined',
  MESSAGE: 'chat:message',
  MESSAGE_UPDATED: 'chat:messageUpdated',
  READ_RECEIPT: 'chat:readReceipt',
  ERROR: 'chat:error',
} as const;

export type ChatDeliveryStatus = 'sent' | 'delivered' | 'read';
