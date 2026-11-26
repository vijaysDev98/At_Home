import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Keyboard,
  Image,
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
  previousDoctor?: CoordinatorDoctor | null;
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
>(({ onSelectDoctor, previousDoctor }, ref) => {
  const sheetRef = React.useRef<ActionSheetRef>(null);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = React.useState<'previous' | 'list'>('list');
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
          if (previousDoctor?.id) {
            setMode('previous');
            sheetRef.current?.show();
          } else {
            setMode('list');
            sheetRef.current?.show();
            fetchDoctors(1, '', false);
          }
        },
        hide: () => sheetRef.current?.hide(),
        snapToOffset: (offset: number) =>
          sheetRef.current?.snapToOffset(offset),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      }) as ActionSheetRef,
  );

  React.useEffect(() => {
    if (mode !== 'list') return;
    const timer = setTimeout(() => {
      fetchDoctors(1, search, true);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, mode, fetchDoctors]);

  const handleSelect = (item: CoordinatorDoctor) => {
    Keyboard.dismiss();
    setSelectedDoctor(item);
  };

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
        activeOpacity={0.8}
        style={[
          styles.providerItemCard,
          isSelected && styles.providerItemCardSelected,
        ]}
        onPress={() => handleSelect(item)}
      >
        <ProfileAvatar
          name={displayName}
          imageUrl={
            item.profileImg ? `${IMAGE_BASE_URL}${item.profileImg}` : undefined
          }
          size="medium"
        />
        <View style={styles.providerItemInfo}>
          <AppText
            size={getScaleSize(15)}
            font={FONTS.Inter.Bold}
            color={COLORS._1A1D1F}
            numberOfLines={1}
          >
            {displayName}
          </AppText>
          {specialtyLabel ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Medium}
              color={COLORS.primary}
              style={{ marginTop: 2 }}
              numberOfLines={1}
            >
              {specialtyLabel}
            </AppText>
          ) : null}
          {item.email ? (
            <AppText
              size={getScaleSize(12)}
              font={FONTS.Inter.Regular}
              color={COLORS._6F767E}
              style={{ marginTop: 2 }}
              numberOfLines={1}
            >
              {item.email}
            </AppText>
          ) : null}
        </View>
        <View
          style={[
            styles.providerRadioOuter,
            isSelected && styles.providerRadioOuterSelected,
          ]}
        >
          {isSelected ? <View style={styles.providerRadioInner} /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled={false}
      closeOnTouchBackdrop={true}
      closeOnPressBack={true}
      keyboardHandlerEnabled={
        Platform.OS === 'android' ? Number(Platform.Version) >= 35 : true
      }
      containerStyle={[
        styles.sheetContainer,
        {
          backgroundColor: COLORS.white,
          height: mode === 'previous' ? '52%' : '84%',
          paddingBottom: Math.max(insets.bottom, getScaleSize(20)),
        },
      ]}
      indicatorStyle={styles.indicator}
    >
      <View style={styles.sheetContent}>
        {mode === 'previous' && previousDoctor ? (
          <>
            <View style={styles.headerBlock}>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                style={{ marginBottom: getScaleSize(4) }}
              >
                {t(STRING.previouslySelectedDoctor)}
              </AppText>
              <AppText size={getScaleSize(13)} color={COLORS._6B7280}>
                {t(STRING.sendToPreviousDoctorPrompt)}
              </AppText>
            </View>

            <View style={styles.previousCardWrap}>
              {(() => {
                const prevName =
                  previousDoctor.fullName?.trim() ||
                  `${previousDoctor.fName || ''} ${previousDoctor.lName || ''}`.trim() ||
                  t(STRING.doctor);
                const formattedPrevName = prevName
                  .toLowerCase()
                  .startsWith('dr')
                  ? prevName
                  : `Dr. ${prevName}`;
                const prevSpec = previousDoctor.specialty
                  ? t(
                      doctorSpecialities.find(
                        s => s.value === previousDoctor.specialty,
                      )?.label || previousDoctor.specialty,
                    )
                  : null;
                return (
                  <View
                    style={[
                      styles.providerItemCard,
                      styles.providerItemCardSelected,
                    ]}
                  >
                    <ProfileAvatar
                      name={formattedPrevName}
                      imageUrl={
                        previousDoctor.profileImg
                          ? `${IMAGE_BASE_URL}${previousDoctor.profileImg}`
                          : undefined
                      }
                      size="medium"
                    />
                    <View style={styles.providerItemInfo}>
                      <AppText
                        size={getScaleSize(15)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        numberOfLines={1}
                      >
                        {formattedPrevName}
                      </AppText>
                      {prevSpec ? (
                        <AppText
                          size={getScaleSize(12)}
                          font={FONTS.Inter.Medium}
                          color={COLORS.primary}
                          style={{ marginTop: 2 }}
                          numberOfLines={1}
                        >
                          {prevSpec}
                        </AppText>
                      ) : null}
                      {previousDoctor.email ? (
                        <AppText
                          size={getScaleSize(12)}
                          font={FONTS.Inter.Regular}
                          color={COLORS._6F767E}
                          style={{ marginTop: 2 }}
                          numberOfLines={1}
                        >
                          {previousDoctor.email}
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                );
              })()}
            </View>

            <View style={styles.previousActionsCol}>
              <TouchableOpacity
                style={styles.previousPrimaryBtn}
                onPress={() => {
                  sheetRef.current?.hide();
                  onSelectDoctor(previousDoctor);
                }}
                activeOpacity={0.85}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.white}
                >
                  {t(STRING.sendToThisDoctor)}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.previousSecondaryBtn}
                onPress={() => {
                  setMode('list');
                  fetchDoctors(1, '', false);
                }}
                activeOpacity={0.8}
              >
                <AppText
                  size={getScaleSize(14)}
                  font={FONTS.Inter.Bold}
                  color={COLORS.primary}
                >
                  {t(STRING.sendToAnotherDoctor)}
                </AppText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Header */}
            <View style={styles.headerBlock}>
              <AppText
                size={getScaleSize(18)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                style={{ marginBottom: getScaleSize(4) }}
              >
                {t(STRING.selectDoctor)}
              </AppText>
              <AppText size={getScaleSize(13)} color={COLORS._6B7280}>
                {t(STRING.selectDoctorSignSubtitle)}
              </AppText>
            </View>

            {/* Search Input */}
            <View
              style={{
                marginTop: getScaleSize(12),
                marginBottom: getScaleSize(8),
              }}
            >
              <Input
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => Keyboard.dismiss()}
                returnKeyType="search"
                placeholder={t(STRING.searchDoctorPlaceholder)}
                placeholderTextColor={COLORS._6F767E}
                leftIcon={IMAGES.search}
                style={styles.providerSearchInputContainer}
                inputWrapperStyle={styles.providerSearchInputWrapper}
                inputStyle={styles.providerSearchInput}
              />
            </View>

            {isLoading && page === 1 && doctors.length === 0 ? (
              <View style={styles.providerLoaderContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <GestureFlatList
                data={doctors}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={styles.providerListContent}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={() => {
                      setIsRefreshing(true);
                      fetchDoctors(1, search, true);
                    }}
                    colors={[COLORS.primary]}
                    tintColor={COLORS.primary}
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
                    <View style={{ paddingVertical: 12 }}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  !isLoading ? (
                    <View style={styles.providerEmptyContainer}>
                      <Image
                        source={IMAGES.role_doctor}
                        style={styles.providerEmptyIcon}
                      />
                      <AppText
                        size={getScaleSize(15)}
                        font={FONTS.Inter.Bold}
                        color={COLORS._1A1D1F}
                        align="center"
                        style={{ marginTop: 8 }}
                      >
                        {t(STRING.noDoctorsFound)}
                      </AppText>
                    </View>
                  ) : null
                }
              />
            )}

            {/* Bottom Actions with Safe Area Inset Protection */}
            <View style={styles.providerButtonContainer}>
              {selectedDoctor ? (
                <View style={styles.providerButtonRow}>
                  <TouchableOpacity
                    style={styles.providerCancelBtnRow}
                    onPress={() => sheetRef.current?.hide()}
                    activeOpacity={0.7}
                  >
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS._1A1D1F}
                    >
                      {t(STRING.cancel)}
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.providerSubmitBtnRow}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                  >
                    <AppText
                      size={getScaleSize(14)}
                      font={FONTS.Inter.Bold}
                      color={COLORS.white}
                    >
                      {t(STRING.continue)}
                    </AppText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.providerCancelBtnFull}
                  onPress={() => sheetRef.current?.hide()}
                  activeOpacity={0.7}
                >
                  <AppText
                    size={getScaleSize(14)}
                    font={FONTS.Inter.Bold}
                    color={COLORS._1A1D1F}
                  >
                    {t(STRING.cancel)}
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    </ActionSheet>
  );
});

