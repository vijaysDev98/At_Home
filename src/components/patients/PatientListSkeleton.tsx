import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const PLACEHOLDER_COUNT = 6;
const NAME_WIDTHS = ['62%', '48%', '70%', '54%', '66%', '44%'];

const SkeletonBlock = ({
  style,
  opacity,
}: {
  style: object;
  opacity: Animated.Value;
}) => <Animated.View style={[styles.block, style, { opacity }]} />;

const PatientSkeletonRow = ({
  opacity,
  nameWidth,
}: {
  opacity: Animated.Value;
  nameWidth: string;
}) => (
  <View style={styles.card}>
    <View style={styles.cardLeft}>
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
            width: nameWidth,
            height: getScaleSize(14),
            borderRadius: getScaleSize(6),
            marginBottom: getScaleSize(8),
          }}
        />
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: '46%',
            height: getScaleSize(12),
            borderRadius: getScaleSize(6),
          }}
        />
      </View>
    </View>
    <SkeletonBlock
      opacity={opacity}
      style={{
        width: getScaleSize(8),
        height: getScaleSize(14),
        borderRadius: getScaleSize(4),
      }}
    />
  </View>
);

export const PatientListSkeleton: React.FC = () => {
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
        <PatientSkeletonRow
          key={`patient-skeleton-${index}`}
          opacity={opacity}
          nameWidth={NAME_WIDTHS[index % NAME_WIDTHS.length]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: getScaleSize(16),
    paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(120),
    gap: getScaleSize(12),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  block: {
    backgroundColor: COLORS._E5E7EB,
  },
});
