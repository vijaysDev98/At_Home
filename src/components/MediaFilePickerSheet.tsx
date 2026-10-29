import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { useTranslation } from 'react-i18next';

import AppBottomSheet from './AppBottomSheet';
import AppText from './AppText';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

export type MediaFilePickerSheetProps = {
  title: string;
  description: string;
  onTakePhoto: () => void;
  onSelectPhoto: () => void;
  onSelectFile: () => void;
};

export const MediaFilePickerSheet = React.forwardRef<
  ActionSheetRef,
  MediaFilePickerSheetProps
>(({ title, description, onTakePhoto, onSelectPhoto, onSelectFile }, ref) => {
  const { t } = useTranslation();
  const sheetRef = React.useRef<ActionSheetRef>(null);

  React.useImperativeHandle(ref, () => sheetRef.current as ActionSheetRef);

  return (
    <AppBottomSheet ref={sheetRef}>
      <View style={styles.content}>
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          align="center"
          style={styles.title}
        >
          {title}
        </AppText>
        <AppText
          size={getScaleSize(13)}
          font={FONTS.Inter.Regular}
          color={COLORS._6F767E}
          align="center"
          style={styles.description}
        >
          {description}
        </AppText>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.optionBtn}
          onPress={onTakePhoto}
        >
          <View style={styles.optionIconWrap}>
            <Image source={IMAGES.ic_camera} style={styles.optionIcon} />
          </View>
          <View style={styles.optionTextWrap}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.takePhoto) || 'Take Photo'}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
              style={styles.optionSubtitle}
            >
              {t('Use camera to capture document') ||
                'Use camera to capture document'}
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.optionBtn}
          onPress={onSelectPhoto}
        >
          <View style={styles.optionIconWrap}>
            <Image source={IMAGES.ic_gallery} style={styles.optionIcon} />
          </View>
          <View style={styles.optionTextWrap}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.photoLibrary) || 'Photo Library'}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
              style={styles.optionSubtitle}
            >
              {t(STRING.chooseFromGallery) || 'Choose photo from gallery'}
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.optionBtn}
          onPress={onSelectFile}
        >
          <View style={styles.optionIconWrap}>
            <Image source={IMAGES.ic_file} style={styles.optionIcon} />
          </View>
          <View style={styles.optionTextWrap}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.selectPdfOrDocument) || 'Select PDF / Document'}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
              style={styles.optionSubtitle}
            >
              {t(STRING.selectPdfOrDocumentDesc) ||
                'Choose PDF document or file from device'}
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.cancelBtn}
          onPress={() => sheetRef.current?.hide()}
        >
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._6F767E}
            align="center"
          >
            {t(STRING.cancel) || 'Cancel'}
          </AppText>
        </TouchableOpacity>
      </View>
    </AppBottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingVertical: getScaleSize(8),
    paddingHorizontal: getScaleSize(4),
  },
  title: {
    marginBottom: getScaleSize(4),
  },
  description: {
    marginBottom: getScaleSize(20),
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getScaleSize(14),
    paddingHorizontal: getScaleSize(16),
    borderRadius: getScaleSize(12),
    backgroundColor: '#F9FAFB',
    marginBottom: getScaleSize(10),
    gap: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  optionIconWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionSubtitle: {
    marginTop: 2,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(14),
    marginTop: getScaleSize(4),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
});
