import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

export type CreateRequestStep2Props = NativeStackScreenProps<RootStackParamList, 'CreateRequestStep2'>;

type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const services: Service[] = [
  { id: 'wound', title: 'Wound Care', description: 'Dressing changes, cleaning, and monitoring.', icon: '🩹' },
  { id: 'iv', title: 'IV Therapy', description: 'Intravenous fluids and medication admin.', icon: '💉' },
  { id: 'oxygen', title: 'Oxygen Support', description: 'Respiratory therapy and monitoring.', icon: '🫁' },
  { id: 'nursing', title: 'General Nursing', description: 'Vital signs, medication, daily care.', icon: '🩺' },
  { id: 'physio', title: 'Physiotherapy', description: 'Rehabilitation and mobility exercises.', icon: '🏃‍♂️' },
  { id: 'lab', title: 'Lab Collection', description: 'Blood draws and sample collection.', icon: '🧪' },
];

const CreateRequestStep2: React.FC<CreateRequestStep2Props> = ({ navigation }) => {
  const [selected, setSelected] = useState<string>('wound');
  const canContinue = useMemo(() => !!selected, [selected]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Create Request</Text>
            <Text style={styles.headerSubtitle}>Step 2/3: Service</Text>
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Service</Text>
              <Text style={styles.sectionSubtitle}>Choose the primary service required for the patient.</Text>
            </View>

            <View style={styles.grid}>
              {services.map((service) => {
                const isSelected = selected === service.id;
                return (
                  <TouchableOpacity
                    key={service.id}
                    activeOpacity={0.9}
                    style={[styles.card, isSelected && styles.cardActive]}
                    onPress={() => setSelected(service.id)}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={[styles.iconWrap, isSelected && styles.iconWrapActive]}>
                        <Text style={styles.iconText}>{service.icon}</Text>
                      </View>
                      <View style={[styles.checkOuter, isSelected && styles.checkOuterActive]}>
                        {isSelected ? <View style={styles.checkInner} /> : null}
                      </View>
                    </View>
                    <Text style={styles.cardTitle}>{service.title}</Text>
                    <Text style={styles.cardDesc}>{service.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <TouchableOpacity activeOpacity={0.9} style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.nextBtn, !canContinue && styles.nextDisabled]}
              disabled={!canContinue}
              onPress={() => navigation.navigate('CreateRequestStep3')}
            >
              <Text style={styles.nextText}>Next</Text>
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
    paddingTop: 20,
    paddingBottom: 160,
    gap: 16,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6f767e',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#efefef',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  cardActive: {
    borderColor: '#526674',
    backgroundColor: '#f3f6f8',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#e3e9ee',
  },
  iconText: {
    fontSize: 20,
  },
  checkOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkOuterActive: {
    borderColor: '#526674',
  },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#526674',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1d1f',
  },
  cardDesc: {
    fontSize: 12,
    color: '#6f767e',
    lineHeight: 16,
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
    flex: 1.3,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default CreateRequestStep2;
