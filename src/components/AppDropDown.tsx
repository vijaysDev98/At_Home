import React from 'react';
import { View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

interface DropdownItem {
  label: string;
  value: string | number;
}

interface AppDropdownProps {
  label?: string;
  value?: string | number | null;
  data: DropdownItem[];
  placeholder?: string;
  onChange: (value: string | number) => void;
  isMandatory?: boolean;
  labelSize?:number;
  labelColor?:String;
  labelFont?:String;
  style?:ViewStyle;
  error?: string;
}

const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  labelSize,
  labelColor,
  labelFont,
  value,
  data,
  placeholder,
  onChange,
  isMandatory,
  style,
  error
}) => {
  return (
    <View style={[styles.container,style]}>
      {label && (
        <AppText 
     size={labelSize ? labelSize : getScaleSize(13)}
                 color={labelColor ? labelColor : COLORS._1E293B}
                 font={labelFont ? labelFont : FONTS.Inter.Medium}
                 style={styles.label}
        >
          {label}
          {isMandatory && <AppText color={COLORS.error}>*</AppText>}
        </AppText>
      )}

      <Dropdown
        style={[styles.dropdown, error && styles.dropdownError]}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={item => onChange(item.value)}
      />
      {error && (
        <AppText style={styles.errorText}>{error}</AppText>
      )}
    </View>
  );
};

export default AppDropdown;

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: FONTS.Inter.SemiBold,
    color: COLORS._1A1D1F,
  },
  required: { color: 'red' },
  dropdown: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  placeholder: {
    color: '#6F767E',
  },
  selectedText: {
    color: '#1A1D1F',
  },
  dropdownError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
});