import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import {
  AppSafeAreaView,
  AppText,
  Header,
  ProfileAvatar,
} from '../../components';
import { ChatListSkeleton } from '../../components/chat/ChatListSkeleton';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING } from '../../constant';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import {
  ChatConversationItem,
  ChatMessage,
  fetchChatConversations,
} from '../../services/chatService';
import { IMAGE_BASE_URL } from '../../api/apiRoutes';
import FastImage from 'react-native-fast-image';
import { RootState } from '../../redux/store';
import {
  connectChatSocket,
  subscribeToChatMessages,
} from '../../services/chatSocketService';
import {
  formatChatLastMessagePreview,
  formatChatListTime,
  mergeConversationWithMessage,
  sortConversationsByLatest,
} from '../../utils/chatListHelpers';

const ChatListScreen: React.FC = () => {
  const { t } = useTranslation();
  const profileData = useSelector((state: RootState) => state.profile.profileData);
  const currentUserId =
    (profileData as any)?._id?.toString?.() ||
    (profileData as any)?.id?.toString?.() ||
    null;

  const [conversations, setConversations] = useState<ChatConversationItem[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    const list = await fetchChatConversations(1, 50);
    setConversations(sortConversationsByLatest(list));
    setLoading(false);
  }, []);

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      setConversations(prev => {
        const { list, needsRefetch } = mergeConversationWithMessage(
          prev,
          message,
          currentUserId,
        );
        if (needsRefetch) {
          load(true);
          return prev;
        }
        return list;
      });
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [currentUserId, load],
  );

  useFocusEffect(
    useCallback(() => {
      load(true);
      connectChatSocket();
      const unsubscribe = subscribeToChatMessages(handleIncomingMessage);
      return () => {
        unsubscribe();
      };
    }, [load, handleIncomingMessage]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ChatConversationItem }) => {
    const subtitle = formatChatLastMessagePreview(
      item.lastMessagePreview,
      item.lastMessageType,
    );
    const timeLabel = formatChatListTime(item.lastMessageAt);
    const unread = !!item.unread;

    return (
      <TouchableOpacity
        style={[styles.card, unread && styles.cardUnread]}
        activeOpacity={0.78}
        onPress={() =>
          NavigationService.navigate(SCREENS.CHAT, {
            ...(item.serviceRequestId
              ? { serviceRequestId: item.serviceRequestId }
              : {}),
            conversationId: item.id,
            peerName: item.peerName,
            peerProfileImg: item.peerProfileImg,
          })
        }
      >
        <View style={styles.avatarWrap}>
          {item.peerProfileImg ? (
            <FastImage
              source={{ uri: IMAGE_BASE_URL + item.peerProfileImg }}
              style={styles.avatar}
            />
          ) : (
            <ProfileAvatar name={item.peerName || '?'} size="medium" />
          )}
        </View>

        <View style={styles.textBlock}>
          <AppText
            size={getScaleSize(16)}
            font={unread ? FONTS.Inter.Bold : FONTS.Inter.SemiBold}
            color={COLORS._1A1D1F}
            numberOfLines={1}
            style={styles.nameText}
          >
            {item.peerName || t(STRING.chatNow)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            font={unread ? FONTS.Inter.Medium : FONTS.Inter.Regular}
            color={unread ? COLORS._1A1D1F : COLORS._6F767E}
            numberOfLines={2}
            style={styles.preview}
          >
            {subtitle}
          </AppText>
        </View>

        <View style={styles.metaColumn}>
          {!!timeLabel && (
            <AppText
              size={getScaleSize(11)}
              font={unread ? FONTS.Inter.SemiBold : FONTS.Inter.Regular}
              color={unread ? COLORS.primary : COLORS._6F767E}
              style={styles.timeText}
            >
              {timeLabel}
            </AppText>
          )}
          {unread ? <View style={styles.unreadDot} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AppSafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <Header isBack title={t(STRING.chats) || 'Chats'} />
      </View>

      {loading && conversations.length === 0 ? (
        <ChatListSkeleton />
      ) : (
        <FlatList
          ref={listRef}
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.listEmpty,
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                {t(STRING.chatNoConversationsYet)}
              </AppText>
            </View>
          }
        />
      )}
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerWrap: {
    paddingHorizontal: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._E5E7EB,
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(32),
    backgroundColor: COLORS._F9FAFB,
    flexGrow: 1,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: getScaleSize(10),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._F3F4F6,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: getScaleSize(12),
  },
  cardUnread: {
    backgroundColor: COLORS._EFF6FF,
    borderColor: COLORS._DBEAFE,
  },
  avatarWrap: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(24),
    backgroundColor: COLORS._F3F4F6,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: getScaleSize(4),
  },
  nameText: {
    marginBottom: getScaleSize(4),
  },
  preview: {
    lineHeight: getScaleSize(18),
  },
  metaColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    alignSelf: 'stretch',
    minWidth: getScaleSize(48),
    paddingLeft: getScaleSize(8),
    gap: getScaleSize(6),
  },
  timeText: {
    textAlign: 'right',
  },
  unreadDot: {
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: COLORS.primary,
  },
  emptyWrap: {
    paddingHorizontal: getScaleSize(24),
    paddingVertical: getScaleSize(40),
  },
  emptySubtitle: {
    marginTop: getScaleSize(10),
    lineHeight: getScaleSize(20),
  },
});

export default ChatListScreen;
