import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  AppSafeAreaView,
  AppText,
  ProfileAvatar,
} from '../../components';
import NavigationService from '../../navigation/NavigationService';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { IMAGE_BASE_URL } from '../../api/apiRoutes';
import { SHOW_TOAST, STRING } from '../../constant';
import { getCountryCode, toDialablePhone } from '../../constant/getCountryCode';
import { getRoleVisualTheme, ROLES } from '../../constant/getRole';
import { doctorSpecialities } from '../../utils/dummyData';
import {
  ChatPeerProfile,
  fetchChatPeerProfile,
} from '../../services/chatService';
import {
  getProviderServiceItems,
  getProviderSpecialty,
} from '../doctor/providers/providerDisplay';

type RouteParams = {
  conversationId?: string;
  peerName?: string;
  peerProfileImg?: string | null;
  peerPhone?: string | null;
  peerCountry?: string | null;
  peerUserId?: string;
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
          style={styles.detailRowValue}
          numberOfLines={3}
        >
          {value}
        </AppText>
      </View>
    </View>
  );
};

const formatPhoneDisplay = (
  rawPhone?: string | null,
  country?: string | null,
): string => {
  const phone = String(rawPhone || '').trim();
  if (!phone) return '';
  const dial = getCountryCode(country || undefined);
  const digits = phone.replace(/[^\d+]/g, '');
  const dialDigits = dial.replace(/\D/g, '');
  let national = digits.replace(/^\+/, '').replace(/^00/, '');
  if (dialDigits && national.startsWith(dialDigits)) {
    national = national.slice(dialDigits.length);
  }
  national = national.replace(/^0+/, '');
  if (!national) {
    return `${dial} ${phone.replace(/\s+/g, ' ').trim()}`.trim();
  }
  return `${dial} ${national}`.trim();
};

const ChatPeerProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const [peer, setPeer] = useState<ChatPeerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(!!params.conversationId);

  useEffect(() => {
    let active = true;
    const convId = params.conversationId;
    if (!convId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchChatPeerProfile(convId)
      .then(data => {
        if (active && data) {
          setPeer(data);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.conversationId]);

  const displayName =
    peer?.name ||
    peer?.fullName ||
    peer?.providerName ||
    [peer?.fName, peer?.lName].filter(Boolean).join(' ').trim() ||
    params.peerName ||
    t(STRING.profile);

  const profileImg = peer?.profileImg ?? params.peerProfileImg ?? null;
  const phoneRaw = peer?.phoneNumber || params.peerPhone || '';
  const country = peer?.country || params.peerCountry || '';
  const phoneDisplay = useMemo(
    () => formatPhoneDisplay(phoneRaw, country),
    [phoneRaw, country],
  );
  const professionalPhoneDisplay = useMemo(
    () => formatPhoneDisplay(peer?.professionalPhoneNumber, country),
    [peer?.professionalPhoneNumber, country],
  );

  const isServiceProvider =
    peer?.role === ROLES.PROVIDER ||
    peer?.roles?.includes(ROLES.PROVIDER) ||
    peer?.roles?.includes('serviceProvider');

  const roleBadge = useMemo(() => {
    if (!peer) return null;
    if (isServiceProvider) {
      return {
        label: t(STRING.healthcareProvider),
        bg: '#EFF6FF',
        border: '#BFDBFE',
        text: '#1D4ED8',
      };
    }
    const theme = getRoleVisualTheme(peer);
    return {
      label: t(theme.labelKey),
      bg: theme.badgeBg,
      border: theme.badgeBorder,
      text: theme.badgeText,
    };
  }, [peer, isServiceProvider, t]);

  const specialtyLabel = useMemo(() => {
    if (!peer?.specialty) return '';
    if (isServiceProvider) {
      return getProviderSpecialty(peer as any, t);
    }
    const match = doctorSpecialities.find(s => s.value === peer.specialty);
    return t(match?.label || peer.specialty);
  }, [peer, isServiceProvider, t]);

  const departments =
    peer?.operatingDepartments?.filter(Boolean).join(', ') || '';

  const serviceItems = useMemo(
    () => (peer ? getProviderServiceItems(peer as any) : []),
    [peer],
  );

  const handleCall = () => {
    const raw = phoneRaw.trim() || (peer?.professionalPhoneNumber || '').trim();
    if (!raw) {
      SHOW_TOAST(t(STRING.noProviderPhoneNumberAvailable), 'info');
      return;
    }
    const tel = toDialablePhone(raw, country);
    if (!tel) {
      SHOW_TOAST(t(STRING.noProviderPhoneNumberAvailable), 'info');
      return;
    }
    Linking.openURL(`tel:${tel}`).catch(() => {
      SHOW_TOAST(t(STRING.unableToOpenPhoneDialer), 'error');
    });
  };

  return (
    <AppSafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: COLORS.white }}
    >
      <View style={styles.headerWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          hitSlop={16}
          style={styles.backBtn}
          onPress={() => NavigationService.goBack()}
        >
          <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
        </TouchableOpacity>
        <AppText
          size={getScaleSize(16)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._1A1D1F}
          numberOfLines={1}
          style={styles.headerTitle}
        >
          {t(STRING.profile)}
        </AppText>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <ProfileAvatar
            name={displayName}
            imageUrl={profileImg ? IMAGE_BASE_URL + profileImg : undefined}
            size="large"
          />
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            align="center"
            style={styles.heroName}
          >
            {displayName}
          </AppText>

          {specialtyLabel && specialtyLabel !== roleBadge?.label ? (
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS.primary}
              align="center"
              style={{ marginTop: getScaleSize(4) }}
            >
              {specialtyLabel}
            </AppText>
          ) : null}

          {roleBadge ? (
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: roleBadge.bg,
                  borderColor: roleBadge.border,
                },
              ]}
            >
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color={roleBadge.text}
              >
                {roleBadge.label}
              </AppText>
            </View>
          ) : null}
        </View>

        {loading && !peer ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : null}

        {/* Contact & Professional Details */}
        {(peer?.email ||
          phoneDisplay ||
          professionalPhoneDisplay ||
          (specialtyLabel && specialtyLabel !== roleBadge?.label) ||
          peer?.practiceType ||
          peer?.supervisingDoctorName ||
          peer?.facilityName ||
          peer?.businessAddress ||
          departments ||
          peer?.rppsNumber ||
          peer?.finessNumber ||
          peer?.registrationId) ? (
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
              value={peer?.email || ''}
              icon={IMAGES.mail}
            />
            <DetailRow
              label={t(STRING.phoneNumber)}
              value={phoneDisplay}
              icon={IMAGES.phone}
            />
            {professionalPhoneDisplay &&
            professionalPhoneDisplay !== phoneDisplay ? (
              <DetailRow
                label={t(STRING.phoneNumber)}
                value={professionalPhoneDisplay}
                icon={IMAGES.phone}
              />
            ) : null}
            {specialtyLabel && specialtyLabel !== roleBadge?.label ? (
              <DetailRow
                label={t(STRING.specialty)}
                value={specialtyLabel}
                icon={IMAGES.stethoscope}
              />
            ) : null}
            <DetailRow
              label={t(STRING.placeOfPractice)}
              value={peer?.practiceType ? t(peer.practiceType) : ''}
              icon={IMAGES.ic_medKit}
            />
            <DetailRow
              label={t(STRING.supervisingDoctor)}
              value={peer?.supervisingDoctorName || ''}
              icon={IMAGES.provider}
            />
            <DetailRow
              label={t(STRING.facilityName)}
              value={peer?.facilityName || ''}
              icon={IMAGES.hospital}
            />
            <DetailRow
              label={t(STRING.businessAddress)}
              value={peer?.businessAddress || ''}
              icon={IMAGES.location_pin}
            />
            <DetailRow
              label={t(STRING.department)}
              value={departments}
              icon={IMAGES.location_pin}
            />
            <DetailRow
              label={t(STRING.rppsNumber)}
              value={peer?.rppsNumber || ''}
              icon={IMAGES.card}
            />
            <DetailRow
              label={t(STRING.finessNumber)}
              value={peer?.finessNumber || ''}
              icon={IMAGES.ic_insurance}
            />
            <DetailRow
              label={t(STRING.registrationId)}
              value={peer?.registrationId || ''}
              icon={IMAGES.ic_file}
            />
          </View>
        ) : null}

        {/* Provider Services */}
        {serviceItems.length > 0 || (isServiceProvider && !loading) ? (
          <View style={styles.section}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              style={styles.sectionTitle}
            >
              {serviceItems.length > 0
                ? `${t(STRING.services)} (${serviceItems.length})`
                : t(STRING.services)}
            </AppText>
            {serviceItems.length > 0 ? (
              <View style={styles.serviceCardsContainer}>
                {serviceItems.map((item, idx) => (
                  <View
                    key={`${item.id || item.name}-${idx}`}
                    style={styles.serviceCard}
                  >
                    <View style={styles.serviceTag}>
                      <AppText
                        size={getScaleSize(13)}
                        font={FONTS.Inter.SemiBold}
                        color={COLORS.primary}
                      >
                        {t(item.name)}
                      </AppText>
                    </View>
                    {item.description ? (
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        style={{ marginTop: getScaleSize(6) }}
                      >
                        {t(item.description)}
                      </AppText>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
              >
                {t(STRING.noServicesAssigned)}
              </AppText>
            )}
          </View>
        ) : null}
      </ScrollView>

      {phoneRaw || peer?.professionalPhoneNumber ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.callBtn}
            activeOpacity={0.85}
            onPress={handleCall}
          >
            <Image source={IMAGES.phone} style={styles.callIcon} />
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

export default ChatPeerProfileScreen;

const styles = StyleSheet.create({
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(10),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._E5E7EB,
    gap: getScaleSize(10),
  },
  backBtn: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    borderRadius: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    backgroundColor: COLORS._F9FAFB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: getScaleSize(17),
    height: getScaleSize(15),
    resizeMode: 'contain',
  },
  headerTitle: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    padding: getScaleSize(16),
    paddingBottom: getScaleSize(32),
    gap: getScaleSize(14),
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    padding: getScaleSize(20),
    alignItems: 'center',
  },
  heroName: {
    marginTop: getScaleSize(12),
  },
  roleBadge: {
    marginTop: getScaleSize(8),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
  },
  loaderBox: {
    paddingVertical: getScaleSize(12),
    alignItems: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    padding: getScaleSize(16),
  },
  sectionTitle: {
    marginBottom: getScaleSize(12),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(10),
    paddingVertical: getScaleSize(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS._EFEFEF,
  },
  detailRowIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    marginTop: getScaleSize(2),
    tintColor: COLORS._6F767E,
  },
  detailRowText: {
    flex: 1,
  },
  detailRowValue: {
    marginTop: getScaleSize(2),
  },
  serviceCardsContainer: {
    gap: getScaleSize(8),
  },
  serviceCard: {
    backgroundColor: COLORS._F9FAFB,
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    padding: getScaleSize(12),
  },
  serviceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(8),
  },
  footer: {
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
  },
  callBtn: {
    height: getScaleSize(50),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
  },
  callIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
});
