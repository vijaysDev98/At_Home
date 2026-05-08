import React, { useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector } from 'react-redux';

import {
  AppCheckBox,
  AppText,
  FormSignature,
  WarningSheet,
  Input,
  FormPatientSection,
  FormPrescriberSection,
} from '../../../components';

import FormPrescriptionDetails from '../../../components/FormPrescriptionDetails';

import { RootState } from '../../../redux/store';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';

const WoundCareForm: React.FC = () => {
  const selectedPatient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );

  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const warningSheetRef = useRef<ActionSheetRef>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const [pickerType, setPickerType] = useState<string | null>(null);

  const [state, setState] = useState({
    prescriptionDate: moment().format('DD/MM/YYYY'),

    patientLastName: '',
    patientFirstName: selectedPatient?.fullName || '',
    patientDOB: selectedPatient?.dateOfBirth
      ? moment(selectedPatient.dateOfBirth).format('DD/MM/YYYY')
      : '',

    careRelatedToALD: '',
    careNotRelatedToALD: '',

    prescriberLastName: '',
    prescriberFirstName: profileData?.fullName || '',
    prescriberPhone: profileData?.phoneNumber || '',
    prescriberRPPS: profileData?.rppsNumber || '',
    prescriberFINESS: profileData?.finessNumber || '',

    woundSize: '',
    woundType: '',
    woundCategory: '',
    otherWound: '',

    dressingType: '',
    packing: false,

    packingGoals: {
      fillCavity: false,
      occupyDeadSpace: false,
      preventClosure: false,
    },

    exudate: '',
    cavity: '',
    septic: '',

    materials: {
      dressingKitsChecked: false,
      kitsPerDay: '',

      retentionBandageChecked: false,
      bandagePerDay: '',

      cleaningChecked: false,
      cleaningWith: '',

      disinfectionChecked: false,
      disinfectionWith: '',

      firstLayer: '',
      secondLayer: '',
    },

    treatmentDuration: '',
    untilHealed: false,
  });

  const renderSectionHeader = (
    title: string,
    icon?: any,
  ) => (
    <View style={styles.sectionHeader}>
      {icon && (
        <Image
          source={icon}
          style={styles.sectionIcon}
        />
      )}

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
            Wound Dressing Prescription Support Form
          </AppText>
        </View>

        <FormPrescriptionDetails
          state={state}
          setState={setState}
        />

        <FormPrescriberSection
          state={state}
          setState={setState}
          title={'Physician Information'}
          showFiness={true}
        />

        <FormPatientSection
          state={state}
          setState={setState}
          showDate={true}
          showNALD={true}
          showWeight={false}
          showALD={true}
          showNIR={false}
        />

        {/* WOUND CHARACTERISTICS */}
        <View style={styles.card}>
          {renderSectionHeader(
            'Type Of Wound',
          )}

          <Input
            label="Wound Size"
            placeholder="e.g. 5x5 cm"
            value={state.woundSize}
            onChangeText={value =>
              setState(prev => ({
                ...prev,
                woundSize: value,
              }))
            }
            style={styles.inputField}
          />

          <View style={styles.checkboxRow}>
            <AppCheckBox
              value={
                state.woundType ===
                'Acute'
              }
              onValueChange={() =>
                setState(prev => ({
                  ...prev,
                  woundType: 'Acute',
                }))
              }
              label="Acute"
            />

            <AppCheckBox
              value={
                state.woundType ===
                'Chronic'
              }
              onValueChange={() =>
                setState(prev => ({
                  ...prev,
                  woundType:
                    'Chronic',
                }))
              }
              label="Chronic"
            />
          </View>

          <View style={styles.checkboxGroup}>
            {[
              'Ulcer',
              'Pressure ulcer',
              'Postoperative wound',
              'Cavity wound',
              'Wound with fibrin',
            ].map(item => (
              <AppCheckBox
                key={item}
                value={
                  state.woundCategory ===
                  item
                }
                onValueChange={() =>
                  setState(prev => ({
                    ...prev,
                    woundCategory:
                      item,
                  }))
                }
                label={item}
              />
            ))}
          </View>

          <Input
            label="Other"
            placeholder="Specify..."
            value={state.otherWound}
            onChangeText={value =>
              setState(prev => ({
                ...prev,
                otherWound: value,
              }))
            }
            style={styles.inputField}
          />
        </View>

        {/* DRESSING */}
        <View style={styles.card}>
          {renderSectionHeader(
            'Desired Dressing Type',
          )}

          <View style={styles.checkboxGroup}>
            {[
              'Hyperabsorbent',
              'Post-op',
              'Debridement',
              'Hydrocolloid',
            ].map(item => (
              <AppCheckBox
                key={item}
                value={
                  state.dressingType ===
                  item
                }
                onValueChange={() =>
                  setState(prev => ({
                    ...prev,
                    dressingType:
                      item,
                  }))
                }
                label={item}
              />
            ))}
          </View>

          <AppCheckBox
            value={state.packing}
            onValueChange={value =>
              setState(prev => ({
                ...prev,
                packing: value,
              }))
            }
            label="Packing"
          />

          {state.packing && (
            <View
              style={
                styles.nestedCheckbox
              }
            >
              <AppCheckBox
                value={
                  state.packingGoals
                    .fillCavity
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    packingGoals:
                    {
                      ...prev.packingGoals,
                      fillCavity:
                        value,
                    },
                  }))
                }
                label="Fill cavity"
              />

              <AppCheckBox
                value={
                  state.packingGoals
                    .occupyDeadSpace
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    packingGoals:
                    {
                      ...prev.packingGoals,
                      occupyDeadSpace:
                        value,
                    },
                  }))
                }
                label="Occupy dead space"
              />

              <AppCheckBox
                value={
                  state.packingGoals
                    .preventClosure
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    packingGoals:
                    {
                      ...prev.packingGoals,
                      preventClosure:
                        value,
                    },
                  }))
                }
                label="Prevent premature closure"
              />
            </View>
          )}
        </View>

        {/* WOUND STATUS */}
        <View style={styles.card}>
          {renderSectionHeader(
            'Wound Status',
          )}

          {[
            {
              key: 'exudate',
              title: 'Exudate',
            },
            {
              key: 'cavity',
              title: 'Cavity',
            },
            {
              key: 'septic',
              title: 'Septic wound',
            },
          ].map(item => (
            <View
              key={item.key}
              style={
                styles.statusRow
              }
            >
              <AppText
                size={getScaleSize(
                  13,
                )}
                font={
                  FONTS.Inter
                    .SemiBold
                }
              >
                {item.title}
              </AppText>

              <View
                style={
                  styles.checkboxRow
                }
              >
                <AppCheckBox
                  value={
                    (state as any)[
                    item.key
                    ] === 'Yes'
                  }
                  onValueChange={() =>
                    setState(
                      prev => ({
                        ...prev,
                        [item.key]:
                          'Yes',
                      }),
                    )
                  }
                  label="Yes"
                />

                <AppCheckBox
                  value={
                    (state as any)[
                    item.key
                    ] === 'No'
                  }
                  onValueChange={() =>
                    setState(
                      prev => ({
                        ...prev,
                        [item.key]:
                          'No',
                      }),
                    )
                  }
                  label="No"
                />
              </View>
            </View>
          ))}
        </View>

        {/* MATERIALS */}
        <View style={styles.card}>
          {renderSectionHeader(
            'Required Materials And Applicable Protocol',
          )}

          <View
            style={
              styles.protocolContainer
            }
          >
            <View
              style={styles.protocolRow}
            >
              <CheckBox
                value={
                  state.materials
                    .dressingKitsChecked
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      dressingKitsChecked:
                        value,
                    },
                  }))
                }
                tintColors={{
                  true: COLORS.primary,
                  false:
                    COLORS._6F767E,
                }}
              />

              <AppText
                size={getScaleSize(13)}
              >
                Dressing kits
              </AppText>

              <Input
                value={
                  state.materials
                    .kitsPerDay
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      kitsPerDay:
                        value,
                    },
                  }))
                }
                style={
                  styles.blankInputSmall
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
                keyboardType="numeric"
              />

              <AppText
                size={getScaleSize(13)}
              >
                per day
              </AppText>
            </View>

            <View
              style={styles.protocolRow}
            >
              <CheckBox
                value={
                  state.materials
                    .retentionBandageChecked
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      retentionBandageChecked:
                        value,
                    },
                  }))
                }
                tintColors={{
                  true: COLORS.primary,
                  false:
                    COLORS._6F767E,
                }}
              />

              <AppText
                size={getScaleSize(13)}
              >
                Nylex or Velpeau
                retention bandage
              </AppText>

              <Input
                value={
                  state.materials
                    .bandagePerDay
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      bandagePerDay:
                        value,
                    },
                  }))
                }
                style={
                  styles.blankInputSmall
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
                keyboardType="numeric"
              />

              <AppText
                size={getScaleSize(13)}
              >
                per day
              </AppText>
            </View>

            <View
              style={styles.protocolRow}
            >
              <CheckBox
                value={
                  state.materials
                    .cleaningChecked
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      cleaningChecked:
                        value,
                    },
                  }))
                }
                tintColors={{
                  true: COLORS.primary,
                  false:
                    COLORS._6F767E,
                }}
              />

              <AppText
                size={getScaleSize(13)}
              >
                Cleaning with
              </AppText>

              <Input
                value={
                  state.materials
                    .cleaningWith
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      cleaningWith:
                        value,
                    },
                  }))
                }
                style={
                  styles.blankInputLarge
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
              />
            </View>

            <View
              style={styles.protocolRow}
            >
              <CheckBox
                value={
                  state.materials
                    .disinfectionChecked
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      disinfectionChecked:
                        value,
                    },
                  }))
                }
                tintColors={{
                  true: COLORS.primary,
                  false:
                    COLORS._6F767E,
                }}
              />

              <AppText
                size={getScaleSize(13)}
              >
                Disinfection with
              </AppText>

              <Input
                value={
                  state.materials
                    .disinfectionWith
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      disinfectionWith:
                        value,
                    },
                  }))
                }
                style={
                  styles.blankInputLarge
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
              />
            </View>

            <View
              style={
                styles.protocolTextRow
              }
            >
              <AppText
                size={getScaleSize(13)}
              >
                1st layer in contact
                with the wound
              </AppText>

              <Input
                value={
                  state.materials
                    .firstLayer
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      firstLayer:
                        value,
                    },
                  }))
                }
                style={
                  styles.blankInputMedium
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
              />
            </View>

            <View
              style={
                styles.protocolTextRow
              }
            >
              <AppText
                size={getScaleSize(13)}
              >
                2nd overlapping
                layer
              </AppText>

              <Input
                value={
                  state.materials
                    .secondLayer
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    materials: {
                      ...prev.materials,
                      secondLayer:
                        value,
                    },
                  }))
                }
                style={
                  styles.blankInputMedium
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
              />
            </View>
          </View>
        </View>

        {/* TREATMENT DURATION */}
        <View style={styles.card}>
          {renderSectionHeader(
            'Treatment Duration',
          )}

          <View
            style={
              styles.protocolContainer
            }
          >
            <View
              style={styles.protocolRow}
            >
              <CheckBox
                value={
                  !state.untilHealed
                }
                onValueChange={() =>
                  setState(prev => ({
                    ...prev,
                    untilHealed: false,
                  }))
                }
                tintColors={{
                  true: COLORS.primary,
                  false:
                    COLORS._6F767E,
                }}
              />

              <AppText
                size={getScaleSize(13)}
              >
                Treatment duration
              </AppText>

              <Input
                value={
                  state.treatmentDuration
                }
                onChangeText={value =>
                  setState(prev => ({
                    ...prev,
                    treatmentDuration:
                      value,
                    untilHealed:
                      false,
                  }))
                }
                style={
                  styles.blankInputMedium
                }
                inputWrapperStyle={
                  styles.blankInputWrapper
                }
                inputStyle={
                  styles.blankInputText
                }
              />

              <AppText
                size={getScaleSize(13)}
              >
                or
              </AppText>
            </View>

            <View
              style={styles.protocolRow}
            >
              <CheckBox
                value={
                  state.untilHealed
                }
                onValueChange={value =>
                  setState(prev => ({
                    ...prev,
                    untilHealed:
                      value,
                  }))
                }
                tintColors={{
                  true: COLORS.primary,
                  false:
                    COLORS._6F767E,
                }}
              />

              <AppText
                size={getScaleSize(13)}
              >
                Until healed
              </AppText>
            </View>
          </View>
        </View>

        <FormSignature />
      </ScrollView>

      <DatePicker
        modal
        open={open}
        date={date}
        mode="date"
        onConfirm={selectedDate => {
          setOpen(false);
          setDate(selectedDate);

          const formattedDate =
            moment(selectedDate).format(
              'DD/MM/YYYY',
            );

          if (pickerType) {
            setState(prev => ({
              ...prev,
              [pickerType]:
                formattedDate,
            }));
          }
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />

      <WarningSheet
        ref={warningSheetRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS._F9FAFB,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom:
      getScaleSize(190),
    gap: getScaleSize(12),
    marginHorizontal:
      getScaleSize(16),
  },

  headerTextContainer: {
    marginBottom:
      getScaleSize(4),
  },

  card: {
    backgroundColor:
      COLORS.white,
    padding: getScaleSize(17),
    borderRadius:
      getScaleSize(16),
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    marginBottom:
      getScaleSize(16),
  },

  sectionIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },

  inputField: {
    marginBottom:
      getScaleSize(12),
    paddingHorizontal: 0,
  },

  checkboxGroup: {
    // gap: getScaleSize(10),
  },

  checkboxRow: {
    flexDirection: 'row',
    gap: getScaleSize(16),
    flexWrap: 'wrap',
    marginBottom:
      getScaleSize(10),
  },

  nestedCheckbox: {
    marginLeft:
      getScaleSize(18),
    marginTop: getScaleSize(8),
    gap: getScaleSize(8),
  },

  statusRow: {
    // marginBottom:
    //   getScaleSize(12),
    gap: getScaleSize(8),
  },

  protocolContainer: {
    // gap: getScaleSize(18),
  },

  protocolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    // gap: getScaleSize(8),
  },

  protocolTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    // marginLeft:
    //   getScaleSize(36),
    flexWrap: 'wrap',
  },

  blankInputWrapper: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS._BFC8D0,
    borderRadius: 0,
    backgroundColor:
      'transparent',
    minHeight:
      getScaleSize(34),
    paddingHorizontal: 0,
  },

  blankInputText: {
    paddingVertical: 0,
    textAlign: 'center',
    fontSize: getScaleSize(13),
    color: COLORS._1A1D1F,
    fontFamily:
      FONTS.Inter.Medium,
  },

  blankInputSmall: {
    width: getScaleSize(70),
    paddingHorizontal: 0,
    marginBottom: 0,
  },

  blankInputMedium: {
    width: getScaleSize(120),
    paddingHorizontal: 0,
    marginBottom: 0,
  },

  blankInputLarge: {
    width: getScaleSize(180),
    paddingHorizontal: 0,
    marginBottom: 0,
  },
});

export default WoundCareForm;