import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant';
import AppText from '../AppText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface InternReviewData {
  internId: string;
  internName: string;
  internEmail?: string;
  internPhone?: string;
  facilityName?: string;
  profileImg?: string | null;
  notificationId?: string;
}

export interface RppsAuthorizationModalProps {
  visible: boolean;
  internData: InternReviewData | null;
  onClose: () => void;
  onApprove: (internId: string) => Promise<void> | void;
  onReject: (internId: string) => Promise<void> | void;
  isProcessing?: boolean;
}

export const RppsAuthorizationModal: React.FC<RppsAuthorizationModalProps> = ({
  visible,
  internData,
  onClose,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const { t } = useTranslation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Reset authorization checkbox when modal opens or intern changes
  useEffect(() => {
    if (visible) {
      setIsAuthorized(false);
    }
  }, [visible, internData?.internId]);

  if (!internData) {
    return null;
  }

  const handleApprovePress = () => {
    if (!isAuthorized || isProcessing) return;
    onApprove(internData.internId);
  };

  const handleRejectPress = () => {
    if (isProcessing) return;
    Alert.alert(
      t(STRING.rejectIntern) || 'Reject Request',
      t(STRING.areYouSureYouWantToReject) ||
        'Are you sure you want to decline this medical intern request?',
      [
        {
          text: t(STRING.cancel) || 'Cancel',
          style: 'cancel',
        },
        {
          text: t(STRING.rejectIntern) || 'Reject',
          style: 'destructive',
          onPress: () => {
            onReject(internData.internId);
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => {
        if (!isProcessing) {
          onClose();
        }
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.shieldBadge}>
                <Image
                  source={IMAGES.securityIcon || IMAGES.ic_warning}
                  style={styles.shieldIcon}
                  resizeMode="contain"
                />
              </View>
              <AppText
                size={getScaleSize(15.5)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                style={styles.headerTitle}
                numberOfLines={2}
              >
                {t(STRING.rppsAuthorizationTitle)}
              </AppText>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isProcessing}
              activeOpacity={0.7}
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS._6B7280 || '#6B7280'}
              >
                ✕
              </AppText>
            </TouchableOpacity>
          </View>

          {/* SCROLLABLE BODY */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* INTERN INFORMATION CARD */}
            <View style={styles.internInfoCard}>
              <View style={styles.avatarWrap}>
                <Image
                  source={
                    internData.profileImg
                      ? { uri: internData.profileImg }
                      : IMAGES.role_intern
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.internInfoText}>
                <AppText
                  size={getScaleSize(14.5)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                >
                  {internData.internName || 'Medical Intern'}
                </AppText>
                {!!internData.internEmail && (
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                    style={{ marginTop: getScaleSize(2) }}
                  >
                    {internData.internEmail}
                  </AppText>
                )}
                {!!internData.facilityName && (
                  <AppText
                    size={getScaleSize(11.5)}
                    font={FONTS.Inter.Medium}
                    color={COLORS.primary}
                    style={{ marginTop: getScaleSize(2) }}
                  >
                    {internData.facilityName}
                  </AppText>
                )}
              </View>
            </View>

            {/* AUTHORIZATION NOTICE */}
            <View style={styles.noticeBox}>
              <AppText
                size={getScaleSize(12.5)}
                font={FONTS.Inter.Regular}
                color={COLORS._1A1D1F}
                style={styles.noticeParagraph}
              >
                {t(STRING.rppsAuthorizationDesc1)}
              </AppText>
              <AppText
                size={getScaleSize(12.5)}
                font={FONTS.Inter.Regular}
                color={COLORS._1A1D1F}
                style={[styles.noticeParagraph, { marginBottom: 0 }]}
              >
                {t(STRING.rppsAuthorizationDesc2)}
              </AppText>
            </View>

            {/* MANDATORY ACKNOWLEDGMENT CHECKBOX */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAuthorized(prev => !prev)}
              disabled={isProcessing}
              style={[
                styles.checkboxCard,
                isAuthorized && styles.checkboxCardChecked,
              ]}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  isAuthorized && styles.checkboxSquareChecked,
                ]}
              >
                {isAuthorized && (
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                  >
                    ✓
                  </AppText>
                )}
              </View>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Medium}
                color={COLORS._1A1D1F}
                style={styles.checkboxLabel}
              >
                {t(STRING.rppsAuthorizationCheckbox)}
              </AppText>
            </TouchableOpacity>
          </ScrollView>

          {/* FOOTER ACTIONS */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRejectPress}
              disabled={isProcessing}
              style={styles.rejectBtn}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.error || '#DC2626'}
              >
                {t(STRING.rejectIntern) || 'Reject'}
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleApprovePress}
              disabled={!isAuthorized || isProcessing}
              style={[
                styles.approveBtn,
                (!isAuthorized || isProcessing) && styles.approveBtnDisabled,
              ]}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {t(STRING.approveIntern) || 'Approve'}
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RppsAuthorizationModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
  },
  modalCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(18),
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: getScaleSize(10),
  },
  shieldBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getScaleSize(8),
  },
  shieldIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS.primary,
  },
  headerTitle: {
    flex: 1,
  },
  closeBtn: {
    padding: getScaleSize(4),
  },
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(18),
    paddingVertical: getScaleSize(16),
  },
  internInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: getScaleSize(14),
  },
  avatarWrap: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginRight: getScaleSize(12),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  internInfoText: {
    flex: 1,
  },
  noticeBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: getScaleSize(14),
    marginBottom: getScaleSize(14),
  },
  noticeParagraph: {
    lineHeight: getScaleSize(18),
    marginBottom: getScaleSize(10),
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: getScaleSize(12),
  },
  checkboxCardChecked: {
    borderColor: COLORS.primary,
  },
  checkboxSquare: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    borderRadius: getScaleSize(5),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getScaleSize(10),
    marginTop: getScaleSize(1),
  },
  checkboxSquareChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    flex: 1,
    lineHeight: getScaleSize(18),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(18),
    paddingVertical: getScaleSize(14),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: COLORS.white,
  },
  rejectBtn: {
    flex: 1,
    height: getScaleSize(46),
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    flex: 1.3,
    height: getScaleSize(46),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
