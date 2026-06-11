import React, { memo } from 'react';
import { Text as RNText, StyleProp, TextStyle, TextProps, Platform } from 'react-native';
import FONTS from '../utils/fonts';

interface AppTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
  font?: string;
  color?: string;
  align?: TextStyle['textAlign'];
  size?: number;
  lineHeight?: number;
  weight?: TextStyle['fontWeight'];
  children: React.ReactNode;
}

function AppText({
  style,
  font,
  color = '#000',
  align = 'left',
  size = 13,
  lineHeight,
  weight,
  children,
  ...rest
}: AppTextProps) {
  // Enhanced font handling for iOS
  const getFontStyle = (): TextStyle => {
    if (!font) return {};

    if (Platform.OS === 'ios') {
      // For iOS, use base font family with fontWeight
      // This ensures proper font weight rendering on iOS
      let fontWeight = weight;

      // Map font names to weights for iOS
      if (font === FONTS.Inter.Bold) {
        fontWeight = FONTS.Inter.Weights.Bold;
      } else if (font === FONTS.Inter.Medium) {
        fontWeight = FONTS.Inter.Weights.Medium;
      } else if (font === FONTS.Inter.SemiBold) {
        fontWeight = FONTS.Inter.Weights.SemiBold;
      } else if (font === FONTS.Inter.Regular) {
        fontWeight = FONTS.Inter.Weights.Regular;
      }

      return {
        fontFamily: FONTS.Inter.Family,
        fontWeight,
      };
    } else {
      // For Android, use the specific font names
      return {
        fontFamily: font,
      };
    }
  };

  return (
    <RNText
      {...rest}
      style={[
        style,
        {
          color,
          fontSize: size,
          lineHeight,
          textAlign: align,
          ...getFontStyle(),
        },
      ]}
    >
      {children}
    </RNText>
  );
}

export default memo(AppText);
