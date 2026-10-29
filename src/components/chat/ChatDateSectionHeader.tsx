import React from 'react';
import { StyleSheet, View } from 'react-native';

import AppText from '../AppText';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';

type Props = {
  title: string;
};

export const ChatDateSectionHeader: React.FC<Props> = ({ title }) => {
  if (!title) {
    return null;
  }
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.Medium}
          color={COLORS._6F767E}
        >
          {title}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: getScaleSize(8),
    backgroundColor: COLORS._F9FAFB,
  },
  pill: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(5),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS._E5E7EB,
  },
});
