import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const FormsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Medical Form</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Error summary toast */}
        <View style={styles.errorToast}>
          <Text style={styles.errorToastIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.errorToastTitle}>Please fix 3 errors before submitting</Text>
            <Text style={styles.errorToastBody}>
              Required fields are missing in Diagnosis and Treatment Plan sections.
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Patient context */}
          <View style={styles.patientCard}>
            <View style={styles.patientAvatarWrap}>
              <Image
                source={{ uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' }}
                style={styles.patientAvatar}
              />
            </View>
            <View>
              <Text style={styles.patientName}>Robert Fox</Text>
              <Text style={styles.patientMeta}>Wound Care • Req #8829</Text>
            </View>
          </View>

          {/* Diagnosis - error state */}
          <View style={[styles.card, styles.cardError]}>
            <View style={styles.errorStripe} />
            <View style={styles.cardHeaderBetween}>
              <View style={styles.rowCenter}>
                <Text style={[styles.cardIcon, styles.cardIconError]}>🩺</Text>
                <Text style={styles.cardTitle}>Diagnosis</Text>
              </View>
              <Text style={styles.badgeError}>2 missing</Text>
            </View>
            <View style={styles.fieldGroupLg}>
              <FormField
                label="Primary Diagnosis"
                required
                placeholder="Enter ICD-10 or description"
                error="Primary diagnosis is required"
              />
              <FormField
                label="Secondary Diagnosis"
                placeholder="Optional secondary diagnosis"
                value="Type 2 Diabetes"
              />
              <FormField
                label="Current Condition"
                required
                placeholder="Describe patient's current state..."
                multiline
                error="Current condition description is required"
              />
            </View>
          </View>

          {/* Treatment - error state */}
          <View style={[styles.card, styles.cardError]}>
            <View style={styles.errorStripe} />
            <View style={styles.cardHeaderBetween}>
              <View style={styles.rowCenter}>
                <Text style={[styles.cardIcon, styles.cardIconError]}>🧰</Text>
                <Text style={styles.cardTitle}>Treatment Plan</Text>
              </View>
              <Text style={styles.badgeError}>1 missing</Text>
            </View>
            <View style={styles.fieldGroupLg}>
              <FormField
                label="Procedure / Intervention"
                required
                placeholder="Select procedure..."
                isSelect
                error="Please select a procedure"
              />
              <FormField
                label="Treatment Goals"
                placeholder="Expected outcomes..."
                multiline
                value="Wound healing and infection prevention."
              />
            </View>
          </View>

          {/* Medication - valid */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardIcon, styles.cardIconSuccess]}>💊</Text>
              <Text style={styles.cardTitle}>Medication / Dosage</Text>
            </View>
            <View style={styles.rowGap}>
              <View style={styles.col2}>
                <FormField label="Medication" placeholder="Name" value="Amoxicillin" readOnly />
              </View>
              <View style={styles.col2}>
                <FormField label="Dosage" placeholder="e.g. 50mg" value="500mg" readOnly />
              </View>
            </View>
            <View style={styles.rowGap}>
              <View style={styles.col2}>
                <FormField label="Frequency" isSelect placeholder="Once" value="TID" readOnly />
              </View>
              <View style={styles.col2}>
                <FormField label="Route" isSelect placeholder="Oral" value="Oral" readOnly />
              </View>
            </View>
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
              <Text style={styles.addBtnIcon}>＋</Text>
              <Text style={styles.addBtnText}>Add Medication</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardTitle}>Clinical Notes</Text>
            </View>
            <FormField
              label=""
              placeholder="Additional observations, patient feedback, or follow-up instructions..."
              multiline
              value="Patient reported slight discomfort during the initial assessment."
            />
          </View>
        </ScrollView>

        {/* Sticky action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionSecondary]} activeOpacity={0.85}>
            <Text style={[styles.actionText, styles.actionSecondaryText]}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionPrimary]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignatureForm')}
          >
            <Text style={[styles.actionText, styles.actionPrimaryText]}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

interface FormFieldProps {
  label: string;
  placeholder: string;
  required?: boolean;
  multiline?: boolean;
  isSelect?: boolean;
  error?: string;
  value?: string;
  readOnly?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  placeholder,
  required,
  multiline,
  isSelect,
  error,
  value,
  readOnly,
}) => {
  const hasError = !!error;
  return (
    <View style={styles.field}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}
      <View
        style={[
          styles.input,
          multiline ? styles.inputMultiline : null,
          isSelect ? styles.select : null,
          hasError ? styles.inputError : null,
          readOnly ? styles.inputReadonly : null,
        ]}
      >
        <Text style={[styles.placeholder, readOnly ? styles.placeholderReadonly : null]}>
          {value || placeholder}
        </Text>
        {isSelect ? (
          <Text style={[styles.selectIcon, hasError ? styles.selectIconError : null]}>⌄</Text>
        ) : null}
      </View>
      {hasError ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#EFEFEF',
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#1A1D1F',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140,
    gap: 12,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  patientAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E8EDF1',
  },
  patientAvatar: {
    width: '100%',
    height: '100%',
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  patientMeta: {
    fontSize: 12,
    color: '#6F767E',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  cardError: {
    borderColor: '#FFA39E',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIcon: {
    fontSize: 16,
  },
  cardIconError: {
    color: '#FF4D4F',
  },
  cardIconSuccess: {
    color: '#2ECA7F',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  badgeError: {
    backgroundColor: '#FFF1F0',
    color: '#FF4D4F',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  errorStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FF4D4F',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldGroup: {
    gap: 12,
  },
  fieldGroupLg: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D1F',
  },
  required: {
    color: '#FF4D4F',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    position: 'relative',
  },
  inputMultiline: {
    minHeight: 88,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FFF1F0',
  },
  inputReadonly: {
    backgroundColor: '#F1F5F9',
  },
  placeholder: {
    fontSize: 14,
    color: '#6F767E',
  },
  placeholderReadonly: {
    color: '#526674',
  },
  select: {
    paddingRight: 36,
  },
  selectIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -8 }],
    color: '#6F767E',
    fontSize: 16,
  },
  selectIconError: {
    color: '#FF4D4F',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorIcon: {
    fontSize: 12,
    color: '#FF4D4F',
  },
  errorText: {
    fontSize: 11,
    color: '#FF4D4F',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12,
  },
  col2: {
    flex: 1,
  },
  addBtn: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#526674',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F4F7',
  },
  addBtnIcon: {
    fontSize: 16,
    color: '#526674',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526674',
  },
  errorToast: {
    backgroundColor: '#FFF1F0',
    borderBottomColor: '#FFA39E',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  errorToastIcon: {
    fontSize: 16,
    color: '#FF4D4F',
    marginTop: 2,
  },
  errorToastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF4D4F',
    marginBottom: 2,
  },
  errorToastBody: {
    fontSize: 12,
    color: '#FF4D4F',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSecondary: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
  },
  actionPrimary: {
    flex: 1.5,
    backgroundColor: '#526674',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionSecondaryText: {
    color: '#1A1D1F',
  },
  actionPrimaryText: {
    color: '#FFFFFF',
  },
});

export default FormsScreen;
