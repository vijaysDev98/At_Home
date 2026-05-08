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
    AppCheckBox,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';
import FormSignature from '../../../components/FormSignature';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const PersonalHygieneCare: React.FC = () => {
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
        prescriberDate: moment().format('DD/MM/YYYY'),
        prescriberRPPS: profileData?.rppsNumber || '',

        assistanceHygieneCare: false,
        completeBedHygieneCare: false,

        bloodPressurePulse: false,
        temperature: false,
        oxygenSaturation: false,

        weeklyWeightMonitoring: false,

        bloodGlucoseMonitoring: false,
        bloodGlucoseTimesPerDay: '',

        dressingLocation: '',
        dressingSimple: false,
        dressingComplex: false,
        dressingTimesPerDay: '',
        dressingEveryDays: '',

        suturesRemovalDays: '',

        urinaryCatheterCare: false,
        urinaryCatheterTimesPerDay: '',

        urinaryCatheterRemovalDate: '',

        urineOutputMonitoring: false,

        unrelatedToALD: false,
        relatedToALD: false,

        prescriptionDays: '',
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
                        Personal Hygiene Care
                    </AppText>
                </View>

                {/* PATIENT INFORMATION */}
                <View style={styles.card}>
                    {renderSectionHeader('Basic Information')}

                    <Input
                        label="Patient’s name"
                        value={state.patientFirstName}
                        onChangeText={(value) =>
                            setState(prev => ({
                                ...prev,
                                patientFirstName: value,
                            }))
                        }
                        placeholder="Enter patient name"
                        style={styles.inputField}
                    />

                    <Input
                        onPress={() => {
                            setPickerType({ type: 'patientDOB' });
                            setOpen(true);
                        }}
                        editable={false}
                        label="Date of birth"
                        placeholder="DD/MM/YYYY"
                        value={state.patientDOB}
                        style={styles.inputField}
                        pointerEvents="none"
                    />
                    <Input
                        label="Prescriber name"
                        value={state.prescriberFirstName}
                        onChangeText={(value) =>
                            setState(prev => ({
                                ...prev,
                                prescriberFirstName: value,
                            }))
                        }
                        placeholder="Enter prescriber identification"
                        style={styles.inputField}
                    />

                    <Input
                        onPress={() => {
                            setPickerType({ type: 'prescriberDate' });
                            setOpen(true);
                        }}
                        editable={false}
                        label="Date"
                        placeholder="DD/MM/YYYY"
                        value={state.prescriberDate}
                        style={styles.inputField}
                        pointerEvents="none"
                    />
                </View>

                <View style={styles.card}>
                    {/* <View style={styles.warningContainer}>
                        <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.SemiBold}
                            color={COLORS._B42318}
                        >
                            This prescription form is intended exclusively for
                            the prescription of nursing care.
                        </AppText>

                        <AppText
                            size={getScaleSize(12)}
                            color={COLORS._B42318}
                            style={styles.warningSubText}
                        >
                            Cross out any items that do not apply.
                        </AppText>
                    </View> */}

                    {renderSectionHeader(
                        `To be carried out by a private/home care nurse at the patient's home, every day, including Sundays and public holidays`,
                    )}

                    <AppText
                        size={getScaleSize(14)}
                        font={FONTS.Inter.Bold}
                    >
                        Assistance with hygiene care:
                    </AppText>

                    <View style={styles.checkboxGroup}>
                        <AppCheckBox
                            value={state.assistanceHygieneCare}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    assistanceHygieneCare: value,
                                }))
                            }
                            label="Assistance with hygiene care twice a day"
                        />

                        <AppCheckBox
                            value={state.completeBedHygieneCare}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    completeBedHygieneCare: value,
                                }))
                            }
                            label="Complete bed hygiene care twice a day"
                        />
                    </View>

                    {/* VITALS */}
                    <AppText
                        size={getScaleSize(14)}
                        font={FONTS.Inter.Bold}
                    >
                        Monitoring of vital signs
                    </AppText>

                    <View style={[styles.checkboxGroup, { marginLeft: getScaleSize(16) }]}>
                        <AppCheckBox
                            value={state.bloodPressurePulse}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    bloodPressurePulse: value,
                                }))
                            }
                            label="Blood pressure / Pulse"
                        />

                        <AppCheckBox
                            value={state.temperature}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    temperature: value,
                                }))
                            }
                            label="Temperature"
                        />

                        <AppCheckBox
                            value={state.oxygenSaturation}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    oxygenSaturation: value,
                                }))
                            }
                            label="Oxygen saturation"
                        />
                    </View>

                    <AppCheckBox
                        value={state.weeklyWeightMonitoring}
                        onValueChange={(value) =>
                            setState(prev => ({
                                ...prev,
                                weeklyWeightMonitoring: value,
                            }))
                        }
                        label="Weekly monitoring of body weight with maintenance of a weight chart"
                    />

                    {/* BLOOD GLUCOSE */}
                    <View style={styles.sectionSpacing}>
                        <AppText
                            size={getScaleSize(14)}
                            font={FONTS.Inter.Bold}
                        >
                            Preparation and administration of treatments
                        </AppText>
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <AppCheckBox
                            value={state.bloodGlucoseMonitoring}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    bloodGlucoseMonitoring: value,
                                }))
                            }
                            label=""
                            containerStyle={styles.inlineCheckbox}
                            labelStyle={styles.emptyCheckboxLabel}
                        />

                        <AppText size={getScaleSize(13)}>
                            Capillary blood glucose monitoring and insulin
                        </AppText>
                        <AppText size={getScaleSize(13)}>
                            injection according to medical prescription
                        </AppText>
                        <TextInput
                            value={state.bloodGlucoseTimesPerDay}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    bloodGlucoseTimesPerDay: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            times per day.
                        </AppText>
                    </View>

                    {/* DRESSINGS */}
                    <View style={styles.sectionSpacing}>
                        <AppText
                            size={getScaleSize(14)}
                            font={FONTS.Inter.Bold}
                        >
                            Dressing changes
                        </AppText>
                    </View>

                    <Input
                        label="Location"
                        placeholder="Enter location"
                        value={state.dressingLocation}
                        onChangeText={(value) =>
                            setState(prev => ({
                                ...prev,
                                dressingLocation: value,
                            }))
                        }
                        style={styles.inputField}
                    />

                    <View style={styles.checkboxGroup}>
                        <AppCheckBox
                            value={state.dressingSimple}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    dressingSimple: value,
                                }))
                            }
                            label="Simple"
                        />

                        <AppCheckBox
                            value={state.dressingComplex}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    dressingComplex: value,
                                }))
                            }
                            label="Complex"
                        />
                    </View>

                    <View style={styles.blankSentenceWrap}>
                        <TextInput
                            value={state.dressingTimesPerDay}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    dressingTimesPerDay: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            times per day / every
                        </AppText>

                        <TextInput
                            value={state.dressingEveryDays}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    dressingEveryDays: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            days
                        </AppText>
                    </View>

                    {/* SUTURES */}
                    <View style={styles.blankSentenceWrap}>
                        <AppCheckBox
                            value={!!state.suturesRemovalDays}
                            onValueChange={() => { }}
                            label=""
                            containerStyle={styles.inlineCheckbox}
                            labelStyle={styles.emptyCheckboxLabel}
                        />

                        <AppText size={getScaleSize(13)}>
                            Removal of sutures or staples in
                        </AppText>

                        <TextInput
                            value={state.suturesRemovalDays}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    suturesRemovalDays: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            days
                        </AppText>
                    </View>

                    {/* URINARY */}
                    <View style={styles.blankSentenceWrap}>
                        <AppCheckBox
                            value={state.urinaryCatheterCare}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    urinaryCatheterCare: value,
                                }))
                            }
                            label=""
                            containerStyle={styles.inlineCheckbox}
                            labelStyle={styles.emptyCheckboxLabel}
                        />

                        <AppText size={getScaleSize(13)}>
                            Urinary catheter care
                        </AppText>

                        <TextInput
                            value={state.urinaryCatheterTimesPerDay}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    urinaryCatheterTimesPerDay: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            times per day
                        </AppText>
                    </View>

                    <Input
                        editable={false}
                        label="Removal of the urinary catheter on"
                        value={state.urinaryCatheterRemovalDate}
                        style={styles.inputField}
                        pointerEvents="none"
                    />

                    <AppCheckBox
                        value={state.urineOutputMonitoring}
                        onValueChange={(value) =>
                            setState(prev => ({
                                ...prev,
                                urineOutputMonitoring: value,
                            }))
                        }
                        label="Monitoring of urine output"
                    />

                    {/* ALD */}
                    <View style={styles.sectionSpacing}>
                        <AppCheckBox
                            value={state.unrelatedToALD}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    unrelatedToALD: value,
                                }))
                            }
                            label="Prescriptions not related to the recognized long-term condition"
                        />

                        <View style={styles.subTextBlock}>
                            <AppText
                                size={getScaleSize(12)}
                                color={COLORS._1A1D1F}
                            >
                                (INTERCURRENT ILLNESSES)
                            </AppText>
                        </View>

                        <AppCheckBox
                            value={state.relatedToALD}
                            onValueChange={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    relatedToALD: value,
                                }))
                            }
                            label="Prescriptions related to the treatment of the recognized long-term condition"
                        />

                        <View style={styles.subTextBlock}>
                            <AppText
                                size={getScaleSize(12)}
                                color={COLORS._1A1D1F}
                            >
                                (EXEMPTING LONG-TERM CONDITION)
                            </AppText>
                        </View>
                    </View>

                    {/* MEDICAL CERTIFICATION */}
                    <View style={styles.sectionSpacing}>
                        <AppText
                            size={getScaleSize(14)}
                            font={FONTS.Inter.Bold}
                        >
                            Medical certification
                        </AppText>
                    </View>

                    <AppText
                        size={getScaleSize(13)}
                        color={COLORS._1A1D1F}
                        style={styles.descriptionText}
                    >
                        I, the undersigned Dr., after examining the patient,
                        certify that his/her state of health requires nursing
                        care at home.
                    </AppText>

                    <View style={styles.blankSentenceWrap}>
                        <AppText size={getScaleSize(13)}>
                            Prescription for
                        </AppText>

                        <TextInput
                            value={state.prescriptionDays}
                            onChangeText={(value) =>
                                setState(prev => ({
                                    ...prev,
                                    prescriptionDays: value,
                                }))
                            }
                            style={styles.inlineBlankInput}
                            keyboardType="numeric"
                        />

                        <AppText size={getScaleSize(13)}>
                            days, renewable
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

    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getScaleSize(16),
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

    warningSubText: {
        marginTop: getScaleSize(4),
    },

    descriptionText: {
        lineHeight: getScaleSize(20),
    },

    checkboxGroup: {
        gap: getScaleSize(6),
        marginBottom: getScaleSize(8),
        marginTop: getScaleSize(4)
    },

    sectionSpacing: {
        marginTop: getScaleSize(14),
        marginBottom: getScaleSize(12),
    },

    inputField: {
        marginBottom: getScaleSize(12),
        paddingHorizontal: 0,
    },

    blankSentenceWrap: {
        marginBottom: getScaleSize(14),
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        // gap: getScaleSize(6),
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

    inlineCheckbox: {
        flex: 0,
        marginRight: getScaleSize(2),
    },

    emptyCheckboxLabel: {
        flex: 0,
        width: 0,
    },

    subTextBlock: {
        marginLeft: getScaleSize(34),
        marginTop: getScaleSize(-4),
        marginBottom: getScaleSize(10),
    },
});

export default PersonalHygieneCare;