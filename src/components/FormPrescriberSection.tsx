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
  title?: string;
  showFiness?: boolean;
  children?: React.ReactNode;
}

const FormPrescriberSection: React.FC<PrescriberSectionProps> = ({
  state,
  setState,
  title = 'Prescriber Identification',
  showFiness = false,
  children,
}) => {
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
      {renderSectionHeader(title, IMAGES.stethoscopeIcon)}
      <View style={styles.row}>
        <Input
          isLocked
          label="First name"
          value={state.prescriber_first_name}
          style={[styles.inputField, { flex: 1 }]}
        />
        <Input
          isLocked
          label="Last name"
          value={state.prescriber_last_name}
          style={[styles.inputField, { flex: 1 }]}
        />
      </View>
      <View style={styles.row}>
        {showFiness ? <Input
          isLocked
          label="FINESS"
          value={state.prescriber_finess}
          style={[styles.inputField, { flex: 1 }]}
        /> : <Input
          isLocked
          label="Phone"
          value={state.prescriber_phone || state.prescriber_emergency_phone}
          style={[styles.inputField, { flex: 1 }]}
        />}
        <Input
          isLocked
          label="RPPS ID"
          value={state.rpps_id}
          style={[styles.inputField, { flex: 1 }]}
        />
      </View>
      <AppText size={getScaleSize(12)} color={COLORS._6F767E} style={{ marginTop: getScaleSize(-4), marginBottom: getScaleSize(8) }}>
        *Shared directory of healthcare professionals
      </AppText>
      {children}
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
    alignItems: 'center',
    marginBottom: getScaleSize(5),
  },
});

export default FormPrescriberSection;
