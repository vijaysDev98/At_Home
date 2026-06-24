import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS } from '../../../utils';

const Bone = ({ style }: { style: any }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    return (
        <Animated.View
            style={[{ backgroundColor: '#E5E7EB', borderRadius: 6, opacity }, style]}
        />
    );
};

const ProviderHomeSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Bone style={styles.avatarBone} />
                    <View style={{ gap: getScaleSize(6) }}>
                        <Bone style={{ width: getScaleSize(60), height: getScaleSize(10) }} />
                        <Bone style={{ width: getScaleSize(120), height: getScaleSize(14) }} />
                    </View>
                </View>
                <Bone style={styles.bellBone} />
            </View>

            <View style={styles.scrollContent}>
                {/* Overview label */}
                <Bone style={{ width: getScaleSize(80), height: getScaleSize(12), marginBottom: getScaleSize(12) }} />

                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                    <Bone style={styles.kpiCard} />
                    <Bone style={styles.kpiCard} />
                </View>

                {/* Wide KPI */}
                <Bone style={styles.kpiWide} />

                {/* Recent Queue label */}
                <View style={[styles.row, { marginTop: getScaleSize(24), marginBottom: getScaleSize(12) }]}>
                    <Bone style={{ width: getScaleSize(100), height: getScaleSize(12) }} />
                    <Bone style={{ width: getScaleSize(44), height: getScaleSize(12) }} />
                </View>

                {/* Request cards */}
                {[1, 2, 3].map(i => (
                    <Bone key={i} style={styles.requestCard} />
                ))}
            </View>
        </View>
    );
};

export default ProviderHomeSkeleton;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getScaleSize(24),
        paddingVertical: getScaleSize(16),
        backgroundColor: COLORS.white,
        borderBottomWidth: 0.5,
        borderColor: COLORS._EFEFEF,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(12),
    },
    avatarBone: {
        width: getScaleSize(48),
        height: getScaleSize(48),
        borderRadius: getScaleSize(24),
    },
    bellBone: {
        width: getScaleSize(40),
        height: getScaleSize(40),
        borderRadius: getScaleSize(20),
    },
    scrollContent: {
        paddingHorizontal: getScaleSize(20),
        paddingTop: getScaleSize(20),
    },
    kpiGrid: {
        flexDirection: 'row',
        gap: getScaleSize(12),
        marginBottom: getScaleSize(12),
    },
    kpiCard: {
        flex: 1,
        height: getScaleSize(96),
        borderRadius: getScaleSize(12),
    },
    kpiWide: {
        height: getScaleSize(68),
        borderRadius: getScaleSize(12),
    },
    requestCard: {
        height: getScaleSize(110),
        borderRadius: getScaleSize(12),
        marginBottom: getScaleSize(12),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});