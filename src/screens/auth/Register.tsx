import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS, FONTS } from '../../utils';
import { getScaleSize } from '../../utils/scaleSize';
import { IMAGES } from '../../assets/images';
import { useNavigation } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import { Input, PrimaryButton } from '../../components';
import { SafeAreaView } from 'react-native-safe-area-context';
import { STRING } from '../../constant/strings';
import NavigationService from '../../navigation/NavigationService';
import { doctorSpecialities } from '../../utils/dummyData';

// --- Sub-components ---

interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
}

interface CheckboxProps {
  label: React.ReactNode;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onToggle }) => {
  return (
    <View style={styles.checkboxContainer}>
      <CheckBox
        disabled={false}
        value={checked}
        onValueChange={onToggle}
        tintColors={{ true: COLORS.primary, false: COLORS.slate200 }}
        boxType="square" // iOS specific
        onTintColor={COLORS.primary} // iOS specific
        onCheckColor={COLORS.white} // iOS specific
        onFillColor={COLORS.primary} // iOS specific
        style={styles.checkboxLib}
      />
      {label && (
        <View style={styles.checkboxLabelWrapper}>
          <Text style={styles.checkboxLabel}>{label}</Text>
        </View>
      )}
    </View>
  );
};

// --- Main Screen ---

