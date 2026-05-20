import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  FlatList,
} from 'react-native';
import {
  AppButton,
  AppSafeAreaView,
  AppText,
  Header,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { useRoute, useIsFocused } from '@react-navigation/native';
import { AppLoader } from '../../../components';
import moment from 'moment';
import NavigationService from '../../../navigation/NavigationService';
import { DOCTOR_TAB_SCREENS, SCREENS } from '../../../navigation/routes';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { fetchPatientDetails } from '../../../actions/patient/patientAction';
import { getButtonConfig, STRING } from '../../../constant';
import { clearSelectedPatient } from '../../../actions/patient/patientSlice';
import RequestCardDoctor from '../../../components/RequestCardDoctor';

const PatientDetail: React.FC = () => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch<any>();
  const route = useRoute<any>();
  const { id } = route.params || {};
  const patient = useSelector(
    (state: RootState) => state.patient.selectedPatient,
  );
  console.log('patient', patient);

  const homeAddress = [patient?.streetAddress, patient?.city, patient?.zip]
    .filter(item => item && item !== 'null')
    .join(', ');
  const { isLoading: globalLoading } = useSelector(
    (state: RootState) => state.common,
  );

  const fetchPatientData = async () => {
    if (id) {
      dispatch(fetchPatientDetails(id));
    }
  };

  useEffect(() => {
    if (id && isFocused) {
      fetchPatientData();
    }
  }, [id, isFocused]);

  useEffect(() => {
    return () => {
      dispatch(clearSelectedPatient());
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  return (
    <AppSafeAreaView edges>
      <Header
        isBack
        backIcon={IMAGES.arrowLeft}
        title={STRING.patientDetail}
        style={styles.headerStyle}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Info Card */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.8}
              hitSlop={20}
              onPress={() =>
                NavigationService.navigate(SCREENS.ADD_PATIENT, { patient })
              }
            >
              <Image source={IMAGES.editIcon} style={styles.editIcon} />
            </TouchableOpacity>

            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText
                    size={getScaleSize(20)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._526674}
                  >
                    {getInitials(patient?.fName + ' ' + patient?.lName)}
                  </AppText>
                </View>
              </View>
              <View style={styles.profileMeta}>
                <AppText
                  size={getScaleSize(18)}
                  color={COLORS._1A1D1F}
                  font={FONTS.Inter.Bold}
                >
                  {patient?.fullName || '---'}
                </AppText>
                <AppText
                  size={getScaleSize(13)}
                  color={COLORS._6F767E}
                  font={FONTS.Inter.Regular}
                >
                  {STRING.dob}{' '}
                  {patient?.dateOfBirth
                    ? moment(patient.dateOfBirth).format('MMM DD, YYYY')
                    : '---'}{' '}
                  ({patient?.age || 0}yo)
                </AppText>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <AppText
                    size={getScaleSize(12)}
                    color={COLORS._2ECA7F}
                    font={FONTS.Inter.Medium}
                  >
                    {STRING.activePatient}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Image source={IMAGES.phone} style={styles.infoIcon} />
                <View>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                  >
                    {STRING.primaryContact}
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._1A1D1F}
                  >
                    {patient?.phoneNumber || '---'}
                  </AppText>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Image source={IMAGES.mail} style={styles.infoIcon} />
                <View>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                  >
                    {STRING.emailAddress}
                  </AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._1A1D1F}
                  >
                    {patient?.email || '---'}
                  </AppText>
                </View>
              </View>
              {homeAddress && (
                <View style={styles.infoRow}>
                  <Image source={IMAGES.location_pin} style={styles.infoIcon} />
                  <View>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                    >
                      {STRING.homeAddress}
                    </AppText>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._1A1D1F}
                    >
                      {homeAddress || '---'}
                    </AppText>
                  </View>
                </View>
              )}
              {patient?.gender && (
                <View style={styles.infoRow}>
                  <Image source={IMAGES.ic_gender} style={styles.infoIcon} />
                  <View>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                    >
                      {STRING.gender}
                    </AppText>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._1A1D1F}
                    >
                      {patient?.gender}
                    </AppText>
                  </View>
                </View>
              )}
              {patient?.socialInsuranceNumber && (
                <View style={styles.infoRow}>
                  <Image source={IMAGES.ic_insurance} style={styles.infoIcon} />
                  <View>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                    >
                      {STRING.socialInsuranceNumber}
                    </AppText>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._1A1D1F}
                    >
                      {patient?.socialInsuranceNumber}
                    </AppText>
                  </View>
                </View>
              )}
              {patient?.weight && (
                <View style={styles.infoRow}>
                  <Image source={IMAGES.ic_weight} style={styles.infoIcon} />
                  <View>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                    >
                      {STRING.weight}
                    </AppText>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._1A1D1F}
                    >
                      {patient?.weight}
                    </AppText>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Medical Notes */}
          <View style={styles.sectionHeader}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS.black}
            >
              {STRING.medicalNotes}
            </AppText>
            <TouchableOpacity
              onPress={() =>
                NavigationService.navigate(SCREENS.ADD_PATIENT, { patient })
              }
              activeOpacity={0.8}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Medium}
                color={COLORS._526674}
              >
                {STRING.edit}
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Regular}
              color={COLORS._1A1A1A}
            >
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1A1A}
              >
                {STRING.medicalDescription}:
              </AppText>{' '}
              {patient?.medicalDescription}
            </AppText>
          </View>

          {/* Linked Requests */}
          <View style={styles.sectionHeader}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS.black}
            >
              {STRING.linkedRequests}
            </AppText>
            <TouchableOpacity
              onPress={() => {
                NavigationService.replace(DOCTOR_TAB_SCREENS.CREATE_REQUEST);
              }}
              style={styles.plusBtn}
              activeOpacity={0.8}
            >
              <Image
                source={IMAGES.new_request}
                style={styles.newRequestIcon}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[] as any[]}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                  align="center"
                >
                  No linked requests found
                </AppText>
              </View>
            )}
            renderItem={({ item }) => {
              const formStatus = item?.formStatus;
              const buttonConfig = getButtonConfig(formStatus, item?.status);

              return (
                <View style={{ marginBottom: getScaleSize(12) }}>
                  <RequestCardDoctor
                    name={patient?.fullName}
                    requestId={item?.id}
                    requestType={item?.service?.serviceName}
                    status={item?.status}
                    formStatus={item?.formStatus}
                    buttonText={
                      buttonConfig.show
                        ? buttonConfig.label || undefined
                        : undefined
                    }
                    onPress={() => {
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
                        NavigationService.navigate(SCREENS.FORM_REVIEW_SCREEN, {
                          request: item,
                          action: buttonConfig.action,
                        });
                      } else if (buttonConfig.action === 'view') {
                        NavigationService.navigate(SCREENS.FORMS_SCREEN, {
                          request: item,
                          action: buttonConfig.action,
                        });
                      }
                    }}
                  />
                </View>
              );
            }}
            keyExtractor={item => item.id}
          />
        </ScrollView>
      </View>
      <AppLoader visible={globalLoading} />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(20),
    backgroundColor: COLORS.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    zIndex: 10000,
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    height: getScaleSize(32),
    width: getScaleSize(32),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8EDF1',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileMeta: {
    flex: 1,
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECA7F',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: getScaleSize(5),
    height: getScaleSize(18),
    width: getScaleSize(18),
    resizeMode: 'contain',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRequestIcon: {
    width: getScaleSize(12),
    height: getScaleSize(21),
    tintColor: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(32),
  },
});

export default PatientDetail;
