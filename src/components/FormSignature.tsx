import React from 'react';
import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';

export interface FormSignatureProps {
    title?: string;
}

const FormSignature: React.FC<FormSignatureProps> = ({
    title = 'Signature',
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
                    {title}
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        padding: getScaleSize(17),
        borderRadius: getScaleSize(16),
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    signatureLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS._1A1D1F,
        marginLeft: getScaleSize(16),
    },
});

export default FormSignature;