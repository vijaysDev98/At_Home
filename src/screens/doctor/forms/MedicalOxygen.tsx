import React, { useRef, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector } from 'react-redux';

import {
    AppCheckBox,
    AppText,
    FormFacilitySection,
    FormPatientSection,
    FormPrescriberSection,
    FormSignature,
    WarningSheet,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';

import { IMAGES } from '../../../assets/images';
import { RootState } from '../../../redux/store';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';

const MedicalOxygen = () => {
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
        index?: number;
    } | null>(null);

    const [state, setState] = useState({
        prescriptionDate: moment().format('DD/MM/YYYY'),
        startTherapy: false,
        renewalTherapy: false,

        patientLastName: '',
        patientFirstName: selectedPatient?.fullName || '',
        patientDOB: selectedPatient?.dateOfBirth
            ? moment(selectedPatient?.dateOfBirth).format('DD/MM/YYYY')
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

        oxygenProducts: [
            {
                stationaryConcentrator: false,
                compressedOxygenCylinder: false,

                ambulatoryCylinderYes: false,
                ambulatoryCylinderNo: false,

                oxygenNasalCannula: false,
                oxygenMask: false,

                durationHoursPerDay: '',
                durationMonth: '',

                flowRateAtRest: '',
                flowRateDuringExertion: '',

                humidifierYes: false,
                humidifierNo: false,

                backupSource: false,
                mobilitySource: false,
                pulseOximeter: false,
                nonKinkingTubing: false,

                spo2Value: '',

                prescriberPhoneNumber: '',

                palliativeCareYes: false,
                palliativeCareNo: false,
            },
        ],
    });

    const addProduct = () => {
        setState(prev => ({
            ...prev,
            oxygenProducts: [
                ...prev.oxygenProducts,
                {
                    stationaryConcentrator: false,
                    compressedOxygenCylinder: false,

                    ambulatoryCylinderYes: false,
                    ambulatoryCylinderNo: false,

                    oxygenNasalCannula: false,
                    oxygenMask: false,

                    durationHoursPerDay: '',
                    durationMonth: '',

                    flowRateAtRest: '',
                    flowRateDuringExertion: '',

                    humidifierYes: false,
                    humidifierNo: false,

                    backupSource: false,
                    mobilitySource: false,
                    pulseOximeter: false,
                    nonKinkingTubing: false,

                    spo2Value: '',

                    prescriberPhoneNumber: '',

                    palliativeCareYes: false,
                    palliativeCareNo: false,
                },
            ],
        }));
    };

    const removeProduct = (index: number) => {
        setState(prev => ({
            ...prev,
            oxygenProducts: prev.oxygenProducts.filter((_, i) => i !== index),
        }));
    };

    const updateProduct = (
        index: number,
        field: string,
        value: boolean | string,
    ) => {
        setState(prev => ({
            ...prev,
            oxygenProducts: prev.oxygenProducts.map((item, i) =>
                i === index ? { ...item, [field]: value } : item,
            ),
        }));
    };

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
                        Medical Oxygen Form
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
                    setState={updates =>
                        setState(prev => ({
                            ...prev,
                            ...updates,
                        }))
                    }
                />

                <FormPrescriberSection
                    state={{
                        prescriberLastName: state.prescriberLastName,
                        prescriberFirstName: state.prescriberFirstName,
                        prescriberPhone: state.prescriberPhone,
                        prescriberRPPS: state.prescriberRPPS,
                    }}
                    setState={updates =>
                        setState(prev => ({
                            ...prev,
                            ...updates,
                        }))
                    }
                />

                <FormFacilitySection
                    state={{
                        hospitalName: state.hospitalName,
                        hospitalAddress: state.hospitalAddress,
                        finessNo: state.finessNo,
                    }}
                    setState={updates =>
                        setState(prev => ({
                            ...prev,
                            ...updates,
                        }))
                    }
                />

                {state.oxygenProducts.map((product, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.productHeader}>
                            <AppText
                                size={getScaleSize(14)}
                                font={FONTS.Inter.SemiBold}
                                color={COLORS._1A1D1F}
                            >
                                Oxygen Prescription {index + 1}
                            </AppText>

                            {state.oxygenProducts.length > 1 && (
                                <TouchableOpacity onPress={() => removeProduct(index)}>
                                    <Text style={{ color: COLORS.error }}>
                                        Remove
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.checkboxGroup}>
                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                                font={FONTS.Inter.Medium}
                            >
                                Type of primary oxygen (O₂) source:
                            </AppText>

                            <AppCheckBox
                                value={product.stationaryConcentrator}
                                onValueChange={value =>
                                    updateProduct(index, 'stationaryConcentrator', value)
                                }
                                label="Stationary concentrator"
                            />

                            <AppCheckBox
                                value={product.compressedOxygenCylinder}
                                onValueChange={value =>
                                    updateProduct(index, 'compressedOxygenCylinder', value)
                                }
                                label="Compressed oxygen cylinder"
                            />
                        </View>

                        <View style={styles.rowCenter}>
                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                                font={FONTS.Inter.Medium}
                            >
                                Ambulatory cylinder:
                            </AppText>

                            <AppCheckBox
                                value={product.ambulatoryCylinderYes}
                                onValueChange={value => {
                                    updateProduct(index, 'ambulatoryCylinderYes', value);

                                    if (value) {
                                        updateProduct(index, 'ambulatoryCylinderNo', false);
                                    }
                                }}
                                label="YES"
                            />

                            <AppCheckBox
                                value={product.ambulatoryCylinderNo}
                                onValueChange={value => {
                                    updateProduct(index, 'ambulatoryCylinderNo', value);

                                    if (value) {
                                        updateProduct(index, 'ambulatoryCylinderYes', false);
                                    }
                                }}
                                label="NO"
                            />
                        </View>

                        <View style={styles.rowCenter}>
                            <AppCheckBox
                                value={product.oxygenNasalCannula}
                                onValueChange={value =>
                                    updateProduct(index, 'oxygenNasalCannula', value)
                                }
                                label="Nasal cannula"
                            />

                            <AppCheckBox
                                value={product.oxygenMask}
                                onValueChange={value =>
                                    updateProduct(index, 'oxygenMask', value)
                                }
                                label="Oxygen mask"
                            />
                        </View>

                        <AppText
                            size={getScaleSize(14)}
                            color={COLORS._1A1D1F}
                            font={FONTS.Inter.Medium}
                        >
                            Duration:
                        </AppText>

                        <View style={styles.inlineRow}>
                            <TextInput
                                value={product.durationHoursPerDay}
                                onChangeText={value =>
                                    updateProduct(index, 'durationHoursPerDay', value)
                                }
                                style={styles.blankInput}
                                keyboardType="numeric"
                            />

                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                            >
                                hours / day / Month
                            </AppText>
                        </View>

                        <AppText
                            size={getScaleSize(14)}
                            color={COLORS._1A1D1F}
                            font={FONTS.Inter.Medium}
                        >
                            Flow rate:
                        </AppText>

                        <View style={styles.inlineRow}>
                            <TextInput
                                value={product.flowRateAtRest}
                                onChangeText={value =>
                                    updateProduct(index, 'flowRateAtRest', value)
                                }
                                style={styles.blankInput}
                                keyboardType="numeric"
                            />

                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                            >
                                L/min at rest and
                            </AppText>

                            <TextInput
                                value={product.flowRateDuringExertion}
                                onChangeText={value =>
                                    updateProduct(index, 'flowRateDuringExertion', value)
                                }
                                style={styles.blankInput}
                                keyboardType="numeric"
                            />

                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                            >
                                L/min during exertion
                            </AppText>
                        </View>

                        <AppText
                            size={getScaleSize(14)}
                            color={COLORS._1A1D1F}
                            font={FONTS.Inter.Medium}
                            style={styles.sectionLabel}
                        >
                            Humidifier compliant with NF EN ISO 8185 standard:
                        </AppText>

                        <View style={styles.rowCenter}>
                            <AppCheckBox
                                value={product.humidifierYes}
                                onValueChange={value => {
                                    updateProduct(index, 'humidifierYes', value);

                                    if (value) {
                                        updateProduct(index, 'humidifierNo', false);
                                    }
                                }}
                                label="YES"
                            />

                            <AppCheckBox
                                value={product.humidifierNo}
                                onValueChange={value => {
                                    updateProduct(index, 'humidifierNo', value);

                                    if (value) {
                                        updateProduct(index, 'humidifierYes', false);
                                    }
                                }}
                                label="NO"
                            />
                        </View>

                        <View style={styles.checkboxGroup}>
                            <AppCheckBox
                                value={product.backupSource}
                                onValueChange={value =>
                                    updateProduct(index, 'backupSource', value)
                                }
                                label="Backup source: compressed oxygen cylinder with pressure regulator and appropriate flowmeter"
                            />

                            <AppCheckBox
                                value={product.mobilitySource}
                                onValueChange={value =>
                                    updateProduct(index, 'mobilitySource', value)
                                }
                                label="Mobility source: 1 small compressed oxygen cylinder with pressure regulator and appropriate flowmeter"
                            />

                            <AppCheckBox
                                value={product.pulseOximeter}
                                onValueChange={value =>
                                    updateProduct(index, 'pulseOximeter', value)
                                }
                                label="Provision of a pulse oximeter"
                            />

                            <AppCheckBox
                                value={product.nonKinkingTubing}
                                onValueChange={value =>
                                    updateProduct(index, 'nonKinkingTubing', value)
                                }
                                label="Non-kinking star-lumen oxygen tubing if possible"
                            />
                        </View>

                        <View style={styles.inlineRow}>
                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                            >
                                Adjust oxygen to obtain an SpO₂ ≥
                            </AppText>

                            <TextInput
                                value={product.spo2Value}
                                onChangeText={value =>
                                    updateProduct(index, 'spo2Value', value)
                                }
                                style={styles.blankInput}
                                keyboardType="numeric"
                            />

                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                            >
                                %
                            </AppText>
                        </View>

                        <View style={styles.phoneWrapper}>
                            <AppText
                                size={getScaleSize(14)}
                                color={COLORS._1A1D1F}
                                style={{ marginBottom: getScaleSize(10) }}
                            >
                                Prescriber's phone number to call if contact is necessary:
                            </AppText>

                            <TextInput
                                value={product.prescriberPhoneNumber}
                                onChangeText={value =>
                                    updateProduct(index, 'prescriberPhoneNumber', value)
                                }
                                style={styles.longBlankInput}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <AppText
                            size={getScaleSize(12)}
                            color={COLORS._6F767E}
                            font={FONTS.Inter.Regular}
                        >
                            * Cross out any items that do not apply
                        </AppText>
                    </View>
                ))}

                <View style={styles.card}>
                    <AppText
                        size={getScaleSize(15)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        style={styles.sectionTitle}
                    >
                        PATIENT INSTRUCTIONS
                    </AppText>

                    <AppText style={styles.instructionText}>
                        It is essential to follow the instructions carefully.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        Use your oxygen daily for at least the duration indicated
                        on your prescription.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        If oxygen comes into contact with a flame or combustible
                        material, there is a risk of explosion, fire, and/or
                        serious burns.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        NEVER smoke or vape while using oxygen.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        NEVER smoke in the room where your oxygen is installed.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        NEVER cook while using oxygen.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        NEVER use aerosol sprays or flammable solvents near oxygen
                        (alcohol, gasoline, etc.).
                    </AppText>

                    <AppText style={styles.instructionText}>
                        NEVER apply greasy ointment to the face and never handle
                        the equipment with greasy hands.
                    </AppText>

                    <AppText style={styles.instructionText}>
                        NEVER keep the equipment near heat sources.
                    </AppText>
                </View>

                <View style={styles.card}>
                    <AppText
                        size={getScaleSize(15)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        style={styles.sectionTitle}
                    >
                        HOME OXYGEN THERAPY AS PART OF PALLIATIVE CARE
                    </AppText>

                    <View style={styles.rowCenter}>
                        <AppCheckBox
                            value={
                                state.oxygenProducts[0].palliativeCareYes
                            }
                            onValueChange={value => {
                                updateProduct(
                                    0,
                                    'palliativeCareYes',
                                    value,
                                );

                                if (value) {
                                    updateProduct(
                                        0,
                                        'palliativeCareNo',
                                        false,
                                    );
                                }
                            }}
                            label="YES"
                        />

                        <AppCheckBox
                            value={
                                state.oxygenProducts[0].palliativeCareNo
                            }
                            onValueChange={value => {
                                updateProduct(
                                    0,
                                    'palliativeCareNo',
                                    value,
                                );

                                if (value) {
                                    updateProduct(
                                        0,
                                        'palliativeCareYes',
                                        false,
                                    );
                                }
                            }}
                            label="NO"
                        />
                    </View>

                    <AppText
                        size={getScaleSize(12)}
                        color={COLORS._6F767E}
                        font={FONTS.Inter.Regular}
                    >
                        Cross out any items that do not apply
                    </AppText>
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addProduct}
                >
                    <Image
                        source={IMAGES.add_patient}
                        style={styles.addIcon}
                    />

                    <AppText
                        size={getScaleSize(13)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._526674}
                    >
                        + Add Prescription
                    </AppText>
                </TouchableOpacity>

                <FormSignature />
            </ScrollView>

            <DatePicker
                modal
                open={open}
                date={date}
                mode="date"
                onConfirm={selectedDate => {
                    setOpen(false);

                    if (pickerType) {
                        const formattedDate =
                            moment(selectedDate).format('DD/MM/YYYY');

                        if (pickerType.index !== undefined) {
                            updateProduct(
                                pickerType.index,
                                pickerType.type,
                                formattedDate,
                            );
                        } else {
                            setState(prev => ({
                                ...prev,
                                [pickerType.type]: formattedDate,
                            }));
                        }
                    }
                }}
                onCancel={() => setOpen(false)}
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

    headerTextContainer: {
        marginBottom: getScaleSize(4),
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: getScaleSize(190),
        gap: getScaleSize(12),
        marginHorizontal: getScaleSize(16),
    },

    card: {
        backgroundColor: COLORS.white,
        padding: getScaleSize(17),
        borderRadius: getScaleSize(16),
        elevation: 4,
    },

    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: getScaleSize(12),
        borderBottomWidth: 1,
        borderBottomColor: COLORS._EFEFEF,
        marginBottom: getScaleSize(16),
    },

    checkboxGroup: {
        gap: getScaleSize(10),
        marginBottom: getScaleSize(16),
    },

    rowCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getScaleSize(16),
        flexWrap: 'wrap',
    },

    inlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: getScaleSize(20),
        gap: getScaleSize(8),
    },

    blankInput: {
        minWidth: getScaleSize(70),
        borderBottomWidth: 1,
        borderBottomColor: COLORS._1A1D1F,
        paddingVertical: getScaleSize(4),
        paddingHorizontal: getScaleSize(2),
        fontSize: getScaleSize(14),
        color: COLORS._1A1D1F,
    },

    longBlankInput: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: COLORS._1A1D1F,
        paddingVertical: getScaleSize(4),
        fontSize: getScaleSize(14),
        color: COLORS._1A1D1F,
    },

    phoneWrapper: {
        marginBottom: getScaleSize(20),
    },

    sectionLabel: {
        marginBottom: getScaleSize(12),
    },

    sectionTitle: {
        marginBottom: getScaleSize(14),
    },

    instructionText: {
        marginBottom: getScaleSize(10),
        lineHeight: getScaleSize(22),
    },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: getScaleSize(8),
        paddingVertical: getScaleSize(12),
        borderRadius: getScaleSize(8),
        borderWidth: 1,
        borderColor: COLORS._EFEFEF,
        backgroundColor: COLORS._F8F9FA,
    },

    addIcon: {
        width: getScaleSize(16),
        height: getScaleSize(16),
        resizeMode: 'contain',
    },
});

export default MedicalOxygen;