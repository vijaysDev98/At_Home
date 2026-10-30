import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';

import AppText from '../AppText';
import { ChatAttachmentImageView } from './ChatAttachmentImageView';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant';
import {
  ChatMessageAttachment,
  ChatReplyPreview,
} from '../../services/chatService';
import {
  getChatAttachmentAbsoluteUrl,
  getChatAttachmentDisplayName,
  isChatAttachmentImage,
} from '../../utils/chatAttachmentPreview';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

type Props = {
  reply: ChatReplyPreview;
  /** Bubble quote on sent/received messages */
  variant?: 'bubble' | 'banner';
  isMine?: boolean;
};

const mapAttachments = (
  attachments?: ChatMessageAttachment[],
): ChatMessageAttachment[] => {
  if (!attachments?.length) {
    return [];
  }
  return attachments.map(a => ({
    url: a.url,
    fileName: a.fileName || '',
    mimeType: a.mimeType || '',
    kind: a.kind,
  }));
};

export const getReplyPreviewBodyText = (
  reply: ChatReplyPreview,
  t: (key: string) => string,
): string => {
  if (reply.isDeleted) {
    return t(STRING.chatMessageDeleted);
  }
  const trimmed = reply.body?.trim();
  if (trimmed) {
    return trimmed;
  }
  const attachments = mapAttachments(reply.attachments);
  if (attachments.length > 0) {
    const firstImage = attachments.find(a => isChatAttachmentImage(a));
    if (firstImage && !trimmed) {
      return '';
    }
    if (firstImage) {
      return trimmed;
    }
    const name = getChatAttachmentDisplayName(attachments[0]);
    return name || t(STRING.chatSharedAttachment);
  }
  if (
    reply.messageType === 'attachment' ||
    reply.messageType === 'mixed'
  ) {
    return t(STRING.chatSharedAttachment);
  }
  return '';
};

export const ChatReplyPreviewContent: React.FC<Props> = ({
  reply,
  variant = 'bubble',
  isMine = false,
}) => {
  const { t } = useTranslation();
  const attachments = useMemo(
    () => mapAttachments(reply.attachments),
    [reply.attachments],
  );

  const previewImage = useMemo(() => {
    if (reply.isDeleted || attachments.length === 0) {
      return null;
    }
    return attachments.find(a => isChatAttachmentImage(a)) || null;
  }, [attachments, reply.isDeleted]);

  const previewFile =
    !reply.isDeleted && !previewImage && attachments.length > 0
      ? attachments[0]
      : null;

  const titleColor =
    variant === 'banner'
      ? COLORS.primary
      : isMine
        ? COLORS.white
        : COLORS.primary;
  const bodyColor =
    variant === 'banner'
      ? COLORS._6F767E
      : isMine
        ? 'rgba(255,255,255,0.85)'
        : COLORS._6F767E;

  const bodyText = getReplyPreviewBodyText(reply, t);
  const showThumb = !!(previewImage || previewFile);

  return (
    <View style={styles.root}>
      <View style={styles.textCol}>
        <AppText
          size={getScaleSize(11)}
          font={FONTS.Inter.SemiBold}
          color={titleColor}
          numberOfLines={1}
        >
          {t(STRING.chatReplyingTo)}
        </AppText>
        {!!bodyText && (
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Regular}
            color={bodyColor}
            numberOfLines={showThumb ? 1 : 2}
            style={showThumb ? styles.bodyWithThumb : undefined}
          >
            {bodyText}
          </AppText>
        )}
      </View>
      {previewImage ? (
        <ChatAttachmentImageView
          uri={getChatAttachmentAbsoluteUrl(previewImage)}
          style={styles.thumb}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : previewFile ? (
        <View style={styles.fileThumb}>
          <Image
            source={IMAGES.ic_file}
            style={styles.fileIcon}
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );
};

const THUMB = getScaleSize(40);

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  bodyWithThumb: {
    marginTop: getScaleSize(2),
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: getScaleSize(6),
    backgroundColor: COLORS._E5E7EB,
  },
  fileThumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: getScaleSize(6),
    backgroundColor: COLORS._F3F4F6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS._E5E7EB,
  },
  fileIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
  },
});
