import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../utils';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

interface AppLoaderProps {
  visible: boolean;
  signing?: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({
  visible,
  signing = false,
}) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.container}
      // Block touches behind the loader while it's visible;
      // rendered as a View overlay (not RN Modal) to avoid iOS touch-freeze bugs.
      pointerEvents="auto"
    >
      <View style={styles.loaderWrapper}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        {signing && (
          <AppText
            style={styles.signingText}
            font={FONTS.Inter.SemiBold}
            color={COLORS.primary}
          >
            {t(STRING.signing)}
          </AppText>
        )}
      </View>
    </View>
  );
};

export default React.memo(AppLoader);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderWrapper: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(24),
    borderRadius: getScaleSize(16),
    minWidth: getScaleSize(96),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signingText: {
    marginTop: getScaleSize(10),
    textAlign: 'center',
  },
});