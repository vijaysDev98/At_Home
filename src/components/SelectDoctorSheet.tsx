import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Keyboard,
} from 'react-native';
import { FlatList as GestureFlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import AppText from './AppText';
import Input from './Input';
import ProfileAvatar from './ProfileAvatar';
import { getScaleSize } from '../utils/scaleSize';
import { IMAGES } from '../assets/images';
import { COLORS, FONTS } from '../utils';
import { SHOW_TOAST, STRING } from '../constant';
import { useTranslation } from 'react-i18next';
import { getCoordinatorDoctorsService } from '../services/patientService';
import { IMAGE_BASE_URL } from '../api/apiRoutes';
import { doctorSpecialities } from '../utils/dummyData';

export type CoordinatorDoctor = {
  id: string;
  fName?: string;
  lName?: string;
  fullName?: string;
  email?: string;
  specialty?: string;
  profileImg?: string;
};

interface SelectDoctorSheetProps {
  onSelectDoctor: (doctor: CoordinatorDoctor) => void;
}

const normalizeDoctor = (raw: any): CoordinatorDoctor | null => {
  const id = raw?.id || raw?._id;
  if (!id) return null;
  return {
    id: String(id),
    fName: raw.fName,
    lName: raw.lName,
    fullName: raw.fullName,
    email: raw.email,
    specialty: raw.specialty,
    profileImg: raw.profileImg,
  };
};

export const SelectDoctorSheet = React.forwardRef<
  ActionSheetRef,
  SelectDoctorSheetProps
>(({ onSelectDoctor }, ref) => {
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [doctors, setDoctors] = React.useState<CoordinatorDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] =
    React.useState<CoordinatorDoctor | null>(null);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMoreLoading, setIsMoreLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchDoctors = React.useCallback(
    async (pageNum: number, searchQuery: string, refresh: boolean) => {
      try {
        if (pageNum === 1 && !refresh) setIsLoading(true);
        if (pageNum > 1) setIsMoreLoading(true);

        const response: any = await getCoordinatorDoctorsService(
          pageNum,
          20,
          searchQuery.trim() || undefined,
        );

        const ok =
          response?.status === true ||
          response?.code === 200 ||
          response?.status === 200;
        if (!ok) return;

        const rawList =
          response?.data?.data?.doctors ||
          response?.data?.doctors ||
          response?.data?.data ||
          [];
        const newList = (Array.isArray(rawList) ? rawList : [])
          .map(normalizeDoctor)
          .filter(Boolean) as CoordinatorDoctor[];

        if (refresh || pageNum === 1) {
          setDoctors(newList);
          setPage(1);
        } else {
          setDoctors(prev => [...prev, ...newList]);
        }

        const pagination =
          response?.data?.data?.pagination || response?.data?.pagination;
        if (pagination) {
          setHasMore(
            pagination.hasNextPage ?? pageNum < (pagination.totalPages || 1),
          );
        } else {
          setHasMore(newList.length >= 20);
        }
      } catch (e) {
        console.log('Error fetching doctors for coordinator:', e);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsMoreLoading(false);
      }
    },
    [],
  );

  React.useImperativeHandle(
    ref,
    () =>
      ({
        show: () => {
          setSearch('');
          setSelectedDoctor(null);
          sheetRef.current?.show();
          fetchDoctors(1, '', false);
        },
        hide: () => sheetRef.current?.hide(),
        snapToOffset: (offset: number) =>
          sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      }) as ActionSheetRef,
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(1, search, true);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, fetchDoctors]);

  const handleConfirm = () => {
    if (!selectedDoctor) {
      SHOW_TOAST(t(STRING.selectDoctor), 'error');
      return;
    }
    sheetRef.current?.hide();
    onSelectDoctor(selectedDoctor);
  };

  const renderItem = ({ item }: { item: CoordinatorDoctor }) => {
    const isSelected = selectedDoctor?.id === item.id;
    const displayName =
      item.fullName?.trim() ||
      `${item.fName || ''} ${item.lName || ''}`.trim() ||
      t(STRING.selectDoctor);
    const specialtyLabel = item.specialty
      ? t(
          doctorSpecialities.find(s => s.value === item.specialty)?.label ||
            item.specialty,
        )
      : null;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, isSelected && styles.cardActive]}
        onPress={() => setSelectedDoctor(item)}
      >
        <ProfileAvatar
          name={displayName}
          imageUrl={
            item.profileImg ? `${IMAGE_BASE_URL}${item.profileImg}` : undefined
          }
          size="medium"
        />
        <View style={styles.cardInfo}>
          <AppText
            size={getScaleSize(16)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {displayName}
          </AppText>
          {specialtyLabel ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >
              {specialtyLabel}
            </AppText>
          ) : null}
          {item.email ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
            >
              {item.email}
            </AppText>
          ) : null}
        </View>
        <View
          style={[styles.radioOuter, isSelected && styles.radioOuterActive]}
        >
          {isSelected ? <View style={styles.radioInner} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled={false}
      closeOnTouchBackdrop
      closeOnPressBack
      keyboardHandlerEnabled={
        Platform.OS === 'android' ? Number(Platform.Version) >= 35 : true
      }
      containerStyle={[
        styles.sheetContainer,
        {
          height: '84%',
          paddingBottom: insets.bottom + 5,
        },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.sheetContent}>
        <View style={styles.headerBlock}>
          <AppText
            size={getScaleSize(18)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
          >
            {t(STRING.selectDoctor)}
          </AppText>
          <AppText
            size={getScaleSize(13)}
            color={COLORS._6B7280}
            style={{ marginTop: getScaleSize(4) }}
          >
            {t(STRING.selectDoctorSignSubtitle)}
          </AppText>
        </View>

        <Input
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => Keyboard.dismiss()}
          returnKeyType="search"
          placeholder={t(STRING.searchProviderPlaceholder)}
          placeholderTextColor={COLORS._6F767E}
          leftIcon={IMAGES.search}
          style={styles.searchInputOuter}
          inputWrapperStyle={styles.searchInputWrapper}
        />

        {isLoading && doctors.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <GestureFlatList
            data={doctors}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            style={{ flex: 1, marginTop: getScaleSize(12) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                  setIsRefreshing(true);
                  fetchDoctors(1, search, true);
                }}
              />
            }
            onEndReached={() => {
              if (!hasMore || isMoreLoading || isLoading) return;
              const next = page + 1;
              setPage(next);
              fetchDoctors(next, search, false);
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isMoreLoading ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  style={{ marginVertical: getScaleSize(12) }}
                />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <AppText
                  align="center"
                  color={COLORS._6F767E}
                  style={{ marginTop: getScaleSize(24) }}
                >
                  {t(STRING.noDoctorsFound)}
                </AppText>
              ) : null
            }
          />
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.confirmBtn,
            !selectedDoctor && styles.confirmBtnDisabled,
          ]}
          disabled={!selectedDoctor}
          onPress={handleConfirm}
        >
          <AppText
            size={getScaleSize(14)}
            font={FONTS.Inter.Bold}
            color={COLORS.white}
            align="center"
          >
            {t(STRING.continue)}
          </AppText>
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
});

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: getScaleSize(20),
    borderTopRightRadius: getScaleSize(20),
  },
  indicator: {
    width: getScaleSize(48),
    height: getScaleSize(4),
    backgroundColor: COLORS._E5E7EB,
    marginTop: getScaleSize(8),
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(8),
  },
  headerBlock: {
    borderBottomWidth: 1,
    borderColor: COLORS._F3F4F6,
    paddingBottom: getScaleSize(12),
  },
  searchInputOuter: {
    marginTop: getScaleSize(12),
    marginHorizontal: getScaleSize(-8),
    paddingHorizontal: 0,
  },
  searchInputWrapper: {
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._F9FAFB,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getScaleSize(12),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._F3F4F6,
    marginBottom: getScaleSize(10),
    backgroundColor: COLORS.white,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS._F9FAFB,
  },
  cardInfo: {
    flex: 1,
    marginLeft: getScaleSize(12),
  },
  radioOuter: {
    width: getScaleSize(22),
    height: getScaleSize(22),
    borderRadius: getScaleSize(11),
    borderWidth: 2,
    borderColor: COLORS._D1D5DB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: getScaleSize(10),
    height: getScaleSize(10),
    borderRadius: getScaleSize(5),
    backgroundColor: COLORS.primary,
  },
  confirmBtn: {
    marginTop: getScaleSize(12),
    backgroundColor: COLORS.primary,
    borderRadius: getScaleSize(12),
    paddingVertical: getScaleSize(14),
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
});

export default SelectDoctorSheet;