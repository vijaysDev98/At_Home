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
} from 'react-native';
import { CountryPicker, countryCodes } from 'react-native-country-codes-picker';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';
import { useTranslation } from 'react-i18next';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  trailing?: React.ReactNode;
  secureToggle?: boolean;
  labelSize?: number;
  labelColor?: string;
  labelFont?: string;
  leftIcon?: any;
  handlePasswordVisibility?: () => void;
  isPasswordVisible?: boolean;
  isMandatory?: boolean;
  isLoading?: boolean;
  onPress?: () => void;
  subText?: string;
  leftComponent?: React.ReactNode;
  inputStyle?: StyleProp<TextStyle>;
  inputWrapper?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  helperStyle?: StyleProp<TextStyle>;
  containerBackgroundColor?: string;
  labelRight?: React.ReactNode;
  isLocked?: boolean;
  renderPicker?: () => React.ReactNode;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  placeholderTextColor?: string;
  isCountryCode?: boolean;
  countryCode?: string;
  onCountryCodeSelect?: (code: string) => void;
  nameOnly?: boolean;
  isNumberOnly?: boolean;
  // isFiness?: boolean;
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
  inputWrapper,
  helperStyle,
  containerBackgroundColor,
  labelRight,
  isLocked = false,
  renderPicker,
  inputWrapperStyle,
  placeholderTextColor,
  isCountryCode,
  countryCode,
  onCountryCodeSelect,
  nameOnly = false,
  isNumberOnly = false,
  // isFiness = false,
  ...rest
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslation();
  const { multiline } = rest;
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

  const isNumericKeyboard =
    rest.keyboardType === 'numeric' ||
    rest.keyboardType === 'number-pad' ||
    rest.keyboardType === 'decimal-pad' ||
    rest.keyboardType === 'phone-pad';

  const isNameField = nameOnly === true;

  const handleChangeText = (text: string) => {
    if (!rest.onChangeText) return;

    // if (isFiness) {
    //   const cleaned = text.replace(/[^0-9]/g, '');

    //   const formatted = cleaned
    //     .match(/.{1,3}/g)
    //     ?.join('-') ?? '';

    //   rest.onChangeText(formatted);
    //   return;
    // }

    if (isCountryCode) {
      const cleaned = text.replace(/[^0-9]/g, ''); // ✅ digits only, nothing else
      rest.onChangeText(cleaned);
    } else if (isNameField) {
      // ✅ letters only (including spaces, hyphens, and apostrophes for names)
      const cleaned = text.replace(/[^a-zA-Z\s\-']/g, '');
      rest.onChangeText(cleaned);
    } else if (isNumberOnly || isNumericKeyboard) {
      const cleaned = text
        .replace(/[^0-9.]/g, '')
        .replace(/^\./, '')
        .replace(/(\..*)\./g, '$1');

      rest.onChangeText(cleaned);
    } else {
      rest.onChangeText(text);
    }
  };

  const selectedCountry = React.useMemo(() => {
    if (!countryCode) {
      return countryCodes.find(item => item.code === 'US');
    }

    return (
      countryCodes.find(
        item => item.code?.toLowerCase() === countryCode.toLowerCase(),
      ) || countryCodes.find(item => item.code === 'US')
    );
  }, [countryCode]);

  const resolvedFlag = selectedCountry?.flag || '🇺🇸';
  const resolvedCode = selectedCountry?.dial_code || '+1';

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
            </View>
          ) : null}
          {labelRight && labelRight}
        </View>
      )}
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
        disabled={isLocked || !onPress}
        style={[
          styles.inputWrapper, inputWrapper,
          { backgroundColor: resolvedBg, borderColor: resolvedBorder },
          !rest.multiline && styles.inputWrapperFixed,
          rest.multiline && styles.inputWrapperMultiline,
          error ? styles.inputWrapperError : null,
          inputWrapperStyle,
        ]}
      >
        {isCountryCode ? (
          <>
            <TouchableOpacity
              disabled={rest.editable === false}
              onPress={() => setShowPicker(true)}
              style={styles.countryCodeSelector}
              activeOpacity={0.8}
            >
              <AppText size={getScaleSize(16)} style={styles.flagText}>
                {resolvedFlag}
              </AppText>
              <AppText
                size={getScaleSize(15)}
                color={COLORS._1E293B}
                font={FONTS.Inter.Medium}
              >
                {resolvedCode}
              </AppText>
              {rest.editable !== false && (
                <Image
                  source={IMAGES.arrow_bottom}
                  style={styles.dropdownArrow}
                />
              )}
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
          </>
        ) : leftIcon ? (
          <Image source={leftIcon} style={styles.icon} />
        ) : null}
        {leftComponent && leftComponent}

        <TextInput
          {...rest}
          onChangeText={handleChangeText}
          editable={isLocked ? false : onPress ? false : rest.editable}
          pointerEvents={onPress ? 'none' : undefined}
          style={[styles.input, isLocked && styles.inputLocked, inputStyle]}
          placeholderTextColor={placeholderTextColor || COLORS._1E293B80}
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
        <View style={[styles.helperRow, { marginVertical: getScaleSize(8) }]}>
          <Image source={IMAGES.error_icon} style={{ width: 11, height: 11 }} />
          <AppText
            size={getScaleSize(12)}
            color={COLORS.error}
            style={[styles.helperText]}
          >
            {typeof error === 'string' ? t(error) : error}
          </AppText>
        </View>
      ) : helper ? (
        <AppText
          size={12}
          color="#64748b"
          style={[styles.helperText, helperStyle]}
        >
          {typeof helper === 'string' ? t(helper) : helper}
        </AppText>
      ) : null}

      {isCountryCode && (
        <CountryPicker
          show={showPicker}
          pickerButtonOnPress={item => {
            onCountryCodeSelect?.(item.code);
            setShowPicker(false);
          }}
          style={{
            modal: {
              flex: 0.5,
            },
          }}
          inputPlaceholder={t(STRING.searchYourCountry)}
          onRequestClose={() => setShowPicker(false)}
          onBackdropPress={() => setShowPicker(false)}
          lang={'en'}
        />
      )}
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
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: getScaleSize(15),
    color: COLORS._1E293B,
  },
  inputLocked: {
    color: COLORS._6B7280,
  },
  lockIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._C4C8CC,
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
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    paddingRight: getScaleSize(4),
  },
  flagText: {
    marginRight: getScaleSize(2),
  },
  dropdownArrow: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
    tintColor: COLORS._64748B,
  },
  verticalDivider: {
    width: 1,
    height: getScaleSize(24),
    backgroundColor: COLORS._E5E7EB,
    marginRight: getScaleSize(4),
  },
});

export default Input;
