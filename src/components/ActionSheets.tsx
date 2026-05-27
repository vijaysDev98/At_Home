import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import AppText from './AppText';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import { COLORS, FONTS } from '../utils';
import React from 'react';
import NavigationService from '../navigation/NavigationService';
import { SHOW_TOAST, STRING } from '../constant';
import { useTranslation } from 'react-i18next';

/**
 * Constants
 */
export const REVIEW_REASONS = [
  { key: 'missinginfo', value: 'Missing Information' },
  { key: 'incorrectpatientdetails', value: 'Incorrect Patient Details' },
  { key: 'incompleteform', value: 'Incomplete Form' },
  { key: 'other', value: 'Other' },
];
const DETAILS_MAX = 500;

/**
 * Warning Bottom Sheet (Used in ProviderForm)
 */
interface WarningSheetProps {
  isLock?: boolean;
}

export const WarningSheet = React.forwardRef<ActionSheetRef, WarningSheetProps>(
  ({ isLock }, ref) => {
    const sheetRef = React.useRef<ActionSheetRef>(null);

    React.useImperativeHandle(
      ref,
      () =>
      ({
        show: () => sheetRef.current?.show(),
        hide: () => sheetRef.current?.hide(),
        snapToOffset: (offset: number) =>
          sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      } as ActionSheetRef),
    );

    const { t } = useTranslation();


    return (
      <ActionSheet
        ref={sheetRef}
        gestureEnabled={!isLock}
        closeOnTouchBackdrop={!isLock}
        closeOnPressBack={!isLock}
        containerStyle={[
          styles.sheetContainer,
          { backgroundColor: COLORS.white },
        ]}
        indicatorStyle={styles.indicator}
      >
        <View style={styles.sheetContent}>
          <View style={styles.warningHeader}>
            <Image source={IMAGES.ic_warning} style={styles.warningIcon} />
            <AppText
              size={getScaleSize(18)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.warning)}
            </AppText>
          </View>

          <AppText
            size={getScaleSize(14)}
            color={COLORS._6F767E}
            font={FONTS.Inter.SemiBold}
            align="center"
            style={styles.warningText}
          >
            {t(STRING.formTemporarilyUnavailable)}
          </AppText>

          <TouchableOpacity
            style={styles.warningBackBtn}
            onPress={() => {
              sheetRef.current?.hide();
              if (isLock) {
                NavigationService.goBack();
              }
            }}
            activeOpacity={0.8}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.back)}
            </AppText>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    );
  },
);

/**
 * Request Review Bottom Sheet (Used in Service Detail)
 */
interface ReviewRequestSheetProps {
  onSend: (reason: string, details: string) => void;
}

export const ReviewRequestSheet = React.forwardRef<
  ActionSheetRef,
  ReviewRequestSheetProps
>(({ onSend }, ref) => {
  const { t } = useTranslation();
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const [selectedReason, setSelectedReason] = React.useState<string | null>(
    null,
  );
  const [reviewDetails, setReviewDetails] = React.useState('');

  React.useImperativeHandle(
    ref,
    () =>
    ({
      show: () => sheetRef.current?.show(),
      hide: () => sheetRef.current?.hide(),
      snapToOffset: (offset: number) =>
        sheetRef.current?.snapToOffset(offset),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
    } as ActionSheetRef),
  );

  const handleSend = () => {
    if (selectedReason && reviewDetails) {
      onSend(selectedReason || '', reviewDetails);
      // handleCancel();
      // sheetRef.current?.hide();
    } else {
      SHOW_TOAST(t(STRING.pleaseSelectAReasonAndEnterDetails), 'error');
    }
  };

  const handleCancel = () => {
    setSelectedReason(null);
    setReviewDetails('');
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled
      containerStyle={[
        styles.sheetContainer,
        { backgroundColor: COLORS.white },
      ]}
      indicatorStyle={styles.indicator}
      onClose={handleCancel}
    >
      <View style={styles.sheetContent}>
        <View style={{ borderBottomWidth: 1, borderColor: COLORS._F3F4F6 }}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={{ marginBottom: getScaleSize(4) }}
          >
            {t(STRING.requestReview)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._6B7280}
            style={{ marginBottom: getScaleSize(20) }}
          >
            {t(STRING.describeIssueWithThisService)}
          </AppText>
        </View>
        {/* Quick Select */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.quickSelect)}
            </AppText>
            <AppText
              size={getScaleSize(13)}
              color={COLORS.error}
              style={{ marginLeft: 4 }}
            >
              *
            </AppText>
          </View>
          <View style={styles.chips}>
            {REVIEW_REASONS.map(reason => {
              const active = selectedReason === reason.key;
              return (
                <TouchableOpacity
                  key={reason.key}
                  onPress={() => setSelectedReason(reason.key)}
                  activeOpacity={0.7}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Medium}
                    color={active ? COLORS._526674 : COLORS._1A1A1A}
                  >
                    {reason.value}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.details)}
            </AppText>
            <AppText
              size={getScaleSize(13)}
              color={COLORS.error}
              style={{ marginLeft: 4 }}
            >
              *
            </AppText>
          </View>
          <View style={styles.textareaContainer}>
            <TextInput
              value={reviewDetails}
              onChangeText={text =>
                text.length <= DETAILS_MAX && setReviewDetails(text)
              }
              placeholder={t(STRING.enterDetails)}
              placeholderTextColor={COLORS._6F767E}
              multiline
              numberOfLines={4}
              style={styles.textareaInput}
              textAlignVertical="top"
            />
          </View>
          <AppText
            size={getScaleSize(12)}
            color={COLORS._6F767E}
            align={'right'}
            style={styles.charCount}
          >
            {reviewDetails.length}/{DETAILS_MAX}
          </AppText>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              sheetRef.current?.hide();
              handleCancel();
            }}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.cancel)}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                flex: 2,
                backgroundColor: COLORS.error,
                flexDirection: 'row',
                gap: 8,
              },
            ]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Image
              source={IMAGES.ic_reload}
              style={{ width: 18, height: 18, tintColor: COLORS.white }}
            />
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.sendForReview)}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
});

