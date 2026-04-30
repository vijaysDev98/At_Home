import React, { forwardRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import ActionSheet, { ActionSheetRef, ActionSheetProps } from 'react-native-actions-sheet';
import { COLORS } from '../utils';

interface AppBottomSheetProps extends ActionSheetProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

const AppBottomSheet = forwardRef<ActionSheetRef, AppBottomSheetProps>(
  ({ children, containerStyle, ...rest }, ref) => {
    return (
      <ActionSheet
        ref={ref}
        gestureEnabled
        containerStyle={[styles.container, containerStyle]}
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
    paddingBottom: 30,
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
