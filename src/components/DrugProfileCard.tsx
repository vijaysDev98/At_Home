import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import AppText from './AppText';
import { COLORS, FONTS } from '../utils';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import { STRING } from '../constant';
import { DrugProfileData } from '../services/pharmacyAiService';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DrugProfileCardProps {
  data: DrugProfileData;
}

interface SectionConfig {
  key: keyof DrugProfileData['sections'];
  titleKey: string;
  subtitleKey: string;
  icon: any;
  bgColor: string;
  borderColor: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'indication',
    titleKey: STRING.indication,
    subtitleKey: STRING.indicationSubtitle,
    icon: IMAGES.ic_drug_indication,
    bgColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  {
    key: 'dosageForm',
    titleKey: STRING.dosageForm,
    subtitleKey: STRING.dosageFormSubtitle,
    icon: IMAGES.ic_drug_dosage,
    bgColor: '#FAF5FF',
    borderColor: '#F3E8FF',
  },
  {
    key: 'preparation',
    titleKey: STRING.preparation,
    subtitleKey: STRING.preparationSubtitle,
    icon: IMAGES.ic_drug_preparation,
    bgColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  {
    key: 'dilution',
    titleKey: STRING.dilution,
    subtitleKey: STRING.dilutionSubtitle,
    icon: IMAGES.ic_drug_dilution,
    bgColor: '#F0F9FF',
    borderColor: '#E0F2FE',
  },
  {
    key: 'administrationDuration',
    titleKey: STRING.administrationDuration,
    subtitleKey: STRING.administrationDurationSubtitle,
    icon: IMAGES.ic_drug_duration,
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  {
    key: 'contraindication',
    titleKey: STRING.contraindication,
    subtitleKey: STRING.contraindicationSubtitle,
    icon: IMAGES.ic_drug_contraindication,
    bgColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  {
    key: 'availability',
    titleKey: STRING.availabilityCommunity,
    subtitleKey: STRING.availabilityCommunitySubtitle,
    icon: IMAGES.ic_drug_availability,
    bgColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
];

export const DrugProfileCard: React.FC<DrugProfileCardProps> = ({ data }) => {
  const { t } = useTranslation();
  // By default, the first section (Indication) can start expanded
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({
    indication: true,
  });

  const toggleSection = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKeys(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const medicineName = data.medicineName || 'Medicine';
  const inn = data.inn || '—';
  const strength = data.strength || '—';
  const route = data.route || '—';
  const sources = data.sources || t(STRING.sourcesLabel);
  const lastUpdated = data.lastUpdated || 'Jan 2025';

  return (
    <View style={styles.container}>
      {/* Top Drug Profile Header Card */}
      <LinearGradient
        colors={['#EDF5FF', '#F8FAFF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerLeft}>
          <View style={styles.badgeRow}>
            <Image
              source={IMAGES.ic_drug_badge_pill}
              style={styles.badgeIcon}
            />
            <AppText
              size={getScaleSize(11)}
              font={FONTS.Inter.Bold}
              color={COLORS.primary}
              style={styles.badgeText}
            >
              {t(STRING.drugProfile)}
            </AppText>
          </View>

          <AppText
            size={getScaleSize(22)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={styles.medicineName}
          >
            {medicineName}
          </AppText>

          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
            style={styles.metaRow}
          >
            {t(STRING.inn)}: {inn}  |  {t(STRING.strength)}: {strength}  |  {t(STRING.route)}: {route}
          </AppText>
        </View>

        <Image
          source={IMAGES.drug_profile_bottle}
          style={styles.bottleImage}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* 7 Accordion Sections */}
      <View style={styles.accordionList}>
        {SECTIONS.map(sec => {
          const content = data.sections?.[sec.key];
          const isExpanded = !!expandedKeys[sec.key];

          return (
            <View key={sec.key} style={styles.accordionCard}>
              <TouchableOpacity
                style={styles.accordionHeader}
                activeOpacity={0.7}
                onPress={() => toggleSection(sec.key)}
                accessibilityRole="button"
                accessibilityLabel={t(sec.titleKey)}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: sec.bgColor,
                      borderColor: sec.borderColor,
                    },
                  ]}
                >
                  <Image source={sec.icon} style={styles.sectionIcon} />
                </View>

                <View style={styles.accordionTitleCol}>
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(sec.titleKey)}
                  </AppText>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                    style={styles.sectionSubtitle}
                  >
                    {t(sec.subtitleKey)}
                  </AppText>
                </View>

                <Image
                  source={IMAGES.ic_drug_chevron_down}
                  style={[
                    styles.chevronIcon,
                    isExpanded && styles.chevronIconRotated,
                  ]}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.accordionBody}>
                  <AppText
                    size={getScaleSize(13.5)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._33383F}
                    style={styles.bodyContent}
                  >
                    {content || t(STRING.notAvailable)}
                  </AppText>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Sources Box */}
      <View style={styles.sourcesBox}>
        <Image source={IMAGES.ic_drug_sources} style={styles.sourcesIcon} />
        <View style={styles.sourcesTextCol}>
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Medium}
            color={COLORS._1A1D1F}
            style={styles.sourcesTitle}
          >
            {sources}
          </AppText>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Regular}
            color={COLORS._6F767E}
          >
            {t(STRING.lastUpdatedLabel)}: {lastUpdated}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: getScaleSize(6),
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(18),
    borderRadius: getScaleSize(18),
    borderWidth: 1,
    borderColor: '#D8E8FE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
    paddingRight: getScaleSize(10),
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0EEFF',
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
    alignSelf: 'flex-start',
    gap: getScaleSize(5),
  },
  badgeIcon: {
    width: getScaleSize(13),
    height: getScaleSize(13),
    resizeMode: 'contain',
  },
  badgeText: {
    letterSpacing: 0.4,
  },
  medicineName: {
    marginTop: getScaleSize(8),
    lineHeight: getScaleSize(26),
  },
  metaRow: {
    marginTop: getScaleSize(6),
    lineHeight: getScaleSize(18),
  },
  bottleImage: {
    width: getScaleSize(85),
    height: getScaleSize(85),
    borderRadius: getScaleSize(14),
  },
  accordionList: {
    marginTop: getScaleSize(12),
    gap: getScaleSize(10),
  },
  accordionCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(12),
  },
  iconBox: {
    width: getScaleSize(42),
    height: getScaleSize(42),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
  },
  accordionTitleCol: {
    flex: 1,
    marginLeft: getScaleSize(12),
    marginRight: getScaleSize(8),
  },
  sectionSubtitle: {
    marginTop: getScaleSize(2),
  },
  chevronIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  chevronIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  accordionBody: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(14),
    paddingTop: getScaleSize(2),
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
  },
  bodyContent: {
    lineHeight: getScaleSize(21),
    marginTop: getScaleSize(6),
  },
  sourcesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(12),
    marginTop: getScaleSize(12),
    gap: getScaleSize(12),
  },
  sourcesIcon: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    resizeMode: 'contain',
  },
  sourcesTextCol: {
    flex: 1,
  },
  sourcesTitle: {
    marginBottom: getScaleSize(2),
  },
});

export default DrugProfileCard;
