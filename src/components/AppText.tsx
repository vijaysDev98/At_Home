import React, { memo } from 'react';
import { Text as RNText, StyleProp, TextStyle, TextProps } from 'react-native';

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
  return (
    <RNText
      {...rest}
      style={[
        style,
        {
          color,
          fontSize: size,
          fontFamily: font,
          lineHeight,
          textAlign: align,
          fontWeight: weight,
        },
      ]}
    >
      {children}
    </RNText>
  );
}

export default memo(AppText);
