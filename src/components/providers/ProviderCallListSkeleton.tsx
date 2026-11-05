import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const PLACEHOLDER_COUNT = 6;

const SkeletonBlock = ({
  style,
  opacity,
}: {
  style: object;
  opacity: Animated.Value;
}) => <Animated.View style={[styles.block, style, { opacity }]} />;

const ProviderSkeletonCard = ({ opacity }: { opacity: Animated.Value }) => (
  <View style={styles.card}>
    <SkeletonBlock
      opacity={opacity}
      style={{
        width: getScaleSize(50),
        height: getScaleSize(50),
        borderRadius: getScaleSize(28),
      }}
    />
    <View style={styles.textCol}>
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '62%',
          height: getScaleSize(14),
          borderRadius: getScaleSize(6),
          marginBottom: getScaleSize(8),
        }}
      />
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '40%',
          height: getScaleSize(12),
          borderRadius: getScaleSize(6),
          marginBottom: getScaleSize(6),
        }}
      />
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '78%',
          height: getScaleSize(12),
          borderRadius: getScaleSize(6),
        }}
      />
    </View>
    <View style={styles.actions}>
      <SkeletonBlock opacity={opacity} style={styles.action} />
      <SkeletonBlock opacity={opacity} style={styles.action} />
    </View>
  </View>
);

export const ProviderCallListSkeleton: React.FC = () => {
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
        <ProviderSkeletonCard
          key={`provider-skeleton-${index}`}
          opacity={opacity}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(4),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(14),
    marginBottom: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: getScaleSize(12),
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  action: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
  },
  block: {
    backgroundColor: COLORS._E5E7EB,
  },
});
