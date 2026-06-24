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

// ─── Info row (icon + label + value) ─────────────────────────────────────────
const InfoRowSkeleton = ({ valueWidth = 160 }: { valueWidth?: number }) => (
    <View style={styles.infoRow}>
        <Bone style={styles.infoIcon} />
        <View style={styles.infoContent}>
            <Bone style={{ width: getScaleSize(80), height: getScaleSize(11), borderRadius: 4 }} />
            <Bone style={{ width: getScaleSize(valueWidth), height: getScaleSize(14), borderRadius: 4, marginTop: getScaleSize(4) }} />
        </View>
    </View>
);

// ─── Linked request card ──────────────────────────────────────────────────────
const RequestCardSkeleton = () => (
    <View style={styles.requestCard}>
        <View style={styles.requestTopRow}>
            <Bone style={{ width: getScaleSize(120), height: getScaleSize(13), borderRadius: 4 }} />
            <Bone style={{ width: getScaleSize(70), height: getScaleSize(24), borderRadius: getScaleSize(12) }} />
        </View>
        <Bone style={{ width: getScaleSize(180), height: getScaleSize(12), borderRadius: 4, marginTop: getScaleSize(8) }} />
        <View style={styles.requestBottomRow}>
            <Bone style={{ width: getScaleSize(90), height: getScaleSize(12), borderRadius: 4 }} />
            <Bone style={{ width: getScaleSize(100), height: getScaleSize(36), borderRadius: getScaleSize(8) }} />
        </View>
    </View>
);

const PatientDetailSkeleton = () => (
    <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
    >
        {/* ── Profile card ── */}
        <View style={styles.card}>
            {/* Edit button placeholder */}
            <Bone style={styles.editBtn} />

            {/* Avatar + name block */}
            <View style={styles.profileRow}>
                <Bone style={styles.avatar} />
                <View style={styles.profileMeta}>
                    <Bone style={{ width: getScaleSize(150), height: getScaleSize(18), borderRadius: 4 }} />
                    <Bone style={{ width: getScaleSize(180), height: getScaleSize(13), borderRadius: 4, marginTop: getScaleSize(6) }} />
                    <View style={styles.statusRow}>
                        <Bone style={styles.statusDot} />
                        <Bone style={{ width: getScaleSize(90), height: getScaleSize(12), borderRadius: 4 }} />
                    </View>
                </View>
            </View>

            <Bone style={styles.divider} />

            {/* Info rows */}
            <InfoRowSkeleton valueWidth={160} />
            <InfoRowSkeleton valueWidth={200} />
            <InfoRowSkeleton valueWidth={140} />
            <InfoRowSkeleton valueWidth={80} />
        </View>

        {/* ── Medical Notes section header ── */}
        <View style={styles.sectionHeader}>
            <Bone style={{ width: getScaleSize(120), height: getScaleSize(16), borderRadius: 4 }} />
            <Bone style={{ width: getScaleSize(32), height: getScaleSize(14), borderRadius: 4 }} />
        </View>

        {/* ── Medical Notes card ── */}
        <View style={styles.card}>
            <Bone style={{ width: '100%', height: getScaleSize(13), borderRadius: 4 }} />
            <Bone style={{ width: '85%', height: getScaleSize(13), borderRadius: 4, marginTop: getScaleSize(8) }} />
            <Bone style={{ width: '60%', height: getScaleSize(13), borderRadius: 4, marginTop: getScaleSize(8) }} />
        </View>

        {/* ── Linked Requests section header ── */}
        <View style={styles.sectionHeader}>
            <Bone style={{ width: getScaleSize(140), height: getScaleSize(16), borderRadius: 4 }} />
            <Bone style={styles.plusBtn} />
        </View>

        {/* ── Request cards ── */}
        <RequestCardSkeleton />
        <RequestCardSkeleton />
    </ScrollView>
);

export default PatientDetailSkeleton;

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: COLORS._F8F9FA,
    },
    content: {
        paddingHorizontal: getScaleSize(20),
        paddingBottom: getScaleSize(32),
        paddingTop: getScaleSize(16),
        gap: getScaleSize(16),
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: getScaleSize(16),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        padding: getScaleSize(16),
        gap: getScaleSize(12),
    },
    editBtn: {
        position: 'absolute',
        top: getScaleSize(12),
        right: getScaleSize(12),
        width: getScaleSize(32),
        height: getScaleSize(32),
        borderRadius: getScaleSize(16),
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(16),
    },
    avatar: {
        width: getScaleSize(64),
        height: getScaleSize(64),
        borderRadius: getScaleSize(32),
        flexShrink: 0,
    },
    profileMeta: {
        flex: 1,
        gap: getScaleSize(4),
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(6),
        marginTop: getScaleSize(4),
    },
    statusDot: {
        width: getScaleSize(8),
        height: getScaleSize(8),
        borderRadius: getScaleSize(4),
    },
    divider: {
        height: 1,
        borderRadius: 0,
    },
    infoRow: {
        flexDirection: 'row',
        gap: getScaleSize(12),
        alignItems: 'flex-start',
    },
    infoIcon: {
        width: getScaleSize(18),
        height: getScaleSize(18),
        borderRadius: getScaleSize(4),
        marginTop: getScaleSize(5),
        flexShrink: 0,
    },
    infoContent: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getScaleSize(4),
    },
    plusBtn: {
        width: getScaleSize(32),
        height: getScaleSize(32),
        borderRadius: getScaleSize(16),
    },
    requestCard: {
        backgroundColor: COLORS.white,
        borderRadius: getScaleSize(16),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        padding: getScaleSize(16),
        marginBottom: getScaleSize(12),
        gap: getScaleSize(4),
    },
    requestTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: getScaleSize(12),
    },
});