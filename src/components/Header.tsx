import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { COLORS, FONTS } from '../utils';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { ViewStyle } from 'react-native';

const Header = ({ isBack = false,title,backIcon ,style,leftContent}: 
  { isBack?: boolean,title?:String,backIcon?:String,style?:ViewStyle,leftContent?:() => React.ReactNode }) => {
  return (
    <View style={[styles.header,style]}>
      <View style={styles.content}>
      {isBack && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={backIcon ? {} :styles.backBtn}
          onPress={() => NavigationService.goBack()}
        >
          <Image source={backIcon ? backIcon:IMAGES.backIcon} style={styles.backIcon} />
        </TouchableOpacity>
      )}
      {title? 
       <AppText
                size={getScaleSize(20)}
          font={ FONTS.Inter.Bold}
          color={ COLORS._1A1D1F}
                >{title}</AppText>
      : null}
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
  content:{
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
