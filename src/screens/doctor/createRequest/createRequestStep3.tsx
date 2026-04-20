import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

export type CreateRequestStep3Props = NativeStackScreenProps<RootStackParamList, 'CreateRequestStep3'>;

const CreateRequestStep3: React.FC<CreateRequestStep3Props> = ({ navigation }) => {
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [date] = useState('2023-10-25');
  const [time] = useState('14:30');
  const [notes, setNotes] = useState('');
  const canProceed = useMemo(() => !!priority && !!date && !!time, [priority, date, time]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Request</Text>
            <Text style={styles.headerSubtitle}>Step 3/3: Form</Text>
          </View>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8}>
            <Text style={styles.headerIcon}>❔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionOverline}>Request Summary</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarEmoji}>🧑🏽‍⚕️</Text>
                  </View>
                  <View style={styles.summaryTextBlock}>
                    <Text style={styles.summaryName}>Robert Fox</Text>
                    <Text style={styles.summaryMeta}>ID: PT-8829 • 65 yrs</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.summaryRowDivider} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={[styles.avatarWrap, styles.serviceIconWrap]}>
                    <Text style={styles.avatarEmoji}>🩹</Text>
                  </View>
                  <View style={styles.summaryTextBlock}>
                    <Text style={styles.summaryName}>Wound Care</Text>
                    <Text style={styles.summaryMeta}>Primary Service</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {(
                  [
                    { key: 'routine', label: 'Routine' },
                    { key: 'urgent', label: 'Urgent' },
                    { key: 'emergency', label: 'Emergency' },
                  ] as const
                ).map((item) => {
                  const active = priority === item.key;
                  const pillStyle = [
                    styles.priorityPill,
                    active && item.key === 'urgent' && styles.priorityUrgent,
                    active && item.key === 'emergency' && styles.priorityEmergency,
                    active && item.key === 'routine' && styles.priorityRoutine,
                  ];
                  const textStyle = [
                    styles.priorityText,
                    active && item.key === 'urgent' && styles.priorityTextUrgent,
                    active && item.key === 'emergency' && styles.priorityTextEmergency,
                    active && item.key === 'routine' && styles.priorityTextRoutine,
                  ];

                  return (
                    <TouchableOpacity
                      key={item.key}
                      activeOpacity={0.9}
                      style={pillStyle}
                      onPress={() => setPriority(item.key)}
                    >
                      <Text style={textStyle}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.doubleRow}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Requested Date</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.inputField}>
                  <Text style={styles.fieldText}>{date}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Requested Time</Text>
                <TouchableOpacity activeOpacity={0.9} style={styles.inputField}>
                  <Text style={styles.fieldText}>{time}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Initial Notes / Reason</Text>
              <TextInput
                style={[styles.textArea]}
                placeholder="Briefly describe the reason for this request..."
                placeholderTextColor="#6f767e"
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity activeOpacity={0.9} style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.nextBtn, !canProceed && styles.nextDisabled]}
              disabled={!canProceed}
              onPress={() => navigation.navigate('Home', { screen: 'Forms' })}
            >
              <Text style={styles.nextText}>Proceed to Medical Form</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 18,
    color: '#1a1d1f',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#526674',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
    paddingTop: 12,
    gap: 18,
  },
  sectionTitleRow: {
    marginTop: 6,
  },
  sectionOverline: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6f767e',
  },
  summaryCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#efefef',
    padding: 14,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRowDivider: {
    height: 1,
    backgroundColor: '#efefef',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8edf1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIconWrap: {
    backgroundColor: '#e7eef3',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  summaryTextBlock: {
    gap: 2,
  },
  summaryName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#6f767e',
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: '#526674',
  },
  formGroup: {
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  priorityRoutine: {
    borderColor: '#526674',
    backgroundColor: '#e8edf1',
  },
  priorityUrgent: {
    borderColor: '#ffb800',
    backgroundColor: '#fff7e6',
  },
  priorityEmergency: {
    borderColor: '#ff4d4f',
    backgroundColor: '#ffecec',
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6f767e',
  },
  priorityTextRoutine: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526674',
  },
  priorityTextUrgent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffb800',
  },
  priorityTextEmergency: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff4d4f',
  },
  doubleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBlock: {
    flex: 1,
    gap: 8,
  },
  inputField: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  fieldText: {
    fontSize: 14,
    color: '#1a1d1f',
  },
  textArea: {
    minHeight: 110,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#efefef',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1d1f',
    textAlignVertical: 'top',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#efefef',
  },
  backBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  nextBtn: {
    flex: 1.4,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextDisabled: {
    opacity: 0.6,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default CreateRequestStep3;
