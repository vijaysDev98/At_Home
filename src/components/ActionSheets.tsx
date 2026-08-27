import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
  AppState,
  AppStateStatus,
  ScrollView,
} from 'react-native';
import { FlatList as GestureFlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import AppText from './AppText';
import Input from './Input';
import ProfileAvatar from './ProfileAvatar';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import { COLORS, FONTS } from '../utils';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import { SHOW_TOAST, STRING } from '../constant';
import { useTranslation } from 'react-i18next';
import { getProvidersService, getServicesService } from '../services/patientService';
import { MASTER_SERVICES_LIST } from '../constant/services';
import { IMAGE_BASE_URL } from '../api/apiRoutes';
import { Provider } from '../screens/doctor/providers/ProvidersCallList';
import moment from 'moment';
import { useSound } from 'react-native-nitro-sound';
import { serviceRequestApi } from '../services/serviceRequestApi';
import { ServiceRequest } from '../services/serviceRequestListApi';
import {
  DISPLAY_FORM_STATUS,
  getStatusBadgeColor,
  getStatusBadgeBgColor,
} from '../constant/RequestStatus';

/**
 * Constants
 */
export const REVIEW_REASONS = [
  { key: 'missinginfo', value: STRING.missingInformation },
  { key: 'incorrectpatientdetails', value: STRING.incorrectPatientDetails },
  { key: 'incompleteform', value: STRING.incompleteForm },
  { key: 'other', value: STRING.other },
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
                    {t(reason.value)}
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
            style={[styles.sendBtn, { backgroundColor: COLORS.primary, flex: 1 }]}
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
 * Delete Account Confirmation Bottom Sheet
 */
interface DeleteAccountConfirmationSheetProps {
  onDeleteAccount: () => void;
}

export const DeleteAccountConfirmationSheet = React.forwardRef<
  ActionSheetRef,
  DeleteAccountConfirmationSheetProps
>((({ onDeleteAccount }, ref) => {
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
          {t(STRING.deleteAccount)}
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
          {t(STRING.deleteAccountConfirmation)}
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
              onDeleteAccount();
            }}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.deleteAccount)}
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

/**
 * Provider Option Bottom Sheet (Used in CreateRequestStep3 for first-time requests)
 */
interface ProviderOptionSheetProps {
  onSendToAll: () => void;
  onSendToSpecific: () => void;
}

export const ProviderOptionSheet = React.forwardRef<
  ActionSheetRef,
  ProviderOptionSheetProps
>(({ onSendToAll, onSendToSpecific }, ref) => {
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedOption, setSelectedOption] = React.useState<
    'all' | 'specific' | null
  >(null);

  React.useImperativeHandle(
    ref,
    () =>
      ({
        show: () => {
          setSelectedOption(null);
          sheetRef.current?.show();
        },
        hide: () => sheetRef.current?.hide(),
        snapToOffset: (offset: number) =>
          sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      } as ActionSheetRef),
  );

  const handleSelectAll = () => {
    setSelectedOption('all');
  };

  const handleSelectSpecific = () => {
    setSelectedOption('specific');
    sheetRef.current?.hide();
    onSendToSpecific();
  };

  const handleConfirm = () => {
    if (selectedOption === 'all') {
      sheetRef.current?.hide();
      onSendToAll();
    }
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled={false}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      containerStyle={[
        styles.sheetContainer,
        {
          backgroundColor: COLORS.white,
          paddingBottom: Math.max(insets.bottom, getScaleSize(24)),
        },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.sheetContent}>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: COLORS._F3F4F6,
            paddingVertical: getScaleSize(12),
          }}
        >
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={{ marginBottom: getScaleSize(4) }}
          >
            {t(STRING.howToSendRequest)}
          </AppText>
          <AppText size={getScaleSize(13)} color={COLORS._6B7280}>
            {t(STRING.selectProviderSubtitle)}
          </AppText>
        </View>

        <View style={styles.optionCardsContainer}>
          {/* Option 1: Send to All Providers */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'all' && styles.optionCardSelected,
            ]}
            onPress={handleSelectAll}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconWrap}>
              <Image source={IMAGES.all_provider} style={styles.optionIcon} />
            </View>
            <View style={styles.optionTextCol}>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.sendToAllProviders)}
              </AppText>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
                style={{ marginTop: 2 }}
              >
                {t(STRING.sendToAllProvidersDesc)}
              </AppText>
            </View>
            <View
              style={[
                styles.providerRadioOuter,
                selectedOption === 'all' && styles.providerRadioOuterSelected,
              ]}
            >
              {selectedOption === 'all' && (
                <View style={styles.providerRadioInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* Option 2: Send to Specific Provider */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedOption === 'specific' && styles.optionCardSelected,
            ]}
            onPress={handleSelectSpecific}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconWrap}>
              <Image source={IMAGES.provider} style={styles.optionIcon} />
            </View>
            <View style={styles.optionTextCol}>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.sendToSpecificProvider)}
              </AppText>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
                style={{ marginTop: 2 }}
              >
                {t(STRING.sendToSpecificProviderDesc)}
              </AppText>
            </View>
            <View
              style={[
                styles.providerRadioOuter,
                selectedOption === 'specific' &&
                  styles.providerRadioOuterSelected,
              ]}
            >
              {selectedOption === 'specific' && (
                <View style={styles.providerRadioInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Actions with height 56 matching screen buttons */}
        <View style={{ marginTop: getScaleSize(20) }}>
          {selectedOption === 'all' ? (
            <View style={styles.providerButtonRow}>
              <TouchableOpacity
                style={styles.providerCancelBtnRow}
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
                style={styles.providerSubmitBtnRow}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {t(STRING.confirm)}
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.providerCancelBtnFull}
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
          )}
        </View>
      </View>
    </ActionSheet>
  );
});

