import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChatMessageDeliveryTicks } from './ChatMessageDeliveryTicks';
import { useTranslation } from 'react-i18next';

import AppText from '../AppText';
import { STRING } from '../../constant';
import { ChatMessage } from '../../services/chatService';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { formatChatMessageTime } from '../../utils/chatMessageUi';
import {
  ChatMessageAttachments,
  ChatAttachmentOpenContext,
} from './ChatPendingAttachments';
import { ChatReplyPreviewContent } from './ChatReplyPreviewContent';

type Props = {
  item: ChatMessage;
  isMine: boolean;
  highlighted?: boolean;
  onOpenAttachment: (ctx: ChatAttachmentOpenContext) => void;
  onLongPress: (item: ChatMessage) => void;
  onPressReplyTarget?: (messageId: string) => void;
};

export const ChatMessageBubble: React.FC<Props> = ({
  item,
  isMine,
  highlighted = false,
  onOpenAttachment,
  onLongPress,
  onPressReplyTarget,
}) => {
  const { t } = useTranslation();
  const isSending = isMine && item.sendStatus === 'sending';
  const attachments = item.attachments || [];
  const timeLabel = formatChatMessageTime(item.createdAt);
  const status = item.deliveryStatus;

  if (item.isDeleted) {
    return (
      <View
        style={[
          styles.messageWrap,
          isMine ? styles.messageWrapMine : styles.messageWrapOther,
        ]}
      >
        <View
          style={[
            styles.bubble,
            styles.bubbleDeleted,
            highlighted && styles.bubbleHighlighted,
          ]}
        >
          <AppText size={getScaleSize(13)} font={FONTS.Inter.Regular} color={COLORS._6F767E}>
            {t(STRING.chatMessageDeleted)}
          </AppText>
          {!!timeLabel && (
            <AppText
              size={getScaleSize(10)}
              color={COLORS._6F767E}
              style={[styles.time, styles.timeLeft]}
            >
              {timeLabel}
            </AppText>
          )}
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onLongPress={() => onLongPress(item)}
      delayLongPress={280}
      style={[
        styles.messageWrap,
        isMine ? styles.messageWrapMine : styles.messageWrapOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          highlighted && styles.bubbleHighlighted,
        ]}
      >
        {item.replyTo ? (
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={!onPressReplyTarget || !item.replyTo.id}
            onPress={() => {
              if (item.replyTo?.id) {
                onPressReplyTarget?.(item.replyTo.id);
              }
            }}
            style={[styles.replyQuote, isMine && styles.replyQuoteMine]}
            accessibilityRole="button"
            accessibilityLabel={t(STRING.chatOpenOriginalMessage)}
          >
            <ChatReplyPreviewContent
              reply={item.replyTo}
              variant="bubble"
              isMine={isMine}
            />
          </TouchableOpacity>
        ) : null}

        {attachments.length > 0 && (
          <ChatMessageAttachments
            attachments={attachments}
            isMine={isMine}
            onOpen={isSending ? () => {} : onOpenAttachment}
          />
        )}

        {!!item.body?.trim() && (
          <AppText
            style={styles.messageText}
            color={isMine ? COLORS.white : COLORS.black}
          >
            {item.body}
          </AppText>
        )}

        <View
          style={[
            styles.metaRow,
            isMine ? styles.metaRowMine : styles.metaRowOther,
          ]}
        >
          {item.editedAt ? (
            <AppText
              size={getScaleSize(10)}
              color={isMine ? 'rgba(255,255,255,0.7)' : COLORS._6F767E}
              style={styles.edited}
            >
              {t(STRING.chatEdited)}
            </AppText>
          ) : null}
          {!!timeLabel || (isMine && !isSending) ? (
            <View
              style={[
                styles.timeStatusRow,
                !isMine && styles.timeStatusRowOther,
              ]}
            >
              {!!timeLabel && (
                <AppText
                  size={getScaleSize(10)}
                  color={isMine ? 'rgba(255,255,255,0.75)' : COLORS._6F767E}
                >
                  {timeLabel}
                </AppText>
              )}
              {isMine && !isSending ? (
                <ChatMessageDeliveryTicks status={status} />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      {isSending ? (
        <View style={styles.sendingIndicatorSide}>
          <ActivityIndicator size="small" color={COLORS._6F767E} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageWrap: {
    marginBottom: getScaleSize(10),
  },
  messageWrapMine: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    gap: getScaleSize(6),
  },
  messageWrapOther: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
  },
  bubble: {
    borderRadius: getScaleSize(14),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    maxWidth: '82%',
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: getScaleSize(4),
    alignSelf: 'flex-end',
    flexShrink: 1,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: getScaleSize(4),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS._E5E7EB,
    alignSelf: 'flex-start',
    flexShrink: 1,
  },
  bubbleHighlighted: {
    borderWidth: 2,
    borderColor: COLORS._F59E0B,
  },
  bubbleDeleted: {
    backgroundColor: COLORS._F3F4F6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS._E5E7EB,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  messageText: {
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Regular,
    lineHeight: getScaleSize(21),
  },
  replyQuote: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: getScaleSize(8),
    marginBottom: getScaleSize(6),
    opacity: 0.95,
  },
  replyQuoteMine: {
    borderLeftColor: COLORS.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: getScaleSize(6),
    marginTop: getScaleSize(4),
    alignSelf: 'stretch',
  },
  metaRowMine: {
    justifyContent: 'flex-end',
  },
  metaRowOther: {
    justifyContent: 'flex-start',
  },
  timeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(2),
    flexShrink: 0,
  },
  timeStatusRowOther: {
    justifyContent: 'flex-start',
  },
  edited: {
    fontStyle: 'italic',
  },
  time: {
    marginTop: getScaleSize(4),
  },
  timeLeft: {
    alignSelf: 'flex-start',
    textAlign: 'left',
  },
  sendingIndicatorSide: {
    paddingBottom: getScaleSize(4),
  },
});
