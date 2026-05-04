import React, { useState, useRef, useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { ActionSheetRef } from 'react-native-actions-sheet';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

import {
  AppSafeAreaView,
  AppText,
  Header,
  Input,
  WarningSheet,
  RequestSummaryCard,
  FormPatientSection,
  FormPrescriberSection,
  FormFacilitySection,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';

const FreePrescriptionForm: React.FC = () => {
  const warningSheetRef = useRef<ActionSheetRef>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerType, setPickerType] = useState<string | null>(null);

  const [state, setState] = useState({
    prescriptionDate: '',
    homeInfusionTherapy: false,
    renewalModification: false,

    patientLastName: '',
    patientFirstName: '',
    patientDOB: '',
    patientWeight: '',
    patientNIR: '',
    careRelatedToALD: false,

    // Automatic fields (locked)
    prescriberLastName: 'Jenkins',
    prescriberFirstName: 'Sarah',
    prescriberPhone: '01 23 45 67 89',
    prescriberRPPS: '12345678901',

    hospitalName: '',
    hospitalAddress: '',
    finessNo: '1234567',
    formsFor: '',

    freeZoneText: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    if (!state.patientLastName.trim()) {
      newErrors.patientLastName = 'Last name is required';
      hasErrors = true;
    }
    if (!state.patientFirstName.trim()) {
      newErrors.patientFirstName = 'First name is required';
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      NavigationService.navigate(SCREENS.SIGNATURE_FORM);
    }
  };

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
    <>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
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
              Free Prescription Form
            </AppText>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
              style={{ marginTop: getScaleSize(4) }}
            >
              Tick the appropriate boxes on the form
            </AppText>
          </View>

          {/* Prescription Date & Main Options */}
          <View style={styles.card}>
            {renderSectionHeader('Prescription date', IMAGES.ic_calender)}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setPickerType('prescriptionDate');
                setOpen(true);
              }}
            >
              <Input
                editable={false}
                placeholder="DD/MM/YYYY"
                value={state.prescriptionDate}
                style={styles.inputField}
                labelSize={getScaleSize(20)}
                pointerEvents="none"
              />
            </TouchableOpacity>
            <DatePicker
              modal
              mode="date"
              open={open}
              date={date}
              onConfirm={d => {
                setOpen(false);
                setDate(d);
                const formattedDate = moment(d).format('DD/MM/YYYY');

                if (pickerType === 'prescriptionDate') {
                  setState({ ...state, prescriptionDate: formattedDate });
                }
                setPickerType(null);
              }}
              onCancel={() => {
                setOpen(false);
                setPickerType(null);
              }}
            />
            <View style={styles.checkboxGroup}>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.homeInfusionTherapy}
                  onValueChange={val =>
                    setState({ ...state, homeInfusionTherapy: val })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Start of home infusion therapy
                </AppText>
              </View>
              <View style={styles.checkboxItem}>
                <CheckBox
                  boxType="square"
                  value={state.renewalModification}
                  onValueChange={val =>
                    setState({ ...state, renewalModification: val })
                  }
                  tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
                />

                <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
                  Renewal or modification
                </AppText>
              </View>
            </View>
          </View>

          {/* PATIENT SECTION */}
          <FormPatientSection state={state} setState={setState} />

          <FormPrescriberSection state={state} setState={setState} />

          {/* FACILITY SECTION */}
          <FormFacilitySection state={state} setState={setState}>
            <Input
              multiline
              label="Forms for"
              placeholder="Enter details"
              value={state.formsFor}
              onChangeText={text => setState({ ...state, formsFor: text })}
              style={styles.inputField}
            />
          </FormFacilitySection>
        </ScrollView>
      </View>
      <WarningSheet ref={warningSheetRef} />
    </>
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
    // padding: 16,
    paddingBottom: getScaleSize(100),
    gap: getScaleSize(12),
  },
  headerTextContainer: {
    marginBottom: getScaleSize(8),
    // paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
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
    marginTop: getScaleSize(0),
    marginBottom: getScaleSize(12),
    paddingHorizontal: getScaleSize(0),
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
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
  textArea: {
    minHeight: getScaleSize(120),
    textAlignVertical: 'top',
  },
  actionBar: {
    position: 'absolute',
    left: getScaleSize(0),
    right: getScaleSize(0),
    bottom: getScaleSize(0),
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._E5E7EB,
  },
  actionBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  actionPrimary: {
    flex: 1.5,
    backgroundColor: '#526674',
  },
  actionText: {
    fontSize: getScaleSize(16),
    fontFamily: FONTS.Inter.Bold,
  },
  actionSecondaryText: {
    color: COLORS._1A1D1F,
  },
  actionPrimaryText: {
    color: COLORS.white,
  },
});

export default FreePrescriptionForm;
