import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  trailing?: React.ReactNode;
  secureToggle?: boolean;
  labelSize?: number;
  labelColor?: string;
  labelFont?: string;
  leftIcon?: string;
  handlePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  trailing,
  secureToggle,
  secureTextEntry,
  style,
  labelSize,
  labelColor,
  labelFont,
  leftIcon,
  handlePasswordVisibility,
  isPasswordVisible,
  ...rest
}) => {


  return (
    <View style={styles.root}>
      {label ? (
        <AppText
          size={labelSize ? labelSize : getScaleSize(13)}
          color={labelColor ? labelColor : COLORS._1E293B}
          font={labelFont ? labelFont : FONTS.Inter.Medium}
          style={styles.label}
        >
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputWrapperError : null,
        ]}
      >
        {
          leftIcon &&
          <Image
            source={leftIcon}
            style={styles.icon}
          />
        }

        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={COLORS._1E293B}
          secureTextEntry={secureTextEntry && isPasswordVisible}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={handlePasswordVisibility}
            style={styles.icon}
            activeOpacity={0.8}
          >

            <Image
              source={isPasswordVisible ? IMAGES.open_eye_icon : IMAGES.close_eye_icon}
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : trailing ? (
          <View style={styles.icon}>{trailing}</View>
        ) : null}
      </View>

      {error ? (
        <View style={styles.helperRow}>
          <Image
            source={IMAGES.error_icon}
            style={{width: 11, height: 11}}
          />
          <AppText size={12} color="#ef4444" style={styles.helperText}>
            {error}
          </AppText>
        </View>
      ) : helper ? (
        <AppText size={12} color="#64748b" style={styles.helperText}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: getScaleSize(16),
    paddingVertical:getScaleSize(12),
    gap:12
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: getScaleSize(15),
    color: '#1e293b',
    paddingVertical: 12,
  },
  icon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  helperText: {
    // marginTop: 6,
  },
});

export default Input;