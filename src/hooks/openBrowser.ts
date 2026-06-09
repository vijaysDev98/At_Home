import { Text } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { COLORS } from '../utils';

export const openInBrowser = async (url: string) => {
  try {
    const isAvailable = await InAppBrowser.isAvailable();

    if (isAvailable) {
      await InAppBrowser.open(url, {
        dismissButtonStyle: 'close',
        preferredBarTintColor: COLORS.primary,
        preferredControlTintColor: COLORS.white,
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalEnabled: true,
        enableBarCollapsing: false,
        showTitle: true,
      });
    }
  } catch (error) {
    console.log('InAppBrowser error:', error);
  }
};