/**
 * Select Provider Bottom Sheet (Used in CreateRequestStep3 to search, select, and assign a specific provider)
 */
interface SelectProviderSheetProps {
  serviceId?: string;
  onSelectProvider: (provider: Provider, serviceId?: string) => void;
}

export const SelectProviderSheet = React.forwardRef<
  ActionSheetRef,
  SelectProviderSheetProps
>(({ serviceId, onSelectProvider }, ref) => {
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const [servicesList, setServicesList] = React.useState<any[]>(MASTER_SERVICES_LIST);
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(
    serviceId || '',
  );
  const currentServiceIdRef = React.useRef<string | undefined>(serviceId);

  React.useEffect(() => {
    // Fetch live services from backend
    getServicesService(1, 50)
      .then((res: any) => {
        if (res?.status && res?.data?.data?.services) {
          setServicesList(res.data.data.services);
        }
      })
      .catch(err => {
        console.log('Error loading services for filter:', err);
      });
  }, []);

  React.useEffect(() => {
    if (serviceId !== undefined) {
      setSelectedServiceId(serviceId);
      currentServiceIdRef.current = serviceId || undefined;
    }
  }, [serviceId]);

  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>('');
  const [page, setPage] = React.useState<number>(1);
  const [hasMore, setHasMore] = React.useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = React.useState<boolean>(false);

  const fetchProviders = async (
    pageNum: number = 1,
    searchQuery: string = '',
    refresh: boolean = false,
    overrideServiceId?: string,
  ) => {
    try {
      if (pageNum === 1 && !refresh) setIsLoading(true);
      if (pageNum > 1) setIsMoreLoading(true);

      const langParam = i18n?.language || 'en';
      const activeServiceId =
        overrideServiceId !== undefined
          ? overrideServiceId
          : currentServiceIdRef.current || serviceId;
      const response: any = await getProvidersService(
        pageNum,
        10,
        searchQuery,
        langParam,
        activeServiceId || undefined,
      );

      if (
        response?.status &&
        (response?.code === 200 || response?.status === 200)
      ) {
        const rawData = response.data?.data || response.data;
        const newList: Provider[] =
          rawData?.providers ||
          rawData?.doctors ||
          response.data?.providers ||
          response.data?.doctors ||
          (Array.isArray(rawData) ? rawData : []);

        if (refresh || pageNum === 1) {
          setProviders(newList);
          setPage(1);
        } else {
          setProviders(prev => [...prev, ...newList]);
        }

        const pagination = rawData?.pagination || response.data?.pagination;
        if (pagination) {
          setHasMore(pagination.hasNextPage ?? pageNum < pagination.totalPages);
        } else {
          setHasMore(newList.length >= 10);
        }
      }
    } catch (error) {
      console.log('Error fetching providers for selection sheet:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsMoreLoading(false);
    }
  };

  React.useImperativeHandle(
    ref,
    () =>
      ({
        show: (customServiceId?: string) => {
          const targetServiceId =
            customServiceId !== undefined
              ? customServiceId
              : serviceId || '';
          currentServiceIdRef.current = targetServiceId || undefined;
          setSelectedServiceId(targetServiceId);
          sheetRef.current?.show();
          setSearch('');
          setSelectedProvider(null);
          fetchProviders(1, '', false, targetServiceId || undefined);
        },
        hide: () => sheetRef.current?.hide(),
        snapToOffset: (offset: number) =>
          sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      } as any),
  );

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders(1, search, true, currentServiceIdRef.current);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const handleServiceFilterPress = (targetId: string) => {
    const nextId = targetId === selectedServiceId ? '' : targetId;
    setSelectedServiceId(nextId);
    currentServiceIdRef.current = nextId || undefined;
    setSelectedProvider(null);
    setPage(1);
    fetchProviders(1, search, true, nextId || undefined);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProviders(1, search, true, currentServiceIdRef.current);
  };

  const handleLoadMore = () => {
    if (!hasMore || isMoreLoading || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProviders(nextPage, search, false, currentServiceIdRef.current);
  };

  const handleSelect = (item: Provider) => {
    setSelectedProvider(item);
  };

  const handleSubmit = () => {
    if (selectedProvider) {
      sheetRef.current?.hide();
      onSelectProvider(selectedProvider, selectedServiceId || undefined);
    }
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled={false}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      containerStyle={[
        styles.sheetContainer,
        {
          backgroundColor: COLORS.white,
          height: '82%',
          paddingBottom: Math.max(insets.bottom, getScaleSize(20)),
        },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={[styles.sheetContent, { flex: 1, paddingBottom: 0 }]}>
        {/* Header */}
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: COLORS._F3F4F6,
            paddingVertical: getScaleSize(12),
          }}
        >
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={{ marginBottom: getScaleSize(4) }}
          >
            {t(STRING.selectProvider)}
          </AppText>
          <AppText size={getScaleSize(13)} color={COLORS._6B7280}>
            {t(STRING.selectProviderSubtitle)}
          </AppText>
        </View>

        {/* Search Input */}
        <View
          style={{
            marginTop: getScaleSize(12),
            marginBottom: getScaleSize(8),
          }}
        >
          <Input
            value={search}
            onChangeText={handleSearchChange}
            placeholder={t(STRING.searchProviderPlaceholder)}
            placeholderTextColor={COLORS._6F767E}
            leftIcon={IMAGES.search}
            style={styles.providerSearchInputContainer}
            inputWrapperStyle={styles.providerSearchInputWrapper}
            inputStyle={styles.providerSearchInput}
          />
        </View>

        {/* Service Filter Chips */}
        <View style={styles.serviceFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.serviceFilterScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* All Services Option */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => handleServiceFilterPress('')}
              style={[
                styles.serviceFilterChip,
                selectedServiceId === '' && styles.serviceFilterChipActive,
              ]}
            >
              <View
                style={[
                  styles.serviceFilterDot,
                  selectedServiceId === '' && styles.serviceFilterDotActive,
                ]}
              />
              <AppText
                size={getScaleSize(12)}
                font={
                  selectedServiceId === ''
                    ? FONTS.Inter.Bold
                    : FONTS.Inter.Medium
                }
                color={selectedServiceId === '' ? COLORS.white : '#475569'}
              >
                {t(STRING.allServices) || 'All Services'}
              </AppText>
            </TouchableOpacity>

            {/* Individual Service Chips */}
            {servicesList.map((svc: any) => {
              const svcId = svc.id || svc._id;
              const svcName = svc.serviceName || svc.name || '';
              const isChipActive = selectedServiceId === svcId;

              return (
                <TouchableOpacity
                  key={svcId}
                  activeOpacity={0.75}
                  onPress={() => handleServiceFilterPress(svcId)}
                  style={[
                    styles.serviceFilterChip,
                    isChipActive && styles.serviceFilterChipActive,
                  ]}
                >
                  <View
                    style={[
                      styles.serviceFilterDot,
                      isChipActive && styles.serviceFilterDotActive,
                    ]}
                  />
                  <AppText
                    size={getScaleSize(12)}
                    font={
                      isChipActive ? FONTS.Inter.Bold : FONTS.Inter.Medium
                    }
                    color={isChipActive ? COLORS.white : '#475569'}
                  >
                    {t(svcName) || svcName}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Provider List / States */}
        {isLoading && page === 1 ? (
          <View style={styles.providerLoaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <GestureFlatList
            data={providers}
            keyExtractor={(item, index) =>
              item.id || item._id || index.toString()
            }
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.providerListContent}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isMoreLoading ? (
                <View style={{ paddingVertical: 12 }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.providerEmptyContainer}>
                  <Image
                    source={IMAGES.provider}
                    style={styles.providerEmptyIcon}
                  />
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                    align="center"
                    style={{ marginTop: 8 }}
                  >
                    {t(STRING.noProvidersFound)}
                  </AppText>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                    align="center"
                    style={{ marginTop: 4 }}
                  >
                    {t(STRING.noProvidersFoundSubtitle)}
                  </AppText>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const isSelected =
                (selectedProvider?.id && selectedProvider?.id === item.id) ||
                (selectedProvider?._id &&
                  selectedProvider?._id === item._id);

              const name =
                item.fullName ||
                item.providerName ||
                `${item.fName || ''} ${item.lName || ''}`.trim() ||
                'Healthcare Provider';

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.providerItemCard,
                    isSelected && styles.providerItemCardSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <ProfileAvatar
                    name={name}
                    imageUrl={
                      item.profileImg
                        ? IMAGE_BASE_URL + item.profileImg
                        : undefined
                    }
                    size="medium"
                  />

                  <View style={styles.providerItemInfo}>
                    <AppText
                      size={getScaleSize(15)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                      numberOfLines={1}
                    >
                      {name}
                    </AppText>

                    {item.specialty ? (
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Medium}
                        color={COLORS.primary}
                        style={{ marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {item.specialty}
                      </AppText>
                    ) : null}

                    {item.email ? (
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        style={{ marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {item.email}
                      </AppText>
                    ) : null}
                  </View>

                  {/* Radio indicator */}
                  <View
                    style={[
                      styles.providerRadioOuter,
                      isSelected && styles.providerRadioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.providerRadioInner} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Bottom Actions with Safe Area Inset Protection */}
        <View style={styles.providerButtonContainer}>
          {selectedProvider ? (
            <View style={styles.providerButtonRow}>
              <TouchableOpacity
                style={styles.providerCancelBtnRow}
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
                style={styles.providerSubmitBtnRow}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {t(STRING.submitRequest)}
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.providerCancelBtnFull}
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
          )}
        </View>
      </View>
    </ActionSheet>
  );
});

/**
 * Pre-Request Detail Bottom Sheet
 * Displays full details of a discharge pre-request with audio playback and written notes
 */
export interface PreRequestDetailSheetProps {
  onClose?: () => void;
}

export const PreRequestDetailSheet = React.forwardRef<
  ActionSheetRef,
  PreRequestDetailSheetProps
>(({ onClose }, ref) => {
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const [request, setRequest] = React.useState<any>(null);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = React.useState<number>(0);
  const [currentSecs, setCurrentSecs] = React.useState<number>(0);
  const [totalSecs, setTotalSecs] = React.useState<number>(0);

  const sound = useSound({
    subscriptionDuration: 0.1,
    onPlayback: e => {
      if (e.duration > 0 && e.currentPosition != null) {
        setTotalSecs(Math.floor(e.duration / 1000));
        setCurrentSecs(Math.floor(e.currentPosition / 1000));
        const prog = (e.currentPosition / e.duration) * 100;
        setPlaybackProgress(Math.min(prog, 100));
      }
    },
    onPlaybackEnd: () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentSecs(0);
    },
  });

  React.useImperativeHandle(
    ref,
    () =>
      ({
        show: (data?: any) => {
          if (data) {
            setRequest(data);
          }
          setIsPlaying(false);
          setPlaybackProgress(0);
          setCurrentSecs(0);
          setTotalSecs(0);
          sheetRef.current?.show();
        },
        hide: () => {
          handleClose();
        },
        snapToOffset: (offset: number) =>
          sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      } as ActionSheetRef),
  );

  const soundRef = React.useRef(sound);
  React.useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  const isPlayingRef = React.useRef(isPlaying);
  React.useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const stopAudio = React.useCallback(async () => {
    if (isPlayingRef.current) {
      try {
        await soundRef.current?.stopPlayer();
      } catch (e) {
        // ignore
      }
      setIsPlaying(false);
      setPlaybackProgress(0);
      setCurrentSecs(0);
    }
  }, []);

  // Stop playback when phone is locked, app minimized, or phone call arrives
  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState !== 'active') {
          stopAudio();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [stopAudio]);

  const handleSheetClose = () => {
    stopAudio();
    onClose?.();
  };

  const handleClose = () => {
    stopAudio();
    sheetRef.current?.hide();
  };

  const handleTogglePlay = async () => {
    if (!request?.voiceMessageUrl) return;
    try {
      if (isPlaying) {
        await sound.pausePlayer();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await sound.startPlayer(request.voiceMessageUrl);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  const effectiveStatus =
    request?.preRequestStatus ||
    request?.status ||
    request?.formStatus ||
    'submitted';

  const badgeColor = getStatusBadgeColor(effectiveStatus);
  const badgeBgColor = getStatusBadgeBgColor(effectiveStatus);

  const displayStatus =
    DISPLAY_FORM_STATUS[effectiveStatus.toLowerCase()] ||
    (request?.status ? t(request.status) : 'Submitted');

  return (
    <ActionSheet
      ref={sheetRef}
      onClose={handleSheetClose}
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      useBottomSafeAreaPadding={false}
      containerStyle={styles.preRequestSheetContainer}
    >
      <View
        style={[
          styles.preRequestSheetContent,
          {
            paddingBottom: (insets.bottom || 0) + getScaleSize(12),
          },
        ]}
      >
        {/* Header with Title & Close Button */}
        <View style={styles.preRequestSheetHeader}>
          <View style={styles.preRequestHeaderLeft}>
            <View style={styles.preRequestBadgeWrapper}>
              <Image
                source={
                  request?.voiceMessageUrl ? IMAGES.ic_mic : IMAGES.ic_file
                }
                style={styles.preRequestBadgeIcon}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.preRequest) || 'Pre-Request'}
              </AppText>
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
                style={{ marginTop: getScaleSize(2) }}
              >
                {request?.requestId || '—'}
              </AppText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.preRequestCloseCircle}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Image
              source={IMAGES.crossIcon}
              style={styles.preRequestCloseIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.preRequestDivider} />

        {/* Voice Recording Player (if voice message exists) */}
        {!!request?.voiceMessageUrl && (
          <View style={styles.preRequestVoiceSection}>
            <View style={styles.preRequestSectionTitleRow}>
              <Image
                source={IMAGES.ic_mic}
                style={styles.preRequestSectionIcon}
              />
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.voiceInstructions)}
              </AppText>
            </View>

            <View style={styles.preRequestAudioPlayerCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.preRequestPlayPauseBtn}
                onPress={handleTogglePlay}
              >
                {isPlaying ? (
                  <Image
                    source={IMAGES.ic_pause}
                    style={styles.preRequestPlayPauseIcon}
                  />
                ) : (
                  <AppText
                    size={getScaleSize(16)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.white}
                    style={{ marginLeft: getScaleSize(2) }}
                  >
                    {'▶'}
                  </AppText>
                )}
              </TouchableOpacity>

              <View style={styles.preRequestAudioInfoCol}>
                <View style={styles.preRequestProgressBarBg}>
                  <View
                    style={[
                      styles.preRequestProgressBarFill,
                      { width: `${playbackProgress}%` },
                    ]}
                  />
                </View>

                <View style={styles.preRequestAudioTimeRow}>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                  >
                    {formatSeconds(currentSecs)}
                  </AppText>
                  <AppText
                    size={getScaleSize(11)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                  >
                    {totalSecs > 0 ? formatSeconds(totalSecs) : '--:--'}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Written Notes Section (if notes exist) */}
        {!!request?.initialNotes && (
          <View style={styles.preRequestNotesSection}>
            <View style={styles.preRequestSectionTitleRow}>
              <Image
                source={IMAGES.ic_file}
                style={styles.preRequestSectionIcon}
              />
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.textInstructions)}
              </AppText>
            </View>

            <View style={styles.preRequestNotesContentBox}>
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Regular}
                color={COLORS._1A1D1F}
                style={{ lineHeight: getScaleSize(19) }}
              >
                {request.initialNotes}
              </AppText>
            </View>
          </View>
        )}

        {/* Meta Info Row: Created Date */}
        {!!request?.createdAt && (
          <View style={styles.preRequestMetaRow}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              {t('Created') || 'Created'}:{' '}
              {moment(request.createdAt)
                .locale(i18n?.language || 'en')
                .format('DD MMM YYYY, HH:mm')}
            </AppText>
          </View>
        )}

        {/* Action Buttons: Close and Complete Request (if accepted) */}
        <View style={styles.preRequestBtnRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.preRequestCancelBtn}
            onPress={handleClose}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t('Close')}
            </AppText>
          </TouchableOpacity>

          {effectiveStatus === 'accepted' && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.preRequestAcceptBtn}
              onPress={() => {
                handleClose();
                NavigationService.navigate(SCREENS.CREATE_DISCHARGE_REQUEST, {
                  request,
                  isEdit: true,
                  isAccepted: true,
                });
              }}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                {t(STRING.completeRequest) || 'Complete Request'}
              </AppText>
            </TouchableOpacity>
          )}
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
    backgroundColor: COLORS.white,
    zIndex: 9999,
  },
  indicator: {
    width: 48,
    height: 4,
    backgroundColor: COLORS._E2E8F0,
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
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '1A',
  },
  textarea: {
    backgroundColor: COLORS._F8F9FA,
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
    backgroundColor: COLORS._F9FAFB,
    borderRadius: 12,
    padding: 16,
    minHeight: getScaleSize(120),
  },
  warningBackBtn: {
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._E2E8F0,
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
    borderColor: COLORS._E2E8F0,
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
  // Provider Option Sheet styles
  optionCardsContainer: {
    gap: getScaleSize(12),
    marginTop: getScaleSize(16),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getScaleSize(14),
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS._E5E7EB,
    gap: getScaleSize(12),
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  optionIconWrap: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
    tintColor: COLORS._1A1D1F,
  },
  optionTextCol: {
    flex: 1,
  },
  optionChevron: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  // Select Provider Sheet styles
  providerSearchInputContainer: {
    paddingHorizontal: 0,
  },
  providerSearchInputWrapper: {
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._F9FAFB,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  providerSearchInput: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS._1A1D1F,
  },
  serviceFilterContainer: {
    marginBottom: getScaleSize(10),
  },
  serviceFilterScrollContent: {
    paddingRight: getScaleSize(10),
    alignItems: 'center',
  },
  serviceFilterChip: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(7),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: getScaleSize(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
  },
  serviceFilterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  serviceFilterDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS.primary,
  },
  serviceFilterDotActive: {
    backgroundColor: COLORS.white,
  },
  providerLoaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerListContent: {
    gap: getScaleSize(10),
    paddingBottom: getScaleSize(10),
  },
  providerEmptyContainer: {
    paddingVertical: getScaleSize(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerEmptyIcon: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
    opacity: 0.5,
  },
  providerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getScaleSize(12),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS._E5E7EB,
    gap: getScaleSize(12),
  },
  providerItemCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  providerItemInfo: {
    flex: 1,
  },
  providerRadioOuter: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    borderRadius: getScaleSize(10),
    borderWidth: 2,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerRadioOuterSelected: {
    borderColor: COLORS.primary,
  },
  providerRadioInner: {
    width: getScaleSize(10),
    height: getScaleSize(10),
    borderRadius: getScaleSize(5),
    backgroundColor: COLORS.primary,
  },
  providerButtonContainer: {
    paddingVertical: getScaleSize(12),
    borderTopWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  providerButtonRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  providerCancelBtnRow: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  providerSubmitBtnRow: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCancelBtnFull: {
    width: '100%',
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  preRequestSheetContainer: {
    borderTopLeftRadius: getScaleSize(24),
    borderTopRightRadius: getScaleSize(24),
    backgroundColor: COLORS.white,
  },
  preRequestSheetContent: {
    paddingHorizontal: getScaleSize(20),
    paddingTop: getScaleSize(16),
  },
  preRequestSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(12),
  },
  preRequestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
    flex: 1,
  },
  preRequestBadgeWrapper: {
    width: getScaleSize(42),
    height: getScaleSize(42),
    borderRadius: getScaleSize(21),
    backgroundColor: '#e8edf1',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preRequestBadgeIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  preRequestCloseCircle: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preRequestCloseIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: COLORS._1A1D1F,
    resizeMode: 'contain',
  },
  preRequestPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(12),
  },
  preRequestStatusPill: {
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
  },
  preRequestDivider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(10),
  },
  preRequestVoiceSection: {
    marginBottom: getScaleSize(14),
  },
  preRequestSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    marginBottom: getScaleSize(8),
  },
  preRequestSectionIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  preRequestAudioPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: getScaleSize(12),
  },
  preRequestPlayPauseBtn: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  preRequestPlayPauseIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  preRequestAudioInfoCol: {
    flex: 1,
    gap: getScaleSize(6),
  },
  preRequestProgressBarBg: {
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  preRequestProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  preRequestAudioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preRequestNotesSection: {
    marginBottom: getScaleSize(14),
  },
  preRequestNotesContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  preRequestMetaRow: {
    marginBottom: getScaleSize(16),
  },
  preRequestBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  preRequestCancelBtn: {
    flex: 1,
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preRequestEditBtn: {
    flex: 1.6,
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
  },
  preRequestEditBtnIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  providerDoctorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: getScaleSize(12),
    padding: getScaleSize(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: getScaleSize(14),
  },
  providerDoctorAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  preRequestAcceptBtn: {
    flex: 1.6,
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
