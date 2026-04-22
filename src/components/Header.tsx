import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { COLORS } from '../utils';

const Header = ({ isBack = false }: { isBack?: boolean }) => {
  return (
    <View style={styles.header}>
      {isBack && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.backBtn}
          onPress={() => NavigationService.goBack()}
        >
          <Image source={IMAGES.backIcon} style={styles.backIcon} />
        </TouchableOpacity>
      )}
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
