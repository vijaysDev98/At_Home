import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from '../AppText';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { STRING } from '../../constant/strings';
import {
  getServiceDetails,
  ServiceConfig,
} from '../../constant/services';

export interface FormItemConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  isFullWidth?: boolean;
  isGenericMic?: boolean;
}

export interface CategoryGroupConfig {
  id: string;
  name: string;
  headerIcon: any;
  headerBg: string;
  contentBg: string;
  borderColor: string;
  forms: FormItemConfig[];
}

const FORM_CATEGORIES: CategoryGroupConfig[] = [
  {
    id: 'infusion_hygiene',
    name: STRING.catInfusionHygiene,
    headerIcon: IMAGES.cat_infusion,
    headerBg: '#6345A6',
    contentBg: '#F3EEFD',
    borderColor: '#D9CEF2',
    forms: [
      {
        id: '69ef359fd1c1c4252d4b8d4f',
        title: 'Antibiotherapy\nInfusion',
        icon: IMAGES.injectionIcon,
      },
      {
        id: '69ef353fd1c1c4252d4b8d22',
        title: 'IV Therapy',
        icon: IMAGES.ivfIcon,
      },
      {
        id: '69ef3592d1c1c4252d4b8d4a',
        title: 'Hydration\nInfusion',
        icon: IMAGES.ic_hydration,
      },
      {
        id: '69ef3563d1c1c4252d4b8d31',
        title: 'Personal\nHygiene Care',
        icon: IMAGES.hygiene,
      },
    ],
  },
  {
    id: 'oxygen_therapy',
    name: STRING.catOxygenTherapy,
    headerIcon: IMAGES.cat_oxygen,
    headerBg: '#03AFB9',
    contentBg: '#E4F8F8',
    borderColor: '#BEE8E9',
    forms: [
      {
        id: '69ef354cd1c1c4252d4b8d27',
        title: 'Medical Oxygen',
        icon: IMAGES.maskIcon,
      },
    ],
  },
  {
    id: 'nutrition',
    name: STRING.catNutrition,
    headerIcon: IMAGES.cat_nutrition,
    headerBg: '#FA9E00',
    contentBg: '#FFF9E6',
    borderColor: '#FBE4AA',
    forms: [
      {
        id: '69ef3589d1c1c4252d4b8d45',
        title: 'ONS',
        subtitle: STRING.onsSubtitle,
        icon: IMAGES.nurseIcon,
      },
      {
        id: '69ef357cd1c1c4252d4b8d40',
        title: 'Parenteral\nNutrition',
        subtitle: STRING.parenteralSubtitle,
        icon: IMAGES.parenteral,
      },
      {
        id: '69ef3557d1c1c4252d4b8d2c',
        title: 'Artificial\nNutrition',
        subtitle: STRING.artificialNutritionSubtitle,
        icon: IMAGES.testTubeIcon,
      },
    ],
  },
  {
    id: 'pain_management',
    name: STRING.catPainManagement,
    headerIcon: IMAGES.cat_pain,
    headerBg: '#EE4979',
    contentBg: '#FDF0F5',
    borderColor: '#F8CBD8',
    forms: [
      {
        id: '69ef356cd1c1c4252d4b8d36',
        title: 'PCA',
        subtitle: STRING.pcaSubtitle,
        icon: IMAGES.pca,
      },
    ],
  },
  {
    id: 'specific_care',
    name: STRING.catSpecificCare,
    headerIcon: IMAGES.cat_care,
    headerBg: '#4DAE0F',
    contentBg: '#EDF8E5',
    borderColor: '#CCE9BC',
    forms: [
      {
        id: '69ef3575d1c1c4252d4b8d3b',
        title: 'Pregnancy-\nRelated Care',
        icon: IMAGES.pregnancy,
      },
      {
        id: '69ef3534d1c1c4252d4b8d1d',
        title: 'Wound Care',
        icon: IMAGES.bandegeIcon,
      },
    ],
  },
  {
    id: 'general',
    name: STRING.catGeneral,
    headerIcon: IMAGES.cat_general,
    headerBg: '#0861DF',
    contentBg: '#EDF4FE',
    borderColor: '#BDD7FB',
    forms: [
      {
        id: '69eb112a056b86c571c1a44f',
        title: 'Generic',
        icon: IMAGES.ic_generic,
        isFullWidth: true,
        isGenericMic: true,
      },
    ],
  },
];

