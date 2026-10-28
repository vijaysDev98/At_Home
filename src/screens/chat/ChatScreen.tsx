import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';

import { IMAGES } from '../../assets/images';
import { AppSafeAreaView, AppText } from '../../components';
import { ChatDetailHeader } from '../../components/chat/ChatDetailHeader';
import { ChatMessagesSkeleton } from '../../components/chat/ChatMessagesSkeleton';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING } from '../../constant';
import {
  ChatMessage,
  fetchChatMessages,
  fetchChatPeerMeta,
  markChatRead,
  sendChatMessage,
} from '../../services/chatService';
import {
  connectChatSocket,
  joinChatRoom,
  subscribeToChatMessages,
} from '../../services/chatSocketService';
import { RootState } from '../../redux/store';

type RouteParams = {
  serviceRequestId: string;
  requestIdLabel?: string;
  peerName?: string;
  peerProfileImg?: string | null;
};

const ChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { serviceRequestId, peerName: routePeerName, peerProfileImg: routePeerImg } =
    (route.params || {}) as RouteParams;

  const profileData = useSelector((state: RootState) => state.profile.profileData);
  const currentUserId =
    (profileData as any)?._id?.toString?.() ||
    (profileData as any)?.id?.toString?.() ||
    '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [peerName, setPeerName] = useState(routePeerName || '');
  const [peerProfileImg, setPeerProfileImg] = useState<string | null>(
    routePeerImg || null,
  );
  const listRef = useRef<FlatList>(null);

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;

    const init = async () => {
      if (!serviceRequestId) {
        setLoading(false);
        return;
      }

      const [initial, peerMeta] = await Promise.all([
        fetchChatMessages(serviceRequestId),
        fetchChatPeerMeta(serviceRequestId),
      ]);

      if (!mounted) {
        return;
      }

      setMessages(initial);
      if (peerMeta?.name) {
        setPeerName(peerMeta.name);
      }
      if (peerMeta?.profileImg) {
        setPeerProfileImg(peerMeta.profileImg);
      }
      setLoading(false);

      await markChatRead(serviceRequestId);
      await connectChatSocket();
      await joinChatRoom(serviceRequestId);
      unsubscribe = subscribeToChatMessages(incoming => {
        if (incoming.serviceRequestId === serviceRequestId) {
          appendMessage(incoming);
        }
      });
    };

    init();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [serviceRequestId, appendMessage]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !serviceRequestId || sending) {
      return;
    }
    setSending(true);
    Keyboard.dismiss();
    const sent = await sendChatMessage(serviceRequestId, text);
    if (sent) {
      appendMessage(sent);
      setDraft('');
      listRef.current?.scrollToEnd({ animated: true });
    }
    setSending(false);
  };

  const composerPaddingBottom = Math.max(insets.bottom, getScaleSize(12));

  return (
    <AppSafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardProvider>
        <ChatDetailHeader
          peerName={peerName || t(STRING.chatNow)}
          peerProfileImg={peerProfileImg}
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          automaticOffset
        >
          {loading ? (
            <ChatMessagesSkeleton />
          ) : (
            <FlatList
              ref={listRef}
              style={styles.list}
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onContentSizeChange={() =>
                listRef.current?.scrollToEnd({ animated: false })
              }
              renderItem={({ item }) => {
                const isMine = item.senderId === currentUserId;
                return (
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleOther,
                    ]}
                  >
                    <AppText
                      style={styles.messageText}
                      color={isMine ? COLORS.white : COLORS.black}
                    >
                      {item.body}
                    </AppText>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.center}>
                  <AppText style={styles.emptyText}>
                    {t(STRING.textInstructions) ||
                      'Send a message to start the conversation.'}
                  </AppText>
                </View>
              }
            />
          )}

          <View
            style={[
              styles.composerRow,
              { paddingBottom: composerPaddingBottom },
            ]}
          >
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder="Type a message"
                placeholderTextColor={COLORS._6F767E}
                multiline
                textAlignVertical="center"
              />
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!draft.trim() || sending) && styles.sendBtnDisabled,
                ]}
                onPress={handleSend}
                disabled={!draft.trim() || sending}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Image source={IMAGES.chat_send} style={styles.sendIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </KeyboardProvider>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  list: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  listContent: {
    padding: getScaleSize(16),
    flexGrow: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: getScaleSize(24),
  },
  bubble: {
    maxWidth: '82%',
    padding: getScaleSize(12),
    borderRadius: getScaleSize(12),
    marginBottom: getScaleSize(8),
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  messageText: {
    fontFamily: FONTS.Inter.Regular,
    fontSize: getScaleSize(14),
    color: COLORS.black,
    lineHeight: getScaleSize(20),
  },
  emptyText: { textAlign: 'center', color: COLORS._6F767E },
  composerRow: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: getScaleSize(44),
    maxHeight: getScaleSize(132),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: getScaleSize(8),
    backgroundColor: COLORS.white,
    paddingRight: getScaleSize(4),
  },
  input: {
    flex: 1,
    minHeight: getScaleSize(42),
    maxHeight: getScaleSize(120),
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(10),
    fontFamily: FONTS.Inter.Regular,
    fontSize: getScaleSize(14),
    color: COLORS.black,
  },
  sendBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getScaleSize(1),
  },
  sendIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default ChatScreen;
