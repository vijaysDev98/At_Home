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
  REQUEST_STATUS,
} from '../constant/RequestStatus';

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

        <View style={titleContainerStyle}>
          {title ? (
            <AppText
              size={getScaleSize(20)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={titleStyle}
            >
              {title}
            </AppText>
          ) : null}

          {subTitle ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6B7280}
            >
              {subTitle}
            </AppText>
          ) : null}

          {(requestStatus || formStatus) && (
            <View style={styles.statusRow}>
              {requestStatus ? (
                <>
                  <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                    Request Status:{' '}
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Bold}
                      color={getStatusBadgeColor(requestStatus)}
                    >
                      {requestStatus}
                    </AppText>
                  </AppText>

                  {formStatus ? <View style={styles.statusDivider} /> : null}
                </>
              ) : null}
              {status ? (
                <AppText
                  style={{ marginRight: getScaleSize(10) }}
                  size={getScaleSize(12)}
                  color={COLORS._6F767E}
                >
                  Request Status:{' '}
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Bold}
                    color={getStatusBadgeColor(status)}
                  >
                    {DISPLAY_FORM_STATUS[status]}
                  </AppText>
                </AppText>
              ) : null}
              {formStatus ? (
                <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                  Form Status:{' '}
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Bold}
                    color={getStatusBadgeColor(formStatus)}
                  >
                    {DISPLAY_FORM_STATUS[formStatus]}
                  </AppText>
                </AppText>
              ) : null}
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
    alignItems: 'center',
    marginTop: getScaleSize(4),
    flexWrap: 'wrap',
  },

  statusDivider: {
    width: 1,
    height: getScaleSize(12),
    backgroundColor: COLORS._D1D5DB,
    marginHorizontal: getScaleSize(8),
  },
});