const Register: React.FC = () => {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rpps, setRpps] = useState('');
  const [finess, setFiness] = useState('');
  const [specialty, setSpecialty] = useState(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(doctorSpecialities);
  const [placeOfPractice, setPlaceOfPractice] = useState('');
  const [address, setAddress] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isFormValid = () => {
    return (
      fullName &&
      email &&
      password &&
      password &&
      rpps &&
      finess &&
      specialty &&
      agreed
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Frame Container (Matching Screenshot Border) */}
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{STRING.createYourAccount}</Text>
              <Text style={styles.subtitle}>
                {STRING.createAccountSubtitle}
              </Text>
            </View>

            {/* Form Fields */}
            <Input
              label={STRING.fullName}
              isMandatory
              placeholder={STRING.enterFullName}
              leftIcon={IMAGES.person}
              value={fullName}
              onChangeText={setFullName}
              style={{ marginBottom: getScaleSize(20) }}
            />

            <Input
              label={STRING.emailAddress}
              isMandatory
              placeholder={STRING.enterEmailAddress}
              leftIcon={IMAGES.mail}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              helper="We'll send verification to this email"
              style={{ marginBottom: getScaleSize(20) }}
              helperStyle={{ marginTop: getScaleSize(8) }}
            />

            <Input
              label={STRING.password}
              isMandatory
              placeholder={STRING.createPassword}
              leftIcon={IMAGES.lock}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
              isPasswordVisible={showPassword}
              handlePasswordVisibility={() => setShowPassword(!showPassword)}
              style={{ marginBottom: getScaleSize(20) }}
            />

            <Input
              label={STRING.rppsNumber}
              isMandatory
              placeholder={`${STRING.enterRppsNumber} (${STRING.elevenDigit})`}
              leftIcon={IMAGES.card}
              value={rpps}
              onChangeText={setRpps}
              keyboardType="numeric"
              helper="RPPS number"
              style={{ marginBottom: getScaleSize(20) }}
              helperStyle={{ marginTop: getScaleSize(8) }}
            />

            <Input
              label={STRING.finessNumber}
              isMandatory
              placeholder={`${STRING.enterFinessNumber} (${STRING.nineDigit})`}
              leftIcon={IMAGES.hospital}
              value={finess}
              onChangeText={setFiness}
              keyboardType="numeric"
              helper="Facility identification number"
              style={{ marginBottom: getScaleSize(20) }}
              helperStyle={{ marginTop: getScaleSize(8) }}
            />

            {/* Specialty Dropdown */}
            <View style={[styles.fieldWrapper, { zIndex: 1000 }]}>
              <Text style={styles.label}>
                {STRING.specialty} <Text style={styles.required}>*</Text>
              </Text>
              <View>
                <DropDownPicker
                  open={open}
                  value={specialty}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSpecialty}
                  setItems={setItems}
                  placeholder={STRING.selectYourSpecialty}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownList}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  listParentContainerStyle={styles.dropdownItemContainer}
                  listItemLabelStyle={styles.dropdownItemLabel}
                  showArrowIcon={true}
                  listMode="SCROLLVIEW"
                  ArrowDownIconComponent={() => (
                    <Image
                      source={IMAGES.arrow_bottom}
                      style={styles.dropdownArrow}
                    />
                  )}
                  ArrowUpIconComponent={() => (
                    <Image
                      source={IMAGES.arrow_bottom}
                      style={[
                        styles.dropdownArrow,
                        { transform: [{ rotate: '180deg' }] },
                      ]}
                    />
                  )}
                />
                <Image
                  source={IMAGES.stethoscope}
                  style={styles.dropdownLeftIcon}
                  pointerEvents="none"
                />
              </View>
            </View>

            <Input
              label={STRING.placeOfPractice}
              isMandatory
              placeholder="9 digits"
              value={placeOfPractice}
              onChangeText={setPlaceOfPractice}
              keyboardType="numeric"
              style={{ marginBottom: getScaleSize(20) }}
            />

            <Input
              label={STRING.businessAddress}
              isMandatory
              placeholder="Street address, city, postal code"
              leftIcon={IMAGES.location_pin}
              value={address}
              onChangeText={setAddress}
              style={{ marginBottom: getScaleSize(20) }}
            />

            {/* Terms Agreement */}
            <Checkbox
              checked={agreed}
              onToggle={value => setAgreed(value)}
              label={
                <Text>
                  I agree to the{' '}
                  <Text
                    style={styles.link}
                    onPress={() => console.log('Privacy Policy')}
                  >
                    Privacy Policy
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.link}
                    onPress={() => console.log('Terms of Service')}
                  >
                    Terms of Service
                  </Text>
                </Text>
              }
            />

            {/* Submit Section */}
            <View style={styles.footer}>
              <PrimaryButton
                title={STRING.submitRegistration}
                icon={IMAGES.arrowRight}
                onPress={() => console.log('LOGIN')}
                disabled={!isFormValid()}
              />

              <TouchableOpacity
                style={styles.signInContainer}
                onPress={() => navigation.navigate('Login' as never)}
              >
                <Text style={styles.signInText}>
                  Already have an account?{' '}
                  <Text style={styles.signInLink}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },
  scrollContent: {
    paddingBottom: getScaleSize(40),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(20),
  },
  backBtn: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    tintColor: COLORS.primary,
  },
  headerLogo: {
    width: getScaleSize(100),
    height: getScaleSize(40),
  },
  header: {
    marginBottom: getScaleSize(24),
    paddingHorizontal: getScaleSize(24),
  },
  title: {
    fontSize: getScaleSize(24),
    fontFamily: FONTS.Inter.Bold,
    color: COLORS.slate900,
    marginBottom: getScaleSize(8),
  },
  subtitle: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.slate700,
  },
  label: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate900,
    marginBottom: getScaleSize(8),
  },
  required: {
    color: COLORS.error,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getScaleSize(8),
    marginBottom: getScaleSize(32),
    paddingHorizontal: getScaleSize(24),
  },
  checkboxLib: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    marginRight: getScaleSize(12),
  },
  checkboxLabelWrapper: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: getScaleSize(13),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate700,
  },
  link: {
    color: COLORS._526674,
    fontFamily: FONTS.Inter.SemiBold,
  },
  footer: {
    marginTop: getScaleSize(8),
    paddingHorizontal: getScaleSize(24),
  },

  signInContainer: {
    marginTop: getScaleSize(20),
    alignItems: 'center',
  },
  signInText: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate700,
  },
  signInLink: {
    color: COLORS.primary,
    fontFamily: FONTS.Inter.Bold,
  },
  fieldWrapper: {
    paddingHorizontal: getScaleSize(24),
    marginBottom: getScaleSize(20),
  },
  dropdown: {
    borderColor: COLORS._E5E7EB,
    borderRadius: 12,
    height: getScaleSize(56),
    backgroundColor: COLORS.white,
    paddingLeft: getScaleSize(48),
    paddingRight: getScaleSize(16),
  },
  dropdownList: {
    borderColor: COLORS._E5E7EB,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dropdownText: {
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Medium,
    color: COLORS.slate900,
  },
  dropdownPlaceholder: {
    color: COLORS.slate400,
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Regular,
  },
  dropdownItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate200,
  },
  dropdownItemLabel: {
    fontSize: getScaleSize(15),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS.slate700,
  },
  dropdownArrow: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    tintColor: COLORS.slate400,
  },
  dropdownLeftIcon: {
    position: 'absolute',
    left: getScaleSize(16),
    top: getScaleSize(18),
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS.slate400,
    resizeMode: 'contain',
    zIndex: 9999,
    elevation: 9999,
  },
});

export default Register;
