import React, { useCallback, useRef } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { IMAGES } from '../../assets/images';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

type Props = {
  isMine: boolean;
  disabled?: boolean;
  onReply: () => void;
  children: React.ReactNode;
};

export const ChatMessageSwipeRow: React.FC<Props> = ({
  isMine,
  disabled,
  onReply,
  children,
}) => {
  const swipeRef = useRef<Swipeable>(null);

  const renderAction = useCallback(
    (progress: Animated.AnimatedInterpolation<number>) => {
      const scale = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.55, 1],
        extrapolate: 'clamp',
      });
      return (
        <View
          style={[
            styles.actionWrap,
            isMine ? styles.actionWrapRight : styles.actionWrapLeft,
          ]}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Image
              source={IMAGES.arrow_back}
              style={[
                styles.replyIcon,
                isMine ? styles.iconSwipeLeft : styles.iconSwipeRight,
              ]}
              resizeMode="contain"
              tintColor={COLORS.primary}
            />
          </Animated.View>
        </View>
      );
    },
    [isMine],
  );

  const handleOpen = useCallback(
    (direction: 'left' | 'right') => {
      const shouldReply =
        (!isMine && direction === 'left') || (isMine && direction === 'right');
      if (!shouldReply) {
        swipeRef.current?.close();
        return;
      }
      onReply();
      requestAnimationFrame(() => swipeRef.current?.close());
    },
    [isMine, onReply],
  );

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      overshootFriction={8}
      overshootLeft={!isMine}
      overshootRight={isMine}
      leftThreshold={getScaleSize(36)}
      rightThreshold={getScaleSize(36)}
      renderLeftActions={!isMine ? renderAction : undefined}
      renderRightActions={isMine ? renderAction : undefined}
      onSwipeableOpen={handleOpen}
      containerStyle={styles.container}
      childrenContainerStyle={styles.childContainer}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  childContainer: {
    backgroundColor: 'transparent',
    flexGrow: 0,
  },
  actionWrap: {
    justifyContent: 'center',
    width: getScaleSize(56),
  },
  actionWrapLeft: {
    alignItems: 'flex-start',
    paddingLeft: getScaleSize(8),
  },
  actionWrapRight: {
    alignItems: 'flex-end',
    paddingRight: getScaleSize(8),
  },
  replyIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
  },
  /** Incoming: swipe right → arrow points right */
  iconSwipeRight: {
    transform: [{ scaleX: -1 }],
  },
  /** Outgoing: swipe left → arrow points left */
  iconSwipeLeft: {},
});
