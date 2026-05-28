import React, { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import {
  Image,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface CustomDropdownProps {
  labelStyle?: TextStyle;
  isMandatory?: boolean;
  style?: ViewStyle;
  labelContainerStyle?: ViewStyle;
  label: string;
  data: any[];
  value: any;
  onChange: (value: any) => void;
  placeholder: string;
  leftIcon: any;
  error?: string;
  zIndex?: number;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  labelStyle,
  isMandatory = false,
  style,
  labelContainerStyle,
  label,
  data,
  value,
  onChange,
  placeholder,
  leftIcon,
  error,
  zIndex = 1000,
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={[styles.fieldWrapper, { zIndex }, style]}>
      <Text style={[styles.label, labelStyle]}>
        {label} {isMandatory && <Text style={styles.required}>*</Text>}
      </Text>

      <View style={styles.dropdownWrapper}>
        <Image
          source={leftIcon}
          style={[
            styles.dropdownLeftIcon,
            {
              tintColor: isFocus ? COLORS.primary : COLORS.slate400,
            },
          ]}
        />

        <Dropdown
          style={[
            styles.dropdown,
            labelContainerStyle,
            !!error
              ? styles.dropdownErrorBorder
              : isFocus && { borderColor: COLORS.primary },
          ]}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownText}
          iconStyle={styles.dropdownArrow}
          data={data}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? placeholder : '...'}
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            onChange(item?.value);
            setIsFocus(false);
          }}
          renderRightIcon={() => (
            <Image
              source={IMAGES.arrow_bottom}
              style={[
                styles.dropdownArrow,
                isFocus && {
                  transform: [{ rotate: '180deg' }],
                },
              ]}
            />
          )}
        />
      </View>

      {!!error && (
        <View style={styles.errorRow}>
          <Image source={IMAGES.error_icon} style={styles.errorBottomIcon} />

          <Text style={styles.dropdownError}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldWrapper: {
    paddingHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(20),
  },

  dropdownWrapper: {
    position: 'relative',
  },

  dropdown: {
    height: getScaleSize(56),
    borderColor: COLORS._E5E7EB,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: getScaleSize(16),
    backgroundColor: COLORS.white,
    paddingLeft: getScaleSize(48),
  },

  dropdownErrorBorder: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },

  dropdownPlaceholder: {
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.slate400,
  },

  dropdownText: {
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate900,
  },

  dropdownSearchInput: {
    height: getScaleSize(40),
    fontSize: getScaleSize(14),
    borderRadius: 8,
    borderColor: COLORS._E5E7EB,
  },

  dropdownArrow: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS.slate400,
  },

  errorIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS.error,
  },

  dropdownLeftIcon: {
    position: 'absolute',
    left: getScaleSize(16),
    top: getScaleSize(18),
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    zIndex: 1,
  },

  label: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate900,
    marginBottom: getScaleSize(8),
  },

  required: {
    color: COLORS.error,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getScaleSize(6),
    gap: getScaleSize(6),
  },

  errorBottomIcon: {
    width: getScaleSize(11),
    height: getScaleSize(11),
    tintColor: COLORS.error,
  },

  dropdownError: {
    fontSize: getScaleSize(12),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.error,
  },
});
