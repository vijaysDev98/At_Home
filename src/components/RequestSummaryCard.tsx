import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';

interface RequestSummaryCardProps {
  patientName: string;
  patientMeta: string;
  patientAvatar?: string;
  serviceTitle: string;
  serviceCategory?: string;
  serviceIcon: any;
  showEdit?: boolean;
  onEditPatient?: () => void;
  onEditService?: () => void;
  style?: StyleProp<ViewStyle>;
  rightContent?: React.ReactNode;
}

const RequestSummaryCard: React.FC<RequestSummaryCardProps> = ({
  patientName,
  patientMeta,
  patientAvatar,
  serviceTitle,
  serviceCategory = 'Primary Service',
  serviceIcon,
  showEdit = false,
  onEditPatient,
  onEditService,
  style,
  rightContent,
}) => {
  return (
    <View style={[styles.summaryCard, style]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <View style={styles.avatarWrap}>
            <Image
              source={
                patientAvatar
                  ? { uri: patientAvatar }
                  : {
                      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
                    }
              }
              style={styles.avatar}
            />
          </View>
          <View style={styles.summaryTextBlock}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {patientName}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >
              {patientMeta}
            </AppText>
          </View>
        </View>
        {rightContent
          ? rightContent
          : showEdit && (
              <TouchableOpacity activeOpacity={0.8} onPress={onEditPatient}>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._526674}
                >
                  Edit
                </AppText>
              </TouchableOpacity>
            )}
      </View>

      <View style={styles.summaryRowDivider} />

      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <View style={[styles.avatarWrap, styles.serviceIconWrap]}>
            <Image source={serviceIcon} style={styles.avatar} />
          </View>
          <View style={styles.summaryTextBlock}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {serviceTitle}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >
              {serviceCategory}
            </AppText>
          </View>
        </View>
        {showEdit && (
          <TouchableOpacity activeOpacity={0.8} onPress={onEditService}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Medium}
              color={COLORS._526674}
            >
              Edit
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    paddingVertical: getScaleSize(14),
    paddingHorizontal: getScaleSize(17),
    gap: getScaleSize(12),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRowDivider: {
    height: getScaleSize(1),
    backgroundColor: COLORS._EFEFEF,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  avatarWrap: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    backgroundColor: '#e8edf1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    height: getScaleSize(40),
    width: getScaleSize(40),
  },
  serviceIconWrap: {
    backgroundColor: '#e7eef3',
  },
  summaryTextBlock: {
    gap: getScaleSize(2),
  },
});

export default RequestSummaryCard;
