import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import moment from 'moment';

import DatePicker from 'react-native-date-picker';
import AppCheckBox from './AppCheckBox';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';

export interface FormPrescriptionDetailsProps {
    state: any;
    setState: (state: any) => void;
    errors?: { [key: string]: string };
}

const FormPrescriptionDetails: React.FC<FormPrescriptionDetailsProps> = ({
    state,
    setState,
    errors = {},
}) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(() => {
        if (state.prescription_date) {
            return moment(state.prescription_date, 'DD/MM/YYYY').toDate();
        }
        return new Date();
    });

    useEffect(() => {
        if (state.prescription_date) {
            const parsedDate = moment(state.prescription_date, 'DD/MM/YYYY').toDate();
            setDate(parsedDate);
        }
    }, [state.prescription_date]);

    const renderSectionHeader = (title: string, icon?: any) => (
        <View style={styles.sectionHeader}>
            {icon && <Image source={icon} style={styles.sectionIcon} />}
            <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
            >
                {title}
            </AppText>
        </View>
    );

    return (
        <View style={styles.card}>
            {renderSectionHeader(STRING.prescriptionDetails)}


            <Input
                onPress={() => { setOpen(true) }}
                editable={false}
                label="Prescription Date"
                placeholder="DD/MM/YYYY"
                value={state.prescription_date}
                style={styles.inputField}
                pointerEvents="none"
                error={errors.prescription_date}
            />

            <DatePicker
                modal
                mode="date"
                open={open}
                date={date}
                onConfirm={d => {
                    setOpen(false);
                    setDate(d);
                    const formattedDate = moment(d).format('DD/MM/YYYY');
                    setState({ prescription_date: formattedDate });
                }}
                onCancel={() => setOpen(false)}
            />

            <View style={styles.checkboxGroup}>
                <View style={styles.checkboxItem}>
                    <AppCheckBox
                        value={state.therapy_type === 'start'}
                        onValueChange={value =>
                            setState({ therapy_type: value ? 'start' : '' })
                        }
                        label="Start of home infusion therapy"
                    />
                </View>

                <View style={styles.checkboxItem}>
                    <AppCheckBox
                        value={state.therapy_type === 'renewal'}
                        onValueChange={value =>
                            setState({ therapy_type: value ? 'renewal' : '' })
                        }
                        label="Renewal or modification"
                    />
                </View>
            </View>
            {errors.therapy_type && (
                <AppText size={getScaleSize(12)} color={COLORS.error} style={styles.errorText}>
                    {errors.therapy_type}
                </AppText>
            )}
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(12),
        marginBottom: getScaleSize(12),
    },
    sectionIcon: {
        width: getScaleSize(20),
        height: getScaleSize(20),
        resizeMode: 'contain',
    },
    inputField: {
        marginBottom: getScaleSize(12),
        paddingHorizontal: 0
    },
    checkboxGroup: {
        marginBottom: getScaleSize(12),
    },
    checkboxItem: {
        marginBottom: getScaleSize(8),
    },
    errorText: {
        marginTop: getScaleSize(4),
        marginBottom: getScaleSize(8),
    },
});

export default FormPrescriptionDetails;