import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import moment from 'moment';

import DatePicker from 'react-native-date-picker';
import CheckBox from '@react-native-community/checkbox';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';

export interface PatientSectionProps {
  state: any;
  setState: (state: any) => void;
  showWeight?: boolean;
  showNIR?: boolean;
}

const FormPatientSection: React.FC<PatientSectionProps> = ({
  state,
  setState,
  showWeight = true,
  showNIR = true,
}) => {
  const [openDob, setOpenDob] = useState(false);
  const [dobDate, setDobDate] = useState(new Date());

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
      {renderSectionHeader('Patient', IMAGES.person)}
      <View style={styles.row}>
        <Input
          label="First name"
          placeholder="Enter first name"
          value={state.patientFirstName}
          onChangeText={text => setState({ ...state, patientFirstName: text })}
          style={[styles.inputField, { flex: 1 }]}
        />
        <Input
          label="Last name"
          placeholder="Enter last name"
          value={state.patientLastName}
          onChangeText={text => setState({ ...state, patientLastName: text })}
          style={[styles.inputField, { flex: 1 }]}
        />
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setOpenDob(true)}
          style={{ flex: 1 }}
        >
          <Input
            editable={false}
            label="Date of birth"
            placeholder="DD/MM/YYYY"
            value={state.patientDOB}
            style={styles.inputField}
            pointerEvents="none"
          />
        </TouchableOpacity>
        {showWeight && (
          <Input
            label="Weight (kg)"
            placeholder="e.g. 70"
            value={state.patientWeight}
            onChangeText={text => setState({ ...state, patientWeight: text })}
            style={[styles.inputField, { flex: 1 }]}
            keyboardType="numeric"
          />
        )}
      </View>

      <DatePicker
        modal
        mode="date"
        open={openDob}
        date={dobDate}
        onConfirm={d => {
          setOpenDob(false);
          setDobDate(d);
          const formattedDate = moment(d).format('DD/MM/YYYY');
          setState({ ...state, patientDOB: formattedDate });

        }}
        onCancel={() => setOpenDob(false)}
      />

      {showNIR && (
        <Input
          label="Social Insurance number (NIR)"
          placeholder="Enter NIR"
          value={state.patientNIR}
          onChangeText={text => setState({ ...state, patientNIR: text })}
          style={styles.inputField}
        />
      )}

      <View style={[styles.checkboxItem, { marginTop: getScaleSize(12) }]}>
        <CheckBox
          boxType="square"
          value={
            state.careRelatedToALD === true || state.careRelatedToALD === 'ALD'
          }
          onValueChange={val => {
            const newVal =
              typeof state.careRelatedToALD === 'string'
                ? val
                  ? 'ALD'
                  : 'NOT_ALD'
                : val;
            setState({ ...state, careRelatedToALD: newVal });
          }}
          tintColors={{ true: COLORS.primary, false: COLORS._6F767E }}
        />

        <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>
          Care related to a long-term condition (ALD)
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
    marginBottom: getScaleSize(10),
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
    marginBottom: getScaleSize(5),
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
});

export default FormPatientSection;
