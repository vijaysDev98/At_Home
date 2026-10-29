import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { IMAGES } from '../../assets/images';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { getChatAccess } from '../../services/chatService';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';

type Props = {
  serviceRequestId?: string | null;
  requestIdLabel?: string;
  peerName?: string | null;
  peerProfileImg?: string | null;
};

export const HeaderChatIconButton: React.FC<Props> = ({
  serviceRequestId,
  requestIdLabel,
  peerName,
  peerProfileImg,
}) => {
  const [canChat, setCanChat] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const run = async () => {
        if (!serviceRequestId) {
          if (active) {
            setCanChat(false);
          }
          return;
        }
        const access = await getChatAccess(String(serviceRequestId));
        if (active) {
          setCanChat(!!access?.canChat);
        }
      };
      run();
      return () => {
        active = false;
      };
    }, [serviceRequestId]),
  );

  if (!serviceRequestId || !canChat) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.btn}
      onPress={() =>
        NavigationService.navigate(SCREENS.CHAT, {
          serviceRequestId: String(serviceRequestId),
          requestIdLabel,
          peerName: peerName || undefined,
          peerProfileImg: peerProfileImg || undefined,
        })
      }
      accessibilityRole="button"
      accessibilityLabel="Open chat"
      hitSlop={8}
    >
      <View style={styles.iconWrap}>
        <Image source={IMAGES.chat_conversation} style={styles.icon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    marginLeft: getScaleSize(8),
  },
  iconWrap: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
});
