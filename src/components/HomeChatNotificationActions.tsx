import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { IMAGES } from '../assets/images';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import AppText from './AppText';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';

type Props = {
  unreadNotificationCount?: number;
  unreadChatCount?: number;
  onNotificationPress: () => void;
};

const renderBadge = (count: number) => {
  const label = count > 99 ? '99+' : String(count);
  const isWide = count > 9;

  return (
    <View
      style={[
        styles.badgeContainer,
        isWide && styles.badgeContainerWide,
      ]}
    >
      <AppText
        size={getScaleSize(7)}
        lineHeight={getScaleSize(9)}
        font={FONTS.Inter.Bold}
        color={COLORS.white}
        align="center"
        style={styles.badgeText}
        allowFontScaling={false}
      >
        {label}
      </AppText>
    </View>
  );
};

export const HomeChatNotificationActions: React.FC<Props> = ({
  unreadNotificationCount = 0,
  unreadChatCount = 0,
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
          {unreadChatCount > 0 && renderBadge(unreadChatCount)}
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
          {unreadNotificationCount > 0 && renderBadge(unreadNotificationCount)}
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
    tintColor: COLORS._526674,
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
    paddingHorizontal: getScaleSize(2),
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  badgeContainerWide: {
    minWidth: getScaleSize(20),
    paddingHorizontal: getScaleSize(3),
  },
  badgeText: {
    includeFontPadding: false,
    textAlignVertical: 'center',
    ...(Platform.OS === 'ios'
      ? {
          marginTop: -0.5,
          letterSpacing: -0.2,
        }
      : {}),
  },
});
