import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import {
  AppSafeAreaView,
  AppText,
  Input,
  ProfileAvatar,
} from '../../../components';
import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import { IMAGES } from '../../../assets/images';
import NavigationService from '../../../navigation/NavigationService';
import { getProvidersService } from '../../../services/patientService';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { STRING } from '../../../constant';

export type ProvidersCallListProps = NativeStackScreenProps<any, 'ProvidersCallList'>;

export interface Provider {
  id: string;
  _id?: string;
  fName?: string;
  lName?: string;
  fullName?: string;
  providerName?: string;
  email?: string;
  phoneNumber?: string;
  specialty?: string;
  profileImg?: string;
  roles?: string[];
  status?: string;
}

const ProviderCallItem: React.FC<{ provider: Provider }> = React.memo(({ provider }) => {
  const { t } = useTranslation();
  const name =
    provider.fullName ||
    provider.providerName ||
    `${provider.fName || ''} ${provider.lName || ''}`.trim() ||
    'Healthcare Provider';

  const handleCall = () => {
    if (provider.phoneNumber) {
      Linking.openURL(`tel:${provider.phoneNumber}`).catch(() => {
        console.log('Unable to open phone dialer');
      });
    }
  };

  return (
    <View style={styles.card}>
      <ProfileAvatar
        name={name}
        imageUrl={
          provider.profileImg ? IMAGE_BASE_URL + provider.profileImg : undefined
        }
        size="medium"
      />

      <View style={styles.infoCol}>
        <AppText
          size={getScaleSize(15)}
          font={FONTS.Inter.Bold}
          color={COLORS._1A1D1F}
          numberOfLines={1}
        >
          {name}
        </AppText>

        {provider.specialty ? (
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Medium}
            color={COLORS.primary}
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {provider.specialty}
          </AppText>
        ) : null}

        {provider.email ? (
          <AppText
            size={getScaleSize(12)}
            font={FONTS.Inter.Regular}
            color={COLORS._6F767E}
            style={{ marginTop: 2 }}
            numberOfLines={1}
          >
            {provider.email}
          </AppText>
        ) : null}

        {provider.phoneNumber ? (
          <View style={styles.phoneRow}>
            <Image source={IMAGES.phone} style={styles.phoneIconSmall} />
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.SemiBold}
              color={COLORS._48B02C}
            >
              {provider.phoneNumber}
            </AppText>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCall}
        style={styles.callBtn}
      >
        <Image source={IMAGES.phone} style={styles.callIcon} />
      </TouchableOpacity>
    </View>
  );
});

const ProvidersCallList: React.FC<ProvidersCallListProps> = () => {
  const { t, i18n } = useTranslation();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isMoreLoading, setIsMoreLoading] = useState<boolean>(false);

  const fetchProviders = async (
    pageNum: number = 1,
    searchQuery: string = '',
    refresh: boolean = false,
  ) => {
    try {
      if (pageNum === 1 && !refresh) setIsLoading(true);
      if (pageNum > 1) setIsMoreLoading(true);

      const langParam = i18n?.language || 'en';
      const response: any = await getProvidersService(
        pageNum,
        10,
        searchQuery,
        langParam,
      );

      if (response?.status && (response?.code === 200 || response?.status === 200)) {
        const rawData = response.data?.data || response.data;
        const newList: Provider[] =
          rawData?.providers ||
          rawData?.doctors ||
          response.data?.providers ||
          response.data?.doctors ||
          (Array.isArray(rawData) ? rawData : []);

        if (refresh || pageNum === 1) {
          setProviders(newList);
          setPage(1);
        } else {
          setProviders(prev => [...prev, ...newList]);
        }

        const pagination = rawData?.pagination || response.data?.pagination;
        if (pagination) {
          setHasMore(pagination.hasNextPage ?? pageNum < pagination.totalPages);
        } else {
          setHasMore(newList.length >= 10);
        }
      }
    } catch (error) {
      console.log('Error fetching providers call list:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsMoreLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProviders(1, '', false);
  }, []);

  // Debounced API search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders(1, search, true);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchProviders(1, search, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || isMoreLoading || isLoading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProviders(nextPage, search, false);
  };

  return (
    <AppSafeAreaView style={{ backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 0.5 }}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.8}
              onPress={() => NavigationService.goBack()}
            >
              <Image source={IMAGES.arrowLeft} style={styles.backIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <AppText
              size={getScaleSize(16)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {t(STRING.approvedProvidersCallCenter)}
            </AppText>
          </View>

          <View style={{ flex: 0.5 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Input
            value={search}
            onChangeText={handleSearchChange}
            placeholder={t(STRING.searchProviderPlaceholder)}
            placeholderTextColor={COLORS._6F767E}
            leftIcon={IMAGES.search}
            inputWrapperStyle={styles.searchInputWrapper}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Provider List */}
        {isLoading && page === 1 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={providers}
            keyExtractor={(item, index) => item.id || item._id || index.toString()}
            renderItem={({ item }) => <ProviderCallItem provider={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isMoreLoading ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Medium}
                    color={COLORS._6F767E}
                    style={{ textAlign: 'center' }}
                  >
                    {t(STRING.noApprovedProvidersFound)}
                  </AppText>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </AppSafeAreaView>
  );
};

export default ProvidersCallList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  backBtn: {
    width: getScaleSize(36),
    height: getScaleSize(36),
    borderRadius: getScaleSize(18),
    backgroundColor: COLORS._F8F9FA,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  backIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  searchWrapper: {
    // paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
    backgroundColor: COLORS.white,
  },
  searchInputWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    fontSize: getScaleSize(14),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingBottom: getScaleSize(24),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    padding: getScaleSize(14),
    marginBottom: getScaleSize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoCol: {
    flex: 1,
    marginLeft: getScaleSize(12),
    marginRight: getScaleSize(8),
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getScaleSize(3),
    gap: getScaleSize(4),
  },
  phoneIconSmall: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS._48B02C,
  },
  callBtn: {
    backgroundColor: COLORS._48B02C,
    borderRadius: getScaleSize(20),
    width: getScaleSize(40),
    height: getScaleSize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    resizeMode: 'contain',
    tintColor: COLORS.white,
  },
  footerLoader: {
    paddingVertical: getScaleSize(16),
  },
  emptyContainer: {
    paddingTop: getScaleSize(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