type Props = {
  awaitingSignatureByService?: Record<string, number>;
  services?: ServiceConfig[];
  onServicePress: (service: ServiceConfig) => void;
};

export const DoctorServicesGrid: React.FC<Props> = ({
  awaitingSignatureByService,
  onServicePress,
}) => {
  const { t } = useTranslation();

  // All categories open by default as in Image 2
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    infusion_hygiene: true,
    oxygen_therapy: true,
    nutrition: true,
    pain_management: true,
    specific_care: true,
    general: true,
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const getCategoryCount = (category: CategoryGroupConfig) => {
    if (!awaitingSignatureByService) return 0;
    return category.forms.reduce((sum, form) => {
      return sum + (awaitingSignatureByService[form.id] || 0);
    }, 0);
  };

  const getFormCount = (formId: string) => {
    if (!awaitingSignatureByService) return 0;
    return awaitingSignatureByService[formId] || 0;
  };

  return (
    <View style={styles.container}>
      {FORM_CATEGORIES.map(category => {
        const isExpanded = expandedCategories[category.id] ?? true;
        const pendingCount = getCategoryCount(category);

        return (
          <View
            key={category.id}
            style={[
              styles.categoryCard,
              {
                borderColor: category.borderColor,
                backgroundColor: category.contentBg,
              },
            ]}
          >
            {/* Category Header */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => toggleCategory(category.id)}
              style={[
                styles.categoryHeader,
                { backgroundColor: category.headerBg },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${t(category.name)}, ${
                pendingCount > 0
                  ? t(STRING.youHaveFormsPendingSignature, {
                      count: pendingCount,
                    })
                  : t(STRING.noFormPendingSignature)
              }`}
            >
              {/* Left side: Icon + Title */}
              <View style={styles.headerLeft}>
                <Image
                  source={category.headerIcon}
                  style={styles.headerIcon}
                />
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                  style={styles.headerTitle}
                >
                  {t(category.name)}
                </AppText>
              </View>

              {/* Right side: Badge pill + Accordion chevron */}
              <View style={styles.headerRight}>
                <View style={styles.badgePill}>
                  {pendingCount > 0 && <View style={styles.badgeRedDot} />}
                  <AppText
                    size={getScaleSize(9.5)}
                    font={
                      pendingCount > 0
                        ? FONTS.Inter.Bold
                        : FONTS.Inter.Medium
                    }
                    color={COLORS._1A1D1F}
                    numberOfLines={1}
                  >
                    {pendingCount > 0
                      ? t(STRING.youHaveFormsPendingSignature, {
                          count: pendingCount,
                        })
                      : t(STRING.noFormPendingSignature)}
                  </AppText>
                </View>

                <Image
                  source={IMAGES.arrow_bottom}
                  style={[
                    styles.chevronIcon,
                    isExpanded && styles.chevronIconExpanded,
                  ]}
                />
              </View>
            </TouchableOpacity>

            {/* Category Content (when expanded) */}
            {isExpanded && (
              <View style={styles.categoryBody}>
                {category.forms.map(form => {
                  const formPending = getFormCount(form.id);
                  const serviceConfig = getServiceDetails(form.id);

                  if (form.isGenericMic) {
                    return (
                      <TouchableOpacity
                        key={form.id}
                        activeOpacity={0.88}
                        onPress={() => onServicePress(serviceConfig)}
                        style={styles.genericCard}
                      >
                        {/* Left part: Generic icon + text */}
                        <View style={styles.genericLeftSection}>
                          {formPending > 0 && (
                            <View style={styles.formRedDot} />
                          )}
                          <Image
                            source={form.icon}
                            style={styles.formIcon}
                          />
                          <AppText
                            size={getScaleSize(13)}
                            font={FONTS.Inter.Bold}
                            color={COLORS._1A1D1F}
                          >
                            {t(form.title)}
                          </AppText>
                        </View>

                        {/* Vertical Divider */}
                        <View style={styles.genericDivider} />

                        {/* Right part: Mic icon + prompt text */}
                        <View style={styles.genericRightSection}>
                          <Image
                            source={IMAGES.ic_mic}
                            style={styles.micIcon}
                          />
                          <AppText
                            size={getScaleSize(11)}
                            font={FONTS.Inter.SemiBold}
                            color="#0284C7"
                            style={styles.genericPromptText}
                          >
                            {t(STRING.dictateMedicalOrderPrompt)}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={form.id}
                      activeOpacity={0.88}
                      onPress={() => onServicePress(serviceConfig)}
                      style={[
                        styles.formCard,
                        form.isFullWidth && styles.formCardFull,
                      ]}
                    >
                      {/* Red indicator dot if form has pending signatures */}
                      {formPending > 0 && (
                        <View style={styles.formRedDot} />
                      )}

                      <Image source={form.icon} style={styles.formIcon} />

                      <View style={styles.formTextWrap}>
                        <AppText
                          size={getScaleSize(12)}
                          font={FONTS.Inter.Bold}
                          color={COLORS._1A1D1F}
                          style={styles.formTitle}
                        >
                          {t(form.title)}
                        </AppText>
                        {form.subtitle ? (
                          <AppText
                            size={getScaleSize(10)}
                            font={FONTS.Inter.Regular}
                            color={COLORS._6F767E}
                            style={styles.formSubtitle}
                          >
                            {t(form.subtitle)}
                          </AppText>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getScaleSize(14),
    paddingBottom: getScaleSize(24),
  },
  categoryCard: {
    borderRadius: getScaleSize(14),
    overflow: 'hidden',
    borderWidth: 1.2,
    marginBottom: getScaleSize(14),
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryHeader: {
    minHeight: getScaleSize(44),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(7),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: getScaleSize(8),
    marginRight: getScaleSize(6),
  },
  headerIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  headerTitle: {
    flexShrink: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  badgePill: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(5),
    maxWidth: getScaleSize(210),
  },
  badgeRedDot: {
    width: getScaleSize(6),
    height: getScaleSize(6),
    borderRadius: getScaleSize(3),
    backgroundColor: '#DC2626',
  },
  chevronIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  chevronIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  categoryBody: {
    padding: getScaleSize(8),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: getScaleSize(8),
  },
  formCard: {
    width: '48.5%',
    minHeight: getScaleSize(62),
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(10),
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(8),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  formCardFull: {
    width: '100%',
  },
  formRedDot: {
    width: getScaleSize(6.5),
    height: getScaleSize(6.5),
    borderRadius: getScaleSize(3.5),
    backgroundColor: '#DC2626',
    marginRight: getScaleSize(5),
  },
  formIcon: {
    width: getScaleSize(26),
    height: getScaleSize(26),
    resizeMode: 'contain',
    marginRight: getScaleSize(8),
  },
  formTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  formTitle: {
    lineHeight: getScaleSize(15),
  },
  formSubtitle: {
    lineHeight: getScaleSize(13),
    marginTop: getScaleSize(2),
  },
  genericCard: {
    width: '100%',
    minHeight: getScaleSize(60),
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(10),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(8),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  genericLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: getScaleSize(10),
  },
  genericDivider: {
    width: 1,
    height: getScaleSize(36),
    backgroundColor: '#CBD5E1',
    marginHorizontal: getScaleSize(8),
  },
  genericRightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  micIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },
  genericPromptText: {
    flex: 1,
    lineHeight: getScaleSize(14),
  },
});

export default DoctorServicesGrid;
