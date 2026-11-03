import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardEvent,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  AppSafeAreaView,
  AppText,
} from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING, SHOW_TOAST } from '../../../constant';
import { Storage } from '../../../constant/storage';
import NavigationService from '../../../navigation/NavigationService';
import {
  askPharmacyAi,
  PharmacyAiTurn,
} from '../../../services/pharmacyAiService';

type Message = PharmacyAiTurn & { id: string };

const computeKeyboardLift = (event: KeyboardEvent): number => {
  const { height, screenY } = event.endCoordinates;
  const windowHeight = Dimensions.get('window').height;
  const fromWindowBottom = screenY > 0 ? windowHeight - screenY : height;
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

const shouldApplyManualKeyboardLift = (): boolean => {
  if (Platform.OS === 'ios') {
    return true;
  }
  if (Platform.OS === 'android') {
    return getAndroidApiLevel() >= 35;
  }
  return false;
};

const PharmacyAiChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [thinkingDots, setThinkingDots] = useState(1);
  const [showIntro, setShowIntro] = useState(false);
  const [keyboardLift, setKeyboardLift] = useState(0);
  const stickToBottomRef = useRef(true);

  const scrollToLatest = useCallback((animated: boolean) => {
    listRef.current?.scrollToEnd({ animated });
  }, []);

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
      if (stickToBottomRef.current) {
        scrollToLatest(true);
      }
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
  }, [manualKeyboardLift, scrollToLatest]);

  useEffect(() => {
    if (!sending) {
      setThinkingDots(1);
      return;
    }
    const timer = setInterval(() => {
      setThinkingDots(count => (count % 3) + 1);
    }, 400);
    return () => clearInterval(timer);
  }, [sending]);

  useEffect(() => {
    let cancelled = false;
    Storage.get(Storage.PHARMACY_AI_INTRO_SEEN).then(seen => {
      if (!cancelled && !seen) {
        setShowIntro(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismissIntro = () => {
    setShowIntro(false);
    Storage.save(Storage.PHARMACY_AI_INTRO_SEEN, '1');
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || sending) {
      return;
    }

    stickToBottomRef.current = true;

    const history: PharmacyAiTurn[] = messages.slice(-2).map(({ role, text: turnText }) => ({
      role,
      text: turnText.slice(0, 280),
    }));
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: question,
    };

    setMessages(prev => [...prev, userMessage]);
    setDraft('');
    setSending(true);

    try {
      const result = await askPharmacyAi(question, history);
      setMessages(prev => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: result.reply,
        },
      ]);
    } catch (error: any) {
      SHOW_TOAST(
        error?.message || t(STRING.somethingWentWrong),
        'error',
      );
    } finally {
      setSending(false);
    }
  };

  const composerPaddingBottom =
    keyboardLift > 0
      ? getScaleSize(8)
      : Math.max(insets.bottom, getScaleSize(12));

  return (
    <AppSafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View
        style={[
          styles.flex,
          manualKeyboardLift ? { paddingBottom: keyboardLift } : null,
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => NavigationService.goBack()}
            accessibilityRole="button"
          >
            <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
          </TouchableOpacity>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={styles.headerTitle}
            numberOfLines={1}
          >
            {t(STRING.pharmacyAiTitle)}
          </AppText>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.8}
            onPress={() => setShowIntro(true)}
            accessibilityRole="button"
            accessibilityLabel={t(STRING.pharmacyAiShowTips)}
          >
            <Image source={IMAGES.info} style={styles.infoIcon} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          style={styles.list}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          nestedScrollEnabled
          onScrollBeginDrag={() => {
            stickToBottomRef.current = false;
          }}
          onContentSizeChange={() => {
            if (stickToBottomRef.current) {
              scrollToLatest(true);
            }
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                {t(STRING.pharmacyAiEmpty)}
              </AppText>
            </View>
          }
          ListFooterComponent={
            sending ? (
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._6F767E}
                  style={styles.bubbleText}
                >
                  {`${t(STRING.pharmacyAiThinking)}${'.'.repeat(thinkingDots)}`}
                </AppText>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            return (
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Regular}
                  color={isUser ? COLORS.white : COLORS._1A1D1F}
                  style={styles.bubbleText}
                >
                  {item.text}
                </AppText>
              </View>
            );
          }}
        />

        {showIntro ? (
          <View style={styles.introWrap} pointerEvents="box-none">
            <View style={styles.introCard}>
              <View style={styles.introArrow} />
              <AppText
                size={getScaleSize(17)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.pharmacyAiIntroTitle)}
              </AppText>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._1A1D1F}
                style={styles.introBody}
              >
                {t(STRING.pharmacyAiIntroBody)}
              </AppText>
              <TouchableOpacity
                style={styles.introBtn}
                activeOpacity={0.85}
                onPress={dismissIntro}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {t(STRING.pharmacyAiGotIt)}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View
          style={[styles.composer, { paddingBottom: composerPaddingBottom }]}
        >
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Regular}
            color={COLORS._6F767E}
            style={styles.disclaimer}
          >
            {t(STRING.pharmacyAiDisclaimer)}
          </AppText>
          <View style={styles.inputWrap}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t(STRING.pharmacyAiPlaceholder)}
              placeholderTextColor={COLORS._6F767E}
              style={styles.input}
              multiline
              textAlignVertical="center"
              maxLength={600}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!draft.trim() || sending) && styles.sendBtnDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!draft.trim() || sending}
              onPress={() => send(draft)}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.pharmacyAiSend)}
            >
              <Image source={IMAGES.chat_send} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
    position: 'relative',
  },
  list: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    gap: getScaleSize(10),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  backIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
  infoIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS._526674,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(16),
    gap: getScaleSize(10),
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: getScaleSize(24),
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: getScaleSize(14),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS._F3F4F6,
  },
  bubbleText: {
    lineHeight: getScaleSize(20),
  },
  introWrap: {
    position: 'absolute',
    left: getScaleSize(16),
    right: getScaleSize(16),
    top: getScaleSize(64),
  },
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  introArrow: {
    position: 'absolute',
    top: getScaleSize(-7),
    right: getScaleSize(18),
    width: getScaleSize(14),
    height: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: COLORS._E5E7EB,
    transform: [{ rotate: '45deg' }],
  },
  introBody: {
    marginTop: getScaleSize(10),
    lineHeight: getScaleSize(21),
  },
  introBtn: {
    marginTop: getScaleSize(14),
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius: getScaleSize(10),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(8),
  },
  composer: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  disclaimer: {
    marginBottom: getScaleSize(8),
    lineHeight: getScaleSize(15),
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
    paddingLeft: getScaleSize(8),
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
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
  },
});

export default PharmacyAiChatScreen;
