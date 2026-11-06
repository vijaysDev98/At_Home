import React, { useCallback, useEffect, useState } from 'react';
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
import { AppSafeAreaView, AppText, Header } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { SHOW_TOAST, STRING } from '../../../constant';
import { getEmergencyNumbers } from '../../../constant/emergencyNumbers';
import { getNearbyPlacesService } from '../../../services/nearbyPlacesService';

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

// Static France coordinates for testing (Paris). Used only in development builds.
const USE_TEST_LOCATION = __DEV__;
const TEST_LOCATION = { latitude: 48.8566, longitude: 2.3522 };

const readPosition = () =>
  new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
    if (USE_TEST_LOCATION) {
      resolve(TEST_LOCATION);
      return;
    }

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
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const emergency = detectedCountry
    ? getEmergencyNumbers(detectedCountry)
    : null;
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadPlaces = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLocationDenied(false);
      setHasError(false);

      try {
        const allowed = USE_TEST_LOCATION || (await requestLocationAccess());
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
    [t],
  );

  useEffect(() => {
    loadPlaces(false);
    // Load once when the screen opens. Pull to refresh loads again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPlace = ({ item }: { item: NearbyPlace }) => {
    const distance = formatDistance(item.distanceMeters, t);
    const kindLabel =
      item.kind === 'ambulance'
        ? t(STRING.nearbyAmbulance)
        : t(STRING.nearbyHospital);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.kindBadge}>
            <AppText
              size={getScaleSize(11)}
              font={FONTS.Inter.SemiBold}
              color={COLORS.primary}
            >
              {kindLabel}
            </AppText>
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

        <View style={styles.actions}>
          {item.phone ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.callBtn}
              onPress={() => dial(item.phone)}
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
  kindBadge: {
    backgroundColor: '#E8EDF1',
    borderRadius: getScaleSize(20),
    paddingHorizontal: getScaleSize(10),
    paddingVertical: getScaleSize(4),
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
