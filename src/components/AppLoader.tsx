import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { COLORS } from '../utils';
import { AppSafeAreaView } from './AppSafeAreaView';

interface AppLoaderProps {
  visible: boolean;
}

const AppLoader: React.FC<AppLoaderProps> = ({ visible }) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <AppSafeAreaView edges={false} style={styles.container}>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </AppSafeAreaView>
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
