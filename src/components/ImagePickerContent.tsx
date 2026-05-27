import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

interface ImagePickerContentProps {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  onHide: () => void;
}

export const ImagePickerContent: React.FC<ImagePickerContentProps> = ({
  onCameraPress,
  onGalleryPress,
  onHide,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText
        size={getScaleSize(16)}
        font={FONTS.Inter.Bold}
        color={COLORS._1A1D1F}
        align={'center'}
        style={styles.title}
      >
        {t(STRING.selectImage)}
      </AppText>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          onCameraPress();
          onHide();
        }}
        activeOpacity={0.8}
      >
        <Image
          source={IMAGES.ic_camera}
          style={styles.optionIcon}
        />
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.Medium}
          color={COLORS._1A1D1F}
        >
          {t(STRING.camera)}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionButton}
        onPress={() => {
          onGalleryPress();
          onHide();
        }}
        activeOpacity={0.8}
      >
        <Image
          source={IMAGES.ic_gallery}
          style={styles.optionIcon}
        />
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.Medium}
          color={COLORS._1A1D1F}
        >
          {t(STRING.gallery)}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onHide}
        activeOpacity={0.8}
      >
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.Medium}
          color={COLORS._6B7280}
        >
          {t(STRING.cancel)}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: getScaleSize(20),
  },
  title: {
    marginBottom: getScaleSize(24),
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getScaleSize(16),
    paddingHorizontal: getScaleSize(20),
    borderRadius: getScaleSize(12),
    backgroundColor: '#F9FAFB',
    marginBottom: getScaleSize(12),
    gap: getScaleSize(16),
  },
  optionIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
    tintColor: COLORS._526674,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(16),
    paddingHorizontal: getScaleSize(20),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: 'transparent',
  },
});
