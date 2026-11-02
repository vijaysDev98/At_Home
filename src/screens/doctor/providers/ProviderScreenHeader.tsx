import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppText } from '../../../components';
import { IMAGES } from '../../../assets/images';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import NavigationService from '../../../navigation/NavigationService';

type Props = {
  title: string;
};

const ProviderScreenHeader: React.FC<Props> = ({ title }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => NavigationService.goBack()}
          accessibilityRole="button"
        >
          <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerCenter}>
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      <View style={styles.headerSide} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  headerSide: {
    flex: 0.5,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  backIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
});

export default ProviderScreenHeader;
