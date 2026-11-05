import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

const SkeletonBlock = ({
  style,
  opacity,
}: {
  style: object;
  opacity: Animated.Value;
}) => <Animated.View style={[styles.block, style, { opacity }]} />;

const InfoRow = ({ opacity }: { opacity: Animated.Value }) => (
  <View style={styles.infoRow}>
    <SkeletonBlock
      opacity={opacity}
      style={{
        width: getScaleSize(18),
        height: getScaleSize(18),
        borderRadius: getScaleSize(4),
        marginTop: getScaleSize(2),
      }}
    />
    <View style={styles.infoText}>
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '36%',
          height: getScaleSize(10),
          borderRadius: getScaleSize(5),
          marginBottom: getScaleSize(6),
        }}
      />
      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '72%',
          height: getScaleSize(12),
          borderRadius: getScaleSize(6),
        }}
      />
    </View>
  </View>
);

export const PatientDetailSkeleton: React.FC = () => {
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
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <SkeletonBlock
            opacity={opacity}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
            }}
          />
          <View style={styles.profileMeta}>
            <SkeletonBlock
              opacity={opacity}
              style={{
                width: '70%',
                height: getScaleSize(16),
                borderRadius: getScaleSize(6),
                marginBottom: getScaleSize(8),
              }}
            />
            <SkeletonBlock
              opacity={opacity}
              style={{
                width: '50%',
                height: getScaleSize(12),
                borderRadius: getScaleSize(6),
              }}
            />
          </View>
        </View>
        <View style={styles.divider} />
        <InfoRow opacity={opacity} />
        <InfoRow opacity={opacity} />
        <InfoRow opacity={opacity} />
        <InfoRow opacity={opacity} />
      </View>

      <SkeletonBlock
        opacity={opacity}
        style={{
          width: '40%',
          height: getScaleSize(16),
          borderRadius: getScaleSize(6),
          marginTop: getScaleSize(8),
        }}
      />
      <View style={styles.card}>
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: '100%',
            height: getScaleSize(14),
            borderRadius: getScaleSize(6),
            marginBottom: getScaleSize(8),
          }}
        />
        <SkeletonBlock
          opacity={opacity}
          style={{
            width: '80%',
            height: getScaleSize(14),
            borderRadius: getScaleSize(6),
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: getScaleSize(16),
    gap: getScaleSize(12),
    backgroundColor: COLORS._F8F9FA,
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileMeta: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  block: {
    backgroundColor: COLORS._E5E7EB,
  },
});
