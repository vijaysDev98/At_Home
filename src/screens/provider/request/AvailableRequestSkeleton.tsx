import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { COLORS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';

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

// ─── Single request card skeleton ────────────────────────────────────────────
const RequestCardSkeleton = () => (
    <View style={styles.card}>
        {/* Top row: name + status badge */}
        <View style={styles.topRow}>
            <View style={styles.topLeft}>
                <Bone style={styles.avatar} />
                <View style={styles.nameBlock}>
                    <Bone style={{ width: getScaleSize(130), height: getScaleSize(14), borderRadius: 4 }} />
                    <Bone style={{ width: getScaleSize(90), height: getScaleSize(12), borderRadius: 4, marginTop: getScaleSize(6) }} />
                </View>
            </View>
            <Bone style={styles.badge} />
        </View>

        <Bone style={styles.divider} />

        {/* Detail row: request ID + service type */}
        <View style={styles.detailRow}>
            <View style={styles.detailBlock}>
                <Bone style={{ width: getScaleSize(60), height: getScaleSize(11), borderRadius: 4 }} />
                <Bone style={{ width: getScaleSize(90), height: getScaleSize(13), borderRadius: 4, marginTop: getScaleSize(4) }} />
            </View>
            <View style={styles.detailBlock}>
                <Bone style={{ width: getScaleSize(60), height: getScaleSize(11), borderRadius: 4 }} />
                <Bone style={{ width: getScaleSize(110), height: getScaleSize(13), borderRadius: 4, marginTop: getScaleSize(4) }} />
            </View>
        </View>

        {/* Button row */}
        <View style={styles.buttonRow}>
            <Bone style={styles.outlineBtn} />
            <Bone style={styles.primaryBtn} />
        </View>
    </View>
);

const AvailableRequestSkeleton = () => (
    <View style={styles.container}>
        {/* Tab bar */}
        {/* <View style={styles.tabBar}>
            {[60, 72, 80, 64, 84].map((w, i) => (
                <Bone key={i} style={[styles.tabBone, { width: getScaleSize(w) }]} />
            ))}
        </View> */}

        {/* Cards */}
        <View style={styles.list}>
            {[1, 2, 3, 4].map(i => (
                <RequestCardSkeleton key={i} />
            ))}
        </View>
    </View>
);

export default AvailableRequestSkeleton;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS._F9FAFB,
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(24),
        paddingHorizontal: getScaleSize(20),
        paddingVertical: getScaleSize(14),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS._EFEFEF,
    },
    tabBone: {
        height: getScaleSize(14),
        borderRadius: 4,
    },
    list: {
        paddingHorizontal: getScaleSize(20),
        paddingTop: getScaleSize(16),
        gap: getScaleSize(16),
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: getScaleSize(16),
        padding: getScaleSize(16),
        borderWidth: 1,
        borderColor: COLORS._EFEFEF,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(10),
    },
    avatar: {
        width: getScaleSize(44),
        height: getScaleSize(44),
        borderRadius: getScaleSize(22),
        flexShrink: 0,
    },
    nameBlock: {
        gap: getScaleSize(4),
    },
    badge: {
        width: getScaleSize(80),
        height: getScaleSize(28),
        borderRadius: getScaleSize(12),
    },
    divider: {
        height: 1,
        borderRadius: 0,
        marginVertical: getScaleSize(14),
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: getScaleSize(16),
    },
    detailBlock: {
        gap: getScaleSize(4),
    },
    buttonRow: {
        flexDirection: 'row',
        gap: getScaleSize(10),
    },
    outlineBtn: {
        flex: 1,
        height: getScaleSize(40),
        borderRadius: getScaleSize(10),
    },
    primaryBtn: {
        flex: 1,
        height: getScaleSize(40),
        borderRadius: getScaleSize(10),
    },
});