/**
 * Complete Service Bottom Sheet (Used in Service Detail)
 */
interface CompleteServiceSheetProps {
  onComplete: () => void;
}

export const CompleteServiceSheet = React.forwardRef<
  ActionSheetRef,
  CompleteServiceSheetProps
>(({ onComplete }, ref) => {
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const { t } = useTranslation();
  React.useImperativeHandle(
    ref,
    () =>
    ({
      show: () => sheetRef.current?.show(),
      hide: () => sheetRef.current?.hide(),
      snapToOffset: (offset: number) =>
        sheetRef.current?.snapToOffset(offset),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
    } as ActionSheetRef),
  );

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled
      containerStyle={[
        styles.sheetContainer,
        { backgroundColor: COLORS.white },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.sheetContent}>
        <AppText
          size={getScaleSize(18)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          align={'center'}
          style={{ marginBottom: getScaleSize(12) }}
        >
          {t(STRING.completeService)}
        </AppText>

        <AppText
          size={getScaleSize(15)}
          color={COLORS._6F767E}
          align={'center'}
          style={{
            lineHeight: getScaleSize(22),
            marginBottom: getScaleSize(16),
            marginHorizontal: getScaleSize(20),
          }}
        >
          {t(STRING.completeServiceConfirmation)}
        </AppText>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { flex: 1 }]}
            onPress={() => sheetRef.current?.hide()}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.cancel)}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: '#526674', flex: 1 }]}
            activeOpacity={0.8}
            onPress={() => {
              onComplete();
              sheetRef.current?.hide();
            }}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.markAsCompleted)}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
});

/**
 * Logout Confirmation Bottom Sheet
 */
interface LogoutConfirmationSheetProps {
  onLogout: () => void;
}

export const LogoutConfirmationSheet = React.forwardRef<
  ActionSheetRef,
  LogoutConfirmationSheetProps
>((({ onLogout }, ref) => {
  const { t } = useTranslation();
  const sheetRef = React.useRef<ActionSheetRef>(null);

  React.useImperativeHandle(
    ref,
    () =>
    ({
      show: () => sheetRef.current?.show(),
      hide: () => sheetRef.current?.hide(),
      snapToOffset: (offset: number) =>
        sheetRef.current?.snapToOffset(offset),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
    } as ActionSheetRef),
  );

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled
      containerStyle={[
        styles.sheetContainer,
        { backgroundColor: COLORS.white },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.sheetContent}>
        <AppText
          size={getScaleSize(18)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          align={'center'}
          style={{ marginBottom: getScaleSize(12) }}
        >
          {t(STRING.logout)}
        </AppText>

        <AppText
          size={getScaleSize(15)}
          color={COLORS._6F767E}
          align={'center'}
          style={{
            lineHeight: getScaleSize(22),
            marginBottom: getScaleSize(16),
            marginHorizontal: getScaleSize(20),
          }}
        >
          {t(STRING.logoutConfirmation)}
        </AppText>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { flex: 1 }]}
            onPress={() => sheetRef.current?.hide()}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.cancel)}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: COLORS.error, flex: 1 }]}
            activeOpacity={0.8}
            onPress={() => {
              sheetRef.current?.hide();
              onLogout();
            }}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.logout)}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
}));

