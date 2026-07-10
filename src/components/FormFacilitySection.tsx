import React from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

export interface FacilitySectionProps {
  state: any;
  setState: (state: any) => void;
  children?: React.ReactNode;
  readOnly?: boolean;
}

const FormFacilitySection: React.FC<FacilitySectionProps> = ({
  state,
  setState,
  children,
  readOnly = false,
}) => {
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
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(17),
    borderRadius: getScaleSize(16),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS == 'android' ? 0.03 : 0.15,
    shadowRadius: 3,
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
});

export default FormFacilitySection;
