import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { ChatAttachmentImageView } from './ChatAttachmentImageView';
import { IMAGES } from '../../assets/images';
import {
  ChatAttachmentOpenContext,
  ChatAttachmentOpenPayload,
  getChatAttachmentAbsoluteUrl,
  getChatAttachmentDisplayName,
  isChatAttachmentImage,
} from '../../utils/chatAttachmentPreview';
import { isPdfDocument } from '../../utils/documentPickerHelper';
import { AppText } from '..';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

export type ChatPendingAttachment = {
  id: string;
  uri: string;
  name?: string | null;
  type?: string | null;
  isImage: boolean;
};

type Props = {
  items: ChatPendingAttachment[];
  onRemove: (id: string) => void;
};

export const ChatPendingAttachments: React.FC<Props> = ({ items, onRemove }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {items.map(item => (
        <View key={item.id} style={styles.chip}>
          {item.isImage ? (
            <ChatAttachmentImageView
              uri={item.uri}
              style={styles.thumb}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <View style={styles.fileThumb}>
              <Image
                source={IMAGES.ic_file}
                style={styles.fileIcon}
                resizeMode="contain"
              />
              <AppText
                size={getScaleSize(10)}
                font={FONTS.Inter.Medium}
                color={COLORS._526674}
                numberOfLines={2}
                style={styles.fileName}
              >
                {item.name || 'File'}
              </AppText>
            </View>
          )}
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onRemove(item.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Remove attachment"
          >
            <Image
              source={IMAGES.crossIcon}
              style={styles.removeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const GRID_WIDTH = getScaleSize(200);
const GRID_GAP = getScaleSize(4);
const GRID_CELL = (GRID_WIDTH - GRID_GAP) / 2;
const GRID_MAX_VISIBLE = 4;

const ChatMessageImage: React.FC<{
  uri: string;
  onPress: () => void;
  style?: object;
}> = ({ uri, onPress, style }) => {
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View
          style={[
            styles.messageImage,
            styles.messageImagePlaceholder,
            style,
          ]}
        >
          <Image
            source={IMAGES.chat_image_broken}
            style={styles.messageImagePlaceholderIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <ChatAttachmentImageView
        uri={uri}
        style={[styles.messageImage, style]}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => setLoadFailed(true)}
      />
    </TouchableOpacity>
  );
};

const ChatMessageImageGrid: React.FC<{
  images: ChatAttachmentOpenPayload[];
  onOpen: (context: ChatAttachmentOpenContext) => void;
}> = ({ images, onOpen }) => {
  const visibleCount = Math.min(GRID_MAX_VISIBLE, images.length);
  const extraCount = images.length - GRID_MAX_VISIBLE;

  const openAt = (index: number) => {
    onOpen({
      attachment: images[index],
      messageImages: images,
      imageIndex: index,
    });
  };

  return (
    <View style={styles.imageGrid}>
      {Array.from({ length: visibleCount }).map((_, slot) => {
        const payload = images[slot];
        const uri = getChatAttachmentAbsoluteUrl(payload);
        const isOverflowSlot = images.length > GRID_MAX_VISIBLE && slot === GRID_MAX_VISIBLE - 1;

        return (
          <View key={`${payload.url}-${slot}`} style={styles.imageGridCell}>
            <ChatMessageImage
              uri={uri}
              style={styles.imageGridThumb}
              onPress={() => openAt(slot)}
            />
            {isOverflowSlot ? (
              <TouchableOpacity
                style={styles.imageGridMoreOverlay}
                activeOpacity={0.9}
                onPress={() => openAt(slot)}
              >
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  +{extraCount}
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

/** Renders saved message attachments (remote URLs). */
export const ChatMessageAttachments: React.FC<{
  attachments: Array<{
    url: string;
    fileName?: string;
    mimeType?: string;
    kind?: string;
  }>;
  isMine: boolean;
  onOpen: (context: ChatAttachmentOpenContext) => void;
}> = ({ attachments, isMine, onOpen }) => {
  if (!attachments?.length) {
    return null;
  }

  const payloads: ChatAttachmentOpenPayload[] = attachments.map(file => ({
    url: file.url,
    fileName: file.fileName,
    mimeType: file.mimeType,
    kind: file.kind as 'image' | 'file' | undefined,
  }));

  const imagePayloads = payloads.filter(p => isChatAttachmentImage(p));
  const documentPayloads = payloads.filter(p => !isChatAttachmentImage(p));

  return (
    <View style={styles.messageAttachments}>
      {imagePayloads.length === 1 ? (
        <ChatMessageImage
          uri={getChatAttachmentAbsoluteUrl(imagePayloads[0])}
          onPress={() =>
            onOpen({
              attachment: imagePayloads[0],
              messageImages: imagePayloads,
              imageIndex: 0,
            })
          }
        />
      ) : imagePayloads.length > 1 ? (
        <ChatMessageImageGrid images={imagePayloads} onOpen={onOpen} />
      ) : null}

      {documentPayloads.map((payload, index) => {
        const absoluteUrl = getChatAttachmentAbsoluteUrl(payload);
        const displayName = getChatAttachmentDisplayName(payload);
        const showPdfIcon = isPdfDocument(absoluteUrl);
        const key = `${payload.url}-doc-${index}`;

        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.messageFileRow,
              isMine ? styles.messageFileRowMine : styles.messageFileRowOther,
            ]}
            onPress={() => onOpen({ attachment: payload })}
            activeOpacity={0.85}
          >
            <Image
              source={
                showPdfIcon
                  ? IMAGES.serviceAttachmentPdfIcon
                  : IMAGES.ic_file
              }
              style={styles.messageFileIcon}
              resizeMode="contain"
            />
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={isMine ? COLORS.white : COLORS._1A1D1F}
              numberOfLines={1}
              ellipsizeMode="middle"
              style={styles.messageFileLabel}
            >
              {displayName}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const THUMB = getScaleSize(72);

const styles = StyleSheet.create({
  scroll: {
    maxHeight: THUMB + getScaleSize(20),
    marginBottom: getScaleSize(8),
  },
  scrollContent: {
    gap: getScaleSize(8),
    paddingHorizontal: getScaleSize(2),
  },
  chip: {
    width: THUMB,
    height: THUMB,
    borderRadius: getScaleSize(10),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS._F9FAFB,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fileThumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: getScaleSize(6),
  },
  fileIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
    marginBottom: getScaleSize(4),
  },
  fileName: {
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: getScaleSize(4),
    right: getScaleSize(4),
    width: getScaleSize(22),
    height: getScaleSize(22),
    borderRadius: getScaleSize(11),
    backgroundColor: COLORS._1A1D1F,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: getScaleSize(10),
    height: getScaleSize(10),
    tintColor: COLORS.white,
  },
  messageAttachments: {
    gap: getScaleSize(8),
    marginBottom: getScaleSize(4),
  },
  messageImage: {
    width: GRID_WIDTH,
    height: getScaleSize(140),
    borderRadius: getScaleSize(8),
    backgroundColor: COLORS._E5E7EB,
  },
  imageGrid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  imageGridCell: {
    width: GRID_CELL,
    height: GRID_CELL,
    borderRadius: getScaleSize(8),
    overflow: 'hidden',
  },
  imageGridThumb: {
    width: '100%',
    height: '100%',
    borderRadius: getScaleSize(8),
  },
  imageGridMoreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getScaleSize(8),
  },
  messageImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageImagePlaceholderIcon: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    opacity: 0.55,
  },
  messageFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    width: getScaleSize(200),
    maxWidth: '100%',
    paddingVertical: getScaleSize(8),
    paddingHorizontal: getScaleSize(10),
    borderRadius: getScaleSize(8),
  },
  messageFileRowMine: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  messageFileRowOther: {
    backgroundColor: COLORS._F3F4F6,
  },
  messageFileIcon: {
    width: getScaleSize(28),
    height: getScaleSize(28),
    resizeMode: 'contain',
    flexShrink: 0,
  },
  messageFileLabel: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});
