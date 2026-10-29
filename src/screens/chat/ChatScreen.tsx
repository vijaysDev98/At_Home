import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ImagePickerResponse } from 'react-native-image-picker';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IMAGES } from '../../assets/images';
import { AppSafeAreaView, AppText } from '../../components';
import { MediaFilePickerSheet } from '../../components/MediaFilePickerSheet';
import {
  ChatAttachmentImagePreviewModal,
  ChatImageGalleryState,
} from '../../components/chat/ChatAttachmentImagePreviewModal';
import { ChatDetailHeader } from '../../components/chat/ChatDetailHeader';
import { ChatMessagesSkeleton } from '../../components/chat/ChatMessagesSkeleton';
import {
  ChatMessageAttachments,
  ChatPendingAttachment,
  ChatPendingAttachments,
} from '../../components/chat/ChatPendingAttachments';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING, SHOW_TOAST } from '../../constant';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import {
  ChatAttachmentOpenContext,
  getChatAttachmentAbsoluteUrl,
  getChatAttachmentDisplayName,
  isChatAttachmentDocument,
} from '../../utils/chatAttachmentPreview';
import {
  setActiveChatConversationId,
  setActiveChatServiceRequestId,
} from '../../utils/chatActiveSession';
import { openCamera, openGallery } from '../../utils/simpleImagePicker';
import { pickPrescriptionDocuments } from '../../utils/documentPickerHelper';
import {
  handleImagePickerPermissionError,
  requestCameraPermission,
  requestGalleryPermission,
} from '../../utils/permissionHelper';
import {
  CHAT_MAX_PENDING_ATTACHMENTS,
  isChatImageAttachment,
  uploadChatAttachment,
} from '../../services/chatAttachmentUpload';
import {
  CHAT_MESSAGES_PAGE_SIZE,
  ChatMessage,
  fetchChatMessagesPage,
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
  serviceRequestId?: string;
  conversationId?: string;
  requestIdLabel?: string;
  peerName?: string;
  peerProfileImg?: string | null;
};

/** Space from bottom of window to top of keyboard (+ tiny slack, scaled). */
const computeKeyboardLift = (event: KeyboardEvent): number => {
  const { height, screenY } = event.endCoordinates;
  const windowHeight = Dimensions.get('window').height;
  const fromWindowBottom =
    screenY > 0 ? windowHeight - screenY : height;
  const base = Math.max(fromWindowBottom, height);
  return base + getScaleSize(6);
};

const getAndroidApiLevel = (): number => {
  if (Platform.OS !== 'android') {
    return 0;
  }
  return typeof Platform.Version === 'number'
    ? Platform.Version
    : parseInt(String(Platform.Version), 10);
};

/**
 * Chat uses adjustResize on Android. Manual bottom padding + resize over-shifts
 * the composer on older devices (same cutoff as ActionSheets keyboardHandler).
 */
const shouldApplyManualKeyboardLift = (): boolean => {
  if (Platform.OS === 'ios') {
    return true;
  }
  if (Platform.OS === 'android') {
    // API < 35: adjustResize + manual padding over-shifts the composer.
    // API >= 35: same cutoff as ActionSheets — keyboard inset is reliable.
    return getAndroidApiLevel() >= 35;
  }
  return false;
};

