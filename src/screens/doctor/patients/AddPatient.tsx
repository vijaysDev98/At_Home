import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSafeAreaView, AppText, Header, Input, PrimaryButton } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';

const AddPatient: React.FC = () => {

   const sheetRef = useRef<any>(null);

  const [fullName, setFullName] = useState('John ');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');

  const nameError = fullName.trim().length < 5;

  return (
    <>
    <AppSafeAreaView>
      <Header
        isBack
        title="Add Patient"
        backIcon={IMAGES.arrowLeft}
        style={styles.headerStyle}
        leftContent={() => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
          console.log('Cancel button pressed, ref:', sheetRef.current);
          sheetRef.current?.open();
        }}
          >
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >{"Cancel"}</AppText>
          </TouchableOpacity>
        )}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information */}
          <View style={styles.section}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._6F767E}
            >Personal Information</AppText>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Input
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="e.g. John Doe"
                  label="Full Name"
                  isMandatory={true}
                  error={nameError ? "Please enter a valid full name." : ""}
                  style={styles.fieldGroup}
                  containerBackgroundColor={COLORS.white}
                  labelColor={COLORS._1A1D1F}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Input
                  value={dob}
                  onChangeText={setDob}
                  placeholder="YYYY-MM-DD"
                  label="Date of Birth"
                  style={styles.fieldGroup}
                  containerBackgroundColor={COLORS.white}
                  labelColor={COLORS._1A1D1F}
                />
              </View>
            </View>
          </View>

          {/* Contact Details */}
          <View style={styles.section}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._6F767E}
            >Contact Details</AppText>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Input
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="(555) 000-0000"
                  label="Phone Number"
                  isMandatory={true}
                  leftComponent={<Text style={styles.leadingIcon}>📞</Text>}
                  style={styles.fieldGroup}
                  containerBackgroundColor={COLORS.white}
                  labelColor={COLORS._1A1D1F}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="patient@example.com"
                  label="Email Address"
                  leftComponent={<Text style={styles.leadingIcon}>✉️</Text>}
                  style={styles.fieldGroup}
                  containerBackgroundColor={COLORS.white}
                  labelColor={COLORS._1A1D1F}
                />
              </View>
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._6F767E}
            >Address</AppText>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Input
                  value={street}
                  onChangeText={setStreet}
                  placeholder="123 Main St, Apt 4B"
                  label="Street Address"
                  style={styles.fieldGroup}
                  containerBackgroundColor={COLORS.white}
                  labelColor={COLORS._1A1D1F}
                />
              </View>

              <View style={styles.rowGap}>
                <View style={[styles.fieldGroup, styles.flex1]}>
                  <Input
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    label="City"
                    style={[styles.fieldGroup, styles.flex1]}
                    containerBackgroundColor={COLORS.white}
                    labelColor={COLORS._1A1D1F}
                  />
                </View>
                <View style={[styles.fieldGroup, styles.zipWidth]}>
                  <Input
                    value={zip}
                    onChangeText={setZip}
                    placeholder="12345"
                    label="Zip"
                    style={[styles.fieldGroup, styles.zipWidth]}
                    containerBackgroundColor={COLORS.white}
                    labelColor={COLORS._1A1D1F}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Medical Information */}
          <View style={styles.section}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._6F767E}
            >Medical Information</AppText>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  placeholder="Enter any known allergies, chronic conditions, or important medical history..."
                  label="Initial Notes / Allergies"
                  helper="Optional. Can be updated later."
                  style={[styles.fieldGroup, styles.textAreaWrapper]}
                  inputStyle={styles.textArea}
                  containerBackgroundColor={COLORS.white}
                  labelColor={COLORS._1A1D1F}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <PrimaryButton
          title='Save Patient'
          onPress={() => { }}
          style={{ marginHorizontal: getScaleSize(20) }}
        />
      </View>
     
    </AppSafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F8F9FA',
    backgroundColor: COLORS._F8F9FA

  },
  headerStyle: {
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(20),
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerIcon: {
    fontSize: 18,
    color: '#1A1D1F',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1D1F',
  },
  headerTextBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerText: {
    fontSize: 14,
    color: '#6F767E',
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
    paddingTop: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldGroup: {
    gap: 8,
    paddingHorizontal: 0
  },
  leadingIcon: {
    fontSize: 16,
    color: '#6F767E',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  zipWidth: {
    width: 100,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
});

export default AddPatient;
