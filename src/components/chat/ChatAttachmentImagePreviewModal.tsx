import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';

import { ChatAttachmentImageView } from './ChatAttachmentImageView';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { saveChatImageToDevice } from '../../utils/saveChatImage';
import AppText from '../AppText';

export type ChatImageGalleryState = {
  uris: string[];
  initialIndex: number;
} | null;

type Props = {
  gallery: ChatImageGalleryState;
  onClose: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ChatAttachmentImagePreviewModal: React.FC<Props> = ({
  gallery,
  onClose,
}) => {
  const { t } = useTranslation();
  const listRef = useRef<FlatList<string>>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const uris = gallery?.uris ?? [];
  const visible = uris.length > 0;

  useEffect(() => {
    if (!visible) {
      return;
    }
    const start = Math.min(
      Math.max(gallery?.initialIndex ?? 0, 0),
      uris.length - 1,
    );
    setPageIndex(start);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: start, animated: false });
    });
  }, [gallery?.initialIndex, uris, visible]);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x;
      const next = Math.round(x / SCREEN_WIDTH);
      if (next >= 0 && next < uris.length) {
        setPageIndex(next);
      }
    },
    [uris.length],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.previewModalOverlay}>
        <View style={styles.previewModalHeader}>
          <View>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.chatImagePreview)}
            </AppText>
            {uris.length > 1 && (
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Medium}
                color="rgba(255,255,255,0.75)"
                style={styles.pageIndicator}
              >
                {t(STRING.chatPreviewPage, {
                  current: pageIndex + 1,
                  total: uris.length,
                })}
              </AppText>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.previewModalActionBtn}
              onPress={() => {
                const uri = uris[pageIndex];
                if (uri) {
                  saveChatImageToDevice(uri);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.chatSaveImage)}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.white}
              >
                {t(STRING.chatSaveImage)}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.previewModalCloseBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.chatClosePreview)}
            >
              <Image
                source={IMAGES.crossIcon}
                style={styles.previewModalCloseIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={listRef}
          style={styles.previewList}
          data={uris}
          keyExtractor={(uri, index) => `${uri}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          initialScrollIndex={
            uris.length > 0
              ? Math.min(Math.max(gallery?.initialIndex ?? 0, 0), uris.length - 1)
              : 0
          }
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={info => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }, 100);
          }}
          renderItem={({ item }) => (
            <View style={styles.previewPage}>
              <ChatAttachmentImageView
                uri={item}
                style={styles.previewFullImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingTop: Platform.OS === 'ios' ? getScaleSize(50) : getScaleSize(20),
    paddingBottom: getScaleSize(12),
  },
  pageIndicator: {
    marginTop: getScaleSize(4),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  previewModalActionBtn: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(16),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  previewModalCloseBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewModalCloseIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.white,
  },
  previewList: {
    flex: 1,
  },
  previewPage: {
    width: SCREEN_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(24),
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
});