const ChatScreen: React.FC = () => {
  const route = useRoute<any>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    serviceRequestId,
    conversationId: routeConversationId,
    peerName: routePeerName,
    peerProfileImg: routePeerImg,
  } = (route.params || {}) as RouteParams;

  const conversationIdRef = useRef<string | null>(routeConversationId || null);

  const resolveConversationId = () =>
    conversationIdRef.current || routeConversationId || null;

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
  const [previewGallery, setPreviewGallery] =
    useState<ChatImageGalleryState>(null);
  const [pendingAttachments, setPendingAttachments] = useState<
    ChatPendingAttachment[]
  >([]);
  const [keyboardLift, setKeyboardLift] = useState(0);
  const listRef = useRef<FlatList>(null);
  const attachmentSheetRef = useRef<ActionSheetRef>(null);
  const skipScrollAnimationOnce = useRef(true);
  const messagesPageRef = useRef(1);
  const loadingOlderRef = useRef(false);
  const stickToBottomRef = useRef(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);

  const scrollToLatest = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(COLORS.white);
        StatusBar.setTranslucent(false);
      }
      return () => {
        setKeyboardLift(0);
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(COLORS.white);
          StatusBar.setTranslucent(false);
        }
      };
    }, []),
  );

  const manualKeyboardLift = shouldApplyManualKeyboardLift();

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: KeyboardEvent) => {
      if (manualKeyboardLift) {
        setKeyboardLift(computeKeyboardLift(event));
      }
      scrollToLatest(true);
    };
    const onHide = () => {
      if (manualKeyboardLift) {
        setKeyboardLift(0);
      }
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToLatest, manualKeyboardLift]);

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        const withoutMyPending =
          message.senderId === currentUserId
            ? prev.filter(
                m =>
                  !(
                    m.sendStatus === 'sending' &&
                    m.id.startsWith('local-')
                  ),
              )
            : prev;
        return [...withoutMyPending, message];
      });
      stickToBottomRef.current = true;
      requestAnimationFrame(() => scrollToLatest(true));
    },
    [currentUserId, scrollToLatest],
  );

  const replaceLocalMessage = useCallback(
    (localId: string, next: ChatMessage | null) => {
      setMessages(prev => {
        const rest = prev.filter(m => m.id !== localId);
        if (!next) {
          return rest;
        }
        if (rest.some(m => m.id === next.id)) {
          return rest;
        }
        return [...rest, next];
      });
    },
    [],
  );

  const loadOlderMessages = useCallback(async () => {
    const conversationId = resolveConversationId();
    if (
      (!serviceRequestId && !conversationId) ||
      loadingOlderRef.current ||
      !hasMoreOlder
    ) {
      return;
    }
    loadingOlderRef.current = true;
    setLoadingOlder(true);
    stickToBottomRef.current = false;

    const nextPage = messagesPageRef.current + 1;
    const page = await fetchChatMessagesPage(
      serviceRequestId || '',
      nextPage,
      CHAT_MESSAGES_PAGE_SIZE,
      conversationId,
    );

    setMessages(prev => {
      const seen = new Set(prev.map(m => m.id));
      const older = page.messages.filter(m => !seen.has(m.id));
      return older.length ? [...older, ...prev] : prev;
    });
    messagesPageRef.current = nextPage;
    setHasMoreOlder(!!page.pagination?.hasNextPage);
    loadingOlderRef.current = false;
    setLoadingOlder(false);
  }, [serviceRequestId, routeConversationId, hasMoreOlder]);

  const handleMessagesScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      stickToBottomRef.current = distanceFromBottom < getScaleSize(96);

      if (
        contentOffset.y <= getScaleSize(48) &&
        hasMoreOlder &&
        !loadingOlderRef.current
      ) {
        loadOlderMessages();
      }
    },
    [hasMoreOlder, loadOlderMessages],
  );

  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;

    const init = async () => {
      const conversationId = resolveConversationId();
      if (!serviceRequestId && !conversationId) {
        setLoading(false);
        return;
      }

      messagesPageRef.current = 1;
      setHasMoreOlder(false);
      stickToBottomRef.current = true;
      skipScrollAnimationOnce.current = true;

      try {
        const [initialPage, peerMeta] = await Promise.all([
          fetchChatMessagesPage(
            serviceRequestId || '',
            1,
            CHAT_MESSAGES_PAGE_SIZE,
            conversationId,
          ),
          serviceRequestId
            ? fetchChatPeerMeta(serviceRequestId)
            : Promise.resolve(null),
        ]);

        if (!mounted) {
          return;
        }

        setMessages(initialPage.messages);
        setHasMoreOlder(!!initialPage.pagination?.hasNextPage);
        messagesPageRef.current = 1;
        if (initialPage.conversationId) {
          conversationIdRef.current = initialPage.conversationId;
        } else if (initialPage.messages[0]?.conversationId) {
          conversationIdRef.current = initialPage.messages[0].conversationId;
        }
        if (conversationIdRef.current) {
          setActiveChatConversationId(conversationIdRef.current);
        }
        if (peerMeta?.name) {
          setPeerName(peerMeta.name);
        }
        if (peerMeta?.profileImg) {
          setPeerProfileImg(peerMeta.profileImg);
        }
      } catch {
        if (mounted) {
          setMessages([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }

      if (!mounted || (!serviceRequestId && !conversationId)) {
        return;
      }

      try {
        await markChatRead(serviceRequestId || '', conversationId);
        await connectChatSocket();
        await joinChatRoom(serviceRequestId, conversationId);
        unsubscribe = subscribeToChatMessages(incoming => {
          const activeConversationId = conversationIdRef.current;
          if (activeConversationId) {
            if (incoming.conversationId !== activeConversationId) {
              return;
            }
          } else if (
            serviceRequestId &&
            incoming.serviceRequestId !== serviceRequestId
          ) {
            return;
          }
          appendMessage(incoming);
          if (incoming.senderId !== currentUserId) {
            markChatRead(serviceRequestId || '', activeConversationId);
          }
        });
      } catch {
        // Realtime setup is best-effort; messages already loaded via REST.
      }
    };

    init();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [serviceRequestId, routeConversationId, appendMessage, currentUserId]);

  useFocusEffect(
    useCallback(() => {
      const conversationId = resolveConversationId();
      if (!serviceRequestId && !conversationId) {
        return undefined;
      }
      setActiveChatServiceRequestId(serviceRequestId || null);
      setActiveChatConversationId(conversationId);
      markChatRead(serviceRequestId || '', conversationId);
      return () => {
        setActiveChatServiceRequestId(null);
        setActiveChatConversationId(null);
        markChatRead(serviceRequestId || '', conversationId);
      };
    }, [serviceRequestId, routeConversationId]),
  );

  useEffect(() => {
    skipScrollAnimationOnce.current = true;
  }, [serviceRequestId]);

  useEffect(() => {
    if (loading || messages.length === 0) {
      return;
    }
    if (!skipScrollAnimationOnce.current) {
      return;
    }
    skipScrollAnimationOnce.current = false;
    scrollToLatest(false);
  }, [loading, messages.length, scrollToLatest]);

  const canSend =
    (!!draft.trim() || pendingAttachments.length > 0) && !sending;

  const addPendingFiles = useCallback(
    (
      files: Array<{
        uri: string;
        name?: string | null;
        type?: string | null;
      }>,
    ) => {
      if (!files.length) {
        return;
      }
      setPendingAttachments(prev => {
        const remaining = CHAT_MAX_PENDING_ATTACHMENTS - prev.length;
        if (remaining <= 0) {
          SHOW_TOAST(t(STRING.chatMaxAttachments), 'info');
          return prev;
        }
        const slice = files.slice(0, remaining);
        if (files.length > remaining) {
          SHOW_TOAST(t(STRING.chatMaxAttachments), 'info');
        }
        const mapped: ChatPendingAttachment[] = slice.map((file, index) => ({
          id: `${Date.now()}-${index}-${file.uri}`,
          uri: file.uri,
          name: file.name,
          type: file.type,
          isImage: isChatImageAttachment(file.type, file.name),
        }));
        return [...prev, ...mapped];
      });
    },
    [t],
  );

  const handleTakePhoto = useCallback(async () => {
    attachmentSheetRef.current?.hide();
    const limit = CHAT_MAX_PENDING_ATTACHMENTS - pendingAttachments.length;
    if (limit <= 0) {
      SHOW_TOAST(t(STRING.chatMaxAttachments), 'info');
      return;
    }
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }
    setTimeout(() => {
      openCamera(
        {
          saveToPhotos: false,
          mediaType: 'photo',
          includeBase64: false,
        },
        (res: ImagePickerResponse) => {
          if (res.didCancel) {
            return;
          }
          if (res.errorCode) {
            if (handleImagePickerPermissionError(res, 'camera')) {
              return;
            }
            SHOW_TOAST(res.errorMessage || 'Camera error', 'error');
            return;
          }
          const asset = res.assets?.[0];
          if (asset?.uri) {
            addPendingFiles([
              {
                uri: asset.uri,
                name: asset.fileName,
                type: asset.type,
              },
            ]);
          }
        },
      );
    }, 250);
  }, [addPendingFiles, pendingAttachments.length, t]);

  const handleSelectPhoto = useCallback(async () => {
    attachmentSheetRef.current?.hide();
    const limit = CHAT_MAX_PENDING_ATTACHMENTS - pendingAttachments.length;
    if (limit <= 0) {
      SHOW_TOAST(t(STRING.chatMaxAttachments), 'info');
      return;
    }
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return;
    }
    setTimeout(() => {
      openGallery(
        {
          selectionLimit: limit,
          mediaType: 'photo',
          includeBase64: false,
        },
        (res: ImagePickerResponse) => {
          if (res.didCancel || !res.assets?.length) {
            return;
          }
          if (res.errorCode) {
            if (handleImagePickerPermissionError(res, 'gallery')) {
              return;
            }
            SHOW_TOAST(res.errorMessage || 'Gallery error', 'error');
            return;
          }
          addPendingFiles(
            res.assets.map(asset => ({
              uri: asset.uri || '',
              name: asset.fileName,
              type: asset.type,
            })),
          );
        },
      );
    }, 250);
  }, [addPendingFiles, pendingAttachments.length, t]);

  const handleSelectFile = useCallback(async () => {
    Keyboard.dismiss();
    attachmentSheetRef.current?.hide();
    const limit = CHAT_MAX_PENDING_ATTACHMENTS - pendingAttachments.length;
    if (limit <= 0) {
      SHOW_TOAST(t(STRING.chatMaxAttachments), 'info');
      return;
    }
    const pickerDelay = Platform.OS === 'ios' ? 400 : 250;
    setTimeout(async () => {
      const docs = await pickPrescriptionDocuments({
        allowMultiSelection: limit > 1,
      });
      if (!docs.length) {
        return;
      }
      addPendingFiles(
        docs.slice(0, limit).map(doc => ({
          uri: doc.uri,
          name: doc.name,
          type: doc.type,
        })),
      );
    }, pickerDelay);
  }, [addPendingFiles, pendingAttachments.length, t]);

  const showAttachmentOptions = useCallback(() => {
    attachmentSheetRef.current?.show();
  }, []);

  const removePendingAttachment = useCallback((id: string) => {
    setPendingAttachments(prev => prev.filter(item => item.id !== id));
  }, []);

  const openChatAttachment = useCallback(
    (context: ChatAttachmentOpenContext) => {
      try {
        const { attachment, messageImages, imageIndex = 0 } = context;
        const absoluteUrl = getChatAttachmentAbsoluteUrl(attachment);
        if (!absoluteUrl?.trim()) {
          SHOW_TOAST('Unable to open file', 'error');
          return;
        }
        if (isChatAttachmentDocument(attachment)) {
          requestAnimationFrame(() => {
            NavigationService.navigate(SCREENS.PDF_VIEWER, {
              pdfUrl: absoluteUrl,
              title:
                getChatAttachmentDisplayName(attachment) ||
                t(STRING.chatAddAttachment) ||
                'Document',
            });
          });
          return;
        }
        const gallerySources = (messageImages?.length
          ? messageImages
          : [attachment]
        ).map(item => getChatAttachmentAbsoluteUrl(item));
        requestAnimationFrame(() => {
          setPreviewGallery({
            uris: gallerySources,
            initialIndex: Math.min(
              Math.max(imageIndex, 0),
              gallerySources.length - 1,
            ),
          });
        });
      } catch {
        SHOW_TOAST('Unable to open file', 'error');
      }
    },
    [t],
  );

  const handleSend = async () => {
    const text = draft.trim();
    const conversationId = resolveConversationId();
    if (
      (!text && pendingAttachments.length === 0) ||
      (!serviceRequestId && !conversationId) ||
      sending
    ) {
      return;
    }

    const attachmentsSnapshot = [...pendingAttachments];
    const localId = `local-${Date.now()}`;
    const optimisticAttachments = attachmentsSnapshot.map(item => ({
      url: item.uri,
      fileName: item.name || 'File',
      mimeType: item.type || undefined,
      kind: (item.isImage ? 'image' : 'file') as 'image' | 'file',
    }));

    const optimistic: ChatMessage = {
      id: localId,
      conversationId: conversationId || '',
      serviceRequestId: serviceRequestId || '',
      senderId: currentUserId,
      body: text,
      messageType:
        optimisticAttachments.length > 0
          ? text
            ? 'mixed'
            : 'attachment'
          : 'text',
      attachments: optimisticAttachments.length
        ? optimisticAttachments
        : undefined,
      createdAt: new Date().toISOString(),
      sendStatus: 'sending',
    };

    setDraft('');
    setPendingAttachments([]);
    setMessages(prev => [...prev, optimistic]);
    scrollToLatest(true);
    setSending(true);
    Keyboard.dismiss();

    try {
      const uploaded = await Promise.all(
        attachmentsSnapshot.map(item =>
          uploadChatAttachment(item.uri, item.name, item.type),
        ),
      );
      const sent = await sendChatMessage(
        serviceRequestId || '',
        {
          body: text,
          attachments: uploaded.map(file => ({
            url: file.url,
            fileName: file.fileName,
            mimeType: file.mimeType,
            kind: file.kind,
          })),
        },
        conversationId,
      );
      if (sent) {
        replaceLocalMessage(localId, sent);
      } else {
        replaceLocalMessage(localId, null);
      }
    } catch {
      replaceLocalMessage(localId, null);
    } finally {
      setSending(false);
    }
  };

  const composerPaddingBottom =
    keyboardLift > 0
      ? getScaleSize(8)
      : Math.max(insets.bottom, getScaleSize(12));

  return (
    <AppSafeAreaView edges={['top', 'left', 'right']} style={styles.safeRoot}>
      <View
        style={[
          styles.flex,
          manualKeyboardLift ? { paddingBottom: keyboardLift } : null,
        ]}
      >
        <ChatDetailHeader
          peerName={peerName || t(STRING.chatNow)}
          peerProfileImg={peerProfileImg}
        />

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
              maintainVisibleContentPosition={
                messages.length > 0
                  ? { minIndexForVisible: 1 }
                  : undefined
              }
              onScroll={handleMessagesScroll}
              scrollEventThrottle={16}
              ListHeaderComponent={
                loadingOlder ? (
                  <View style={styles.loadOlderWrap}>
                    <ActivityIndicator size="small" color={COLORS._6F767E} />
                  </View>
                ) : null
              }
              onContentSizeChange={() => {
                if (
                  stickToBottomRef.current &&
                  !loading &&
                  messages.length > 0
                ) {
                  scrollToLatest(false);
                }
              }}
              renderItem={({ item }) => {
                const isMine = item.senderId === currentUserId;
                const attachments = item.attachments || [];
                const isSending = isMine && item.sendStatus === 'sending';
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
                        isMine ? styles.bubbleMine : styles.bubbleOther,
                      ]}
                    >
                      {attachments.length > 0 && (
                        <ChatMessageAttachments
                          attachments={attachments}
                          isMine={isMine}
                          onOpen={
                            isSending ? () => {} : openChatAttachment
                          }
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
                    </View>
                    {isSending ? (
                      <View style={styles.sendingIndicatorSide}>
                        <ActivityIndicator
                          size="small"
                          color={COLORS._6F767E}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={styles.center}>
                  <AppText style={styles.emptyText}>
                    {t(STRING.chatNoMessages)}
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
            <ChatPendingAttachments
              items={pendingAttachments}
              onRemove={removePendingAttachment}
            />
            <View style={styles.inputWrap}>
              <TouchableOpacity
                style={styles.attachBtn}
                onPress={showAttachmentOptions}
                disabled={sending}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t(STRING.chatAddAttachment)}
              >
                <Image source={IMAGES.chat_attach} style={styles.attachIcon} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder={t(STRING.chatTypeMessage)}
                placeholderTextColor={COLORS._6F767E}
                multiline
                textAlignVertical="center"
              />
              <TouchableOpacity
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!canSend}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Image source={IMAGES.chat_send} style={styles.sendIcon} />
              </TouchableOpacity>
            </View>
          </View>
      </View>
        <MediaFilePickerSheet
          ref={attachmentSheetRef}
          title={t(STRING.chatAttachmentSheetTitle)}
          description={t(STRING.chatAttachmentSheetDesc)}
          onTakePhoto={handleTakePhoto}
          onSelectPhoto={handleSelectPhoto}
          onSelectFile={handleSelectFile}
        />
        <ChatAttachmentImagePreviewModal
          gallery={previewGallery}
          onClose={() => setPreviewGallery(null)}
        />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeRoot: { flex: 1, backgroundColor: COLORS.white },
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  list: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  listContent: {
    padding: getScaleSize(16),
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: getScaleSize(24),
  },
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
    padding: getScaleSize(12),
    borderRadius: getScaleSize(12),
    flexShrink: 1,
    maxWidth: '82%',
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
  },
  bubbleOther: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  sendingIndicatorSide: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    flexShrink: 0,
  },
  messageText: {
    fontFamily: FONTS.Inter.Regular,
    fontSize: getScaleSize(14),
    color: COLORS.black,
    lineHeight: getScaleSize(20),
  },
  emptyText: { textAlign: 'center', color: COLORS._6F767E },
  loadOlderWrap: {
    paddingVertical: getScaleSize(12),
    alignItems: 'center',
  },
  composerRow: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  attachBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getScaleSize(1),
  },
  attachIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
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
    paddingLeft: getScaleSize(2),
    paddingRight: getScaleSize(4),
  },
  input: {
    flex: 1,
    minHeight: getScaleSize(42),
    maxHeight: getScaleSize(120),
    paddingHorizontal: getScaleSize(8),
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
