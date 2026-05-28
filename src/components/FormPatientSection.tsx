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
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';
import { useSelector } from 'react-redux';

export interface PatientSectionProps {
  state: any;
  setState: (state: any) => void;
  showWeight?: boolean;
  showNIR?: boolean;
  showALD?: boolean;
  showNALD?: boolean;
  showDate?: boolean;
  errors?: { [key: string]: string };
  readOnly?: boolean;
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
  readOnly = false,
}) => {
  const [openDob, setOpenDob] = useState(false);
  const [dobDate, setDobDate] = useState(new Date());
  const locale = useSelector((state: any) => state.language.currentLanguage);

  const { t } = useTranslation();
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
      {renderSectionHeader(t(STRING.patientInformation), IMAGES.person)}
      <View style={styles.row}>
        <Input
          isLocked={readOnly}
          label={t(STRING.firstName)}
          placeholder={t(STRING.enterFirstName)}
          isMandatory
          value={state.patient_first_name || ''}
          onChangeText={text => setState({ patient_first_name: text })}
          style={[styles.inputField, { flex: 1 }]}
          error={errors.patientFirstName}
        />
        <Input
          isLocked={readOnly}
          label={t(STRING.lastName)}
          isMandatory
          placeholder={t(STRING.enterLastName)}
          value={state.patient_last_name || ''}
          onChangeText={text => setState({ patient_last_name: text })}
          style={[styles.inputField, { flex: 1 }]}
          error={errors.patientLastName}
        />
      </View>
      <View style={styles.row}>
        <Input
          isLocked={readOnly}
          onPress={() => !readOnly && setOpenDob(true)}
          label={t(STRING.dateOfBirth)}
          placeholder={t(STRING.ddmmyyyy)}
          value={state.dob || ''}
          style={[styles.inputField, { flex: 1 }]}
          pointerEvents="none"
        />
        {showDate && (
          <Input
            isLocked={readOnly}
            onPress={() => !readOnly && setOpenDob(true)}
            label={t(STRING.date)}
            placeholder={t(STRING.ddmmyyyy)}
            value={state.dob || ''}
            style={[styles.inputField, { flex: 1 }]}
            pointerEvents="none"
          />
        )}
        {showWeight && (
          <Input
            isLocked={readOnly}
            label={t(STRING.weightKg)}
            placeholder="e.g. 70"
            value={state.weight || ''}
            onChangeText={text => setState({ weight: text })}
            style={[styles.inputField, { flex: 1 }]}
            keyboardType="numeric"
          />
        )}
      </View>

      <DatePicker
        locale={locale}
        title={t(STRING.selectDate)}
        cancelText={t(STRING.cancel)}
        confirmText={t(STRING.confirm)}
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
          isLocked={readOnly}
          label={t(STRING.socialInsuranceNumberNIR)}
          placeholder={t(STRING.enterNIR)}
          value={state.nir || ''}
          onChangeText={text => setState({ nir: text })}
          style={[styles.inputField, { marginBottom: 0 }]}
        />
      )}

      {showALD && (
        <AppCheckBox
          disabled={readOnly}
          value={state.ald_condition === true || state.ald_condition === 'ALD'}
          onValueChange={val => {
            const newVal =
              typeof state.ald_condition === 'string'
                ? val
                  ? 'ALD'
                  : 'NOT_ALD'
                : val;
            setState({ ald_condition: newVal });
          }}
          label={t(STRING.careRelatedToALD)}
          containerStyle={{ marginTop: getScaleSize(12) }}
        />
      )}

      {showNALD && (
        <AppCheckBox
          disabled={readOnly}
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
          label={t(STRING.careNotRelatedToALD)}
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