/**
 * Language Picker Bottom Sheet
 */
export const LANGUAGES = [
  { key: 'en', value: 'English', flag: '🇺🇸' },
  { key: 'fr', value: 'Français', flag: '🇫🇷' },
];

interface LanguagePickerSheetProps {
  onLanguageSelect: (language: { key: string; value: string; flag: string }) => void;
  currentLanguage?: string;
}

export const LanguagePickerSheet = React.forwardRef<
  ActionSheetRef,
  LanguagePickerSheetProps
>(({ onLanguageSelect, currentLanguage = 'en' }, ref) => {
  const { t } = useTranslation();
  const sheetRef = React.useRef<ActionSheetRef>(null);

  React.useImperativeHandle(
    ref,
    () =>
    ({
      show: () => sheetRef.current?.show(),
      hide: () => sheetRef.current?.hide(),
      snapToOffset: (offset: number) =>
        sheetRef.current?.snapToOffset(offset),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
    } as ActionSheetRef),
  );

  const handleLanguageSelect = (language: typeof LANGUAGES[0]) => {
    onLanguageSelect(language);
    sheetRef.current?.hide();
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled
      containerStyle={[
        styles.sheetContainer,
        { backgroundColor: COLORS.white },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.sheetContent}>
        <AppText
          size={getScaleSize(18)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          align={'center'}
          style={{ marginBottom: getScaleSize(12) }}
        >
          {t(STRING.selectLanguage)}
        </AppText>

        <AppText
          size={getScaleSize(15)}
          color={COLORS._6F767E}
          align={'center'}
          style={{
            lineHeight: getScaleSize(22),
            marginBottom: getScaleSize(20),
            marginHorizontal: getScaleSize(20),
          }}
        >
          {t(STRING.choosePreferredLanguage)}
        </AppText>

        <View style={styles.languageList}>
          {LANGUAGES.map(language => {
            const isSelected = language.key === currentLanguage;
            return (
              <TouchableOpacity
                key={language.key}
                onPress={() => handleLanguageSelect(language)}
                activeOpacity={0.7}
                style={[
                  styles.languageItem,
                  isSelected && styles.languageItemSelected,
                ]}
              >
                <View style={styles.languageLeft}>
                  <AppText
                    size={getScaleSize(24)}
                    style={styles.languageFlag}
                  >
                    {language.flag}
                  </AppText>
                  <View style={styles.languageInfo}>
                    <AppText
                      size={getScaleSize(16)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._1A1D1F}
                    >
                      {language.value}
                    </AppText>
                    <AppText
                      size={getScaleSize(13)}
                      color={COLORS._6F767E}
                      style={styles.languageCode}
                    >
                      {language.key.toUpperCase()}
                    </AppText>
                  </View>
                </View>
                {/* {isSelected && (
                  <View style={styles.languageCheck}>
                    <Image
                      source={IMAGES.ic_doubleTick}
                      style={styles.checkIcon}
                    />
                  </View>
                )} */}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { flex: 1 }]}
            onPress={() => sheetRef.current?.hide()}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.cancel)}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ActionSheet>
  );
});


const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
    zIndex: 9999,
  },
  indicator: {
    width: 48,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    paddingBottom: getScaleSize(10),
    marginTop: 10,
    backgroundColor: COLORS.white,
  },
  section: {
    marginTop: getScaleSize(20),
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: getScaleSize(8),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(8),
  },
  chip: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(20),
    backgroundColor: '#F4F6F8',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    borderColor: '#526674',
    backgroundColor: '#5266741A',
  },
  textarea: {
    backgroundColor: '#F4F6F8',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(12),
    minHeight: getScaleSize(120),
  },
  textareaInput: {
    flex: 1,
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS._1A1D1F,
    padding: 0,
  },
  charCount: {
    textAlign: 'right',
    marginTop: getScaleSize(4),
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getScaleSize(16),
  },
  warningIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    marginRight: getScaleSize(8),
  },
  warningText: {
    marginBottom: getScaleSize(24),
  },
  textareaContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    minHeight: getScaleSize(120),
  },
  warningBackBtn: {
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: getScaleSize(12),
    marginTop: getScaleSize(32),
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  sendBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    gap: getScaleSize(8),
    marginBottom: getScaleSize(20),
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  languageItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  languageFlag: {
    fontSize: getScaleSize(24),
  },
  languageInfo: {
    flex: 1,
  },
  languageCode: {
    marginTop: getScaleSize(2),
  },
  languageCheck: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
});
