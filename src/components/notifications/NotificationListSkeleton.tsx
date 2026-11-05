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

const NotificationSkeletonRow = ({ opacity }: { opacity: Animated.Value }) => (
  <View style={styles.row}>
    <SkeletonBlock
      opacity={opacity}
      style={{
        width: getScaleSize(40),
        height: getScaleSize(40),
        borderRadius: getScaleSize(20),
      }}
    />
    <View style={styles.textCol}>
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '70%',
          height: getScaleSize(14),
          borderRadius: getScaleSize(6),
          marginBottom: getScaleSize(8),
        }}
      />
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '92%',
          height: getScaleSize(12),
          borderRadius: getScaleSize(6),
          marginBottom: getScaleSize(8),
        }}
      />
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '28%',
          height: getScaleSize(10),
          borderRadius: getScaleSize(5),
        }}
      />
    </View>
  </View>
);

export const NotificationListSkeleton: React.FC = () => {
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
        <NotificationSkeletonRow
          key={`notification-skeleton-${index}`}
          opacity={opacity}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  block: {
    backgroundColor: COLORS._E5E7EB,
  },
});
