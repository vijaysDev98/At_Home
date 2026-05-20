import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextStyle,
  ViewStyle,
} from 'react-native';

import { IMAGES } from '../assets/images';
import NavigationService from '../navigation/NavigationService';
import { COLORS, FONTS } from '../utils';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import {
  DISPLAY_FORM_STATUS,
  getStatusBadgeColor,
} from '../constant/RequestStatus';
import AppButton from './AppButton';

const HeaderProvider = ({
  isBack = false,
  title,
  backIcon,
  style,
  leftContent,
  subTitle,
  titleStyle,
  titleContainerStyle,
  requestStatus,
  formStatus,
  status,
  isViewForm,
  onViewFormPress,
}: {
  isBack?: boolean;
  title?: string;
  backIcon?: any;
  style?: ViewStyle;
  leftContent?: () => React.ReactNode;
  subTitle?: string;
  titleStyle?: TextStyle;
  titleContainerStyle?: ViewStyle;
  requestStatus?: string;
  status?: string;
  formStatus?: string;
  isViewForm?: boolean;
  onViewFormPress?: () => void;
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.content}>
        {isBack && (
          <TouchableOpacity
            activeOpacity={0.8}
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
                size={getScaleSize(20)}
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
                title="View Form"
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

          {(requestStatus || formStatus || status) && (
            <View style={styles.statusRow}>
              {(requestStatus || status) && (
                <View style={styles.statusBadge}>
                  <AppText
                    size={getScaleSize(12)}
                    color={COLORS._526674}
                    font={FONTS.Inter.Regular}
                  >
                    Request Status:
                  </AppText>

                  <AppText
                    size={getScaleSize(12)}
                    color={getStatusBadgeColor(requestStatus || status || '')}
                    font={FONTS.Inter.SemiBold}
                  >
                    {requestStatus || DISPLAY_FORM_STATUS[status || ''] || ''}
                  </AppText>
                </View>
              )}

              {formStatus && (
                <View style={styles.statusBadge}>
                  <AppText
                    size={getScaleSize(12)}
                    color={COLORS._526674}
                    font={FONTS.Inter.Regular}
                  >
                    Form Status:
                  </AppText>

                  <AppText
                    size={getScaleSize(12)}
                    color={getStatusBadgeColor(formStatus)}
                    font={FONTS.Inter.SemiBold}
                  >
                    {DISPLAY_FORM_STATUS[formStatus]}
                  </AppText>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {leftContent && leftContent()}
    </View>
  );
};

export default HeaderProvider;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getScaleSize(12),
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    flex: 1,
  },

  backBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
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

  statusRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    marginTop: getScaleSize(4),
    flexWrap: 'wrap',
  },

  statusBadge: {
    flexDirection: 'row',
    gap: getScaleSize(4),
    alignItems: 'flex-start',
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
});
