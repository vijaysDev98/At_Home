import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IMAGES } from '../assets/images';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import AppText from './AppText';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';

type Props = {
  unreadNotificationCount?: number;
  onNotificationPress: () => void;
};

export const HomeChatNotificationActions: React.FC<Props> = ({
  unreadNotificationCount = 0,
  onNotificationPress,
}) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => NavigationService.navigate(SCREENS.CHAT_LIST)}
        activeOpacity={0.7}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Open chats"
      >
        <View style={styles.iconContainer}>
          <Image source={IMAGES.chat_conversation} style={styles.chatIcon} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNotificationPress}
        activeOpacity={0.7}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Open notifications"
      >
        <View style={styles.iconContainer}>
          <Image source={IMAGES.notification_icon} style={styles.notificationIcon} />
          {unreadNotificationCount > 0 && (
            <View style={styles.badgeContainer}>
              <AppText
                size={getScaleSize(8)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
                style={styles.badgeText}
              >
                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  iconBtn: {
    padding: getScaleSize(4),
  },
  iconContainer: {
    position: 'relative',
  },
  chatIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
  },
  notificationIcon: {
    width: getScaleSize(16),
    height: getScaleSize(18),
    resizeMode: 'contain',
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: getScaleSize(8),
    minWidth: getScaleSize(16),
    height: getScaleSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(3),
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeText: {
    textAlign: 'center',
    lineHeight: getScaleSize(13),
  },
});
