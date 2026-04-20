import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AddPatient: React.FC = () => {
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
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Personal Information</Text>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Full Name</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <View style={[styles.inputWrapper, nameError && styles.inputError]}>
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#6F767E"
                    style={styles.input}
                  />
                  {nameError ? <Text style={styles.errorIcon}>!</Text> : null}
                </View>
                {nameError ? (
                  <Text style={styles.helperError}>Please enter a valid full name.</Text>
                ) : null}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={dob}
                    onChangeText={setDob}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#6F767E"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Contact Details */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact Details</Text>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Phone Number</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.leadingIcon}>📞</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="(555) 000-0000"
                    placeholderTextColor="#6F767E"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.leadingIcon}>✉️</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="patient@example.com"
                    placeholderTextColor="#6F767E"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Address</Text>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Street Address</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={street}
                    onChangeText={setStreet}
                    placeholder="123 Main St, Apt 4B"
                    placeholderTextColor="#6F767E"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.rowGap}>
                <View style={[styles.fieldGroup, styles.flex1]}>
                  <Text style={styles.label}>City</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      placeholderTextColor="#6F767E"
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={[styles.fieldGroup, styles.zipWidth]}>
                  <Text style={styles.label}>Zip</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      value={zip}
                      onChangeText={setZip}
                      placeholder="12345"
                      placeholderTextColor="#6F767E"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Medical Information */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Medical Information</Text>
            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Initial Notes / Allergies</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    placeholder="Enter any known allergies, chronic conditions, or important medical history..."
                    placeholderTextColor="#6F767E"
                    style={[styles.input, styles.textArea]}
                  />
                </View>
                <Text style={styles.helperText}>Optional. Can be updated later.</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Save Patient</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6F767E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  required: {
    color: '#FF4D4F',
    fontWeight: '800',
  },
  inputWrapper: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#FF4D4F',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1D1F',
    paddingVertical: 10,
  },
  leadingIcon: {
    marginRight: 8,
    fontSize: 14,
    color: '#6F767E',
  },
  errorIcon: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF4D4F',
  },
  helperError: {
    fontSize: 12,
    color: '#FF4D4F',
    fontWeight: '600',
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
  helperText: {
    fontSize: 12,
    color: '#6F767E',
  },
  ctaContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  ctaButton: {
    height: 56,
    borderRadius: 14,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddPatient;
