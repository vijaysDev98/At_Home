import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from '../AppText';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import {
  getServiceIcon,
  MASTER_SERVICES_LIST,
  ServiceConfig,
} from '../../constant/services';

type Props = {
  awaitingSignatureByService?: Record<string, number>;
  services?: ServiceConfig[];
  onServicePress: (service: ServiceConfig) => void;
};

const getServiceCount = (
  service: ServiceConfig,
  awaitingSignatureByService?: Record<string, number>,
): number => {
  if (!awaitingSignatureByService || !service?.id) return 0;
  return awaitingSignatureByService[service.id] || 0;
};

export const DoctorServicesGrid: React.FC<Props> = ({
  awaitingSignatureByService,
  services = MASTER_SERVICES_LIST,
  onServicePress,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.servicesGrid}>
      {services.map(service => {
        const count = getServiceCount(service, awaitingSignatureByService);
        return (
          <TouchableOpacity
            key={service.id}
            activeOpacity={0.9}
            onPress={() => onServicePress(service)}
            style={[styles.serviceCard, { backgroundColor: service.bgColor }]}
          >
            <View style={styles.cardIconBox}>
              <Image
                source={getServiceIcon(service.id)}
                style={styles.serviceIcon}
              />
            </View>
            <View style={styles.cardTextBox}>
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
                style={styles.cardTitleText}
                numberOfLines={2}
              >
                {t(service.name)}
              </AppText>
            </View>
            {count > 0 && (
              <View style={styles.serviceBadgeCircle}>
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                  style={styles.serviceBadgeText}
                >
                  {count > 99 ? '99+' : count}
                </AppText>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(18),
    gap: getScaleSize(10),
  },
  serviceCard: {
    width: '48%',
    height: getScaleSize(84),
    borderRadius: getScaleSize(16),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
    position: 'relative',
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  cardIconBox: {
    width: getScaleSize(42),
    height: getScaleSize(54),
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: {
    width: getScaleSize(40),
    height: getScaleSize(50),
    resizeMode: 'contain',
  },
  cardTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleText: {
    lineHeight: getScaleSize(16),
  },
  serviceBadgeCircle: {
    position: 'absolute',
    top: -getScaleSize(6),
    right: -getScaleSize(6),
    backgroundColor: '#E52323',
    minWidth: getScaleSize(26),
    height: getScaleSize(26),
    borderRadius: getScaleSize(13),
    borderWidth: 1,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(4),
    zIndex: 20,
    elevation: 6,
  },
  serviceBadgeText: {
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? getScaleSize(14) : undefined,
  },
});

export default DoctorServicesGrid;
