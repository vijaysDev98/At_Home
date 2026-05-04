import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';

export interface FacilitySectionProps {
  state: any;
  setState: (state: any) => void;
  children?: React.ReactNode;
}

const FormFacilitySection: React.FC<FacilitySectionProps> = ({
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
      {renderSectionHeader("Prescriber's practice / facility", IMAGES.hospital)}
      <Input
        label="Hospital name"
        placeholder="Enter hospital name"
        value={state.hospitalName}
        onChangeText={text => setState({ ...state, hospitalName: text })}
        style={styles.inputField}
      />
      <Input
        label="Address"
        placeholder="Enter address"
        value={state.hospitalAddress}
        onChangeText={text => setState({ ...state, hospitalAddress: text })}
        style={styles.inputField}
      />
      <Input
        isLocked
        label="Geographic Finess No."
        value={state.finessNo}
        style={styles.inputField}
      />
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
});

export default FormFacilitySection;
