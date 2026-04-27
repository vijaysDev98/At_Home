import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationService from '../../../navigation/NavigationService';

const DoctorProfile: React.FC = () => {
  const handleLogout = () => {
    NavigationService.reset('Login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarIcon}>🧑‍⚕️</Text>
          </View>
        </View>

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
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>Dr. John Smith</Text>
            <Text style={styles.subhead}>General Practitioner</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Personal Information</Text>
            <View style={styles.fieldBlock}>
              <Label text="Full Name" />
              <Input value="Dr. John Smith" icon="👤" />
            </View>
            <View style={styles.fieldBlock}>
              <Label text="Email Address" />
              <Input value="john.smith@athome.md" icon="✉️" valid />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Professional Credentials</Text>
            <View style={styles.fieldBlock}>
              <Label text="RPPS Number" />
              <Input value="10002849501" icon="🪪" />
            </View>
            <View style={styles.fieldBlock}>
              <Label text="FINESS Number" />
              <Input value="750012345" icon="🏢" />
            </View>
            <View style={styles.fieldBlock}>
              <Label text="Business Address" />
              <Input
                value={'123 Medical Center Blvd\n75001 Paris, France'}
                icon="📍"
                multiline
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
            <Text style={styles.logoutIcon}>↩️</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Save */}
        <View style={styles.saveBar}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.9}>
            <Text style={styles.saveIcon}>💾</Text>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const Label = ({ text }: { text: string }) => (
  <Text style={styles.label}>{text}</Text>
);

const Input = ({
  value,
  icon,
  valid,
  multiline,
}: {
  value: string;
  icon?: string;
  valid?: boolean;
  multiline?: boolean;
}) => {
  return (
    <View style={styles.inputWrapper}>
      {icon ? <Text style={styles.inputIcon}>{icon}</Text> : null}
      <TextInput
        style={[styles.input, multiline ? styles.textArea : null]}
        value={value}
        multiline={multiline}
        editable={false}
      />
      {valid ? <Text style={styles.validIcon}>✔</Text> : null}
    </View>
  );
};

const RowItem = ({ label, value, chevron }: { label: string; value?: string; chevron?: boolean }) => (
  <View style={styles.rowItem}>
    <Text style={styles.rowLabel}>{label}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    {chevron ? <Text style={styles.chevron}>›</Text> : null}
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
    backgroundColor: '#f8fafc',
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
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e4e9ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarIcon: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  avatarSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#ffffff',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cameraIcon: {
    color: '#ffffff',
    fontSize: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subhead: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  fieldBlock: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 10,
    top: 14,
    fontSize: 14,
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    fontSize: 14,
    color: '#111827',
  },
  textArea: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  validIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    color: '#10b981',
    fontSize: 14,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  chevron: {
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 4,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logoutIcon: {
    fontSize: 14,
    color: '#ef4444',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  saveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#526674',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  saveIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default DoctorProfile;
