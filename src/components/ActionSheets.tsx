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

/**
 * Constants
 */
const REVIEW_REASONS = [
  'Patient not home',
  'Incomplete Info',
  'Supplies missing',
  'Change of status',
  'Other',
];
const DETAILS_MAX = 500;

/**
 * Warning Bottom Sheet (Used in ProviderForm)
 */
export const WarningSheet = React.forwardRef<ActionSheetRef>((_, ref) => {
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
        <View style={styles.warningHeader}>
          <Image source={IMAGES.ic_warning} style={styles.warningIcon} />
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Warning
          </AppText>
        </View>

        <AppText
          size={getScaleSize(14)}
          color={COLORS._6F767E}
          align="center"
          style={styles.warningText}
        >
          Form Temporarily Unavailable. This form is currently being updated by
          another user. Please try again shortly.
        </AppText>

        <TouchableOpacity
          style={styles.warningBackBtn}
          onPress={() => sheetRef.current?.hide()}
          activeOpacity={0.8}
        >
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Back
          </AppText>
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
});

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
      onSend(selectedReason, reviewDetails);
      sheetRef.current?.hide();
    }
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
        <View style={{ borderBottomWidth: 1, borderColor: COLORS._F3F4F6 }}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={{ marginBottom: getScaleSize(4) }}
          >
            Request Review
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._6B7280}
            style={{ marginBottom: getScaleSize(20) }}
          >
            Describe issue with this service.
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
              Quick Select
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
              const active = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  activeOpacity={0.7}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Medium}
                    color={active ? COLORS._526674 : COLORS._1A1A1A}
                  >
                    {reason}
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
              Details
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
              placeholder="Details"
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
            onPress={() => sheetRef.current?.hide()}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              Cancel
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                flex: 2,
                backgroundColor: '#EF4444',
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
              Send for Review
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
          Complete Service?
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
          Please confirm that the service has been successfully completed. Once
          completed, this action cannot be undone.
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
              Cancel
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
              Mark as Completed
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
});
