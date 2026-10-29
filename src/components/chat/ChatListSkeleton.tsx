import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const PLACEHOLDER_COUNT = 7;

const SkeletonBlock = ({
  style,
  opacity,
}: {
  style: object;
  opacity: Animated.Value;
}) => <Animated.View style={[styles.block, style, { opacity }]} />;

const ChatListSkeletonRow = ({ opacity }: { opacity: Animated.Value }) => (
  <View style={styles.card}>
    <SkeletonBlock
      opacity={opacity}
      style={{
        width: getScaleSize(48),
        height: getScaleSize(48),
        borderRadius: getScaleSize(24),
      }}
    />
    <View style={styles.textCol}>
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '55%',
          height: getScaleSize(14),
          borderRadius: getScaleSize(6),
          marginBottom: getScaleSize(8),
        }}
      />
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '88%',
          height: getScaleSize(12),
          borderRadius: getScaleSize(6),
        }}
      />
    </View>
    <SkeletonBlock
      opacity={opacity}
      style={{
        width: getScaleSize(36),
        height: getScaleSize(10),
        borderRadius: getScaleSize(5),
      }}
    />
  </View>
);

export const ChatListSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <ChatListSkeletonRow key={`chat-list-skeleton-${index}`} opacity={opacity} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(32),
    gap: getScaleSize(10),
    backgroundColor: COLORS._F9FAFB,
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
    gap: getScaleSize(12),
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  block: {
    backgroundColor: COLORS._E5E7EB,
  },
});
