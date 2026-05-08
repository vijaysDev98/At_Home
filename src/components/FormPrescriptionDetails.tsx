import React, { useState } from 'react';
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
}

const FormPrescriptionDetails: React.FC<FormPrescriptionDetailsProps> = ({
    state,
    setState,
}) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());

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
                    setState({ ...state, prescription_date: formattedDate });
                }}
                onCancel={() => setOpen(false)}
            />

            <View style={styles.checkboxGroup}>
                <View style={styles.checkboxItem}>
                    <AppCheckBox
                        value={state.therapy_type === 'start'}
                        onValueChange={value =>
                            setState(prev => ({ ...prev, therapy_type: value ? 'start' : '' }))
                        }
                        label="Start of home infusion therapy"
                    />
                </View>

                <View style={styles.checkboxItem}>
                    <AppCheckBox
                        value={state.therapy_type === 'renewal'}
                        onValueChange={value =>
                            setState(prev => ({ ...prev, therapy_type: value ? 'renewal' : '' }))
                        }
                        label="Renewal or modification"
                    />
                </View>
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(12),
        marginBottom: getScaleSize(12),
    },
    sectionIcon: {
        height: getScaleSize(20),
        width: getScaleSize(20),
        resizeMode: 'contain',
    },
    inputField: {
        marginBottom: getScaleSize(12),
        paddingHorizontal: 0,
    },
    checkboxGroup: {
        marginTop: getScaleSize(4),
        gap: getScaleSize(8),
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getScaleSize(4),
    },
});

export default FormPrescriptionDetails;