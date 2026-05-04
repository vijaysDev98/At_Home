import React, { useEffect, useState, useRef } from 'react';
import {
  Image,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Pressable,
  StyleProp,
  TextStyle,
  ViewStyle,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  trailing?: React.ReactNode;
  secureToggle?: boolean;
  labelSize?: number;
  labelColor?: string;
  labelFont?: string;
  leftIcon?: string;
  handlePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
  isMandatory?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  subText?: string;
  leftComponent?: React.ReactNode;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  helperStyle?: StyleProp<TextStyle>;
  containerBackgroundColor?: string;
  labelRight?: React.ReactNode;
  isLocked?: boolean;
  renderPicker?: () => React.ReactNode;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  infoText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  trailing,
  secureToggle,
  secureTextEntry,
  style,
  labelSize,
  labelColor,
  labelFont,
  leftIcon,
  handlePasswordVisibility,
  isPasswordVisible,
  isMandatory,
  isLoading,
  onPress,
  subText,
  leftComponent,
  inputStyle,
  helperStyle,
  containerBackgroundColor,
  labelRight,
  isLocked = false,
  renderPicker,
  inputWrapperStyle,
  infoText,
  ...rest
}) => {
  const { multiline } = rest;
  const [showTooltip, setShowTooltip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconRef = useRef<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const toggleTooltip = () => {
    if (!showTooltip) {
      iconRef.current?.measure((fx, fy, width, height, px, py) => {
        const { width: windowWidth } = Dimensions.get('window');
        let left = px - 10;
        if (left + 220 > windowWidth) {
          left = windowWidth - 236;
        }
        setTooltipPos({ top: py, left: Math.max(16, left) });
        setShowTooltip(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => setShowTooltip(false));
    }
  };

  // When locked: gray bg, no border colour, force non-editable
  const lockedBg = '#F3F4F6';
  const resolvedBg = isLocked
    ? lockedBg
    : containerBackgroundColor || COLORS.white;
  const resolvedBorder = isLocked ? lockedBg : COLORS._E5E7EB;
  const resolvedTrailing =
    trailing ||
    (isLocked ? (
      <Image
        source={IMAGES.lock}
        style={[styles.lockIcon, multiline && styles.lockIconTop]}
      />
    ) : null);
  return (
    <View style={[styles.root, style]}>
      {(labelRight || label) && (
        <View style={styles.labelRow}>
          {label ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText
                size={labelSize ? labelSize : getScaleSize(13)}
                color={labelColor ? labelColor : COLORS._1E293B}
                font={labelFont ? labelFont : FONTS.Inter.Medium}
                style={styles.label}
              >
                {label}{' '}
                {isMandatory && <AppText color={COLORS.error}>*</AppText>}
              </AppText>
              {infoText && (
                <TouchableOpacity
                  ref={iconRef}
                  onPress={toggleTooltip}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ marginLeft: 6 }}
                >
                  <Image
                    source={IMAGES.info}
                    style={{ width: 14, height: 14, tintColor: COLORS._64748B }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          {labelRight && labelRight}
        </View>
      )}
      <Modal
        visible={showTooltip}
        transparent
        animationType="none"
        onRequestClose={toggleTooltip}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'transparent' }}
          onPress={toggleTooltip}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: tooltipPos.top,
              left: tooltipPos.left,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
              backgroundColor: COLORS._1E293B,
              padding: 12,
              borderRadius: 8,
              width: 220,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <AppText
              size={getScaleSize(12)}
              color={COLORS.white}
              font={FONTS.Inter.Regular}
              style={{ lineHeight: 18 }}
            >
              {infoText}
            </AppText>
          </Animated.View>
        </Pressable>
      </Modal>
      {subText ? (
        <AppText
          size={getScaleSize(12)}
          color={COLORS._64748B}
          style={styles.subText}
        >
          {subText}
        </AppText>
      ) : null}

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.inputWrapper,
          { backgroundColor: resolvedBg, borderColor: resolvedBorder },
          !rest.multiline && styles.inputWrapperFixed,
          rest.multiline && styles.inputWrapperMultiline,
          error ? styles.inputWrapperError : null,
          inputWrapperStyle,
        ]}
      >
        {leftIcon && <Image source={leftIcon} style={styles.icon} />}
        {leftComponent && leftComponent}

        <TextInput
          {...rest}
          editable={isLocked ? false : onPress ? false : rest.editable}
          style={[styles.input, isLocked && styles.inputLocked, inputStyle]}
          placeholderTextColor={COLORS._1E293B}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
        />

        {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={handlePasswordVisibility}
            style={styles.icon}
            activeOpacity={0.8}
          >
            <Image
              source={
                isPasswordVisible ? IMAGES.open_eye_icon : IMAGES.close_eye_icon
              }
              style={styles.icon}
            />
          </TouchableOpacity>
        ) : resolvedTrailing ? (
          <View style={styles.icon}>{resolvedTrailing}</View>
        ) : null}
        {renderPicker && renderPicker()}
      </Pressable>

      {error ? (
        <View style={styles.helperRow}>
          <Image source={IMAGES.error_icon} style={{ width: 11, height: 11 }} />
          <AppText
            size={12}
            color="#ef4444"
            style={[styles.helperText, helperStyle]}
          >
            {error}
          </AppText>
        </View>
      ) : helper ? (
        <AppText
          size={12}
          color="#64748b"
          style={[styles.helperText, helperStyle]}
        >
          {helper}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: getScaleSize(24),
  },
  label: {
    marginBottom: 0, // Handled by labelRow gap/margin
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subText: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    borderRadius: 12,
    gap: getScaleSize(8),
    paddingHorizontal: getScaleSize(16),
  },
  inputWrapperFixed: {
    height: getScaleSize(56),
  },
  inputWrapperMultiline: {
    minHeight: getScaleSize(56),
    // alignItems: 'flex-start',
    // paddingVertical: getScaleSize(14),
  },
  inputWrapperError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    fontSize: getScaleSize(15),
    color: '#1e293b',
  },
  inputLocked: {
    color: COLORS._6B7280,
  },
  lockIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: '#C4C8CC',
  },
  lockIconTop: {
    alignSelf: 'flex-start',
    marginTop: getScaleSize(2),
  },
  icon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  helperText: {
    // marginTop: 6,
  },
});

export default Input;
