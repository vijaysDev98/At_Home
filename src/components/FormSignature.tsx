import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';

export interface FormSignatureProps {
    title?: string;
    showDate?: boolean;
    signatureDate?: string;
    onDateChange?: (date: string) => void;
    signature?: string;
    onSignatureChange?: (signature: string) => void;
    readOnly?: boolean;
}

const FormSignature: React.FC<FormSignatureProps> = ({
    title = 'Signature',
    showDate = false,
    signatureDate = '',
    onDateChange,
    signature = '',
    onSignatureChange,
    readOnly = false,
}) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold}>
                    {title}
                </AppText>
            </View>
            <View style={styles.signatureInputContainer}>
                <Input
                    isLocked={readOnly}
                    style={{ paddingHorizontal: 0 }}
                    label="Sign here"
                    value={signature}
                    onChangeText={onSignatureChange}
                />
            </View>
            {showDate && (
                <View style={styles.dateRow}>
                    <Input
                        isLocked={readOnly}
                        onPress={() => {
                            if (readOnly) return;
                            setOpen(true);
                        }}
                        editable={false}
                        label="Signature Date"
                        placeholder="DD/MM/YYYY"
                        value={signatureDate}
                        style={styles.dateInput}
                        pointerEvents="none"
                    />
                </View>
            )}
            <DatePicker
                modal
                mode="date"
                open={open}
                date={date}
                onConfirm={d => {
                    setOpen(false);
                    setDate(d);
                    const formattedDate = moment(d).format('DD/MM/YYYY');
                    onDateChange?.(formattedDate);
                }}
                onCancel={() => setOpen(false)}
            />
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    dateRow: {
        marginTop: getScaleSize(12),
        marginBottom: getScaleSize(12),
    },
    dateInput: {
        marginBottom: 0,
        paddingHorizontal: 0,
    },
    signatureInputContainer: {
        marginTop: getScaleSize(16),
        paddingTop: getScaleSize(12),
        borderTopWidth: 1,
        borderTopColor: COLORS._E5E7EB,
    },
    signatureInput: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS._1A1D1F,
        fontSize: getScaleSize(14),
        color: COLORS._1A1D1F,
        paddingHorizontal: 0,
        paddingVertical: getScaleSize(8),
        // paddingHorizontal: getScaleSize(4),
        // minHeight: getScaleSize(40),
    },
});

export default FormSignature;