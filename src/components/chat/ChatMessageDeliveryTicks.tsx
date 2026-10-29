import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { IMAGES } from '../../assets/images';
import { ChatDeliveryStatus } from '../../constant/chatConstants';
import { getScaleSize } from '../../utils/scaleSize';

/** Double tick: white = not read yet; blue = read. */
export const chatDeliveryTickTint = (
  status?: ChatDeliveryStatus | null,
): string => {
  if (status === 'read') {
    return '#34B7F1';
  }
  return 'rgba(255,255,255,0.9)';
};

type Props = {
  status?: ChatDeliveryStatus | null;
};

const TICK_SLOT_HEIGHT = getScaleSize(11);

export const ChatMessageDeliveryTicks: React.FC<Props> = ({ status }) => {
  const tint = chatDeliveryTickTint(status);

  return (
    <View style={styles.slot}>
      <View style={styles.doubleClip}>
        <Image
          source={IMAGES.chat_message_ticks}
          style={styles.doubleTickImage}
          resizeMode="cover"
          tintColor={tint}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    height: TICK_SLOT_HEIGHT,
    justifyContent: 'center',
    marginLeft: getScaleSize(2),
  },
  doubleClip: {
    width: getScaleSize(13),
    height: TICK_SLOT_HEIGHT,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doubleTickImage: {
    width: getScaleSize(22),
    height: getScaleSize(22),
  },
});
