import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import NavigationService from '../../../navigation/NavigationService';
import { AppSafeAreaView, AppText, Header, Input } from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';

const DoctorProfile: React.FC = () => {
  const handleLogout = () => {
    NavigationService.reset('Login');
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        <Header
          style={styles.headerStyle}
          title="Profile"
          leftContent={() => (
            <View style={styles.headerAvatar}>
              <Image
                source={IMAGES.person}
                style={styles.headerAvatarImage}
              />
            </View>
          )}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.85}>
                <Image source={IMAGES.editIcon} style={styles.cameraIcon} />
              </TouchableOpacity>
            </View>
            <AppText
              size={getScaleSize(18)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}>
              Dr. John Smith
            </AppText>
            <AppText
              size={getScaleSize(14)}
              color={COLORS._6B7280}>
              General Practitioner
            </AppText>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}>
              Personal Information
            </AppText>
            <View style={styles.fieldBlock}>

              <Input
                label='Full Name'
                style={styles.inputContainer}
                value="Dr. John Smith" leftIcon={IMAGES.ic_profile} />
            </View>
            <View style={styles.fieldBlock}>
              <Input
                label='Email Address'
                style={styles.inputContainer}
                value="john.smith@athome.md" leftIcon={IMAGES.email_icon} />
            </View>
          </View>

          <View style={styles.card}>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Bold}
              color={COLORS._6B7280}>
              Professional Credentials
            </AppText>
            <View style={styles.fieldBlock}>
              {/* <AppText size={getScaleSize(12)} font={FONTS.Inter.SemiBold} color={COLORS._6F767E}>RPPS Number</AppText> */}
              <Input
                label='RPPS Number'
                style={styles.inputContainer} value="10002849501" leftIcon={IMAGES.card} />
            </View>
            <View style={styles.fieldBlock}>
              {/* <AppText size={getScaleSize(12)} font={FONTS.Inter.SemiBold} color={COLORS._6F767E}>FINESS Number</AppText> */}
              <Input
                label='FINESS Number'
                style={styles.inputContainer} value="750012345" leftIcon={IMAGES.hospital} />
            </View>
            <View style={styles.fieldBlock}>
              {/* <AppText size={getScaleSize(12)} font={FONTS.Inter.SemiBold} color={COLORS._6F767E}>Business Address</AppText> */}
              <Input
                label='Business Address'
                value={'123 Medical Center Blvd\n75001 Paris, France'}
                leftIcon={IMAGES.location_pin}
                multiline
                style={styles.inputContainer}
              />
            </View>
          </View>

          <View style={styles.card}>
            <RowItem label="App Version" value="v2.4.1 (Build 842)" />
            <Divider />
            <RowItem label="Terms of Service" chevron />
            <Divider />
            <RowItem label="Privacy Policy" chevron />
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Image source={IMAGES.arrow_back} style={styles.logoutIcon} />
            <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS.error}>Log Out</AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>
      {/* Fixed Save */}
      <View style={styles.saveBar}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.9}>
          <AppText size={getScaleSize(15)} font={FONTS.Inter.Bold} color={COLORS.white}>Save Changes</AppText>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
};

const RowItem = ({ label, value, chevron }: { label: string; value?: string; chevron?: boolean }) => (
  <View style={styles.rowItem}>
    <AppText size={getScaleSize(14)} font={FONTS.Inter.SemiBold} color={COLORS._1A1D1F}>{label}</AppText>
    {value ? <AppText size={getScaleSize(14)} color={COLORS._6B7280}>{value}</AppText> : null}
    {chevron ? <AppText size={getScaleSize(16)} color={COLORS._6F767E}>›</AppText> : null}
  </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS._F8F9FA,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(20),
    backgroundColor: COLORS.white,
  },
  statusBar: {
    height: 44,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  statusTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  statusIcon: {
    fontSize: 12,
  },
  headerAvatar: {
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    overflow: 'hidden',
    backgroundColor: COLORS._E4E9EE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerAvatarImage: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.primary
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  avatarSection: {
    backgroundColor: COLORS.white,
    paddingVertical: getScaleSize(24),
    paddingHorizontal: getScaleSize(20),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS._E5E7EB,
  },
  avatarWrap: {
    width: getScaleSize(96),
    height: getScaleSize(96),
    borderRadius: getScaleSize(48),
    overflow: 'hidden',
    position: 'relative',
    marginBottom: getScaleSize(12),
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cameraBtn: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: getScaleSize(32),
    height: getScaleSize(32),
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cameraIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.white,
  },
  name: {
    fontSize: getScaleSize(18),
    fontWeight: '700',
    color: COLORS._1A1D1F,
  },
  subhead: {
    fontSize: getScaleSize(14),
    color: COLORS._6B7280,
  },
  card: {
    marginHorizontal: getScaleSize(20),
    marginTop: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    gap: getScaleSize(12),
  },
  sectionLabel: {
    fontSize: getScaleSize(12),
    fontWeight: '700',
    color: COLORS._6B7280,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldBlock: {
    gap: getScaleSize(6),
  },
  label: {
    fontSize: getScaleSize(12),
    color: COLORS._6F767E,
    fontWeight: '600',
    marginLeft: getScaleSize(4),
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getScaleSize(10),
  },
  rowLabel: {
    fontSize: getScaleSize(14),
    color: COLORS._1A1D1F,
    fontWeight: '600',
    flex: 1,
  },
  rowValue: {
    fontSize: getScaleSize(14),
    color: COLORS._6B7280,
  },
  chevron: {
    fontSize: getScaleSize(16),
    color: COLORS._6F767E,
    marginLeft: getScaleSize(6),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._E5E7EB,
    marginVertical: getScaleSize(4),
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
  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: COLORS._E5E7EB,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  saveBtn: {
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS._526674,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  saveIcon: {
    width: getScaleSize(18),
    height: getScaleSize(18),
    tintColor: COLORS.white,
  },
  saveText: {
    fontSize: getScaleSize(15),
    fontWeight: '700',
    color: COLORS.white,
  },
  inputContainer: {
    paddingHorizontal: 0
  }
});

export default DoctorProfile;
