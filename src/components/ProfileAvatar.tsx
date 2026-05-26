import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AppText } from '.';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

interface ProfileAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name = '',
  imageUrl,
  size = 'medium',
  backgroundColor = '#e8edf1',
}) => {
  const sizeConfig = {
    small: {
      width: getScaleSize(40),
      height: getScaleSize(40),
      borderRadius: getScaleSize(20),
      fontSize: getScaleSize(14),
    },
    medium: {
      width: getScaleSize(50),
      height: getScaleSize(50),
      borderRadius: getScaleSize(28),
      fontSize: getScaleSize(20),
    },
    large: {
      width: getScaleSize(80),
      height: getScaleSize(80),
      borderRadius: getScaleSize(40),
      fontSize: getScaleSize(28),
    },
  };

  const config = sizeConfig[size];

  // Get first letter of first name
  const initials =
    name
      ?.trim()
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const styles = StyleSheet.create({
    container: {
      width: config.width,
      height: config.height,
      borderRadius: config.borderRadius,
      backgroundColor: backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    initials: {
      fontSize: config.fontSize,
      fontWeight: '700',
      color: COLORS._1A1D1F,
    },
  });

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        // defaultSource={require('../assets/images/placeholder.png')}
        />
      ) : (
        <AppText
          size={config.fontSize}
          color={COLORS._1A1D1F}
          font={FONTS.Inter.Bold}
        >
          {initials}
        </AppText>
      )}
    </View>
  );
};

export default ProfileAvatar;
