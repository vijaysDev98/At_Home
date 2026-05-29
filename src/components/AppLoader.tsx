import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { COLORS, FONTS } from '../utils';
import { AppSafeAreaView } from './AppSafeAreaView';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';

interface AppLoaderProps {
  visible: boolean;
  signing?: boolean
}

const AppLoader: React.FC<AppLoaderProps> = ({ visible, signing = false }) => {
  const { t } = useTranslation();
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.container}>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {signing && <AppText style={{ marginTop: getScaleSize(10) }} font={FONTS.Inter.SemiBold} color={COLORS.primary}>{t(STRING.signing)}</AppText>}
        </View>
      </View>
    </Modal>
  );
};

export default AppLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderWrapper: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
