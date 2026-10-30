import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TextInput,
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
import { IMAGES } from '../../assets/images';
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
  subscribeToChatMessageUpdates,
  subscribeToChatMessages,
} from '../../services/chatSocketService';
import {
  filterConversationsBySearch,
  formatChatLastMessagePreview,
  formatChatListTime,
  mergeConversationWithMessage,
  mergeConversationWithMessageUpdate,
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
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const trimmedSearch = search.trim();
  const isSearching = trimmedSearch.length > 0;

  const filteredConversations = useMemo(
    () => filterConversationsBySearch(conversations, search),
    [conversations, search],
  );

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

  const handleMessageUpdate = useCallback(
    (message: ChatMessage) => {
      setConversations(prev => {
        const { list, needsRefetch } = mergeConversationWithMessageUpdate(
          prev,
          message,
        );
        if (needsRefetch) {
          load(true);
          return prev;
        }
        return list;
      });
    },
    [load],
  );

  useFocusEffect(
    useCallback(() => {
      load(true);
      connectChatSocket();
      const unsubscribeMessages = subscribeToChatMessages(handleIncomingMessage);
      const unsubscribeUpdates = subscribeToChatMessageUpdates(handleMessageUpdate);
      return () => {
        unsubscribeMessages();
        unsubscribeUpdates();
      };
    }, [load, handleIncomingMessage, handleMessageUpdate]),
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
      item.lastMessageAt,
    );
    const timeLabel = formatChatListTime(item.lastMessageAt);
    const unread = !!item.unread;
    const unreadCount = item.unreadCount ?? (unread ? 1 : 0);

    return (
      <TouchableOpacity
        style={[styles.card, unread && styles.cardUnread]}
        activeOpacity={0.78}
        onPress={() =>
          NavigationService.navigate(SCREENS.CHAT, {
            conversationId: item.id,
            peerName: item.peerName,
            peerProfileImg: item.peerProfileImg,
            peerPhone: item.peerPhone,
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
          {!!subtitle && (
            <AppText
              size={getScaleSize(13)}
              font={unread ? FONTS.Inter.Medium : FONTS.Inter.Regular}
              color={unread ? COLORS._1A1D1F : COLORS._6F767E}
              numberOfLines={2}
              style={styles.preview}
            >
              {subtitle}
            </AppText>
          )}
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
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <AppText
                size={getScaleSize(10)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                {unreadCount > 99
                  ? t(STRING.chatUnreadBadgeMax)
                  : String(unreadCount)}
              </AppText>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const listEmptyMessage =
    search.trim().length > 0
      ? t(STRING.chatNoSearchResults)
      : t(STRING.chatNoConversationsYet);

  const showSearchBar = conversations.length > 0;

  const searchHeader = (
    <View style={styles.searchSection}>
      <View style={styles.searchRow}>
        <Image source={IMAGES.search} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t(STRING.chatSearchConversations)}
          placeholderTextColor={COLORS._6F767E}
          style={styles.searchInput}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
        />
        {isSearching ? (
          <TouchableOpacity
            onPress={() => setSearch('')}
            hitSlop={10}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel={t(STRING.chatClearSearch)}
          >
            <Image source={IMAGES.crossIcon} style={styles.clearIcon} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={isSearching ? styles.resultsHintSlot : undefined}>
        {isSearching && filteredConversations.length > 0 ? (
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
            style={styles.resultsHint}
          >
            {filteredConversations.length}{' '}
            {filteredConversations.length === 1
              ? t(STRING.chatSearchResultOne)
              : t(STRING.chatSearchResultMany)}
          </AppText>
        ) : null}
      </View>
    </View>
  );

  return (
    <AppSafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <Header isBack title={t(STRING.chats)} style={styles.headerTitle} />
      </View>

      <View style={styles.listArea}>
        {showSearchBar ? (
          <View style={styles.searchSectionOuter}>{searchHeader}</View>
        ) : null}

        {loading && conversations.length === 0 ? (
          <ChatListSkeleton />
        ) : (
          <FlatList
            ref={listRef}
            style={styles.listScroll}
            data={filteredConversations}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              filteredConversations.length === 0 && styles.listEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
                {isSearching ? (
                  <Image source={IMAGES.search} style={styles.emptySearchIcon} />
                ) : null}
                <AppText
                  size={getScaleSize(15)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._1A1D1F}
                  align="center"
                >
                  {listEmptyMessage}
                </AppText>
                {isSearching ? (
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                    align="center"
                    style={styles.emptySubtitle}
                  >
                    {t(STRING.chatSearchTryDifferent)}
                  </AppText>
                ) : null}
              </View>
            }
          />
        )}
      </View>
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
  headerTitle: {
    paddingHorizontal: 0,
  },
  listArea: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  searchSectionOuter: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(12),
    paddingBottom: getScaleSize(12),
  },
  searchSection: {},
  listScroll: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(14),
    height: getScaleSize(46),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    gap: getScaleSize(10),
  },
  searchIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  searchInput: {
    flex: 1,
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS._1A1D1F,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: getScaleSize(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  resultsHintSlot: {
    minHeight: getScaleSize(22),
    marginTop: getScaleSize(8),
    justifyContent: 'center',
  },
  resultsHint: {
    marginLeft: getScaleSize(2),
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(32),
    flexGrow: 1,
  },
  listEmpty: {
    flexGrow: 1,
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
  unreadBadge: {
    minWidth: getScaleSize(20),
    height: getScaleSize(20),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(5),
  },
  emptyWrap: {
    paddingHorizontal: getScaleSize(32),
    paddingTop: getScaleSize(40),
    paddingBottom: getScaleSize(24),
    alignItems: 'center',
  },
  emptySearchIcon: {
    width: getScaleSize(28),
    height: getScaleSize(28),
    resizeMode: 'contain',
    tintColor: COLORS.slate400,
    marginBottom: getScaleSize(12),
  },
  emptySubtitle: {
    marginTop: getScaleSize(8),
    lineHeight: getScaleSize(20),
  },
});

export default ChatListScreen;
