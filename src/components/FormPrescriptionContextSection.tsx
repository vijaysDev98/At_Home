import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

export interface FormPrescriptionContextSectionProps {
  state: any;
  setState: (state: any) => void;
  readOnly?: boolean;
}

const FormPrescriptionContextSection: React.FC<FormPrescriptionContextSectionProps> = ({
  state,
  setState,
  readOnly = false,
}) => {
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
    <View style={styles.card}>
      {renderSectionHeader(t(STRING.prescriptionContext))}
      <Input
        isLocked={readOnly}
        label={t(STRING.formsFor)}
        value={state.forms_for}
        onChangeText={value => setState({ forms_for: value })}
        placeholder={t(STRING.enterFormsFor)}
        style={styles.inputField}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    elevation: 4,
    // marginBottom: getScaleSize(16),
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

export default FormPrescriptionContextSection;
