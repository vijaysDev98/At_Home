import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { COLORS, FONTS } from '../utils';
import { AppText, AppButton } from './index';
import { getScaleSize } from '../utils/scaleSize';

export const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeaderContainer}>
    <AppText
      size={getScaleSize(13)}
      font={FONTS.Inter.Bold}
      color={COLORS._6B7280}
    >
      {title}
    </AppText>
  </View>
);

interface NotificationItemProps {
  title: string;
  subtitle: string;
  time: string;
  iconSource?: any;
  iconText?: string;
  unread?: boolean;
  action?: string;
}

export const NotificationItem = ({
  title,
  subtitle,
  time,
  iconSource,
  iconText,
  unread,
  action,
}: NotificationItemProps) => (
  <View style={styles.notificationRow}>
    <View style={[styles.iconWrap]}>
      {iconSource ? (
        <Image source={iconSource} style={[styles.iconImage]} />
      ) : (
        <AppText size={getScaleSize(20)}>{iconText}</AppText>
      )}
    </View>
    <View style={styles.cardBody}>
      <View style={styles.titleRow}>
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          style={styles.cardTitle}
        >
          {title}
        </AppText>
        <View style={styles.timeRow}>
          <AppText size={getScaleSize(11)} color={COLORS._6B7280}>
            {time}
          </AppText>
          {unread && <View style={styles.unreadDot} />}
        </View>
      </View>
      <AppText
        size={getScaleSize(13)}
        color={COLORS._6F767E}
        style={styles.subtitle}
      >
        {subtitle}
      </AppText>
      {action ? (
        <View style={styles.actionWrap}>
          <AppButton
            title={action}
            onPress={() => {}}
            style={styles.actionBtn}
            textSize={getScaleSize(12)}
            textFont={FONTS.Inter.SemiBold}
          />
        </View>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  notificationRow: {
    flexDirection: 'row',
    padding: getScaleSize(16),
    backgroundColor: COLORS.white,
  },
  iconWrap: {
    width: getScaleSize(60),
    height: getScaleSize(60),
    borderRadius: getScaleSize(45),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getScaleSize(12),
  },
  iconImage: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    resizeMode: 'contain',
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    marginRight: 12,
  },
  subtitle: {
    lineHeight: getScaleSize(20),
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  actionWrap: {
    marginTop: 12,
  },
  actionBtn: {
    height: getScaleSize(36),
    borderRadius: getScaleSize(8),
    alignSelf: 'flex-start',
    paddingHorizontal: getScaleSize(16),
  },
});
