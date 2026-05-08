import React, { useRef, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
    AppText,
    Input,
    WarningSheet,
    FormPatientSection,
    FormPrescriberSection,
    FormFacilitySection,
    AppCheckBox,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const PcaForm: React.FC = () => {
    const selectedPatient = useSelector(
        (state: RootState) => state.patient.selectedPatient,
    );

    const profileData = useSelector(
        (state: RootState) => state.profile.profileData,
    );

    const warningSheetRef = useRef<ActionSheetRef>(null);

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date());

    const [pickerType, setPickerType] = useState<{
        type: string;
    } | null>(null);

    const [state, setState] = useState({
        prescriptionDate: moment().format('DD/MM/YYYY'),

        startTherapy: false,
        renewalTherapy: false,

        patientLastName: '',
        patientFirstName: selectedPatient?.fullName || '',
        patientDOB: selectedPatient?.dateOfBirth
            ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
            : '',
        patientWeight: '',
        patientNIR: '',
        careRelatedToALD: false,

        prescriberLastName: '',
        prescriberFirstName: profileData?.fullName || '',
        prescriberPhone: profileData?.phoneNumber || '',
        prescriberRPPS: profileData?.rppsNumber || '',

        hospitalName: profileData?.businessAddress || '',
        hospitalAddress: '',
        finessNo: profileData?.finessNumber || '',

        effectiveFrom: '',
        prescriptionWeeks: '',
        renewedTimes: '',

        morphineConcentration: '',
        pureMorphineMg: '',
        flexibleBagMl: '',

        basalRate: '',
        bolusDose: '',
        lockoutPeriod: '',
        maxBolusesPerHour: '',

        renewedConnectionTimes: '',

        carePreparationPump: false,
        careFillingPump: false,
        careConnectingInfusion: false,
        careReservoirChange: false,
        careStoppingDevice: false,
        careFlush: false,
        careDressingChange: false,
        careOrganizationMonitoring: false,

        signature: '',
    });

    const renderSectionHeader = (title: string) => (
        <View style={styles.sectionHeader}>
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
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerTextContainer}>
                    <AppText
                        size={getScaleSize(16)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                    >
                        PCA Infusion Prescription Form
                    </AppText>
                </View>

                <FormPrescriptionDetails state={state} setState={setState} />

                <FormPatientSection
                    state={{
                        patientLastName: state.patientLastName,
                        patientFirstName: state.patientFirstName,
                        patientDOB: state.patientDOB,
                        patientWeight: state.patientWeight,
                        patientNIR: state.patientNIR,
                        careRelatedToALD: state.careRelatedToALD,
                    }}
                    setState={(updates) =>
                        setState(prev => ({ ...prev, ...updates }))
                    }
                />

                <FormPrescriberSection
                    state={{
                        prescriberLastName: state.prescriberLastName,
                        prescriberFirstName: state.prescriberFirstName,
                        prescriberPhone: state.prescriberPhone,
                        prescriberRPPS: state.prescriberRPPS,
                    }}
                    setState={(updates) =>
                        setState(prev => ({ ...prev, ...updates }))
                    }
                />

                <FormFacilitySection
                    state={{
                        hospitalName: state.hospitalName,
                        hospitalAddress: state.hospitalAddress,
                        finessNo: state.finessNo,
                    }}
                    setState={(updates) =>
                        setState(prev => ({ ...prev, ...updates }))
                    }
                />

                <View style={styles.card}>
                    <View style={styles.warningContainer}>
                        <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.Bold}
                            color={COLORS._B42318}
                        >
                            **This form must be accompanied by a handwritten secure
                            prescription.
                        </AppText>
                    </View>

                    {renderSectionHeader('Prescription Plan')}

                    <Input
                        onPress={() => {
                            setPickerType({ type: 'effectiveFrom' });
                            setOpen(true);
                        }}
                        editable={false}
                        label="Effective from"
                        placeholder="DD/MM/YYYY"
                        value={state.effectiveFrom}
                        style={styles.inputField}
                        pointerEvents="none"
                    />

                    <View style={styles.topRight}>
                        <View style={styles.blankSentenceWrap}>
                            <AppText size={getScaleSize(13)}>
                                Prescription for
                            </AppText>

                            <TextInput
                                value={state.prescriptionWeeks}
                                onChangeText={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        prescriptionWeeks: value,
                                    }))
                                }
                                style={styles.inlineBlankInput}
                                keyboardType="numeric"
                            />

                            <AppText size={getScaleSize(13)}>
                                week(s), to be renewed
                            </AppText>

                            <TextInput
                                value={state.renewedTimes}
                                onChangeText={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        renewedTimes: value,
                                    }))
                                }
                                style={styles.inlineBlankInput}
                                keyboardType="numeric"
                            />

                            <AppText size={getScaleSize(13)}>
                                times
                            </AppText>
                        </View>
                    </View>

                    <View style={styles.descriptionBlock}>
                        <AppText
                            size={getScaleSize(13)}
                            color={COLORS._1A1D1F}
                        >
                            To be carried out at home by a home care nurse (RN),
                            every day, including Sundays and public holidays,
                            for PCA morphine administration.
                        </AppText>
                    </View>

                    {/* NURSING CARE */}
                    <View style={styles.descriptionBlock}>
                        <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.SemiBold}
                            color={COLORS._1A1D1F}
                        >
                            Nursing care to be provided:
                        </AppText>

                        <View style={styles.checkboxGroup}>
                            <AppCheckBox
                                value={state.carePreparationPump}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        carePreparationPump: value,
                                    }))
                                }
                                label="Preparation and programming of a portable pump"
                            />

                            <AppCheckBox
                                value={state.careFillingPump}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careFillingPump: value,
                                    }))
                                }
                                label="Filling and setting up the portable pump"
                            />

                            <AppCheckBox
                                value={state.careConnectingInfusion}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careConnectingInfusion: value,
                                    }))
                                }
                                label="Connecting the infusion and starting the device"
                            />

                            <AppCheckBox
                                value={state.careReservoirChange}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careReservoirChange: value,
                                    }))
                                }
                                label="Reservoir change (flexible bag)"
                            />

                            <AppCheckBox
                                value={state.careStoppingDevice}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careStoppingDevice: value,
                                    }))
                                }
                                label="Stopping and removing the device"
                            />

                            <AppCheckBox
                                value={state.careFlush}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careFlush: value,
                                    }))
                                }
                                label='Flush / "heparinization"'
                            />

                            <AppCheckBox
                                value={state.careDressingChange}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careDressingChange: value,
                                    }))
                                }
                                label="Dressing change and replacement of the Huber needle once a week"
                            />

                            <AppCheckBox
                                value={state.careOrganizationMonitoring}
                                onValueChange={(value) =>
                                    setState(prev => ({
                                        ...prev,
                                        careOrganizationMonitoring: value,
                                    }))
                                }
                                label="Organization of infusion monitoring, care planning, and coordination"
                            />
                        </View>
                    </View>

                    <View style={styles.sectionSpacing}>
                        <AppText
                            size={getScaleSize(14)}
                            font={FONTS.Inter.Bold}
                        >
                            Administration by continuous infusion PCA pump
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            Morphine hydrochloride injectable, concentration of
                        </AppText>

                        <TextInput
                            value={state.morphineConcentration}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    morphineConcentration: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            mg/h
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <TextInput
                            value={state.pureMorphineMg}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    pureMorphineMg: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            mg of pure morphine, i.e.
                        </AppText>

                        <TextInput
                            value={state.flexibleBagMl}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    flexibleBagMl: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            ml in a flexible bag with maximum capacity of 50 ml
                        </AppText>
                    </View>

                    <View style={styles.sectionSpacing}>
                        <AppText
                            size={getScaleSize(14)}
                            font={FONTS.Inter.Bold}
                        >
                            Pump settings
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            Basal rate:
                        </AppText>

                        <TextInput
                            value={state.basalRate}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    basalRate: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            mg/h
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            Bolus dose:
                        </AppText>

                        <TextInput
                            value={state.bolusDose}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    bolusDose: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            mg
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            Lockout period:
                        </AppText>

                        <TextInput
                            value={state.lockoutPeriod}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    lockoutPeriod: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            minutes
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            Maximum number of boluses per hour:
                        </AppText>

                        <TextInput
                            value={state.maxBolusesPerHour}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    maxBolusesPerHour: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            To be renewed for connection
                        </AppText>

                        <TextInput
                            value={state.renewedConnectionTimes}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    renewedConnectionTimes: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            times per week for 28 days for administration by
                            continuous infusion PCA pump of injectable morphine
                            hydrochloride.
                        </AppText>
                    </View>
                </View>

                <FormSignature />
            </ScrollView>

            <DatePicker
                modal
                open={open}
                date={date}
                mode="date"
                onConfirm={(selectedDate) => {
                    setOpen(false);
                    setDate(selectedDate);

                    if (pickerType) {
                        const formattedDate =
                            moment(selectedDate).format('DD/MM/YYYY');

                        setState(prev => ({
                            ...prev,
                            [pickerType.type]: formattedDate,
                        }));
                    }
                }}
                onCancel={() => {
                    setOpen(false);
                }}
            />

            <WarningSheet ref={warningSheetRef} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS._F9FAFB,
    },

    inputField: {
        marginBottom: getScaleSize(12),
        paddingHorizontal: 0,
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: getScaleSize(190),
        gap: getScaleSize(12),
        marginHorizontal: getScaleSize(16),
    },

    headerTextContainer: {
        marginBottom: getScaleSize(4),
    },

    card: {
        backgroundColor: COLORS.white,
        padding: getScaleSize(17),
        borderRadius: getScaleSize(16),
        elevation: 4,
    },

    warningContainer: {
        backgroundColor: '#FEF3F2',
        borderWidth: 1,
        borderColor: '#FECDCA',
        borderRadius: getScaleSize(12),
        paddingVertical: getScaleSize(14),
        paddingHorizontal: getScaleSize(16),
        marginBottom: getScaleSize(20),
    },

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getScaleSize(16),
    },

    topRight: {
        flex: 1.5,
    },

    descriptionBlock: {
        marginBottom: getScaleSize(18),
        gap: getScaleSize(8),
    },

    checkboxGroup: {
        marginTop: getScaleSize(8),
        gap: getScaleSize(4),
    },

    sectionSpacing: {
        marginTop: getScaleSize(6),
        marginBottom: getScaleSize(12),
    },

    blankSentenceWrap: {
        marginBottom: getScaleSize(14),
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: getScaleSize(6),
    },

    inlineBlankInput: {
        minWidth: getScaleSize(70),
        borderBottomWidth: 1,
        borderBottomColor: COLORS._1A1D1F,
        fontSize: getScaleSize(13),
        color: COLORS._1A1D1F,
        textAlign: 'center',
        paddingVertical: getScaleSize(2),
        paddingHorizontal: getScaleSize(6),
    },
});

export default PcaForm;