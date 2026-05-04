import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';

export interface PrescriberSectionProps {
  state: any;
  setState: (state: any) => void;
  children?: React.ReactNode;
}

const FormPrescriberSection: React.FC<PrescriberSectionProps> = ({
  state,
  setState,
  children,
}) => {
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
      {renderSectionHeader('Prescriber identification', IMAGES.stethoscopeIcon)}
      <View style={styles.row}>
        <Input
          isLocked
          label="First name"
          value={state.prescriberFirstName}
          style={[styles.inputField, { flex: 1 }]}
        />
        <Input
          isLocked
          label="Last name"
          value={state.prescriberLastName}
          style={[styles.inputField, { flex: 1 }]}
        />
      </View>
      <View style={styles.row}>
        <Input
          isLocked
          label="Phone"
          value={state.prescriberPhone || state.prescriberEmergencyPhone}
          style={[styles.inputField, { flex: 1 }]}
        />
        <Input
          isLocked
          label="RPPS ID"
          value={state.prescriberRPPS}
          style={[styles.inputField, { flex: 1 }]}
          infoText="*Shared directory of healthcare professionals"
        />
      </View>
      {children}
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
});

export default FormPrescriberSection;
