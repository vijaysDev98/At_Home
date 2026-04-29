import React from 'react';
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

const ProviderProfile: React.FC = () => {
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
          <TouchableOpacity activeOpacity={0.7}>
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
              source={{
                uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
              }}
              style={styles.avatar}
            />
            <AppText
              size={getScaleSize(20)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              Sarah Jenkins
            </AppText>
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              Registered Nurse (RN)
            </AppText>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.SemiBold}
                color="#15803d"
              >
                Active
              </AppText>
            </View>
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
                sarah.jenkins@athome.com
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
                +1 (555) 123-4567
              </AppText>
            </View>
          </View>

          {/* Eligible Services */}
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
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
              >
                3 Active
              </AppText>
            </View>
            <View style={styles.divider} />
            {[
              {
                title: 'Wound Care Management',
                desc: 'Post-operative wound care, dressing changes, and infection monitoring.',
              },
              {
                title: 'IV Therapy',
                desc: 'Administration of intravenous medications and fluids.',
              },
              {
                title: 'Vitals Monitoring',
                desc: 'Routine check of blood pressure, heart rate, and oxygen levels.',
              },
            ].map((item, idx, arr) => (
              <View key={item.title}>
                <View style={styles.serviceItem}>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {item.title}
                  </AppText>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6F767E}
                    style={{ marginTop: getScaleSize(4) }}
                  >
                    {item.desc}
                  </AppText>
                </View>
                {idx < arr.length - 1 && <View style={styles.itemDivider} />}
              </View>
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._EFEFEF,
  },
  scroll: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(40),
    paddingTop: getScaleSize(16),
    gap: getScaleSize(12),
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    alignItems: 'center',
    paddingVertical: getScaleSize(24),
    paddingHorizontal: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
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
    borderRadius: getScaleSize(16),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
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
    paddingVertical: getScaleSize(4),
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(10),
  },
});
