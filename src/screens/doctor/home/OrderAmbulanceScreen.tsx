import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { AppSafeAreaView, AppText, Header } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { SHOW_TOAST, STRING } from '../../../constant';
import { getEmergencyNumbers } from '../../../constant/emergencyNumbers';
import { getNearbyPlacesService } from '../../../services/nearbyPlacesService';
import {
  recordProviderContact,
  getProviderContactSummary,
  getContactCountFor,
  ProviderContactSummary,
} from '../../../services/providerContactTracker';

type NearbyPlace = {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  distanceMeters: number | null;
  mapsUrl: string;
  kind: 'hospital' | 'ambulance';
};

const dial = (phone: string) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned) return;
  Linking.openURL(`tel:${cleaned}`).catch(() => {});
};

const openDirections = (place: NearbyPlace) => {
  const url =
    place.mapsUrl ||
    (place.latitude != null && place.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
      : '');
  if (!url) return;
  Linking.openURL(url).catch(() => {});
};

const formatDistance = (
  meters: number | null,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  if (meters == null) return '';
  if (meters < 1000) {
    return t(STRING.nearbyDistanceMeters, { count: meters });
  }
  const kilometers = meters / 1000;
  const count = kilometers < 10 ? kilometers.toFixed(1) : Math.round(kilometers);
  return t(STRING.nearbyDistanceKm, { count });
};

const readPosition = () =>
  new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });

const requestLocationAccess = async () => {
  if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return new Promise<boolean>(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
};

const OrderAmbulanceScreen: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useSelector((state: RootState) => state.login);
  const { profileData } = useSelector((state: RootState) => state.profile);
  const userId = userData?._id || userData?.id || profileData?.id || '';

  const [contactSummary, setContactSummary] =
    useState<ProviderContactSummary | null>(null);
  const [showTopNotice, setShowTopNotice] = useState<boolean>(true);

  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const emergency = detectedCountry
    ? getEmergencyNumbers(detectedCountry)
    : null;
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadContacts = useCallback(async () => {
    const summary = await getProviderContactSummary(userId, 7);
    setContactSummary(summary);
  }, [userId]);

  const loadPlaces = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
        loadContacts();
      } else {
        setIsLoading(true);
      }
      setLocationDenied(false);
      setHasError(false);

      try {
        const allowed = await requestLocationAccess();
        if (!allowed) {
          setPlaces([]);
          setLocationDenied(true);
          return;
        }

        const position = await readPosition();
        const response: any = await getNearbyPlacesService(
          position.latitude,
          position.longitude,
        );

        if (response?.status === false) {
          setPlaces([]);
          setHasError(true);
          SHOW_TOAST(
            response?.message || t(STRING.somethingWentWrong),
            'error',
          );
          return;
        }

        const list = response?.data?.data?.places;
        setPlaces(Array.isArray(list) ? list : []);
        setDetectedCountry(response?.data?.data?.country || null);
      } catch (error: any) {
        setPlaces([]);
        const denied = error?.code === 1;
        setLocationDenied(denied);
        setHasError(!denied);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [loadContacts, t],
  );

  useEffect(() => {
    loadPlaces(false);
    loadContacts();
    // Load once when the screen opens. Pull to refresh loads again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCallPlace = async (place: NearbyPlace) => {
    if (!place.phone) return;
    try {
      await recordProviderContact(userId, {
        id: place.id,
        name: place.name,
        phone: place.phone,
        category: 'ambulance',
      });
      loadContacts();
    } catch (e) {
      console.log('Error recording provider contact:', e);
    }
    dial(place.phone);
  };

  const hasFrequentNearbyAmbulance = useMemo(() => {
    if (isLoading || places.length === 0 || !contactSummary) {
      return false;
    }
    return places.some(place => {
      const count = getContactCountFor(contactSummary, place.id, place.phone);
      return count >= 3;
    });
  }, [isLoading, places, contactSummary]);

  const renderPlace = ({ item }: { item: NearbyPlace }) => {
    const distance = formatDistance(item.distanceMeters, t);
    const kindLabel =
      item.kind === 'ambulance'
        ? t(STRING.nearbyAmbulance)
        : t(STRING.nearbyHospital);

    const contactCount = getContactCountFor(
      contactSummary,
      item.id,
      item.phone,
    );
    const showIndependenceWarning = contactCount >= 3;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.badgeRow}>
            <View style={styles.kindBadge}>
              <AppText
                size={getScaleSize(11)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.primary}
              >
                {kindLabel}
              </AppText>
            </View>
            {contactCount > 0 ? (
              <View
                style={[
                  styles.contactCountBadge,
                  contactCount >= 3 && styles.contactCountBadgeWarning,
                ]}
              >
                <Image
                  source={IMAGES.phone}
                  style={[
                    styles.contactCountIcon,
                    contactCount >= 3 && styles.contactCountIconWarning,
                  ]}
                />
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.SemiBold}
                  color={contactCount >= 3 ? '#B45309' : COLORS.primary}
                >
                  {contactCount === 1
                    ? t(STRING.contactedThisWeekSingular)
                    : t(STRING.contactedThisWeek, { count: contactCount })}
                </AppText>
              </View>
            ) : null}
          </View>
          {distance ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              {distance}
            </AppText>
          ) : null}
        </View>

        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          style={styles.placeName}
        >
          {item.name}
        </AppText>

        {item.address ? (
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Regular}
            color={COLORS._6F767E}
          >
            {item.address}
          </AppText>
        ) : null}

        {item.phone ? (
          <AppText
            size={getScaleSize(13)}
            font={FONTS.Inter.SemiBold}
            color={COLORS._48B02C}
            style={styles.phone}
          >
            {item.phone}
          </AppText>
        ) : null}

        {showIndependenceWarning ? (
          <View style={styles.independenceWarningBox}>
            <Image source={IMAGES.info} style={styles.warningInfoIcon} />
            <AppText
              size={getScaleSize(11)}
              font={FONTS.Inter.Regular}
              color="#92400E"
              style={styles.warningText}
            >
              {t(STRING.ambulanceIndependenceWarning, { count: contactCount })}
            </AppText>
          </View>
        ) : null}

        <View style={styles.actions}>
          {item.phone ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.callBtn}
              onPress={() => handleCallPlace(item)}
            >
              <Image source={IMAGES.phone} style={styles.callIcon} />
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.SemiBold}
                color={COLORS.white}
              >
                {t(STRING.callNow)}
              </AppText>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.directionsBtn}
            onPress={() => openDirections(item)}
          >
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.SemiBold}
              color={COLORS.primary}
            >
              {t(STRING.nearbyDirections)}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const emptyMessage = locationDenied
    ? t(STRING.nearbyLocationNeeded)
    : hasError
      ? t(STRING.somethingWentWrong)
      : t(STRING.nearbyPlacesEmpty);

  return (
    <AppSafeAreaView
      edges={['top', 'bottom']}
      style={{ backgroundColor: COLORS.white }}
    >
      <Header
        isBack
        title={t(STRING.nearbyAmbulancesTitle)}
        style={{ paddingHorizontal: getScaleSize(16) }}
      />

      {!isLoading && hasFrequentNearbyAmbulance && showTopNotice ? (
        <View style={styles.topIndependenceBanner}>
          <Image source={IMAGES.info} style={styles.topBannerInfoIcon} />
          <View style={{ flex: 1 }}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Bold}
              color="#92400E"
            >
              {t(STRING.commercialIndependenceReminder)}
            </AppText>
            <AppText
              size={getScaleSize(11)}
              font={FONTS.Inter.Regular}
              color="#78350F"
              style={{ marginTop: 2 }}
            >
              {t(STRING.ambulanceIndependenceNotice)}
            </AppText>
          </View>
          <TouchableOpacity
            onPress={() => setShowTopNotice(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.topBannerDismiss}
          >
            <Image source={IMAGES.crossIcon} style={styles.dismissCrossIcon} />
          </TouchableOpacity>
        </View>
      ) : null}

      {emergency ? (
      <View style={styles.emergencyCard}>
        <AppText
          size={getScaleSize(13)}
          font={FONTS.Inter.Medium}
          color={COLORS._1A1D1F}
        >
          {t(STRING.nearbyEmergencyNote, { number: emergency.ambulance })}
        </AppText>
        <View style={styles.emergencyActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emergencyBtn}
            onPress={() => dial(emergency.ambulance)}
          >
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.nearbyCallNumber, { number: emergency.ambulance })}
            </AppText>
          </TouchableOpacity>
          {emergency.secondary && emergency.secondary !== emergency.ambulance ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.emergencyBtn}
              onPress={() => dial(emergency.secondary as string)}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                {t(STRING.nearbyCallNumber, { number: emergency.secondary })}
              </AppText>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      ) : null}

      {isLoading ? (
        <View style={styles.centered}>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
          >
            {t(STRING.nearbySearching)}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={item => item.id}
          renderItem={renderPlace}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadPlaces(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                {emptyMessage}
              </AppText>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.retryBtn}
                onPress={() =>
                  locationDenied
                    ? Linking.openSettings()
                    : loadPlaces(false)
                }
              >
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS.primary}
                >
                  {locationDenied
                    ? t(STRING.nearbyEnableLocation)
                    : t(STRING.nearbyRetry)}
                </AppText>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  emergencyCard: {
    marginHorizontal: getScaleSize(16),
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(8),
    padding: getScaleSize(14),
    borderRadius: getScaleSize(14),
    backgroundColor: '#F4F7F8',
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: getScaleSize(8),
    marginTop: getScaleSize(12),
  },
  emergencyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C24545',
    borderRadius: getScaleSize(10),
    paddingVertical: getScaleSize(10),
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(32),
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: getScaleSize(14),
    marginTop: getScaleSize(12),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
    flexWrap: 'wrap',
  },
  kindBadge: {
    backgroundColor: '#E8EDF1',
    borderRadius: getScaleSize(20),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
  },
  contactCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(4),
    backgroundColor: '#EFF6FF',
    borderRadius: getScaleSize(20),
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(4),
    borderWidth: 0.8,
    borderColor: '#BFDBFE',
  },
  contactCountBadgeWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  contactCountIcon: {
    width: getScaleSize(10),
    height: getScaleSize(10),
    tintColor: COLORS.primary,
    resizeMode: 'contain',
  },
  contactCountIconWarning: {
    tintColor: '#B45309',
  },
  independenceWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(8),
    backgroundColor: '#FFFBEB',
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: getScaleSize(10),
    marginTop: getScaleSize(10),
  },
  warningInfoIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    tintColor: '#D97706',
    resizeMode: 'contain',
    marginTop: getScaleSize(2),
  },
  warningText: {
    flex: 1,
    lineHeight: getScaleSize(16),
  },
  topIndependenceBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(10),
    marginHorizontal: getScaleSize(16),
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(4),
    padding: getScaleSize(12),
    backgroundColor: '#FEF3C7',
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  topBannerInfoIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: '#B45309',
    resizeMode: 'contain',
    marginTop: getScaleSize(2),
  },
  topBannerDismiss: {
    padding: getScaleSize(4),
  },
  dismissCrossIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: '#92400E',
    resizeMode: 'contain',
  },
  placeName: {
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(4),
  },
  phone: {
    marginTop: getScaleSize(6),
  },
  actions: {
    flexDirection: 'row',
    gap: getScaleSize(8),
    marginTop: getScaleSize(12),
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(6),
    backgroundColor: COLORS.primary,
    borderRadius: getScaleSize(10),
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
  },
  callIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },
  directionsBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getScaleSize(10),
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(8),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getScaleSize(24),
    paddingVertical: getScaleSize(40),
  },
  retryBtn: {
    marginTop: getScaleSize(14),
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(8),
  },
});

export default OrderAmbulanceScreen;
