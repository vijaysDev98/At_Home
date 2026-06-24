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

// Single patient card skeleton
const PatientCardSkeleton = () => (
    <View style={styles.card}>
        <View style={styles.cardLeft}>
            {/* Avatar circle */}
            <Bone style={styles.avatar} />
            <View style={styles.cardText}>
                {/* Name */}
                <Bone style={styles.nameBone} />
                {/* Phone row */}
                <View style={styles.phoneRow}>
                    <Bone style={styles.phoneIconBone} />
                    <Bone style={styles.phoneBone} />
                </View>
            </View>
        </View>
        {/* Chevron */}
        <Bone style={styles.chevron} />
    </View>
);

const PatientsSkeleton = () => (
    <View style={styles.container}>
        {/* Search bar */}
        <View style={styles.header}>
            <Bone style={styles.searchBar} />

            {/* Filter chips */}
            <View style={styles.chipsRow}>
                {[80, 100, 120].map((w, i) => (
                    <Bone key={i} style={[styles.chip, { width: getScaleSize(w) }]} />
                ))}
            </View>
        </View>

        {/* Patient cards */}
        <View style={styles.list}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <PatientCardSkeleton key={i} />
            ))}
        </View>
    </View>
);

export default PatientsSkeleton;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS._F8F9FA,
    },
    header: {
        paddingBottom: getScaleSize(14),
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    searchBar: {
        marginTop: getScaleSize(12),
        marginHorizontal: getScaleSize(20),
        height: getScaleSize(48),
        borderRadius: getScaleSize(12),
    },
    chipsRow: {
        flexDirection: 'row',
        gap: getScaleSize(8),
        paddingHorizontal: getScaleSize(20),
        marginTop: getScaleSize(12),
    },
    chip: {
        height: getScaleSize(34),
        borderRadius: getScaleSize(18),
    },
    list: {
        paddingHorizontal: getScaleSize(20),
        paddingTop: getScaleSize(16),
        gap: getScaleSize(12),
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: getScaleSize(16),
        borderWidth: 1,
        borderColor: '#EFEFEF',
        padding: getScaleSize(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(12),
        flex: 1,
    },
    avatar: {
        width: getScaleSize(48),
        height: getScaleSize(48),
        borderRadius: getScaleSize(24),
        flexShrink: 0,
    },
    cardText: {
        gap: getScaleSize(8),
        flex: 1,
    },
    nameBone: {
        width: getScaleSize(140),
        height: getScaleSize(14),
        borderRadius: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(6),
    },
    phoneIconBone: {
        width: getScaleSize(10),
        height: getScaleSize(14),
        borderRadius: 3,
    },
    phoneBone: {
        width: getScaleSize(110),
        height: getScaleSize(12),
        borderRadius: 4,
    },
    chevron: {
        width: getScaleSize(8),
        height: getScaleSize(18),
        borderRadius: 3,
    },
});