import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const PLACEHOLDER_COUNT = 4;

const SkeletonBlock = ({
  style,
  opacity,
}: {
  style: object;
  opacity: Animated.Value;
}) => <Animated.View style={[styles.block, style, { opacity }]} />;

const RequestSkeletonCard = ({ opacity }: { opacity: Animated.Value }) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
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
            width: '58%',
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
          }}
        />
      </View>
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: getScaleSize(72),
          height: getScaleSize(22),
          borderRadius: getScaleSize(11),
        }}
      />
    </View>

    <View style={styles.divider} />

    <View style={styles.metaRow}>
      <View>
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: getScaleSize(64),
            height: getScaleSize(10),
            borderRadius: getScaleSize(5),
            marginBottom: getScaleSize(8),
          }}
        />
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: getScaleSize(88),
            height: getScaleSize(12),
            borderRadius: getScaleSize(6),
          }}
        />
      </View>
      <View style={styles.metaRight}>
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: getScaleSize(72),
            height: getScaleSize(10),
            borderRadius: getScaleSize(5),
            marginBottom: getScaleSize(8),
          }}
        />
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: getScaleSize(96),
            height: getScaleSize(12),
            borderRadius: getScaleSize(6),
          }}
        />
      </View>
    </View>

    <SkeletonBlock
      opacity={opacity}
      style={{
        height: getScaleSize(40),
        borderRadius: getScaleSize(10),
        marginTop: getScaleSize(14),
      }}
    />
  </View>
);

export const RequestListSkeleton: React.FC<{ style?: ViewStyle }> = ({
  style,
}) => {
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
    <View style={[styles.container, style]}>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <RequestSkeletonCard
          key={`request-skeleton-${index}`}
          opacity={opacity}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(12),
    paddingBottom: getScaleSize(50),
    gap: getScaleSize(12),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    padding: getScaleSize(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(14),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaRight: {
    alignItems: 'flex-end',
  },
  block: {
    backgroundColor: COLORS._E5E7EB,
  },
});
