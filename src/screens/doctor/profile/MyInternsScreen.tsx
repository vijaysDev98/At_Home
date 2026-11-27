import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import {
  AppSafeAreaView,
  AppText,
  Header,
  ProfileAvatar,
} from '../../../components';
import {
  InternReviewData,
  RppsAuthorizationModal,
} from '../../../components/doctor/RppsAuthorizationModal';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { IMAGE_BASE_URL } from '../../../api/apiRoutes';
import { SHOW_TOAST, STRING } from '../../../constant';
import { userApi } from '../../../services/userApi';
import { openDoctorChat } from '../../../services/chatService';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { capitalizeFirstLetter } from '../../../constant/smallFunctions';

type FilterStatus = 'all' | 'pendingApproval' | 'approved' | 'rejected';

interface SupervisedIntern {
  _id?: string;
  id?: string;
  fName?: string;
  lName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  profileImg?: string | null;
  facilityName?: string;
  specialty?: string;
  status?: string;
  createdAt?: string | number;
}

const getInternId = (intern?: SupervisedIntern | null): string =>
  String(intern?._id || intern?.id || '');

const MyInternsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [interns, setInterns] = useState<SupervisedIntern[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [reviewModalVisible, setReviewModalVisible] = useState<boolean>(false);
  const [selectedIntern, setSelectedIntern] =
    useState<InternReviewData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);

  const loadInterns = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const list = await userApi.getSupervisedInterns();
      setInterns(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInterns();
    }, [loadInterns]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInterns(true);
  }, [loadInterns]);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    for (const item of interns) {
      if (item.status === 'pendingApproval') pending += 1;
      else if (item.status === 'approved' || item.status === 'active')
        approved += 1;
      else if (item.status === 'rejected') rejected += 1;
    }
    return { all: interns.length, pending, approved, rejected };
  }, [interns]);

  const filteredInterns = useMemo(() => {
    if (filter === 'all') return interns;
    if (filter === 'approved') {
      return interns.filter(
        i => i.status === 'approved' || i.status === 'active',
      );
    }
    return interns.filter(i => i.status === filter);
  }, [interns, filter]);

  const handleOpenReview = (intern: SupervisedIntern) => {
    const internId = getInternId(intern);
    if (!internId) return;
    const fullName =
      intern.fullName ||
      `${capitalizeFirstLetter(intern.fName || '')} ${capitalizeFirstLetter(
        intern.lName || '',
      )}`.trim();
    setSelectedIntern({
      internId,
      internName: fullName,
      internEmail: intern.email,
      internPhone: intern.phoneNumber,
      facilityName: intern.facilityName,
      profileImg: intern.profileImg || null,
    });
    setReviewModalVisible(true);
  };

  const handleApproveIntern = async (internId: string) => {
    setIsProcessing(true);
    try {
      const ok = await userApi.approveIntern(internId);
      if (ok) {
        setReviewModalVisible(false);
        setSelectedIntern(null);
        await loadInterns(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectIntern = async (internId: string) => {
    setIsProcessing(true);
    try {
      const ok = await userApi.rejectIntern(internId);
      if (ok) {
        setReviewModalVisible(false);
        setSelectedIntern(null);
        await loadInterns(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatWithIntern = async (intern: SupervisedIntern) => {
    const internId = getInternId(intern);
    if (!internId || chatLoadingId) return;
    const fullName =
      intern.fullName ||
      `${capitalizeFirstLetter(intern.fName || '')} ${capitalizeFirstLetter(
        intern.lName || '',
      )}`.trim() ||
      'Intern';
    setChatLoadingId(internId);
    try {
      const result = await openDoctorChat(internId);
      if (!result?.conversationId) {
        SHOW_TOAST(t(STRING.somethingWentWrong), 'error');
        return;
      }
      NavigationService.navigate(SCREENS.CHAT, {
        conversationId: result.conversationId,
        peerName: result.peer?.name || fullName,
        peerProfileImg:
          intern.profileImg || result.peer?.profileImg || undefined,
        peerPhone: intern.phoneNumber || result.peer?.phoneNumber || undefined,
        peerCountry: result.peer?.country || undefined,
        peerUserId: internId,
      });
    } finally {
      setChatLoadingId(null);
    }
  };

  const getStatusMeta = (status?: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return {
          label: t(STRING.Approved),
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#047857',
        };
      case 'rejected':
        return {
          label: t(STRING.Rejected),
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#B91C1C',
        };
      default:
        return {
          label: t(STRING.Pending),
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#B45309',
        };
    }
  };

  const handleOpenInternForms = (intern: SupervisedIntern) => {
    const internId = getInternId(intern);
    if (!internId) return;
    const fullName =
      intern.fullName ||
      `${capitalizeFirstLetter(intern.fName || '')} ${capitalizeFirstLetter(
        intern.lName || '',
      )}`.trim() ||
      'Intern';
    NavigationService.navigate(SCREENS.INTERN_FORMS, {
      internId,
      internName: fullName,
    });
  };

  const renderInternCard = ({ item }: { item: SupervisedIntern }) => {
    const internId = getInternId(item);
    const fullName =
      item.fullName ||
      `${capitalizeFirstLetter(item.fName || '')} ${capitalizeFirstLetter(
        item.lName || '',
      )}`.trim() ||
      'Intern';
    const statusMeta = getStatusMeta(item.status);
    const isPending = item.status === 'pendingApproval';
    const canChat = item.status === 'approved' || item.status === 'active';
    const isOpeningChat = chatLoadingId === internId;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        disabled={!internId}
        onPress={() => handleOpenInternForms(item)}
      >
        <View style={styles.cardTop}>
          {item.profileImg ? (
            <FastImage
              source={{ uri: IMAGE_BASE_URL + item.profileImg }}
              style={styles.avatar}
            />
          ) : (
            <ProfileAvatar name={fullName} size="medium" />
          )}

          <View style={styles.cardInfo}>
            <View style={styles.nameStatusRow}>
              <AppText
                size={getScaleSize(15)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
                numberOfLines={1}
                style={styles.nameText}
              >
                {fullName}
              </AppText>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusMeta.bg,
                    borderColor: statusMeta.border,
                  },
                ]}
              >
                <AppText
                  size={getScaleSize(11)}
                  font={FONTS.Inter.SemiBold}
                  color={statusMeta.text}
                >
                  {statusMeta.label}
                </AppText>
              </View>
            </View>

            {item.facilityName ? (
              <AppText
                size={getScaleSize(12)}
                font={FONTS.Inter.Regular}
                color={COLORS._6B7280}
                numberOfLines={1}
                style={{ marginTop: getScaleSize(2) }}
              >
                {item.facilityName}
              </AppText>
            ) : null}
          </View>
        </View>

        {(item.email || item.phoneNumber) && (
          <View style={styles.contactBox}>
            {item.email ? (
              <View style={styles.contactRow}>
                <Image source={IMAGES.mail} style={styles.contactIcon} />
                <AppText
                  size={getScaleSize(12.5)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._526674}
                  numberOfLines={1}
                  style={styles.contactText}
                >
                  {item.email}
                </AppText>
              </View>
            ) : null}
            {item.phoneNumber ? (
              <View style={styles.contactRow}>
                <Image source={IMAGES.phone} style={styles.contactIcon} />
                <AppText
                  size={getScaleSize(12.5)}
                  font={FONTS.Inter.Regular}
                  color={COLORS._526674}
                  numberOfLines={1}
                  style={styles.contactText}
                >
                  {item.phoneNumber}
                </AppText>
              </View>
            ) : null}
          </View>
        )}

        {isPending ? (
          <TouchableOpacity
            style={styles.reviewBtn}
            activeOpacity={0.85}
            onPress={() => handleOpenReview(item)}
          >
            <AppText
              size={getScaleSize(13)}
              font={FONTS.Inter.Bold}
              color={COLORS.white}
            >
              {t(STRING.reviewIntern)}
            </AppText>
          </TouchableOpacity>
        ) : canChat ? (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.chatBtn, styles.actionFlexBtn]}
              activeOpacity={0.85}
              disabled={isOpeningChat}
              onPress={() => handleChatWithIntern(item)}
            >
              {isOpeningChat ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Image
                    source={IMAGES.chat_conversation}
                    style={styles.chatIcon}
                  />
                  <AppText
                    size={getScaleSize(13)}
                    font={FONTS.Inter.Bold}
                    color={COLORS.primary}
                  >
                    {t(STRING.chat)}
                  </AppText>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewFormsBtn, styles.actionFlexBtn]}
              activeOpacity={0.85}
              onPress={() => handleOpenInternForms(item)}
            >
              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                {t(STRING.viewForms)}
              </AppText>
            </TouchableOpacity>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const tabs: Array<{ key: FilterStatus; label: string; count: number }> = [
    { key: 'all', label: t(STRING.all), count: counts.all },
    { key: 'pendingApproval', label: t(STRING.Pending), count: counts.pending },
    { key: 'approved', label: t(STRING.Approved), count: counts.approved },
    { key: 'rejected', label: t(STRING.Rejected), count: counts.rejected },
  ];

  return (
    <AppSafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <Header
        isBack
        title={t(STRING.mySupervisedInterns)}
        style={styles.headerStyle}
      />

      <View style={styles.tabsRow}>
        {tabs.map(tab => {
          const active = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              style={[styles.tabPill, active && styles.tabPillActive]}
              onPress={() => setFilter(tab.key)}
            >
              <AppText
                size={getScaleSize(12)}
                font={active ? FONTS.Inter.SemiBold : FONTS.Inter.Medium}
                color={active ? COLORS.white : COLORS._526674}
                numberOfLines={1}
              >
                {`${tab.label} (${tab.count})`}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading && interns.length === 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredInterns}
          keyExtractor={(item, idx) => getInternId(item) || String(idx)}
          renderItem={renderInternCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerBox}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Medium}
                color={COLORS._6F767E}
                align="center"
              >
                {filter === 'pendingApproval'
                  ? t(STRING.noPendingInterns)
                  : t(STRING.noSupervisedInterns)}
              </AppText>
            </View>
          }
        />
      )}

      <RppsAuthorizationModal
        visible={reviewModalVisible}
        internData={selectedIntern}
        onClose={() => {
          if (!isProcessing) {
            setReviewModalVisible(false);
            setSelectedIntern(null);
          }
        }}
        onApprove={handleApproveIntern}
        onReject={handleRejectIntern}
        isProcessing={isProcessing}
      />
    </AppSafeAreaView>
  );
};

export default MyInternsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerStyle: {
    paddingHorizontal: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS._EFEFEF,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getScaleSize(8),
    paddingHorizontal: getScaleSize(16),
    paddingVertical: getScaleSize(12),
    backgroundColor: COLORS.white,
  },
  tabPill: {
    paddingHorizontal: getScaleSize(12),
    paddingVertical: getScaleSize(6),
    borderRadius: getScaleSize(16),
    backgroundColor: COLORS._F8F9FA,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  listContent: {
    paddingHorizontal: getScaleSize(16),
    paddingTop: getScaleSize(10),
    paddingBottom: getScaleSize(32),
    flexGrow: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getScaleSize(40),
    paddingHorizontal: getScaleSize(24),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(14),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    padding: getScaleSize(14),
    marginBottom: getScaleSize(12),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: getScaleSize(10),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(12),
  },
  avatar: {
    width: getScaleSize(48),
    height: getScaleSize(48),
    borderRadius: getScaleSize(24),
    backgroundColor: COLORS._F3F4F6,
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: getScaleSize(8),
  },
  nameText: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: getScaleSize(8),
    paddingVertical: getScaleSize(3),
    borderRadius: getScaleSize(10),
    borderWidth: 1,
  },
  contactBox: {
    paddingTop: getScaleSize(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS._EFEFEF,
    gap: getScaleSize(6),
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(8),
  },
  contactIcon: {
    width: getScaleSize(14),
    height: getScaleSize(14),
    resizeMode: 'contain',
    tintColor: COLORS._6F767E,
  },
  contactText: {
    flex: 1,
  },
  reviewBtn: {
    height: getScaleSize(40),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getScaleSize(2),
  },
  chatBtn: {
    height: getScaleSize(40),
    borderRadius: getScaleSize(10),
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getScaleSize(8),
    marginTop: getScaleSize(2),
  },
  chatIcon: {
    width: getScaleSize(16),
    height: getScaleSize(16),
    resizeMode: 'contain',
    tintColor: COLORS.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getScaleSize(10),
    marginTop: getScaleSize(2),
  },
  actionFlexBtn: {
    flex: 1,
    marginTop: 0,
  },
  viewFormsBtn: {
    height: getScaleSize(40),
    borderRadius: getScaleSize(10),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
