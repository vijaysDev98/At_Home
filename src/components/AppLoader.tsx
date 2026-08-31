import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
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

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      hardwareAccelerated
      // Required on Android, otherwise it throws a warning
      // and the hardware back button won't be handled.
      onRequestClose={() => { }}
    >
      <View
        style={styles.container}
        // Block touches behind the loader while it's visible,
        // regardless of "signing" state.
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
    </Modal>
  );
};

export default React.memo(AppLoader);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: Dimensions.get('screen').height,
    backgroundColor: 'rgba(0,0,0,0.25)',
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