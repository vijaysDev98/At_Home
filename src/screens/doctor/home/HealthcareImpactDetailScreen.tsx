import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AppSafeAreaView, AppText, Header } from '../../../components';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { STRING } from '../../../constant';
import {
  formatEuro,
  HealthcareImpactData,
  HealthcareImpactEvent,
  healthcareImpactApi,
} from '../../../services/healthcareImpactService';
import moment from 'moment';

const HealthcareImpactDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<HealthcareImpactData | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    const result = await healthcareImpactApi.getDoctorHealthcareImpact(20);
    if (result.success && result.data) {
      setData(result.data);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load]),
  );

  const renderEvent = ({ item }: { item: HealthcareImpactEvent }) => {
    const ref = item.requestRef || item.requestId?.slice?.(-6)?.toUpperCase?.() || '—';
    const dateLabel = item.countedAt
      ? moment(item.countedAt).format('DD/MM/YYYY')
      : '—';
    return (
      <View style={styles.eventCard}>
        <View style={styles.eventTop}>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            style={styles.eventTitle}
            numberOfLines={2}
          >
            {item.serviceName || t(STRING.createRequest)}
          </AppText>
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS._48B02C}
          >
            {formatEuro(item.estimatedSavingsEuro)}
          </AppText>
        </View>
        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.Medium}
          color={COLORS._6F767E}
        >
          {t(STRING.healthcareImpactRequestRef, { ref })}
        </AppText>
        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.Regular}
          color={COLORS._6F767E}
          style={{ marginTop: getScaleSize(4) }}
        >
          {dateLabel} · {t(STRING.healthcareImpactDaysCount, { count: item.eligibleDays })}
        </AppText>
      </View>
    );
  };

  return (
    <AppSafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <Header isBack title={t(STRING.healthcareImpactScreenTitle)} />
      {loading && !data ? (
        <View style={styles.loader}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={data?.recentEvents || []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={
            <View>
              <View style={styles.summaryCard}>
                <AppText
                  size={getScaleSize(13)}
                  font={FONTS.Inter.Medium}
                  color={COLORS._6F767E}
                >
                  {t(STRING.healthcareImpactCumulativeSavings)}
                </AppText>
                <AppText
                  size={getScaleSize(32)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                  style={styles.summaryAmount}
                >
                  {formatEuro(data?.cumulativeSavingsEuro || 0)}
                </AppText>
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.SemiBold}
                  color={COLORS._526674}
                >
                  {t(STRING.healthcareImpactCumulativeDays)}:{' '}
                  {data?.cumulativeEligibleDays || 0}
                </AppText>
                {data?.lastContribution ? (
                  <AppText
                    size={getScaleSize(12)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._48B02C}
                    style={{ marginTop: getScaleSize(10) }}
                  >
                    {t(STRING.healthcareImpactLastContribution)}:{' '}
                    {formatEuro(data.lastContribution.estimatedSavingsEuro)}
                  </AppText>
                ) : null}
              </View>

              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._6F767E}
                style={styles.disclaimer}
              >
                {t(STRING.healthcareImpactDisclaimer)}
              </AppText>

              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                style={styles.sectionTitle}
              >
                {t(STRING.healthcareImpactRecentContributions)}
              </AppText>
            </View>
          }
          ListEmptyComponent={
            <AppText
              size={getScaleSize(14)}
              font={FONTS.Inter.Medium}
              color={COLORS._6F767E}
              align="center"
              style={{ marginTop: getScaleSize(12) }}
            >
              {t(STRING.healthcareImpactNoContributions)}
            </AppText>
          }
          renderItem={renderEvent}
        />
      )}
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: getScaleSize(18),
    paddingBottom: getScaleSize(32),
  },
  summaryCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: getScaleSize(16),
    marginTop: getScaleSize(8),
  },
  summaryAmount: {
    marginTop: getScaleSize(6),
    marginBottom: getScaleSize(4),
  },
  disclaimer: {
    marginTop: getScaleSize(14),
    lineHeight: getScaleSize(18),
  },
  sectionTitle: {
    marginTop: getScaleSize(20),
    marginBottom: getScaleSize(10),
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    padding: getScaleSize(14),
    marginBottom: getScaleSize(10),
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: getScaleSize(8),
    marginBottom: getScaleSize(6),
  },
  eventTitle: {
    flex: 1,
  },
});

export default HealthcareImpactDetailScreen;