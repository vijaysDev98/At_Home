import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  AppSafeAreaView,
  AppText,
  DoctorServicesGrid,
} from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant/strings';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { dashboardApi } from '../../../services/dashboard';
import {
  MASTER_SERVICES_LIST,
  ServiceConfig,
} from '../../../constant/services';

type DashboardActionRequired = {
  awaitingSignatureCount?: number;
  awaitingSignatureByService?: Record<string, number>;
};

const DoctorHomeServicesScreen: React.FC = () => {
  const { t } = useTranslation();
  const [awaitingSignatureByService, setAwaitingSignatureByService] = useState<
    Record<string, number> | undefined
  >(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await dashboardApi.getDashboardOverview(20);
      if (response.success && response.data?.actionRequired) {
        const actionRequired = response.data
          .actionRequired as DashboardActionRequired;
        setAwaitingSignatureByService(
          actionRequired.awaitingSignatureByService,
        );
      } else {
        setAwaitingSignatureByService(undefined);
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
      setAwaitingSignatureByService(undefined);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  const handleServicePress = (service: ServiceConfig) => {
    NavigationService.navigate(SCREENS.SERVICE_SCREEN, {
      selectedService: service,
      serviceId: service.id,
    });
  };

  return (
    <AppSafeAreaView edges={['top']} style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.8}
              onPress={() => NavigationService.goBack()}
              accessibilityRole="button"
              accessibilityLabel={t(STRING.back)}
            >
              <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
              numberOfLines={1}
            >
              {t(STRING.actionRequired)}
            </AppText>
          </View>
          <View style={styles.headerSide} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.sectionHeaderRow}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS.primary}
            >
              {t(STRING.services)} ({MASTER_SERVICES_LIST.length})
            </AppText>
          </View>

          <DoctorServicesGrid
            awaitingSignatureByService={awaitingSignatureByService}
            onServicePress={handleServicePress}
          />
        </ScrollView>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS._EFEFEF,
  },
  headerSide: {
    flex: 0.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  backIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
  scrollContent: {
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(32),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    marginBottom: getScaleSize(12),
    gap: getScaleSize(8),
  },
});

export default DoctorHomeServicesScreen;
