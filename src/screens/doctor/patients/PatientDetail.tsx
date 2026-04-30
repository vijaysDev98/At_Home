import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { AppButton, AppSafeAreaView, AppText, Header, RequestCard } from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';


const PatientDetail: React.FC = () => {
  return (
    <AppSafeAreaView>
      <Header
        isBack
        backIcon={IMAGES.arrowLeft}
        title="Patient Detail"
        style={styles.headerStyle}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Info Card */}
          <View style={styles.card}>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
              <Image source={IMAGES.editIcon} style={styles.editIcon} />
            </TouchableOpacity>

            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Image
                  source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg' }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.profileMeta}>
                <AppText
                  size={getScaleSize(18)}
                  color={COLORS._1A1D1F}
                  font={FONTS.Inter.Bold}
                >Eleanor Pena</AppText>
                <AppText
                  size={getScaleSize(13)}
                  color={COLORS._6F767E}
                  font={FONTS.Inter.Regular}
                >DOB: Oct 24, 1955 (68yo)</AppText>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <AppText
                    size={getScaleSize(12)}
                    color={COLORS._2ECA7F}
                    font={FONTS.Inter.Medium}
                  >Active Patient</AppText>
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
                  >Primary Contact</AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._1A1D1F}>(555) 019-2834</AppText>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Image source={IMAGES.location_pin} style={styles.infoIcon} />
                <View>
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Regular}
                    color={COLORS._6F767E}
                  >Home Address</AppText>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._1A1D1F}>
                    4140 Parker Rd. Allentown,{"\n"}New Mexico 31134
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Medical Notes */}
          <View style={styles.sectionHeader}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS.black}
            >Medical Notes</AppText>
            <TouchableOpacity activeOpacity={0.8}>
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Medium}
                color={COLORS._526674}
              >Edit</AppText>
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
              >Allergies:</AppText> Penicillin, Peanuts{"\n"}

              <AppText size={getScaleSize(14)}
                font={FONTS.Inter.SemiBold}
                color={COLORS._1A1A1A}
              >Recent Notes:</AppText> Patient requires regular blood pressure monitoring. Experiences mild dizziness in the mornings. Ensure hydration is maintained. Last checkup showed improved blood sugar levels.
            </AppText>
          </View>

          {/* Linked Requests */}
          <View style={styles.sectionHeader}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS.black}
            >Linked Requests</AppText>
            <TouchableOpacity style={styles.plusBtn} activeOpacity={0.8}>
              <Image source={IMAGES.new_request} style={styles.newRequestIcon} />
            </TouchableOpacity>
          </View>

          <RequestCard />

        </ScrollView>
      </View>
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
    backgroundColor: COLORS._F8F9FA
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
    backgroundColor: '#E8EDF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    height: getScaleSize(32),
    width: getScaleSize(32)
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
    resizeMode: 'contain'
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
});

export default PatientDetail;
