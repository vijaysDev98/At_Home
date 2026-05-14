import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../../utils';
import { AppText } from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { STRING } from '../../../constant';
import { userLogout } from '../../../actions/auth/authAction';

const ProviderProfile: React.FC = () => {
  const dispatch = useDispatch();
  const profileData = useSelector(
    (state: RootState) => state.profile.profileData,
  );

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.profileImg) {
      setUserAvatar(profileData.profileImg);
    }
  }, [profileData?.profileImg]);

  const providerName = profileData?.providerName;
  const providerEmail = profileData?.email;
  const providerPhone = profileData?.phoneNumber;
  const providerAssignedServices = profileData?.assignedServices || [];

  const handleLogout = () => {
    dispatch(userLogout());
  };

  console.log('profile data ', profileData);
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Profile
          </AppText>
          <TouchableOpacity
            onPress={() => {
              NavigationService.navigate(SCREENS.EDIT_PROVIDER_PROFILE);
            }}
            activeOpacity={0.7}
          >
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              Edit
            </AppText>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Image
              source={
                userAvatar
                  ? userAvatar.startsWith('file://') ||
                    userAvatar.startsWith('content://') ||
                    userAvatar.startsWith('data:')
                    ? { uri: userAvatar }
                    : { uri: IMAGE_BASE_URL + userAvatar }
                  : IMAGES.person
              }
              style={styles.avatar}
            />
            <AppText
              size={getScaleSize(20)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {providerName}
            </AppText>
            {/* <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              Registered Nurse (RN)
            </AppText> */}
            {/* <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color="#15803d"
              >
                Active
              </AppText>
            </View> */}
          </View>

          {/* Contact Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              {/* <View style={styles.sectionIconWrap}> */}
              <Image
                source={IMAGES.ic_contactInfo}
                style={styles.sectionIcon}
              />
              {/* </View> */}
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Contact Information
              </AppText>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldGroup}>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                Email Address
              </AppText>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._1A1D1F}
              >
                {providerEmail}
              </AppText>
            </View>
            <View style={styles.fieldGroup}>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                Phone Number
              </AppText>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._1A1D1F}
              >
                {providerPhone}
              </AppText>
            </View>
          </View>

          {/* Eligible Services */}
          {providerAssignedServices.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.servicesHeaderRow}>
                <View style={styles.servicesHeaderLeft}>
                  {/* <View style={styles.sectionIconWrap}> */}
                  <Image source={IMAGES.ic_medKit} style={styles.sectionIcon} />
                  {/* </View> */}
                  <AppText
                    size={getScaleSize(15)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    Eligible Services
                  </AppText>
                </View>
                <View style={styles.activeBadge}>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6B7280}
                  >
                    {providerAssignedServices?.length} Active
                  </AppText>
                </View>
              </View>
              {/* <View style={styles.divider} /> */}
              {providerAssignedServices.map((item, idx, arr) => (
                <View key={item.title}>
                  <View style={styles.serviceItem}>
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {item.serviceName}
                    </AppText>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Medium}
                      color={COLORS._6F767E}
                      style={{ marginTop: getScaleSize(4) }}
                    >
                      {item.description}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Image source={IMAGES.arrow_back} style={styles.logoutIcon} />
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS.error}
            >
              {STRING.logOut}
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProviderProfile;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  logoutBtn: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logoutIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.error,
  },
  logoutText: {
    fontSize: getScaleSize(14),
    fontWeight: '700',
    color: COLORS.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._EFEFEF,
    borderWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  scroll: {
    // paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(40),
    // paddingTop: getScaleSize(16),
    gap: getScaleSize(12),
  },
  profileCard: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: getScaleSize(24),
    gap: getScaleSize(6),
  },
  avatar: {
    width: getScaleSize(84),
    height: getScaleSize(84),
    borderRadius: getScaleSize(42),
    marginBottom: getScaleSize(4),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(5),
    marginTop: getScaleSize(2),
  },
  statusDot: {
    width: getScaleSize(8),
    height: getScaleSize(8),
    borderRadius: getScaleSize(4),
    backgroundColor: '#22c55e',
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    gap: getScaleSize(12),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servicesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
  },
  sectionIconWrap: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(8),
    backgroundColor: COLORS.backgroundAlt,
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    width: getScaleSize(16),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
  },
  fieldGroup: {
    gap: getScaleSize(4),
  },
  serviceItem: {
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS._F8F9FA,
    borderRadius: getScaleSize(12),
    paddingHorizontal: getScaleSize(13),
    borderWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(10),
  },
  activeBadge: {
    backgroundColor: COLORS._F3F4F6,
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(4),
    borderRadius: getScaleSize(6),
  },
});
