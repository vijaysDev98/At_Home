import Toast from 'react-native-toast-message';

export function SHOW_TOAST(
  message: string | null | undefined,
  type: 'success' | 'error' | 'info' = 'error',
) {
  Toast.show({
    type,
    text1: message ?? 'Something went wrong',
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 50,
  });
}

export function SHOW_SUCCESS_TOAST(message: string) {
  SHOW_TOAST(message, 'success');
}