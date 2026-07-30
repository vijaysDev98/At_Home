import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextStyle,
} from 'react-native';
import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { COLORS, FONTS } from '../utils';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';
import AppButton from './AppButton';

const Header = ({
  isBack = false,
  title,
  backIcon,
  style,
  leftContent,
  subTitle,
  titleStyle,
  titleContainerStyle,
  isNotification = false,
  onNotificationPress,
  unreadCount = 0,
  isViewForm = false,
  onViewFormPress,
}: {
  isBack?: boolean;
  title?: String;
  backIcon?: String;
  style?: ViewStyle;
  leftContent?: () => React.ReactNode;
  subTitle?: String;
  titleStyle?: TextStyle;
  titleContainerStyle?: ViewStyle;
  isNotification?: boolean;
  onNotificationPress?: () => void;
  unreadCount?: number;
  isViewForm?: boolean;
  onViewFormPress?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <View style={[styles.header, style]}>
      <View style={styles.content}>
        {isBack && (
          <TouchableOpacity
            activeOpacity={0.8}
            hitSlop={20}
            style={backIcon ? {} : styles.backBtn}
            onPress={() => NavigationService.goBack()}
          >
            <Image
              source={backIcon ? backIcon : IMAGES.arrowLeft}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        )}
        <View style={[styles.titleContainer, titleContainerStyle]}>
          <View style={styles.titleRow}>
            {title ? (
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                style={[styles.title, titleStyle]}
              >
                {title}
              </AppText>
            ) : null}
            {isViewForm && (
              <AppButton
                style={styles.viewFormBtn}
                textSize={getScaleSize(10)}
                onPress={onViewFormPress || (() => {})}
                title={t(STRING.viewForm)}
              />
            )}
          </View>
          {subTitle ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6B7280}
            >
              {subTitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {leftContent && leftContent()}
      {isNotification && unreadCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.notificationBtn}
          onPress={onNotificationPress}
        >
          <Text style={styles.notificationText}>{t(STRING.markAllAsRead)}</Text>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    flex: 1,
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
    width: getScaleSize(17),
    height: getScaleSize(15),
    resizeMode: 'contain',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    flexShrink: 1,
    marginRight: getScaleSize(8),
  },
  viewFormBtn: {
    height: getScaleSize(28),
    borderRadius: getScaleSize(6),
    paddingHorizontal: getScaleSize(10),
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 'auto',
    height: 32,
    borderRadius: 16,
    // borderWidth: 1,
    // borderColor: COLORS.slate200,
    // backgroundColor: COLORS.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  notificationText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: FONTS.Inter.Medium,
  },
});
