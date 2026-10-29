/** Context service request id for the chat thread open on ChatScreen (if any). */
let activeChatServiceRequestId: string | null = null;
/** Pair thread id — same for all requests between doctor and provider. */
let activeChatConversationId: string | null = null;

export const setActiveChatServiceRequestId = (
  serviceRequestId: string | null,
): void => {
  activeChatServiceRequestId = serviceRequestId;
};

export const getActiveChatServiceRequestId = (): string | null =>
  activeChatServiceRequestId;

export const setActiveChatConversationId = (
  conversationId: string | null,
): void => {
  activeChatConversationId = conversationId;
};

export const getActiveChatConversationId = (): string | null =>
  activeChatConversationId;
