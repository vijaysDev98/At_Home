import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const SkeletonBar = ({
  width,
  height,
  alignSelf,
  opacity,
}: {
  width: number | `${number}%`;
  height: number;
  alignSelf: 'flex-start' | 'flex-end' | 'center';
  opacity: Animated.Value;
}) => (
  <Animated.View
    style={[
      styles.bar,
      {
        width,
        height,
        alignSelf,
        opacity,
      },
    ]}
  />
);

export const ChatMessagesSkeleton: React.FC = () => {
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
      <SkeletonBar width="68%" height={getScaleSize(44)} alignSelf="flex-start" opacity={opacity} />
      <SkeletonBar width="52%" height={getScaleSize(36)} alignSelf="flex-end" opacity={opacity} />
      <SkeletonBar width="74%" height={getScaleSize(52)} alignSelf="flex-start" opacity={opacity} />
      <SkeletonBar width="48%" height={getScaleSize(40)} alignSelf="flex-end" opacity={opacity} />
      <SkeletonBar width="62%" height={getScaleSize(44)} alignSelf="flex-start" opacity={opacity} />
      <SkeletonBar width="56%" height={getScaleSize(36)} alignSelf="flex-end" opacity={opacity} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(16),
    gap: getScaleSize(12),
    backgroundColor: COLORS._F9FAFB,
  },
  bar: {
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._E5E7EB,
  },
});
