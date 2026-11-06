import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppSafeAreaView, AppText, ProfileAvatar } from '../../../components';
import ProviderScreenHeader from './ProviderScreenHeader';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { STRING, SHOW_TOAST } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { showNotificationOverlay } from '../../../actions/common/notificationOverlaySlice';
import { openProviderChat } from '../../../services/chatService';
import { Provider } from './providerTypes';
import {
  getProviderDisplayName,
  getProviderServiceLabels,
} from './providerDisplay';

type RouteParams = {
  provider: Provider;
  hideFooterActions?: boolean;
};

const DetailRow = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: number;
}) => {
  if (!value) {
    return null;
  }
  return (
    <View style={styles.detailRow}>
      {icon ? (
        <Image source={icon} style={styles.detailRowIcon} resizeMode="contain" />
      ) : null}
      <View style={styles.detailRowText}>
        <AppText
          size={getScaleSize(11)}
          font={FONTS.Inter.Medium}
          color={COLORS._6F767E}
        >
          {label}
        </AppText>
        <AppText
          size={getScaleSize(14)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._1A1D1F}
          style={{ marginTop: getScaleSize(2) }}
        >
          {value}
        </AppText>
      </View>
    </View>
  );
};

const ProviderDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const route = useRoute();
  const routeParams = (route.params || {}) as RouteParams;
  const provider = routeParams.provider;
  const hideFooterActions = !!routeParams.hideFooterActions;
  const [openingChat, setOpeningChat] = useState(false);

  const name = useMemo(
    () => (provider ? getProviderDisplayName(provider) : ''),
    [provider],
  );
  const providerUserId = String(provider?._id || provider?.id || '');
  const serviceLabels = useMemo(
    () => (provider ? getProviderServiceLabels(provider) : []),
    [provider],
  );
  const departments =
    provider?.operatingDepartments?.filter(Boolean).join(', ') || '';

  const handleChat = async () => {
    if (!providerUserId || openingChat) {
      return;
    }
    setOpeningChat(true);
    try {
      const result = await openProviderChat(providerUserId);
      if (!result?.conversationId) {
        SHOW_TOAST(t(STRING.somethingWentWrong), 'error');
        return;
      }
      NavigationService.navigate(SCREENS.CHAT, {
        conversationId: result.conversationId,
        peerName: result.peer?.name || name,
        peerProfileImg:
          provider?.profileImg || result.peer?.profileImg || undefined,
        peerPhone: provider?.phoneNumber || result.peer?.phoneNumber,
        peerCountry: provider?.country || result.peer?.country || undefined,
        peerUserId: providerUserId,
      });
    } finally {
      setOpeningChat(false);
    }
  };

  const handleCall = () => {
    if (provider?.phoneNumber) {
      dispatch(
        showNotificationOverlay({
          type: 'contactProvider',
          payload: {
            phoneNumber: provider.phoneNumber,
            country: provider.country,
            providerName: name,
            position: 'center',
          },
        }),
      );
    } else {
      SHOW_TOAST(t(STRING.noProviderPhoneNumberAvailable), 'info');
    }
  };

  if (!provider) {
    return (
      <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
        <ProviderScreenHeader title={t(STRING.providerDetails)} />
        <View style={styles.empty}>
          <AppText color={COLORS._6F767E}>{t(STRING.somethingWentWrong)}</AppText>
        </View>
      </AppSafeAreaView>
    );
  }

  return (
    <AppSafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: COLORS.white }}
    >
      <ProviderScreenHeader title={t(STRING.providerDetails)} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <ProfileAvatar
            name={name}
            imageUrl={
              provider.profileImg
                ? IMAGE_BASE_URL + provider.profileImg
                : undefined
            }
            size="large"
          />
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            align="center"
            style={styles.heroName}
          >
            {name}
          </AppText>
          {provider.specialty ? (
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS.primary}
              align="center"
            >
              {provider.specialty}
            </AppText>
          ) : null}
        </View>

        <View style={styles.section}>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={styles.sectionTitle}
          >
            {t(STRING.contactDetails)}
          </AppText>
          <DetailRow
            label={t(STRING.emailAddress)}
            value={provider.email || ''}
            icon={IMAGES.mail}
          />
          <DetailRow
            label={t(STRING.phoneNumber)}
            value={provider.phoneNumber || ''}
            icon={IMAGES.phone}
          />
          <DetailRow
            label={t(STRING.department)}
            value={departments}
            icon={IMAGES.location_pin}
          />
        </View>

        {serviceLabels.length > 0 ? (
          <View style={styles.section}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={styles.sectionTitle}
            >
              {t(STRING.services)}
            </AppText>
            <View style={styles.tagWrap}>
              {serviceLabels.map(label => (
                <View key={label} style={styles.tag}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Medium}
                    color={COLORS.primary}
                  >
                    {label}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {!hideFooterActions ? (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleChat}
            style={styles.footerBtnChat}
            disabled={openingChat}
          >
            {openingChat ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Image
                  source={IMAGES.chat_conversation}
                  style={styles.footerIconChat}
                />
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.primary}
                >
                  {t(STRING.chat)}
                </AppText>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCall}
            style={styles.footerBtnCall}
          >
            <Image source={IMAGES.phone} style={styles.footerIconCall} />
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.callNow)}
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(18),
    paddingBottom: getScaleSize(24),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    paddingVertical: getScaleSize(24),
    paddingHorizontal: getScaleSize(16),
    marginTop: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  heroName: {
    marginTop: getScaleSize(12),
    marginBottom: getScaleSize(4),
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    marginTop: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  sectionTitle: {
    marginBottom: getScaleSize(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(10),
    marginBottom: getScaleSize(12),
  },
  detailRowIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    marginTop: getScaleSize(2),
    tintColor: COLORS._6F767E,
  },
  detailRowText: {
    flex: 1,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(8),
  },
  tag: {
    backgroundColor: COLORS._DBEAFE,
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(8),
  },
  footer: {
    flexDirection: 'row',
    gap: getScaleSize(10),
    paddingHorizontal: getScaleSize(18),
    paddingVertical: getScaleSize(12),
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
    backgroundColor: COLORS.white,
  },
  footerBtnChat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS.white,
  },
  footerBtnCall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._48B02C,
  },
  footerIconChat: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  footerIconCall: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
});

export default ProviderDetailScreen;
