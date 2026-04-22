import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  icon?: any;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  icon,
  disabled,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
      {icon && <Image source={icon} style={styles.buttonIcon} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: getScaleSize(56),
    borderRadius: getScaleSize(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: COLORS.slate400,
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontSize: getScaleSize(16),
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.white,
  },
  buttonIcon: {
    marginLeft: getScaleSize(8),
    height: getScaleSize(16),
    width: getScaleSize(16),
    tintColor: COLORS.white,
  },
});

export default PrimaryButton;
