import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import ActionSheet, {
  ActionSheetRef,
  ScrollView,
} from 'react-native-actions-sheet';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from './AppText';
import PrimaryButton from './PrimaryButton';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';
import { RootState } from '../redux/store';
import {
  LegalDocument,
  LegalDocType,
  getLegalDocument,
} from '../constant/legalDocuments';

export type { LegalDocType };

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface LegalDocumentSheetProps {
  initialDoc?: LegalDocType;
}

export const LegalDocumentSheet = React.forwardRef<
  ActionSheetRef,
  LegalDocumentSheetProps
>(({ initialDoc = 'terms_and_conditions' }, ref) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentLanguage } = useSelector((state: RootState) => state.language);
  const sheetRef = React.useRef<ActionSheetRef>(null);

  const activeAppLang = currentLanguage || i18n.language || 'fr';
  const [activeDocType, setActiveDocType] = useState<LegalDocType>(initialDoc);

  useEffect(() => {
    setActiveDocType(initialDoc);
  }, [initialDoc]);

  React.useImperativeHandle(
    ref,
    () =>
      ({
        show: () => sheetRef.current?.show(),
        hide: () => sheetRef.current?.hide(),
        snapToOffset: (offset: number) => sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      } as ActionSheetRef),
  );

  const isFrench = activeAppLang.startsWith('fr');
  const currentDoc: LegalDocument = getLegalDocument(activeDocType, activeAppLang);

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled={true}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      keyboardHandlerEnabled={false}
      containerStyle={[
        styles.container,
        {
          height: SCREEN_HEIGHT * 0.88,
          paddingBottom: Math.max(insets.bottom, getScaleSize(16)),
        },
      ]}
      indicatorStyle={styles.indicator}
      defaultOverlayOpacity={0.4}
    >
      <View style={styles.sheetWrapper}>
        {/* TOP BAR / HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.SemiBold}
              color={COLORS.primaryMuted}
              align="center"
            >
              ATHOME • ECLST116
            </AppText>
          </View>
        </View>

        {/* TAB SELECTOR */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveDocType('terms_and_conditions')}
            style={[
              styles.tabButton,
              activeDocType === 'terms_and_conditions' && styles.tabButtonActive,
            ]}
          >
            <AppText
              size={getScaleSize(12.5)}
              font={
                activeDocType === 'terms_and_conditions'
                  ? FONTS.Inter.SemiBold
                  : FONTS.Inter.Medium
              }
              color={
                activeDocType === 'terms_and_conditions'
                  ? COLORS.primary
                  : COLORS._6B7280
              }
              align="center"
              numberOfLines={2}
            >
              {isFrench
                ? "Conditions Générales d'Utilisation (CGU)"
                : 'Terms and Conditions of Use (CGU)'}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveDocType('neutrality_charter')}
            style={[
              styles.tabButton,
              activeDocType === 'neutrality_charter' && styles.tabButtonActive,
            ]}
          >
            <AppText
              size={getScaleSize(11.5)}
              font={
                activeDocType === 'neutrality_charter'
                  ? FONTS.Inter.SemiBold
                  : FONTS.Inter.Medium
              }
              color={
                activeDocType === 'neutrality_charter'
                  ? COLORS.primary
                  : COLORS._6B7280
              }
              align="center"
              numberOfLines={2}
            >
              {isFrench
                ? "Charte de Neutralité et d'Indépendance"
                : 'Neutrality and Independence Charter'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* SCROLLABLE DOCUMENT CONTENT */}
        <ScrollView
          style={styles.contentScrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                Math.max(insets.bottom, getScaleSize(20)) + getScaleSize(32),
            },
          ]}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {activeDocType === 'neutrality_charter' ? (
            /* EXACT PDF DOCUMENT CONTENT FOR NEUTRALITY CHARTER */
            <View style={styles.charterDocumentCard}>
              <AppText
                size={getScaleSize(16)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                align="center"
                style={styles.charterMainTitle}
              >
                {currentDoc.title}
              </AppText>

              <View style={styles.charterDivider} />

              {currentDoc.sections.map((section, sIdx) => (
                <View
                  key={`sec-${sIdx}`}
                  style={sIdx > 0 ? { marginTop: getScaleSize(14) } : undefined}
                >
                  {section.paragraphs?.map((p, pIdx) => (
                    <AppText
                      key={`p-${pIdx}`}
                      size={getScaleSize(13.5)}
                      font={FONTS.Inter.Regular}
                      color={COLORS.slate700}
                      style={styles.paragraph}
                    >
                      {p}
                    </AppText>
                  ))}

                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <View style={styles.charterNumberedList}>
                      {section.bulletPoints.map((bp, bIdx) => (
                        <View key={`bp-${bIdx}`} style={styles.charterNumberedRow}>
                          <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.Regular}
                            color={COLORS.slate900}
                            style={styles.charterNumberedText}
                          >
                            {bp}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <>
              {/* METADATA CARD FOR TERMS AND CONDITIONS */}
              <View style={styles.metaCard}>
                <AppText
                  size={getScaleSize(16)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  align="center"
                  style={styles.termsMainTitle}
                >
                  {currentDoc.title}
                </AppText>

                <AppText
                  size={getScaleSize(12.5)}
                  font={FONTS.Inter.Medium}
                  color={COLORS.slate700}
                  align="center"
                  style={styles.cardSubtitleText}
                >
                  {currentDoc.subtitle}
                </AppText>

                <View style={styles.metaDivider} />

                <View style={styles.metaBadgeRow}>
                  {!!currentDoc.version && (
                    <View style={styles.pillBadge}>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6B7280}
                      >
                        {isFrench ? 'Version : ' : 'Version: '}
                        {currentDoc.version}
                      </AppText>
                    </View>
                  )}
                  {!!currentDoc.date && (
                    <View style={styles.pillBadge}>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6B7280}
                      >
                        {isFrench ? 'Date : ' : 'Date: '}
                        {currentDoc.date}
                      </AppText>
                    </View>
                  )}
                </View>

                {!!currentDoc.publisher && (
                  <View style={styles.publisherBadgeWrapper}>
                    <View style={styles.pillBadge}>
                      <AppText
                        size={getScaleSize(11)}
                        font={FONTS.Inter.Medium}
                        color={COLORS._6B7280}
                      >
                        {isFrench ? 'Éditeur : ' : 'Publisher: '}
                        {currentDoc.publisher}
                      </AppText>
                    </View>
                  </View>
                )}
              </View>

              {/* SECTIONS */}
              {currentDoc.sections.map((section, sIdx) => (
                <View key={`sec-${sIdx}`} style={styles.sectionCard}>
                  {!!section.title && (
                    <View style={styles.sectionHeader}>
                      <AppText
                        size={getScaleSize(14.5)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        style={styles.sectionTitle}
                      >
                        {section.title}
                      </AppText>
                    </View>
                  )}

                  {/* PARAGRAPHS */}
                  {section.paragraphs?.map((p, pIdx) => (
                    <AppText
                      key={`p-${pIdx}`}
                      size={getScaleSize(13)}
                      font={FONTS.Inter.Regular}
                      color={COLORS.slate700}
                      style={styles.paragraph}
                    >
                      {p}
                    </AppText>
                  ))}

                  {/* BULLET POINTS */}
                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <View style={styles.bulletList}>
                      {section.bulletPoints.map((bp, bIdx) => {
                        const isNumbered = /^\d+\./.test(bp);
                        return (
                          <View key={`bp-${bIdx}`} style={styles.bulletRow}>
                            {!isNumbered && <View style={styles.bulletDot} />}
                            <AppText
                              size={getScaleSize(12.5)}
                              font={FONTS.Inter.Regular}
                              color={COLORS.slate900}
                              style={styles.bulletText}
                            >
                              {bp}
                            </AppText>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* CLOSING PARAGRAPHS */}
                  {section.closingParagraphs?.map((cp, cpIdx) => (
                    <AppText
                      key={`cp-${cpIdx}`}
                      size={getScaleSize(13)}
                      font={FONTS.Inter.Regular}
                      color={COLORS.slate700}
                      style={styles.paragraph}
                    >
                      {cp}
                    </AppText>
                  ))}

                  {/* SUBSECTIONS */}
                  {section.subsections?.map((sub, subIdx) => (
                    <View key={`sub-${subIdx}`} style={styles.subSectionBlock}>
                      <AppText
                        size={getScaleSize(13.5)}
                        font={FONTS.Inter.SemiBold}
                        color={COLORS.primary}
                        style={styles.subSectionTitle}
                      >
                        {sub.title}
                      </AppText>

                      {sub.paragraphs?.map((sp, spIdx) => (
                        <AppText
                          key={`sp-${spIdx}`}
                          size={getScaleSize(12.5)}
                          font={FONTS.Inter.Regular}
                          color={COLORS.slate700}
                          style={styles.paragraph}
                        >
                          {sp}
                        </AppText>
                      ))}

                      {sub.bulletPoints && sub.bulletPoints.length > 0 && (
                        <View style={styles.bulletList}>
                          {sub.bulletPoints.map((sbp, sbIdx) => {
                            const isNumbered = /^\d+\./.test(sbp);
                            return (
                              <View key={`sbp-${sbIdx}`} style={styles.bulletRow}>
                                {!isNumbered && <View style={styles.bulletDot} />}
                                <AppText
                                  size={getScaleSize(12.5)}
                                  font={FONTS.Inter.Regular}
                                  color={COLORS.slate900}
                                  style={styles.bulletText}
                                >
                                  {sbp}
                                </AppText>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}

          {/* BOTTOM BUTTON */}
          <PrimaryButton
            title={isFrench ? 'Fermer' : 'Close'}
            onPress={() => sheetRef.current?.hide()}
            style={styles.bottomCloseButton}
          />
        </ScrollView>
      </View>
    </ActionSheet>
  );
});

export default LegalDocumentSheet;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: getScaleSize(24),
    borderTopRightRadius: getScaleSize(24),
  },
  sheetWrapper: {
    flex: 1,
    height: '100%',
  },
  indicator: {
    width: getScaleSize(44),
    height: getScaleSize(4),
    backgroundColor: '#E5E7EB',
    borderRadius: getScaleSize(2),
    marginTop: getScaleSize(10),
    marginBottom: getScaleSize(6),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(18),
    paddingVertical: getScaleSize(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(8),
    backgroundColor: COLORS._F9FAFB,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
    gap: getScaleSize(8),
  },
  tabButton: {
    flex: 1,
    paddingVertical: getScaleSize(8),
    paddingHorizontal: getScaleSize(6),
    borderRadius: getScaleSize(10),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getScaleSize(46),
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  charterDocumentCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(20),
    marginBottom: getScaleSize(16),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  charterMainTitle: {
    lineHeight: getScaleSize(24),
    letterSpacing: 0.4,
    marginBottom: getScaleSize(14),
  },
  charterDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: getScaleSize(16),
  },
  charterNumberedList: {
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(6),
  },
  charterNumberedRow: {
    marginBottom: getScaleSize(10),
  },
  charterNumberedText: {
    lineHeight: 22,
  },
  contentScrollView: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(14),
    paddingBottom: getScaleSize(28),
    flexGrow: 1,
  },
  metaCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    marginBottom: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  termsMainTitle: {
    lineHeight: getScaleSize(24),
    letterSpacing: 0.4,
    marginBottom: getScaleSize(8),
  },
  cardSubtitleText: {
    lineHeight: getScaleSize(19),
    paddingHorizontal: getScaleSize(4),
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  metaBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(8),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  publisherBadgeWrapper: {
    alignSelf: 'flex-start',
    marginTop: getScaleSize(8),
  },
  pillBadge: {
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(5),
    borderRadius: getScaleSize(6),
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: getScaleSize(14),
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    padding: getScaleSize(16),
    marginBottom: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    marginBottom: getScaleSize(8),
  },
  sectionTitle: {
    lineHeight: 22,
  },
  paragraph: {
    lineHeight: 20,
    marginBottom: getScaleSize(8),
  },
  bulletList: {
    marginTop: getScaleSize(4),
    marginBottom: getScaleSize(8),
    paddingLeft: getScaleSize(4),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getScaleSize(6),
  },
  bulletDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: COLORS.primary,
    marginTop: getScaleSize(7),
    marginRight: getScaleSize(8),
  },
  bulletText: {
    flex: 1,
    lineHeight: 20,
  },
  subSectionBlock: {
    marginTop: getScaleSize(10),
    paddingTop: getScaleSize(10),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subSectionTitle: {
    marginBottom: getScaleSize(6),
    lineHeight: 20,
  },
  bottomCloseButton: {
    marginTop: getScaleSize(16),
    marginBottom: getScaleSize(16),
  },
});
