import React from 'react';
import {
  View,
  StyleSheet,
  TextStyle,
  ViewStyle,
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
    <View style={[styles.container, containerStyle]}>
      <CheckBox
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        tintColors={{
          true: COLORS._526674,
          false: COLORS._EFEFEF,
        }}
      />
      <AppText
        size={getScaleSize(13)}
        color={COLORS._1A1D1F}
        font={FONTS.Inter.Regular}
        style={[styles.label, labelStyle, textStyle]}
      >
        {label}
      </AppText>
    </View>
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
