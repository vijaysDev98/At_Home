import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { AppText } from '..';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { STRING } from '../../constant';
import { IMAGE_BASE_URL } from '../../api/apiRoutes';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import {
  providerForNavigation,
} from '../../screens/doctor/providers/providerTypes';

export type RecentConnectedProvider = {
  id: string;
  name: string;
  profileImg?: string | null;
  primaryServiceId?: string | null;
  assignedServices?: string[];
  profession?: string | null;
  phoneNumber?: string | null;
  country?: string | null;
  isOnline?: boolean;
  lastConnectedAt?: string | null;
};

/** Blue → cyan ring (same for every provider on home). */
const PROVIDER_RING_GRADIENT: [string, string] = ['#3B82F6', '#06B6D4'];

const AVATAR_OUTER = getScaleSize(56);
const RING_BORDER = getScaleSize(3);
const AVATAR_INNER = AVATAR_OUTER - RING_BORDER * 2;

const getInitials = (name: string): string => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'P';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

type Props = {
  providers: RecentConnectedProvider[];
  onViewAll?: () => void;
};

export const RecentlyConnectedProvidersRow: React.FC<Props> = ({
  providers,
  onViewAll,
}) => {
  const { t } = useTranslation();

  const visibleProviders = useMemo(
    () => providers.filter(p => p?.id && p?.name),
    [providers],
  );

  const handleOpenProviderDetail = useCallback(
    (provider: RecentConnectedProvider) => {
      if (!provider.id) {
        return;
      }
      const assigned =
        provider.assignedServices?.length
          ? provider.assignedServices
          : provider.primaryServiceId
            ? [provider.primaryServiceId]
            : [];

      NavigationService.push(SCREENS.PROVIDER_DETAIL, {
        provider: providerForNavigation({
          id: provider.id,
          providerName: provider.name,
          profileImg: provider.profileImg ?? undefined,
          profession: provider.profession ?? undefined,
          specialty: provider.profession ?? undefined,
          phoneNumber: provider.phoneNumber ?? undefined,
          country: provider.country ?? undefined,
          assignedServices: assigned,
          roles: ['serviceProvider'],
        }),
      });
    },
    [],
  );

  if (visibleProviders.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          style={styles.title}
        >
          {t(STRING.homeRecentlyConnectedProviders)}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.SemiBold}
            color={COLORS.primary}
          >
            {t(STRING.viewAll)} ›
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.scrollContent}
      >
        {visibleProviders.map(provider => {
          const imageUri = provider.profileImg
            ? IMAGE_BASE_URL + provider.profileImg
            : undefined;

          return (
            <TouchableOpacity
              key={provider.id}
              style={styles.item}
              activeOpacity={0.85}
              onPress={() => handleOpenProviderDetail(provider)}
            >
              <View style={styles.avatarWrap}>
                <LinearGradient
                  colors={PROVIDER_RING_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ringGradient}
                />
                <View style={styles.avatarInner}>
                  {imageUri ? (
                    <FastImage
                      source={{ uri: imageUri }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {getInitials(provider.name)}
                    </AppText>
                  )}
                </View>
                {provider.isOnline ? (
                  <View style={styles.onlineDot} />
                ) : null}
              </View>
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1D1F}
                align="center"
                numberOfLines={2}
                style={styles.nameLabel}
              >
                {provider.name}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const ITEM_WIDTH = getScaleSize(84);

const styles = StyleSheet.create({
  section: {
    marginBottom: Math.max(getScaleSize(4), getScaleSize(10) - 5),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(18),
    marginBottom: getScaleSize(12),
  },
  title: {
    flex: 1,
    paddingRight: getScaleSize(8),
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(14),
    gap: getScaleSize(10),
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  avatarWrap: {
    width: AVATAR_OUTER,
    height: AVATAR_OUTER,
    marginBottom: getScaleSize(4),
  },
  ringGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: AVATAR_OUTER / 2,
  },
  avatarInner: {
    position: 'absolute',
    top: RING_BORDER,
    left: RING_BORDER,
    width: AVATAR_INNER,
    height: AVATAR_INNER,
    borderRadius: AVATAR_INNER / 2,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: AVATAR_INNER,
    height: AVATAR_INNER,
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: getScaleSize(11),
    height: getScaleSize(11),
    borderRadius: getScaleSize(6),
    backgroundColor: COLORS.completed || '#10B981',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nameLabel: {
    width: ITEM_WIDTH,
  },
});

export default RecentlyConnectedProvidersRow;