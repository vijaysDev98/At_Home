import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IMAGES } from '../../assets/images';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import AppText from '../AppText';
import ProfileAvatar from '../ProfileAvatar';
import NavigationService from '../../navigation/NavigationService';
import FastImage from 'react-native-fast-image';
import { IMAGE_BASE_URL } from '../../api/apiRoutes';

type Props = {
  peerName: string;
  peerProfileImg?: string | null;
  presenceLabel?: string | null;
  onPressCall?: () => void;
  callAccessibilityLabel?: string;
};

export const ChatDetailHeader: React.FC<Props> = ({
  peerName,
  peerProfileImg,
  presenceLabel,
  onPressCall,
  callAccessibilityLabel,
}) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={16}
          style={styles.backBtn}
          onPress={() => NavigationService.goBack()}
        >
          <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
        </TouchableOpacity>

        {peerProfileImg ? (
          <FastImage
            source={{ uri: IMAGE_BASE_URL + peerProfileImg }}
            style={styles.avatar}
          />
        ) : (
          <ProfileAvatar name={peerName || '?'} size="small" />
        )}

        <View style={styles.nameBlock}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._1A1D1F}
            numberOfLines={1}
          >
            {peerName}
          </AppText>
          {!!presenceLabel && (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
              numberOfLines={1}
            >
              {presenceLabel}
            </AppText>
          )}
        </View>
      </View>

      {onPressCall ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressCall}
          style={styles.callBtn}
          accessibilityRole="button"
          accessibilityLabel={callAccessibilityLabel}
        >
          <Image source={IMAGES.phone} style={styles.callIcon} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._E5E7EB,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    gap: getScaleSize(10),
    paddingRight: getScaleSize(8),
  },
  backBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS._F9FAFB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: getScaleSize(17),
    height: getScaleSize(15),
    resizeMode: 'contain',
  },
  avatar: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: COLORS._F3F4F6,
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  callBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: getScaleSize(4),
  },
  callIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
});
