// NotificationSkeleton.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS } from '../../../utils';

// ─── Bone ────────────────────────────────────────────────────────────────────
const Bone = ({ style }: { style: any }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ]),
        ).start();
    }, []);

    return (
        <Animated.View
            style={[{ backgroundColor: '#E5E7EB', borderRadius: 6, opacity }, style]}
        />
    );
};

// ─── Single notification row skeleton ────────────────────────────────────────
const NotificationRowSkeleton = ({ withAction = false }: { withAction?: boolean }) => (
    <View style={styles.row}>
        {/* Icon circle */}
        <Bone style={styles.iconCircle} />

        {/* Content */}
        <View style={styles.content}>
            {/* Title + time */}
            <View style={styles.titleRow}>
                <Bone style={styles.titleBone} />
                <Bone style={styles.timeBone} />
            </View>

            {/* Subtitle lines */}
            <Bone style={[styles.subtitleBone, { width: '100%' }]} />
            <Bone style={[styles.subtitleBone, { width: getScaleSize(180), marginTop: getScaleSize(5) }]} />

            {/* Optional action button */}
            {withAction && <Bone style={styles.actionBone} />}
        </View>
    </View>
);

// ─── Full skeleton ────────────────────────────────────────────────────────────
const NotificationSkeleton = () => (
    <View style={styles.container}>
        {/* Tab bar */}
        <View style={styles.tabs}>
            <Bone style={styles.tabBone} />
            <Bone style={[styles.tabBone, { width: getScaleSize(52) }]} />
        </View>
        <View style={styles.divider} />

        {/* Rows — alternate with/without action bone */}
        {[false, true, false, false, true, false].map((withAction, i) => (
            <React.Fragment key={i}>
                <NotificationRowSkeleton withAction={withAction} />
                {i < 5 && <View style={styles.itemDivider} />}
            </React.Fragment>
        ))}
    </View>
);

export default NotificationSkeleton;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    tabs: {
        flexDirection: 'row',
        gap: 24,
        paddingHorizontal: getScaleSize(20),
        paddingVertical: getScaleSize(14),
    },
    tabBone: {
        width: getScaleSize(32),
        height: getScaleSize(14),
        borderRadius: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
        padding: getScaleSize(16),
        alignItems: 'center',
    },
    iconCircle: {
        width: getScaleSize(30),
        height: getScaleSize(30),
        borderRadius: getScaleSize(30),
        marginRight: getScaleSize(12),
        flexShrink: 0,
    },
    content: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getScaleSize(8),
    },
    titleBone: {
        width: getScaleSize(150),
        height: getScaleSize(14),
        borderRadius: 4,
    },
    timeBone: {
        width: getScaleSize(48),
        height: getScaleSize(10),
        borderRadius: 4,
    },
    subtitleBone: {
        height: getScaleSize(10),
        borderRadius: 4,
    },
    actionBone: {
        marginTop: getScaleSize(12),
        width: getScaleSize(110),
        height: getScaleSize(36),
        borderRadius: getScaleSize(8),
    },
    itemDivider: {
        height: 1,
        marginHorizontal: getScaleSize(16),
        backgroundColor: '#F3F4F6',
    },
});