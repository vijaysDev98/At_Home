import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppSafeAreaView, AppText, AppLoader } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { STRING } from '../../../constant';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { RootStackParamList } from '../../../navigation';
import { getServicesService } from '../../../services/patientService';
import {
  serviceRequestListApi,
  ServiceRequest,
} from '../../../services/serviceRequestListApi';
import RequestCardDoctor from '../../../components/RequestCardDoctor';
import { getButtonConfig } from '../../../constant';
import { REQUEST_STATUS } from '../../../constant/RequestStatus';
import { getServiceIcon } from '../createRequest/createRequestStep2';
import {
  getServiceDetails,
  MASTER_SERVICES_LIST,
  ServiceConfig,
} from '../../../constant/services';

export type ServiceDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ServiceScreen'
>;

const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const initialParam = route?.params?.selectedService || route?.params?.serviceId;
  const initialServiceConfig = getServiceDetails(initialParam);

  const [selectedService, setSelectedService] =
    useState<ServiceConfig>(initialServiceConfig);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchServiceRequests = async (service: ServiceConfig) => {
    try {
      setIsLoading(true);
      const res = await serviceRequestListApi.listServiceRequests({
        page: 1,
        size: 50,
        serviceId: service.id,
      });
      if (res?.data?.requests) {
        // Filter strictly by selected service ID or name as client-side fallback
        const filtered = res.data.requests.filter((req: any) => {
          const reqServiceId = req.service?._id || req.service?.id;
          const reqServiceName = req.service?.serviceName || req.service?.name;
          return (
            reqServiceId === service.id ||
            (reqServiceName &&
              reqServiceName.toLowerCase() === service.name.toLowerCase())
          );
        });
        setRequests(filtered);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.log('Error fetching service requests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (selectedService) {
        fetchServiceRequests(selectedService);
      }
    }, [selectedService]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedService) {
      await fetchServiceRequests(selectedService);
    }
    setRefreshing(false);
  }, [selectedService]);

  return (
    <AppSafeAreaView edges={['top']} style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{flex:0.5}}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => NavigationService.goBack()}
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
              {t(selectedService.name)}
            </AppText>
          </View>
          <View style={{flex:0.5}}/>
        </View>

        {/* Active Service Banner */}
        <View style={styles.bannerWrapper}>
          <View
            style={[
              styles.serviceBanner,
              { backgroundColor: selectedService.bgColor },
            ]}
          >
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconBox}>
                <Image source={getServiceIcon(selectedService.id)} style={styles.bannerIcon} />
              </View>
              <View style={styles.bannerTextCol}>
                <AppText
                  size={getScaleSize(18)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {selectedService.name}
                </AppText>
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Regular}
                  color="rgba(255, 255, 255, 0.9)"
                  style={{ marginTop: 4 }}
                >
                  {selectedService.description}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Requests List for Selected Service */}
        <View style={styles.requestsSection}>
          <View style={styles.sectionHeader}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.serviceRequest)}
            </AppText>
          </View>

          {isLoading ? (
            <View style={styles.loaderBox}>
              <AppLoader visible={true} />
            </View>
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item, index) => item.id || index.toString()}
              contentContainerStyle={[
                styles.listContent,
                requests.length === 0 && styles.listContentEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                !isLoading ? (
                  <View style={styles.emptyState}>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                    >
                      {t(STRING.noRequestsFound || 'No requests found')}
                    </AppText>
                  </View>
                ) : null
              }
              renderItem={({ item }) => {
                const formStatus = item.formStatus;
                const buttonConfig = getButtonConfig(formStatus, item.status || '');
                return (
                  <View style={styles.cardItem}>
                    <RequestCardDoctor
                      name={item.patient?.fullName || 'Patient'}
                      requestId={item.requestId}
                      requestType={item.service?.serviceName || selectedService.name}
                      formStatus={formStatus}
                      status={item.status}
                      buttonText={
                        buttonConfig.show
                          ? t(buttonConfig.label || '') || undefined
                          : undefined
                      }
                      onPress={() => {
                        if ((item.status as string) === REQUEST_STATUS.COMPLETED) {
                          NavigationService.navigate(
                            SCREENS.SERVICE_COMPLETED,
                            { request: item },
                          );
                          return;
                        }
                        NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                          request: item,
                          action: 'view',
                        });
                      }}
                      onButtonPress={() => {
                        if (buttonConfig.action === 'edit') {
                          NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                            request: item,
                            action: buttonConfig.action,
                          });
                        } else if (buttonConfig.action === 'sign') {
                          NavigationService.navigate(
                            SCREENS.FORM_REVIEW_SCREEN,
                            {
                              request: item,
                              action: buttonConfig.action,
                            },
                          );
                        } else {
                          NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                            request: item,
                            action: 'view',
                          });
                        }
                      }}
                    />
                  </View>
                );
              }}
            />
          )}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
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
  headerCenter: {
    alignItems: 'center',
    flex:1
  },
  actionBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: '#00509E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },
  selectorContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: getScaleSize(12),
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  selectorContent: {
    paddingHorizontal: getScaleSize(16),
    gap: getScaleSize(8),
  },
  chipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(20),
    gap: getScaleSize(8),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  chipCardSelected: {
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chipIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
  },
  bannerWrapper: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(14),
  },
  serviceBanner: {
    borderRadius: getScaleSize(18),
    padding: getScaleSize(16),
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: getScaleSize(14),
  },
  bannerIconBox: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(14),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    resizeMode: 'contain',
  },
  bannerTextCol: {
    flex: 1,
  },
  createBtn: {
    marginTop: getScaleSize(14),
    alignSelf: 'flex-end',
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(14),
    paddingVertical: getScaleSize(8),
    borderRadius: getScaleSize(20),
  },
  requestsSection: {
    flex: 1,
    marginTop: getScaleSize(16),
  },
  sectionHeader: {
    paddingHorizontal: getScaleSize(16),
    marginBottom: getScaleSize(12),
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(40),
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  cardItem: {
    marginBottom: getScaleSize(12),
  },
  loaderBox: {
    paddingVertical: getScaleSize(40),
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: getScaleSize(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ServiceDetailScreen;
