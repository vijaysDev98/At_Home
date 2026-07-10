import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

export interface FacilityAndContextSectionProps {
  state: any;
  setState: (state: any) => void;
  readOnly?: boolean;
  showFormsFor?: boolean;
}

const FormFacilityAndContextSection: React.FC<
  FacilityAndContextSectionProps
> = ({ state, setState, readOnly = false, showFormsFor = true }) => {
  const { t } = useTranslation();

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
      {/* FACILITY INFORMATION */}
      <View style={styles.card}>
        {renderSectionHeader(t(STRING.prescribersPracticeFacility))}
        <Input
          isLocked={readOnly}
          label={t(STRING.hospitalName)}
          placeholder={t(STRING.enterHospitalName)}
          value={state.hospital_name}
          onChangeText={text => setState({ hospital_name: text })}
          style={styles.inputField}
        />
        <Input
          label={t(STRING.address)}
          isLocked={readOnly}
          placeholder={t(STRING.enterAddress)}
          value={state.hospital_address}
          onChangeText={text => setState({ hospital_address: text })}
          style={styles.inputField}
        />
        <Input
          isLocked
          label={t(STRING.geographicFinessNo)}
          value={state.finess_number}
          style={styles.inputField}
        />
      </View>

      {/* PRESCRIPTION CONTEXT */}
      {showFormsFor && (
        <View style={styles.card}>
          {renderSectionHeader(t(STRING.prescriptionContext))}
          <Input
            isLocked={readOnly}
            label={t(STRING.formsFor)}
            value={state.forms_for}
            onChangeText={value => setState({ forms_for: value })}
            placeholder={t(STRING.enterDetails)}
            style={styles.inputField}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: getScaleSize(16),
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
    gap: getScaleSize(12),
    marginBottom: getScaleSize(12),
  },
  inputField: {
    marginBottom: getScaleSize(10),
    paddingHorizontal: 0,
  },
});

export default FormFacilityAndContextSection;
