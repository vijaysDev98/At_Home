import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, ViewStyle, StyleProp, View, TextStyle, Image } from 'react-native';
import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

type IconRender = ReactNode;

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  leftIconStyle?: StyleProp<ViewStyle>;
  rightIconStyle?: StyleProp<ViewStyle>;
  textColor?: string;
  backgroundColor?: string;
  textStyle?: StyleProp<TextStyle>;
  textProps?: Omit<React.ComponentProps<typeof AppText>, 'children' | 'color'>;
  textFont?: string;
  textSize?: number;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  contentStyle,
  leftIconStyle,
  rightIconStyle,
  textColor = COLORS.white,
  backgroundColor = COLORS.primary,
  textStyle,
  textProps,
  textSize,
  textFont
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, { backgroundColor, opacity: isDisabled ? 0.7 : 1 }, style]}
    >
      <View style={[styles.content, contentStyle]}>
        {leftIcon ? 
        // <View style={[styles.icon, leftIconStyle]}>{leftIcon}</View>
          <Image
        source={leftIcon}
        style={[styles.icon, leftIconStyle]}
        />
         : null}
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <AppText
            size={ textSize?textSize: getScaleSize(16)}
            font ={textFont ? textFont : FONTS.Inter.SemiBold}
            style={textStyle}
            color={textColor ? textColor : COLORS.white}
            {...textProps}
          >
            {title}
          </AppText>
        )}
        {rightIcon ?
        <Image
        source={rightIcon}
        style={[styles.icon, rightIconStyle]}
        />
        : null}
      </View>
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    height:getScaleSize(52),
    borderRadius: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
   height:getScaleSize(16),
   width:getScaleSize(16),
  },
});