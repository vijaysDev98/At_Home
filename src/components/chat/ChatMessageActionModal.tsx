import React, { useMemo } from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant';
import { ChatMessage } from '../../services/chatService';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import AppText from '../AppText';

const DELETE_RED = '#D32F2F';

type ActionId = 'reply' | 'edit' | 'delete';

type ActionItem = {
  id: ActionId;
  label: string;
  icon: ImageSourcePropType;
  tintColor?: string;
  labelColor: string;
  onPress: () => void;
};

type Props = {
  message: ChatMessage | null;
  currentUserId: string;
  onClose: () => void;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (message: ChatMessage) => void;
};

export const ChatMessageActionModal: React.FC<Props> = ({
  message,
  currentUserId,
  onClose,
  onReply,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const visible = message != null;

  const actions = useMemo((): ActionItem[] => {
    if (!message) {
      return [];
    }
    const isMine = message.senderId === currentUserId;
    const items: ActionItem[] = [
      {
        id: 'reply',
        label: t(STRING.chatReply),
        icon: IMAGES.chat_reply,
        tintColor: COLORS.primary,
        labelColor: COLORS._1A1D1F,
        onPress: () => onReply(message),
      },
    ];
    if (isMine && message.body?.trim()) {
      items.push({
        id: 'edit',
        label: t(STRING.chatEdit),
        icon: IMAGES.ic_edit,
        tintColor: COLORS.primary,
        labelColor: COLORS._1A1D1F,
        onPress: () => onEdit(message),
      });
    }
    if (isMine) {
      items.push({
        id: 'delete',
        label: t(STRING.chatDelete),
        icon: IMAGES.trash,
        tintColor: DELETE_RED,
        labelColor: DELETE_RED,
        onPress: () => onDelete(message),
      });
    }
    return items;
  }, [currentUserId, message, onDelete, onEdit, onReply, t]);

  const handleAction = (action: ActionItem) => {
    onClose();
    action.onPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.cardWrap}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.card}>
            <View style={styles.actionsRow}>
              {actions.map((action, index) => (
                <React.Fragment key={action.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <TouchableOpacity
                    style={styles.actionCell}
                    activeOpacity={0.75}
                    onPress={() => handleAction(action)}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                  >
                    <Image
                      source={action.icon}
                      style={styles.actionIcon}
                      resizeMode="contain"
                      tintColor={action.tintColor}
                    />
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.SemiBold}
                      color={action.labelColor}
                      align="center"
                    >
                      {action.label}
                    </AppText>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(36),
  },
  cardWrap: {
    alignSelf: 'stretch',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(12),
    paddingVertical: getScaleSize(14),
    paddingHorizontal: getScaleSize(2),
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: getScaleSize(3) },
    shadowOpacity: 0.1,
    shadowRadius: getScaleSize(8),
    elevation: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(5),
    paddingVertical: getScaleSize(6),
    minHeight: getScaleSize(56),
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: COLORS._E5E7EB,
    alignSelf: 'stretch',
  },
  actionIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
  },
});
