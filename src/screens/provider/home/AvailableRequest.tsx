import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { AppText } from '../../../components';
import { useNavigation } from '@react-navigation/native';

const TABS = ['All', 'Submitted', 'In Progress', 'Returned', 'Completed'];

const MOCK_REQUESTS = [
  {
    initials: 'MJ',
    name: 'Michael Johnson',
    service: 'Blood Draw',
    status: 'Submitted',
    requestId: 'SR-2023-10456',
    formStatus: 'Signed',
    badgeBg: '#E8F1FF',
    badgeColor: '#2F80ED',
  },
  {
    initials: 'SR',
    name: 'Sarah Richards',
    service: 'Wound Care',
    status: 'InProgress',
    requestId: 'SR-2023-10457',
    formStatus: 'Signed',
    badgeBg: '#FFF7E8',
    badgeColor: '#F2994A',
  },
  {
    initials: 'DT',
    name: 'David Thompson',
    service: 'Physical Therapy',
    status: 'Returned',
    requestId: 'SR-2023-10458',
    formStatus: 'Pending',
    badgeBg: '#FEE2E2',
    badgeColor: '#EF4444',
  },
  {
    initials: 'AB',
    name: 'Alice Brown',
    service: 'Post-Op Care',
    status: 'Completed',
    requestId: 'SR-2023-10459',
    formStatus: 'Signed',
    badgeBg: '#E1F9F1',
    badgeColor: '#27AE60',
  },
];

const RequestCard = ({
  initials,
  name,
  service,
  status,
  requestId,
  formStatus,
  badgeBg,
  badgeColor,
}: {
  initials: string;
  name: string;
  service: string;
  status: string;
  requestId: string;
  formStatus: string;
  badgeBg: string;
  badgeColor: string;
}) => {
  const navigation = useNavigation<any>();
  const showButton = status === 'Submitted' || status === 'InProgress';
  const buttonText =
    status === 'Submitted' ? 'Start a Service' : 'Open Service';

  const handlePress = () => {
    navigation.navigate('ProviderForm', {
      mode:
        status === 'InProgress' || status === 'Submitted' ? 'update' : 'view',
      requestStatus: status,
      formStatus: formStatus,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.queueCard}
    >
      <View style={styles.queueTopRow}>
        <View style={styles.queueUserInfo}>
          <View style={styles.initialsBox}>
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Bold}
              color={COLORS._6F767E}
            >
              {initials}
            </AppText>
          </View>
          <View style={{ marginLeft: getScaleSize(12) }}>
            <AppText
              size={getScaleSize(15)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {name}
            </AppText>
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
            >
              {service}
            </AppText>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Bold}
            color={badgeColor}
          >
            {status}
          </AppText>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={[styles.detailsRow, !showButton && { marginBottom: 0 }]}>
        <View>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
            style={{ marginBottom: getScaleSize(4) }}
          >
            Request ID
          </AppText>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {requestId}
          </AppText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <AppText
            size={getScaleSize(11)}
            font={FONTS.Inter.Medium}
            color={COLORS._6F767E}
            style={{ marginBottom: getScaleSize(4) }}
          >
            Form Status
          </AppText>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {formStatus}
          </AppText>
        </View>
      </View>

      {showButton && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.startServiceBtn}
          onPress={handlePress}
        >
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS.white}
          >
            {buttonText}
          </AppText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const AvailableRequest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const filteredRequests = MOCK_REQUESTS.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'In Progress') return item.status === 'InProgress';
    return item.status === activeTab;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            Requests
          </AppText>
        </View>

        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.tabItemActive,
                ]}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={
                    activeTab === tab ? FONTS.Inter.Bold : FONTS.Inter.Medium
                  }
                  color={activeTab === tab ? COLORS.primary : COLORS._6F767E}
                >
                  {tab}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {filteredRequests.map((item, index) => (
            <RequestCard key={index} {...item} />
          ))}
          {filteredRequests.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: getScaleSize(40) }}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
              >
                No requests found in this category.
              </AppText>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default AvailableRequest;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
  },
  tabContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  tabScroll: {
    paddingHorizontal: getScaleSize(20),
    gap: getScaleSize(24),
  },
  tabItem: {
    paddingVertical: getScaleSize(12),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  scroll: {
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    paddingBottom: getScaleSize(40),
  },
  queueCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(20),
    padding: getScaleSize(16),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    marginBottom: getScaleSize(16),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  queueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialsBox: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(12),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS._EFEFEF,
    marginVertical: getScaleSize(16),
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getScaleSize(16),
  },
  startServiceBtn: {
    backgroundColor: COLORS._526674,
    borderRadius: getScaleSize(12),
    height: getScaleSize(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
