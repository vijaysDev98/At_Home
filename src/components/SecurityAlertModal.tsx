import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { STRING } from '../constant';
import { IMAGES } from '../assets/images';

export interface SecurityAlertModalProps {
  visible: boolean;
  /** Called when the user taps "Cancel" */
  onCancel: () => void;
  /** Called when the user taps "Still Proceed" */
  onProceed: () => void;
}

const SecurityAlertModal: React.FC<SecurityAlertModalProps> = ({
  visible,
  onCancel,
  onProceed,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Image source={IMAGES.ic_warning} style={styles.warningIcon} />
          </View>

          {/* Title */}
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            align="center"
            style={styles.title}
          >
            {t(STRING.securityAlertTitle)}
          </AppText>

          {/* Description */}
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
            align="center"
            lineHeight={getScaleSize(20)}
            style={styles.description}
          >
            {t(STRING.securityAlertDescription)}
          </AppText>

          {/* Actions */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.cancel)}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onProceed}
              style={styles.proceedButton}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.white}
                align="center"
              >
                {t(STRING.proceedAnyWay)}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SecurityAlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '88%',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(24),
    padding: getScaleSize(24),
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: getScaleSize(56),
    height: getScaleSize(56),
    borderRadius: getScaleSize(28),
    backgroundColor: COLORS.draft + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getScaleSize(16),
  },
  warningIcon: {
    width: getScaleSize(28),
    height: getScaleSize(28),
    // tintColor: COLORS.error,
    resizeMode: 'contain',
  },
  title: {
    marginBottom: getScaleSize(8),
  },
  description: {
    marginBottom: getScaleSize(24),
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: getScaleSize(12),
  },
  cancelButton: {
    flex: 1,
    height: getScaleSize(48),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButton: {
    flex: 1,
    height: getScaleSize(48),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
