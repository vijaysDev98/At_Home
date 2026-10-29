import React, { forwardRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import ActionSheet, { ActionSheetRef, ActionSheetProps } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';

interface AppBottomSheetProps extends ActionSheetProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

const AppBottomSheet = forwardRef<ActionSheetRef, AppBottomSheetProps>(
  ({ children, containerStyle, ...rest }, ref) => {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom, getScaleSize(16));

    return (
      <ActionSheet
        ref={ref}
        gestureEnabled
        containerStyle={[
          styles.container,
          { paddingBottom: bottomPad },
          containerStyle,
        ]}
        indicatorStyle={styles.indicator}
        defaultOverlayOpacity={0.4}
        {...rest}
      >
        <View style={styles.inner}>
          {children}
        </View>
      </ActionSheet>
    );
  }
);

export default AppBottomSheet;

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  indicator: {
    width: 48,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  inner: {
    marginTop: 10,
  },
});
