import React from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import Input from './Input';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '../constant/smallFunctions';

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

  const isResident = Boolean(
    state?.is_medical_resident === true ||
    state?.is_medical_resident === 'true'
  );

  const residentDoctorName =
    state?.doctor_name ||
    `${capitalizeFirstLetter(state?.prescriber_first_name || '')} ${capitalizeFirstLetter(
      state?.prescriber_last_name || '',
    )}`.trim();

  const headOfDeptFormatted = state?.head_of_department_name
    ? state.head_of_department_name.startsWith('Dr.')
      ? state.head_of_department_name
      : `Dr. ${state.head_of_department_name}`
    : state?.head_of_department_first_name || state?.head_of_department_last_name
    ? `Dr. ${capitalizeFirstLetter(
        state?.head_of_department_first_name || '',
      )} ${capitalizeFirstLetter(state?.head_of_department_last_name || '')}`.trim()
    : '';

  const effectiveRpps = state?.head_of_department_rpps || state?.rpps_id || '';

  return (
    <View style={styles.card}>
      {renderSectionHeader(t(title), IMAGES.stethoscopeIcon)}
      {isResident ? (
        <>
          <Input
            isLocked
            label={t(STRING.doctorColon)}
            value={residentDoctorName}
            style={styles.inputField}
          />
          <Input
            isLocked
            label={t(STRING.headOfDepartment)}
            value={headOfDeptFormatted}
            style={styles.inputField}
          />
          {showFiness ? (
            <Input
              isLocked
              label={t(STRING.finess)}
              value={state.prescriber_finess}
              style={styles.inputField}
            />
          ) : (
            <Input
              isLocked
              label={t(STRING.phone)}
              value={state.prescriber_phone || state.prescriber_emergency_phone}
              style={styles.inputField}
            />
          )}
          <Input
            isLocked
            label={t(STRING.rppsNumber)}
            value={effectiveRpps}
            style={styles.inputField}
          />
        </>
      ) : (
        <>
          <View style={styles.row}>
            <Input
              isLocked
              label={t(STRING.firstName)}
              value={capitalizeFirstLetter(state.prescriber_first_name || '')}
              style={[styles.inputField, { flex: 1 }]}
            />
            <Input
              isLocked
              label={t(STRING.lastName)}
              value={capitalizeFirstLetter(state.prescriber_last_name || '')}
              style={[styles.inputField, { flex: 1 }]}
            />
          </View>
          {showFiness ? (
            <Input
              isLocked
              label={t(STRING.finess)}
              value={state.prescriber_finess}
              style={[styles.inputField, { flex: 1 }]}
            />
          ) : (
            <Input
              isLocked
              label={t(STRING.phone)}
              value={state.prescriber_phone || state.prescriber_emergency_phone}
              style={[styles.inputField, { flex: 1 }]}
            />
          )}
          <Input
            isLocked
            label={t(STRING.rppsId)}
            value={state.rpps_id}
            style={[styles.inputField, { flex: 1 }]}
          />
        </>
      )}
      <AppText
        size={getScaleSize(12)}
        color={COLORS._6F767E}
        style={{ marginTop: getScaleSize(-4), marginBottom: getScaleSize(8) }}
      >
        *{t(STRING.sharedDirectory)}
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
  row: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    alignItems: 'center',
    marginBottom: getScaleSize(5),
  },
});

export default FormPrescriberSection;
