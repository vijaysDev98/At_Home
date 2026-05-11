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

export interface PatientSectionProps {
  state: any;
  setState: (state: any) => void;
  showWeight?: boolean;
  showNIR?: boolean;
  showALD?: boolean;
  showNALD?: boolean;
  showDate?: boolean;
  errors?: { [key: string]: string };
}

const FormPatientSection: React.FC<PatientSectionProps> = ({
  state,
  setState,
  showWeight = true,
  showNIR = true,
  showALD = true,
  showNALD = false,
  showDate = false,
  errors = {},
}) => {
  const [openDob, setOpenDob] = useState(false);
  const [dobDate, setDobDate] = useState(new Date());

  const renderSectionHeader = (title: string, icon?: any) => (
    <View style={styles.sectionHeader}>
      {/* {icon && <Image source={icon} style={styles.sectionIcon} />} */}
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
      {renderSectionHeader('Patient Information', IMAGES.person)}
      <View style={styles.row}>
        <Input
          label="First name"
          placeholder="Enter first name"
          value={state.patient_first_name}
          onChangeText={text => setState({ patient_first_name: text })}
          style={[styles.inputField, { flex: 1 }]}
          error={errors.patientFirstName}
        />
        <Input
          label="Last name"
          placeholder="Enter last name"
          value={state.patient_last_name}
          onChangeText={text => setState({ patient_last_name: text })}
          style={[styles.inputField, { flex: 1 }]}
          error={errors.patientLastName}
        />
      </View>
      <View style={styles.row}>

        <Input
          onPress={() => setOpenDob(true)}
          editable={false}
          label="Date of birth"
          placeholder="DD/MM/YYYY"
          value={state.dob}
          style={[styles.inputField, { flex: 1 }]}
          pointerEvents="none"
        />
        {showDate && <Input
          onPress={() => setOpenDob(true)}
          editable={false}
          label="Date"
          placeholder="DD/MM/YYYY"
          value={state.dob}
          style={[styles.inputField, { flex: 1 }]}
          pointerEvents="none"
        />}
        {showWeight && (
          <Input
            label="Weight (kg)"
            placeholder="e.g. 70"
            value={state.weight}
            onChangeText={text => setState({ weight: text })}
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
          setState({ dob: formattedDate });
        }}
        onCancel={() => setOpenDob(false)}
      />

      {showNIR && (
        <Input
          label="Social Insurance number (NIR)"
          placeholder="Enter NIR"
          value={state.nir}
          onChangeText={text => setState({ nir: text })}
          style={[styles.inputField, { marginBottom: 0 }]}
        />
      )}

      {showALD && (
        <AppCheckBox
          value={
            state.ald_condition === true ||
            state.ald_condition === 'ALD'
          }
          onValueChange={val => {
            const newVal =
              typeof state.ald_condition === 'string'
                ? val
                  ? 'ALD'
                  : 'NOT_ALD'
                : val;
            setState({ ald_condition: newVal });
          }}
          label="Care related to a long-term condition (ALD)"
          containerStyle={{ marginTop: getScaleSize(12) }}
        />
      )}

      {showNALD && (
        <AppCheckBox
          value={
            state.careNotRelatedToALD === true ||
            state.careNotRelatedToALD === 'NALD'
          }
          onValueChange={val => {
            const newVal =
              typeof state.careNotRelatedToALD === 'string'
                ? val
                  ? 'NALD'
                  : 'NOT_NALD'
                : val;
            setState({ careNotRelatedToALD: newVal });
          }}
          label="Care not related to long-term condition (ALD)"
          containerStyle={{ marginTop: getScaleSize(12) }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    elevation: 4
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
    alignItems: 'flex-start',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
  },
});

export default FormPatientSection;
