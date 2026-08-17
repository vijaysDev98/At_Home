import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation';
import {
  AppButton,
  AppLoader,
  AppSafeAreaView,
  AppText,
} from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { getServicesService } from '../../../services/patientService';
import { SHOW_TOAST, STRING } from '../../../constant';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { ROLES } from '../../../constant/getRole';

export const getServiceIcon = (id: string) => {
  switch (id) {
    case '69ef359fd1c1c4252d4b8d4f':
      return IMAGES.injectionIcon;
    case '69ef3557d1c1c4252d4b8d2c':
      return IMAGES.testTubeIcon;
    case '69ef3589d1c1c4252d4b8d45':
      return IMAGES.nurseIcon;
    case '69eb112a056b86c571c1a44f':
      return IMAGES.ic_generic;
    case '69ef3592d1c1c4252d4b8d4a':
      return IMAGES.ic_hydration;
    case '69ef353fd1c1c4252d4b8d22':
      return IMAGES.ivfIcon;
    case '69ef354cd1c1c4252d4b8d27':
      return IMAGES.maskIcon;
    case '69ef356cd1c1c4252d4b8d36':
      return IMAGES.pca;
    case '69ef357cd1c1c4252d4b8d40':
      return IMAGES.parenteral;
    case '69ef3563d1c1c4252d4b8d31':
      return IMAGES.hygiene;
    case '69ef3575d1c1c4252d4b8d3b':
      return IMAGES.pregnancy;
    case '69ef3534d1c1c4252d4b8d1d':
      return IMAGES.bandegeIcon;
    default:
      return IMAGES.nurseIcon;
  }
};

export type CreateRequestStep2Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateRequestStep2'
>;

const CreateRequestStep2: React.FC<CreateRequestStep2Props> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const patientId = route?.params?.patientId;
  const doctorId = route?.params?.doctorId;
  const selectedDoctor = route?.params?.selectedDoctor;
  const [apiServices, setApiServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  let role: string = profileData?.roles?.[0] || '';
  // console.log(profileData);

  let serviceIDs =
    role === ROLES.DOCTOR
      ? null
      : profileData?.assignedServices?.map((service: any) => service.id);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response: any = await getServicesService(
        1,
        20,
        serviceIDs || undefined,
      );

      if (response?.status && response?.code === 200) {
        const list = response.data.data.services || [];
        setApiServices(list);
        console.log("list", list);
        
        if (list.length > 0) {
          setSelected(list[0]); // Select first by default
        }
      }
    } catch (error) {
      console.log('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.circleBtn}
              activeOpacity={0.8}
              onPress={() => NavigationService.goBack()}
            >
              <Image source={IMAGES.arrowLeft} style={styles.crossIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >
              {t(STRING.createRequest)}
            </AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >
              {t(role === ROLES.PROVIDER ? STRING.step3Of4 : STRING.step2Of3)}
            </AppText>
          </View>
          <View style={styles.headerLeft} />
        </View>

        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionHeader}>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                {t(STRING.selectService)} ({apiServices.length})
              </AppText>
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
              >
                {t(STRING.selectServiceDescription)}
              </AppText>
            </View>

            <View style={styles.grid}>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <AppLoader visible={true} />
                </View>
              ) : (
                apiServices.map(service => {
                  const isSelected = selected?.id === service.id;
                  return (
                    <TouchableOpacity
                      key={service.id}
                      activeOpacity={0.9}
                      style={[styles.card, isSelected && styles.cardActive]}
                      onPress={() => setSelected(service)}
                    >
                      <View style={styles.cardTopRow}>
                        <Image
                          source={getServiceIcon(service.id)}
                          style={{
                            height: getScaleSize(40),
                            width: getScaleSize(40),
                            borderWidth: 0.8,
                            borderColor: COLORS._1E293B80,
                            borderRadius: 40,
                          }}
                        />
                        <View
                          style={[
                            styles.checkOuter,
                            isSelected && styles.checkOuterActive,
                          ]}
                        >
                          {isSelected ? (
                            <View style={styles.checkInner} />
                          ) : null}
                        </View>
                      </View>
                      <AppText
                        size={getScaleSize(15)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        numberOfLines={2}
                      >
                        {t(service.serviceName)}
                      </AppText>
                      <AppText
                        size={getScaleSize(12)}
                        font={FONTS.Inter.Regular}
                        color={COLORS._6F767E}
                        // numberOfLines={3}
                      >
                        {t(service.description)}
                      </AppText>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </ScrollView>
          <View style={styles.bottomButtonContainer}>
            <AppButton
              title={t(STRING.continue)}
              onPress={() => {
                if (!selected) {
                  SHOW_TOAST(t(STRING.noServiceSelected), 'error');
                  return;
                }
                NavigationService.navigate(SCREENS.CREATE_REQUEST_STEP3, {
                  selected,
                  patientId,
                  doctorId,
                  selectedDoctor,
                });
              }}
            />
          </View>
        </View>
      </View>
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  headerLeft: {
    flex: 0.5,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 18,
    color: COLORS._1A1D1F,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 2,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 160,
    gap: 16,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS._1A1D1F,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS._6F767E,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    // height: 164,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS._EFEFEF,
    paddingTop: getScaleSize(18),
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(18),
    shadowColor: COLORS.black,
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS._E8EDF1,
    borderWidth: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS._F1F5F9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS._E3E9EE,
  },
  iconText: {
    fontSize: 20,
  },
  checkOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS._D1D5DB,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkOuterActive: {
    borderColor: COLORS.primary,
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS._1A1D1F,
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS._6F767E,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
  },
  backBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS._1A1D1F,
  },
  nextBtn: {
    flex: 1.3,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDisabled: {
    opacity: 0.6,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  crossIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
    resizeMode: 'contain',
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: getScaleSize(17),
    paddingHorizontal: getScaleSize(20),
  },
  loaderContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreateRequestStep2;
