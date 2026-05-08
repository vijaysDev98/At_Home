import React, { useRef, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
    Input,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';

import { IMAGES } from '../../../assets/images';
import { RootState } from '../../../redux/store';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';

interface HydrationInfusionFormProps {
    title?: string;
}

const HydrationInfusionForm: React.FC<
    HydrationInfusionFormProps
> = ({ title = 'Hydration Infusion Form' }) => {
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
            ? moment(selectedPatient?.dateOfBirth).format(
                'DD/MM/YYYY',
            )
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

        hydrationProducts: [
            {
                productName: '',
                strength: '',

                diluent: '',
                diluentVolume: '',
                withoutDiluent: false,

                durationHours: '',
                durationMinutes: '',
                frequencyPerDay: '',

                centralVenous: false,
                implantedPort: false,
                centralCatheter: false,
                picc: false,

                perineural: false,
                peripheralVenous: false,
                subcutaneous: false,

                gravityMode: false,
                elastomericDiffuser: false,
                electricInfusionPump: false,

                ambulatoryYes: false,
                ambulatoryNo: false,

                preparedInFacility: false,

                startDate: '',
                endDate: '',
                treatmentDurationDays: '',
                totalInfusions: '',

                infuseAlone: false,
            },
        ],
    });

    const addProduct = () => {
        setState(prev => ({
            ...prev,
            hydrationProducts: [
                ...prev.hydrationProducts,
                {
                    productName: '',
                    strength: '',

                    diluent: '',
                    diluentVolume: '',
                    withoutDiluent: false,

                    durationHours: '',
                    durationMinutes: '',
                    frequencyPerDay: '',

                    centralVenous: false,
                    implantedPort: false,
                    centralCatheter: false,
                    picc: false,

                    perineural: false,
                    peripheralVenous: false,
                    subcutaneous: false,

                    gravityMode: false,
                    elastomericDiffuser: false,
                    electricInfusionPump: false,

                    ambulatoryYes: false,
                    ambulatoryNo: false,

                    preparedInFacility: false,

                    startDate: '',
                    endDate: '',
                    treatmentDurationDays: '',
                    totalInfusions: '',

                    infuseAlone: false,
                },
            ],
        }));
    };

    const removeProduct = (index: number) => {
        setState(prev => ({
            ...prev,
            hydrationProducts:
                prev.hydrationProducts.filter(
                    (_, i) => i !== index,
                ),
        }));
    };

    const updateProduct = (
        index: number,
        field: string,
        value: any,
    ) => {
        setState(prev => ({
            ...prev,
            hydrationProducts:
                prev.hydrationProducts.map((item, i) =>
                    i === index
                        ? { ...item, [field]: value }
                        : item,
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
                        {title}
                    </AppText>
                </View>

                <FormPrescriptionDetails
                    state={state}
                    setState={setState}
                />

                <FormPatientSection
                    state={{
                        patientLastName:
                            state.patientLastName,
                        patientFirstName:
                            state.patientFirstName,
                        patientDOB: state.patientDOB,
                        patientWeight:
                            state.patientWeight,
                        patientNIR: state.patientNIR,
                        careRelatedToALD:
                            state.careRelatedToALD,
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
                        prescriberLastName:
                            state.prescriberLastName,
                        prescriberFirstName:
                            state.prescriberFirstName,
                        prescriberPhone:
                            state.prescriberPhone,
                        prescriberRPPS:
                            state.prescriberRPPS,
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
                        hospitalAddress:
                            state.hospitalAddress,
                        finessNo: state.finessNo,
                    }}
                    setState={updates =>
                        setState(prev => ({
                            ...prev,
                            ...updates,
                        }))
                    }
                />

                <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                >
                    Infusion Products
                </AppText>

                {state.hydrationProducts.map(
                    (product, index) => (
                        <View
                            key={index}
                            style={[
                                styles.card,
                                index !==
                                state.hydrationProducts
                                    .length -
                                1 && {
                                    marginBottom:
                                        getScaleSize(16),
                                },
                            ]}
                        >
                            <View style={styles.productHeader}>
                                <AppText
                                    size={getScaleSize(14)}
                                    font={FONTS.Inter.SemiBold}
                                    color={COLORS._1A1D1F}
                                >
                                    Product {index + 1}
                                </AppText>

                                {state.hydrationProducts
                                    .length > 1 && (
                                        <TouchableOpacity
                                            onPress={() =>
                                                removeProduct(index)
                                            }
                                        >
                                            <Text
                                                style={{
                                                    color: COLORS.error,
                                                }}
                                            >
                                                Remove
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                            </View>

                            <Input
                                label="Product Name"
                                value={product.productName}
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'productName',
                                        value,
                                    )
                                }
                                placeholder="Enter Product Name"
                                style={styles.inputField}
                            />

                            <Input
                                label="Strength"
                                value={product.strength}
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'strength',
                                        value,
                                    )
                                }
                                placeholder="Enter Strength"
                                style={styles.inputField}
                            />

                            <View
                                style={[
                                    styles.checkboxGroup,
                                    { flexDirection: 'row' },
                                ]}
                            >
                                <AppCheckBox
                                    value={
                                        !product.withoutDiluent
                                    }
                                    onValueChange={() => {
                                        updateProduct(
                                            index,
                                            'withoutDiluent',
                                            false,
                                        );
                                    }}
                                    label="Diluent"
                                />

                                <AppCheckBox
                                    value={
                                        product.withoutDiluent
                                    }
                                    onValueChange={value => {
                                        updateProduct(
                                            index,
                                            'withoutDiluent',
                                            value,
                                        );

                                        if (value) {
                                            updateProduct(
                                                index,
                                                'diluent',
                                                '',
                                            );

                                            updateProduct(
                                                index,
                                                'diluentVolume',
                                                '',
                                            );
                                        }
                                    }}
                                    label="Without Diluent"
                                />
                            </View>

                            {!product.withoutDiluent && (
                                <>
                                    <Input
                                        label="Diluent"
                                        value={product.diluent}
                                        onChangeText={value =>
                                            updateProduct(
                                                index,
                                                'diluent',
                                                value,
                                            )
                                        }
                                        placeholder="Enter Diluent"
                                        style={styles.inputField}
                                    />

                                    <Input
                                        label="Diluent Volume (ml)"
                                        value={
                                            product.diluentVolume
                                        }
                                        onChangeText={value =>
                                            updateProduct(
                                                index,
                                                'diluentVolume',
                                                value,
                                            )
                                        }
                                        placeholder="Enter Volume"
                                        keyboardType="numeric"
                                        style={styles.inputField}
                                    />
                                </>
                            )}

                            <Input
                                label="Duration Hours"
                                value={product.durationHours}
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'durationHours',
                                        value,
                                    )
                                }
                                placeholder="Hours"
                                keyboardType="numeric"
                                style={styles.inputField}
                            />

                            <Input
                                label="Duration Minutes"
                                value={
                                    product.durationMinutes
                                }
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'durationMinutes',
                                        value,
                                    )
                                }
                                placeholder="Minutes"
                                keyboardType="numeric"
                                style={styles.inputField}
                            />

                            <Input
                                label="Frequency Per Day"
                                value={
                                    product.frequencyPerDay
                                }
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'frequencyPerDay',
                                        value,
                                    )
                                }
                                placeholder="Enter Frequency"
                                keyboardType="numeric"
                                style={styles.inputField}
                            />

                            <AppText
                                size={getScaleSize(13)}
                                font={FONTS.Inter.SemiBold}
                                color={COLORS._1A1D1F}
                                style={styles.sectionLabel}
                            >
                                Route Of Access
                            </AppText>

                            <View style={styles.checkboxGroup}>
                                <AppCheckBox
                                    value={product.centralVenous}
                                    onValueChange={value => {
                                        updateProduct(
                                            index,
                                            'centralVenous',
                                            value,
                                        );

                                        if (!value) {
                                            updateProduct(
                                                index,
                                                'implantedPort',
                                                false,
                                            );

                                            updateProduct(
                                                index,
                                                'centralCatheter',
                                                false,
                                            );

                                            updateProduct(
                                                index,
                                                'picc',
                                                false,
                                            );
                                        }
                                    }}
                                    label="Central Venous (CV)"
                                />

                                <View
                                    style={{
                                        marginLeft:
                                            getScaleSize(15),
                                    }}
                                >
                                    <AppCheckBox
                                        disabled={
                                            !product.centralVenous
                                        }
                                        value={
                                            product.implantedPort
                                        }
                                        onValueChange={value => {
                                            updateProduct(
                                                index,
                                                'implantedPort',
                                                value,
                                            );

                                            if (value) {
                                                updateProduct(
                                                    index,
                                                    'centralVenous',
                                                    true,
                                                );
                                            }
                                        }}
                                        label="Implanted Port"
                                    />

                                    <AppCheckBox
                                        disabled={
                                            !product.centralVenous
                                        }
                                        value={
                                            product.centralCatheter
                                        }
                                        onValueChange={value => {
                                            updateProduct(
                                                index,
                                                'centralCatheter',
                                                value,
                                            );

                                            if (value) {
                                                updateProduct(
                                                    index,
                                                    'centralVenous',
                                                    true,
                                                );
                                            }
                                        }}
                                        label="Central Catheter"
                                    />

                                    <AppCheckBox
                                        disabled={
                                            !product.centralVenous
                                        }
                                        value={product.picc}
                                        onValueChange={value => {
                                            updateProduct(
                                                index,
                                                'picc',
                                                value,
                                            );

                                            if (value) {
                                                updateProduct(
                                                    index,
                                                    'centralVenous',
                                                    true,
                                                );
                                            }
                                        }}
                                        label="Peripherally Inserted Central Catheter (PICC)"
                                    />
                                </View>

                                <AppCheckBox
                                    value={product.perineural}
                                    onValueChange={value =>
                                        updateProduct(
                                            index,
                                            'perineural',
                                            value,
                                        )
                                    }
                                    label="Perineural"
                                />

                                <AppCheckBox
                                    value={
                                        product.peripheralVenous
                                    }
                                    onValueChange={value =>
                                        updateProduct(
                                            index,
                                            'peripheralVenous',
                                            value,
                                        )
                                    }
                                    label="Peripheral Venous"
                                />

                                <AppCheckBox
                                    value={product.subcutaneous}
                                    onValueChange={value =>
                                        updateProduct(
                                            index,
                                            'subcutaneous',
                                            value,
                                        )
                                    }
                                    label="Subcutaneous"
                                />
                            </View>

                            <AppText
                                size={getScaleSize(13)}
                                font={FONTS.Inter.SemiBold}
                                color={COLORS._1A1D1F}
                                style={styles.sectionLabel}
                            >
                                Mode Of Administration
                            </AppText>

                            <View style={styles.checkboxGroup}>
                                <AppCheckBox
                                    value={product.gravityMode}
                                    onValueChange={value =>
                                        updateProduct(
                                            index,
                                            'gravityMode',
                                            value,
                                        )
                                    }
                                    label="Gravity"
                                />

                                <AppCheckBox
                                    value={
                                        product.elastomericDiffuser
                                    }
                                    onValueChange={value =>
                                        updateProduct(
                                            index,
                                            'elastomericDiffuser',
                                            value,
                                        )
                                    }
                                    label="Elastomeric Diffuser"
                                />

                                <AppCheckBox
                                    value={
                                        product.electricInfusionPump
                                    }
                                    onValueChange={value =>
                                        updateProduct(
                                            index,
                                            'electricInfusionPump',
                                            value,
                                        )
                                    }
                                    label="Electric Infusion Pump"
                                />
                            </View>

                            <AppText
                                size={getScaleSize(13)}
                                font={FONTS.Inter.SemiBold}
                                color={COLORS._1A1D1F}
                                style={styles.sectionLabel}
                            >
                                Patient Must Remain
                                Ambulatory?
                            </AppText>

                            <View
                                style={[
                                    styles.checkboxGroup,
                                    { flexDirection: 'row' },
                                ]}
                            >
                                <AppCheckBox
                                    value={
                                        product.ambulatoryYes
                                    }
                                    onValueChange={value => {
                                        updateProduct(
                                            index,
                                            'ambulatoryYes',
                                            value,
                                        );

                                        if (value) {
                                            updateProduct(
                                                index,
                                                'ambulatoryNo',
                                                false,
                                            );
                                        }
                                    }}
                                    label="Yes"
                                />

                                <AppCheckBox
                                    value={
                                        product.ambulatoryNo
                                    }
                                    onValueChange={value => {
                                        updateProduct(
                                            index,
                                            'ambulatoryNo',
                                            value,
                                        );

                                        if (value) {
                                            updateProduct(
                                                index,
                                                'ambulatoryYes',
                                                false,
                                            );
                                        }
                                    }}
                                    label="No"
                                />
                            </View>

                            <AppCheckBox
                                value={
                                    product.preparedInFacility
                                }
                                onValueChange={value =>
                                    updateProduct(
                                        index,
                                        'preparedInFacility',
                                        value,
                                    )
                                }
                                label="Prepared Under Healthcare Facility Supervision"
                            />

                            <View
                                style={styles.dateInputsRow}
                            >
                                <Input
                                    label="Start Date"
                                    value={product.startDate}
                                    onPress={() => {
                                        setPickerType({
                                            type: 'startDate',
                                            index,
                                        });

                                        setOpen(true);
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    style={
                                        styles.halfWidthInput
                                    }
                                />

                                <Input
                                    label="End Date"
                                    value={product.endDate}
                                    onPress={() => {
                                        setPickerType({
                                            type: 'endDate',
                                            index,
                                        });

                                        setOpen(true);
                                    }}
                                    placeholder="DD/MM/YYYY"
                                    style={
                                        styles.halfWidthInput
                                    }
                                />
                            </View>

                            <Input
                                label="Treatment Duration (Days)"
                                value={
                                    product.treatmentDurationDays
                                }
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'treatmentDurationDays',
                                        value,
                                    )
                                }
                                placeholder="Enter Duration"
                                keyboardType="numeric"
                                style={styles.inputField}
                            />

                            <Input
                                label="Total Number Of Infusions"
                                value={
                                    product.totalInfusions
                                }
                                onChangeText={value =>
                                    updateProduct(
                                        index,
                                        'totalInfusions',
                                        value,
                                    )
                                }
                                placeholder="Auto Calculated"
                                editable={false}
                                style={styles.inputField}
                            />

                            <AppCheckBox
                                value={product.infuseAlone}
                                onValueChange={value =>
                                    updateProduct(
                                        index,
                                        'infuseAlone',
                                        value,
                                    )
                                }
                                label="If this treatment must be infused ALONE"
                            />
                        </View>
                    ),
                )}

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
                        + Add Product
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
                            moment(selectedDate).format(
                                'DD/MM/YYYY',
                            );

                        if (
                            pickerType.index !== undefined
                        ) {
                            updateProduct(
                                pickerType.index,
                                pickerType.type,
                                formattedDate,
                            );
                        } else {
                            setState(prev => ({
                                ...prev,
                                [pickerType.type]:
                                    formattedDate,
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

    inputField: {
        marginBottom: getScaleSize(12),
        paddingHorizontal: 0,
    },

    checkboxGroup: {
        gap: getScaleSize(12),
        marginBottom: getScaleSize(12),
    },

    sectionLabel: {
        marginBottom: getScaleSize(8),
    },

    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: getScaleSize(12),
        borderBottomWidth: 1,
        borderBottomColor: COLORS._EFEFEF,
        marginBottom: getScaleSize(10),
    },

    dateInputsRow: {
        flexDirection: 'row',
        gap: getScaleSize(12),
    },

    halfWidthInput: {
        flex: 1,
        marginBottom: getScaleSize(12),
        paddingHorizontal: 0,
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

export default HydrationInfusionForm;