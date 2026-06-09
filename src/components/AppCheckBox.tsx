import React from 'react';
import {
  View,
  StyleSheet,
  TextStyle,
  ViewStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';

interface AppCheckBoxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  textStyle?: TextStyle;
}

const AppCheckBox: React.FC<AppCheckBoxProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  containerStyle,
  labelStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.container, containerStyle]}
    >
      <CheckBox
        boxType="square"
        style={{
          marginVertical: 5,
          marginRight: Platform.OS === 'ios' ? 5 : 10,
          height: 20,
          width: 20,
        }}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        tintColors={{
          true: disabled ? COLORS._D0D5DD : COLORS.primary,
          false: disabled ? COLORS._D0D5DD : COLORS._6F767E,
        }}
        onCheckColor={disabled ? COLORS._D0D5DD : COLORS.primary}
        onTintColor={disabled ? COLORS._D0D5DD : COLORS.primary}
        tintColor={disabled ? COLORS._D0D5DD : COLORS._6F767E}
        animationDuration={0.1}
        lineWidth={1.5}
      />

      <AppText
        size={getScaleSize(13)}
        color={disabled ? COLORS._98A2B3 : COLORS._1A1D1F}
        font={FONTS.Inter.Regular}
        style={[styles.label, labelStyle, textStyle]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(2),
  },
  label: {
    flex: 1,
  },
});

export default AppCheckBox;
