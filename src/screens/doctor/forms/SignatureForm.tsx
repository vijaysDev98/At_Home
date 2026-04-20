import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const SignatureForm: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Review & Sign</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
            <Text style={styles.headerIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success / Locked banner */}
          <View style={styles.lockedBanner}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockText}>Form is locked for final submission</Text>
          </View>

          {/* Patient context */}
          <View style={styles.patientCard}>
            <View style={styles.patientRowTop}>
              <View style={styles.patientInfoRow}>
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
              <View style={styles.badgeSigned}>
                <Text style={styles.badgeSignedIcon}>✔</Text>
                <Text style={styles.badgeSignedText}>Signed</Text>
              </View>
            </View>
          </View>

          {/* PDF preview card */}
          <View style={styles.card}>
            <Text style={styles.pdfIcon}>📄</Text>
            <Text style={styles.cardTitle}>Medical Summary</Text>
            <View style={styles.divider} />

            <View style={styles.fieldList}>
              <Field label="Primary Diagnosis" value="Diabetic Foot Ulcer (E08.621)" />
              <Field label="Treatment Plan" value="Wound Dressing Change, Debridement" />
              <View style={styles.rowGap}>
                <Field label="Medication" value="Amoxicillin 500mg" />
                <Field label="Frequency" value="TID - Oral" />
              </View>
            </View>

            <View style={styles.signatureBlock}>
              <Text style={styles.signatureTitle}>Provider Signature</Text>
              <View style={styles.signaturePad}>
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/John_Hancock_signature.svg' }}
                  style={styles.signatureImg}
                />
                <View style={styles.signatureLine} />
                <View style={styles.signatureMetaRow}>
                  <Text style={styles.signatureMeta}>Dr. Sarah Jenkins</Text>
                  <Text style={styles.signatureMeta}>Oct 24, 2023 • 10:45 AM</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky action bar */}
        <View style={styles.actionBar}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionPrimary]} activeOpacity={0.85}>
            <Text style={styles.actionText}>📨 Submit Final Form</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

interface FieldProps {
  label: string;
  value: string;
}

const Field: React.FC<FieldProps> = ({ label, value }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.lockedInput}>
      <Text style={styles.lockedValue}>{value}</Text>
    </View>
  </View>
);

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
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E6F9F0',
    borderBottomWidth: 1,
    borderBottomColor: '#2ECA7F33',
    borderRadius: 12,
  },
  lockIcon: {
    fontSize: 16,
    color: '#2ECA7F',
  },
  lockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2ECA7F',
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  patientRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  badgeSigned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6F9F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeSignedIcon: {
    fontSize: 12,
    color: '#2ECA7F',
  },
  badgeSignedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2ECA7F',
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
  pdfIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 18,
    color: '#6F767E',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D1F',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 8,
  },
  fieldList: {
    gap: 12,
    marginBottom: 8,
  },
  fieldWrap: {
    gap: 6,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F767E',
  },
  lockedInput: {
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  lockedValue: {
    fontSize: 14,
    color: '#526674',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 12,
  },
  signatureBlock: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    gap: 12,
  },
  signatureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1D1F',
  },
  signaturePad: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signatureImg: {
    height: 64,
    width: '80%',
    resizeMode: 'contain',
    tintColor: 'rgba(82, 102, 116, 0.8)',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  signatureMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  signatureMeta: {
    fontSize: 10,
    color: '#6F767E',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: '#526674',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SignatureForm;