const styles = StyleSheet.create({
  sheetContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: getScaleSize(24),
    borderTopRightRadius: getScaleSize(24),
  },
  indicator: {
    width: getScaleSize(48),
    height: getScaleSize(4),
    backgroundColor: COLORS._E5E7EB,
    marginTop: getScaleSize(8),
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: getScaleSize(20),
    paddingBottom: 0,
  },
  headerBlock: {
    borderBottomWidth: 1,
    borderColor: COLORS._F3F4F6,
    paddingVertical: getScaleSize(12),
  },
  providerSearchInputContainer: {
    paddingHorizontal: 0,
  },
  providerSearchInputWrapper: {
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._F9FAFB,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  providerSearchInput: {
    fontSize: getScaleSize(14),
    fontFamily: FONTS.Inter.Regular,
    color: COLORS._1A1D1F,
  },
  providerLoaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerListContent: {
    gap: getScaleSize(10),
    paddingBottom: getScaleSize(10),
  },
  providerEmptyContainer: {
    paddingVertical: getScaleSize(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerEmptyIcon: {
    width: getScaleSize(40),
    height: getScaleSize(40),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
    opacity: 0.5,
  },
  providerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getScaleSize(12),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS._E5E7EB,
    gap: getScaleSize(12),
  },
  providerItemCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '0D',
  },
  providerItemInfo: {
    flex: 1,
  },
  providerRadioOuter: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    borderRadius: getScaleSize(10),
    borderWidth: 2,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerRadioOuterSelected: {
    borderColor: COLORS.primary,
  },
  providerRadioInner: {
    width: getScaleSize(10),
    height: getScaleSize(10),
    borderRadius: getScaleSize(5),
    backgroundColor: COLORS.primary,
  },
  providerButtonContainer: {
    paddingVertical: getScaleSize(12),
    borderTopWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  providerButtonRow: {
    flexDirection: 'row',
    gap: getScaleSize(12),
  },
  providerCancelBtnRow: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  providerSubmitBtnRow: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCancelBtnFull: {
    width: '100%',
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  previousCardWrap: {
    marginTop: getScaleSize(16),
    flex: 1,
  },
  previousActionsCol: {
    gap: getScaleSize(10),
    paddingTop: getScaleSize(12),
    borderTopWidth: 1,
    borderColor: COLORS._F3F4F6,
  },
  previousPrimaryBtn: {
    width: '100%',
    height: getScaleSize(52),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousSecondaryBtn: {
    width: '100%',
    height: getScaleSize(50),
    borderRadius: getScaleSize(14),
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SelectDoctorSheet;