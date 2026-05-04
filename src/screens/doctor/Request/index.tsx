import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { AppSafeAreaView, AppText, Header, Input, RequestCard } from "../../../components"
import { COLORS, FONTS } from "../../../utils"
import { getScaleSize } from "../../../utils/scaleSize"
import { IMAGES } from "../../../assets/images"
import React, { useCallback, useMemo, useState } from "react"
import { serviceRequests } from "../../../utils/dummyData"
import NavigationService from "../../../navigation/NavigationService"
import { SCREENS } from "../../../navigation/routes"

// Filter Types
type FilterType = 'all' | 'recent' | 'active';

interface FilterChipProps {
  key: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = React.memo(({ key, label, isActive, onPress }) => (
  <TouchableOpacity
    key={key}
    activeOpacity={0.85}
    onPress={onPress}
    style={[styles.chip, isActive && styles.chipActive]}
  >
    <AppText
      color={isActive ? COLORS.white : COLORS._6F767E}
      size={getScaleSize(12)}
      font={isActive ? FONTS.Inter.SemiBold : FONTS.Inter.Regular}
    >
      {label}
    </AppText>
  </TouchableOpacity>
));


const DoctorRequest = () => {

  const [filter, setFilter] = useState<FilterType>('all');

  // Filter options
  const filterOptions = useMemo(() => [
    { key: 'all' as FilterType, label: 'All ' },
    { key: 'draft' as FilterType, label: 'Draft' },
    { key: 'inprogress' as FilterType, label: 'In Progress' },
    { key: 'active' as FilterType, label: 'Returned' },
  ], []);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <RequestCard
        name={item.name}
        initials={item.initials}
        // service={item.service}
        requestId={item.requestId}
        formStatus={item.formStatus}
        status={item.status}
      buttonText={item.action}
      onButtonPress={()=> NavigationService.navigate(SCREENS.FORMS_SCREEN)}
      />
    )
  }

  return (
    <AppSafeAreaView
      style={{ backgroundColor: COLORS.white }}
    >
      <Header
        title="Service Request"
        subTitle="Manage your service requests"
        style={{ paddingHorizontal: getScaleSize(20) }}
      />
      <View style={styles.container}>
        <Input
          leftIcon={IMAGES.search}
          style={styles.searchInput}
          inputWrapperStyle={{ backgroundColor: COLORS._F8F9FA }}
          placeholder="Search patients, services..."
          placeholderTextColor={COLORS._6F767E}
        />

        <View style={styles.filters}>
          {filterOptions.map((option) => (
            <FilterChip
              key={option.key}
              label={option.label}
              isActive={filter === option.key}
              onPress={() => handleFilterChange(option.key)}
            />
          ))}
        </View>

        <AppText
          size={getScaleSize(12)}
          font={FONTS.Inter.SemiBold}
          color={COLORS._6B7280}
          style={{ marginTop: getScaleSize(16) }}
        >{"24 Forms Found "}</AppText>

      </View>

      <FlatList
        data={serviceRequests}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: getScaleSize(16),
          marginTop: getScaleSize(12),
          gap: getScaleSize(12),
          backgroundColor: COLORS._F8F9FA,
          paddingBottom:getScaleSize(50)
        }}
      />
    </AppSafeAreaView>
  )
}

export default DoctorRequest

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    paddingTop: getScaleSize(16),
    paddingBottom: getScaleSize(8),
    paddingHorizontal: getScaleSize(20),
  },
  searchInput: {
    paddingHorizontal: 0,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginTop: getScaleSize(16),
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
  },
  chipActive: {
    backgroundColor: COLORS._526674,
    borderColor: COLORS._526674,
  },

})