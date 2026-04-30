import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Pressable,
  StyleProp,
  TextStyle,
  ViewStyle,
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
  isMandatory?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  subText?: string;
  leftComponent?: React.ReactNode;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  helperStyle?: StyleProp<TextStyle>;
  containerBackgroundColor?: string;
  labelRight?: React.ReactNode;
  inputWrapperStyle?: StyleProp<ViewStyle>;
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
  isMandatory,
  isLoading,
  onPress,
  subText,
  leftComponent,
  inputStyle,
  helperStyle,
  containerBackgroundColor,
  labelRight,
  inputWrapperStyle,
  ...rest
}) => {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.labelRow}>
        {label ? (
          <AppText
            size={labelSize ? labelSize : getScaleSize(13)}
            color={labelColor ? labelColor : COLORS._1E293B}
            font={labelFont ? labelFont : FONTS.Inter.Medium}
            style={styles.label}
          >
            {label} {isMandatory && <AppText color={COLORS.error}>*</AppText>}
          </AppText>
        ) : null}
        {labelRight && labelRight}
      </View>
      {subText ? (
        <AppText
          size={getScaleSize(12)}
          color={COLORS._64748B}
          style={styles.subText}
        >
          {subText}
        </AppText>
      ) : null}

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.inputWrapper,
          { backgroundColor: containerBackgroundColor || COLORS.white },
          error ? styles.inputWrapperError : null,
          inputWrapperStyle
        ]}
      >
        {leftIcon && <Image source={leftIcon} style={styles.icon} />}
        {leftComponent && leftComponent}

        <TextInput
          {...rest}
          editable={onPress ? false : rest.editable}
          style={[styles.input, inputStyle]}
          placeholderTextColor={COLORS._1E293B}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
        />

        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={handlePasswordVisibility}
            style={styles.icon}
            activeOpacity={0.8}
          >
            <Image
              source={
                isPasswordVisible ? IMAGES.open_eye_icon : IMAGES.close_eye_icon
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : trailing ? (
          <View style={styles.icon}>{trailing}</View>
        ) : null}
      </Pressable>

      {error ? (
        <View style={styles.helperRow}>
          <Image source={IMAGES.error_icon} style={{ width: 11, height: 11 }} />
          <AppText
            size={12}
            color="#ef4444"
            style={[styles.helperText, helperStyle]}
          >
            {error}
          </AppText>
        </View>
      ) : helper ? (
        <AppText
          size={12}
          color="#64748b"
          style={[styles.helperText, helperStyle]}
        >
          {helper}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: getScaleSize(24),
  },
  label: {
    marginBottom: 0, // Handled by labelRow gap/margin
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subText: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: 12,
    gap: getScaleSize(8),
    height: getScaleSize(56),
    paddingHorizontal: getScaleSize(16),
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: getScaleSize(15),
    color: '#1e293b',
  },
  icon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
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
