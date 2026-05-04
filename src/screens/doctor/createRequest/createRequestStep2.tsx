import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { AppButton, AppSafeAreaView, AppText } from '../../../components';
import { IMAGES } from '../../../assets/images';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { services } from '../../../utils/dummyData';

export type CreateRequestStep2Props = NativeStackScreenProps<RootStackParamList, 'CreateRequestStep2'>;

const CreateRequestStep2: React.FC<CreateRequestStep2Props> = ({ navigation }) => {
  const [selected, setSelected] = useState<string>('wound');
  const canContinue = useMemo(() => !!selected, [selected]);

  return (
    <AppSafeAreaView
    edges={true}
    >
      <View style={styles.container}>


        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} activeOpacity={0.8} onPress={() => NavigationService.goBack()}>
            <Image
              source={IMAGES.arrowLeft}
              style={styles.crossIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(12)}
              color={COLORS._1A1D1F}
              font={FONTS.Inter.Bold}
            >Create Request</AppText>
            <AppText
              size={getScaleSize(16)}
              color={COLORS._526674}
              font={FONTS.Inter.SemiBold}
            >Step 2/3: Service</AppText>
          </View>
        </View>

        <View style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionHeader}>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >Select Service(12)</AppText>
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
              >Choose the primary service required for the patient.</AppText>
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
                      <Image
                        source={service.icon}
                        style={{ height: getScaleSize(40), width: getScaleSize(40) }}
                      />
                      <View style={[styles.checkOuter, isSelected && styles.checkOuterActive]}>
                        {isSelected ? <View style={styles.checkInner} /> : null}
                      </View>
                    </View>
                    <AppText
                      size={getScaleSize(15)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >{service.title}</AppText>
                    <AppText
                      size={getScaleSize(12)}
                      font={FONTS.Inter.Regular}
                      color={COLORS._6F767E}
                    >{service.description}</AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.bottomButtonContainer}>
            <AppButton
              title={"Continue"}
              onPress={() => NavigationService.navigate(SCREENS.CREATE_REQUEST_STEP3)}
            />
          </View>
        </View>
      </View>
    </AppSafeAreaView>
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    borderColor: COLORS._EFEFEF,
    paddingTop: getScaleSize(18),
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(7),
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS._E8EDF1,
    borderWidth: 2

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
  crossIcon: {
    width: getScaleSize(15),
    height: getScaleSize(15),
  },
  bottomButtonContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: getScaleSize(17),
    paddingHorizontal: getScaleSize(20),
  },
});

export default CreateRequestStep2;
