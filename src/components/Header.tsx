import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextStyle } from 'react-native';
import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { COLORS, FONTS } from '../utils';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { ViewStyle } from 'react-native';

const Header = ({ 
  isBack = false, title, backIcon, style, leftContent, subTitle,titleStyle,titleContainerStyle }:
  { isBack?: boolean, title?: String, backIcon?: String, style?: ViewStyle, leftContent?: () => React.ReactNode, subTitle?: String,titleStyle?: TextStyle,titleContainerStyle?: ViewStyle }) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.content}>
        {isBack && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={backIcon ? {} : styles.backBtn}
            onPress={() => NavigationService.goBack()}
          >
            <Image source={backIcon ? backIcon : IMAGES.backIcon} style={styles.backIcon} />
          </TouchableOpacity>
        )}
        <View style={titleContainerStyle}>
          {title ?
            <AppText
              size={getScaleSize(20)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={titleStyle}
            >{title}</AppText>
            : null}
          {subTitle ?
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6B7280}
            >{subTitle}</AppText>
            : null}
        </View>
      </View>
      {leftContent && leftContent()}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
