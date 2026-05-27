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
import moment from 'moment';
import ProfileAvatar from './ProfileAvatar';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

interface RequestSummaryCardProps {
  patient?: any;
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
  patient,
  serviceTitle,
  serviceCategory = 'Primary Service',
  serviceIcon,
  showEdit = false,
  onEditPatient,
  onEditService,
  style,
  rightContent,
}) => {
  const { t } = useTranslation();
  const name = patient?.fName + ' ' + patient?.lName || 'N/A';
  const age =
    'ID: PT-' +
    (patient?.id?.slice(-4).toUpperCase() || '0000') +
    ' • ' +
    (patient?.age || '0') +
    ' yrs';

  return (
    <View style={[styles.summaryCard, style]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <ProfileAvatar name={name} size="small" />
          <View style={styles.summaryTextBlock}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {name}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >
              {age}
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
                {t(STRING.edit)}
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
              {t(STRING.edit)}
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
    backgroundColor: COLORS._E8EDF1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    height: getScaleSize(40),
    width: getScaleSize(40),
  },
  serviceIconWrap: {
    backgroundColor: COLORS._E7EEF3,
  },
  summaryTextBlock: {
    gap: getScaleSize(2),
  },
});

export default RequestSummaryCard;
