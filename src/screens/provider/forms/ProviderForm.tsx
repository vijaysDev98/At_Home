import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { AppText, Input } from '../../../components';

interface RouteParams {
  mode?: 'view' | 'update';
  requestStatus?: string;
  formStatus?: string;
}

const SERVICE_TYPES = [
  'Wound Care',
  'Blood Draw',
  'Physical Therapy',
  'Post-Op Care',
  'Vitals Check',
];

const ProviderForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as RouteParams) || {};
  
  const isUpdateMode = params.mode === 'update';
  const requestStatus = params.requestStatus || 'Submitted';
  const formStatus = params.formStatus || 'Submitted';

  const [date, setDate] = useState(new Date('2023-10-25'));
  const [startTime, setStartTime] = useState(new Date('2023-10-25T09:00:00'));
  const [endTime, setEndTime] = useState(new Date('2023-10-25T10:30:00'));
  const [serviceType, setServiceType] = useState('Select service type');
  
  const [open, setOpen] = useState(false);
  const [pickerType, setPickerType] = useState<'date' | 'startTime' | 'endTime' | null>(null);
  const [servicePickerVisible, setServicePickerVisible] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'returned':
        return COLORS.error;
      case 'submitted':
      case 'signed':
        return '#2F80ED';
      default:
        return COLORS._6F767E;
    }
  };

  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleConfirm = (selectedDate: Date) => {
    setOpen(false);
    if (pickerType === 'date') setDate(selectedDate);
    if (pickerType === 'startTime') setStartTime(selectedDate);
    if (pickerType === 'endTime') setEndTime(selectedDate);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Image source={IMAGES.backIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <AppText
              size={getScaleSize(20)}
              font={FONTS.Inter.Bold}
              color={COLORS._1A1D1F}
            >
              {isUpdateMode ? 'Update Form' : 'View Form'}
            </AppText>
            <View style={styles.statusRow}>
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                Request Status:{' '}
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Bold}
                  color={getStatusColor(requestStatus)}
                >
                  {requestStatus}
                </AppText>
              </AppText>
              <View style={styles.statusDivider} />
              <AppText size={getScaleSize(12)} color={COLORS._6F767E}>
                Form Status:{' '}
                <AppText
                  size={getScaleSize(12)}
                  font={FONTS.Inter.Bold}
                  color={getStatusColor(formStatus)}
                >
                  {formStatus}
                </AppText>
              </AppText>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isUpdateMode && (
            <View style={styles.banner}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Complete and submit the form for doctor review and signature.
              </AppText>
            </View>
          )}

          {/* Patient Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={IMAGES.person} style={styles.cardIcon} />
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Patient Details
              </AppText>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <AppText size={getScaleSize(12)} color={COLORS._6F767E}>Name</AppText>
                  <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS._1A1D1F}>Alice Smith</AppText>
                </View>
                <View style={styles.gridItem}>
                  <AppText size={getScaleSize(12)} color={COLORS._6F767E}>DOB</AppText>
                  <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS._1A1D1F}>05/12/1980</AppText>
                </View>
              </View>
              <View style={[styles.gridRow, { marginTop: getScaleSize(12) }]}>
                <View style={styles.gridItem}>
                  <AppText size={getScaleSize(12)} color={COLORS._6F767E}>Service Requested</AppText>
                  <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS._1A1D1F}>Post-Op Wound Care</AppText>
                </View>
                <View style={styles.gridItem}>
                  <AppText size={getScaleSize(12)} color={COLORS._6F767E}>Request ID</AppText>
                  <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS._1A1D1F}>SR-2023-10456</AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Service Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={IMAGES.document_icon} style={styles.cardIcon} />
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Service Details
              </AppText>
            </View>
            <View style={styles.cardBody}>
              <Input
                label="Visit Date"
                isMandatory
                value={formatDate(date)}
                onPress={() => {
                  if (isUpdateMode) {
                    setPickerType('date');
                    setOpen(true);
                  }
                }}
                style={styles.formInput}
                trailing={<AppText size={16}>📅</AppText>}
              />
              
              <View style={styles.inputRow}>
                <Input
                  label="Start Time"
                  isMandatory
                  value={formatTime(startTime)}
                  onPress={() => {
                    if (isUpdateMode) {
                      setPickerType('startTime');
                      setOpen(true);
                    }
                  }}
                  style={styles.halfInput}
                  trailing={<AppText size={16}>🕒</AppText>}
                />
                <Input
                  label="End Time"
                  isMandatory
                  value={formatTime(endTime)}
                  onPress={() => {
                    if (isUpdateMode) {
                      setPickerType('endTime');
                      setOpen(true);
                    }
                  }}
                  style={styles.halfInput}
                  trailing={<AppText size={16}>🕒</AppText>}
                />
              </View>

              <Input
                label="Service Type"
                isMandatory
                value={serviceType}
                onPress={() => {
                  if (isUpdateMode) setServicePickerVisible(true);
                }}
                style={styles.formInput}
                trailing={<Image source={IMAGES.arrow_bottom} style={styles.arrowIcon} />}
              />

              <AppText
                size={getScaleSize(13)}
                font={FONTS.Inter.Medium}
                color={COLORS._1E293B}
                style={styles.vitalsLabel}
              >
                Vitals (Optional)
              </AppText>
              <View style={styles.inputRow}>
                <Input
                  placeholder="BP (e.g. 120/80)"
                  editable={isUpdateMode}
                  style={styles.halfInput}
                />
                <Input
                  placeholder="Temp (°F)"
                  editable={isUpdateMode}
                  style={styles.halfInput}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {isUpdateMode && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
              <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS._1A1D1F}>
                Submit for review
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidBtn} activeOpacity={0.8}>
              <AppText size={getScaleSize(14)} font={FONTS.Inter.Bold} color={COLORS.white}>
                Save Progress
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {/* Date/Time Picker Modal */}
        <DatePicker
          modal
          open={open}
          date={
            pickerType === 'date' 
              ? date 
              : pickerType === 'startTime' 
              ? startTime 
              : endTime
          }
          mode={pickerType === 'date' ? 'date' : 'time'}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />

        {/* Custom Service Picker Modal */}
        <Modal
          visible={servicePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setServicePickerVisible(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setServicePickerVisible(false)}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <AppText font={FONTS.Inter.Bold} size={getScaleSize(16)}>
                  Select Service Type
                </AppText>
              </View>
              <FlatList
                data={SERVICE_TYPES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.pickerItem}
                    onPress={() => {
                      setServiceType(item);
                      setServicePickerVisible(false);
                    }}
                  >
                    <AppText size={getScaleSize(14)} color={COLORS._1A1D1F}>{item}</AppText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default ProviderForm;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  backBtn: {
    marginRight: getScaleSize(16),
  },
  backIcon: {
    width: getScaleSize(24),
    height: getScaleSize(24),
    resizeMode: 'contain',
  },
  headerTitleWrap: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getScaleSize(4),
  },
  statusDivider: {
    width: 1,
    height: getScaleSize(12),
    backgroundColor: COLORS._EFEFEF,
    marginHorizontal: getScaleSize(8),
  },
  scrollContent: {
    paddingHorizontal: getScaleSize(20),
    paddingBottom: getScaleSize(40),
  },
  banner: {
    backgroundColor: COLORS.white,
    padding: getScaleSize(16),
    borderRadius: getScaleSize(12),
    marginTop: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: getScaleSize(16),
    marginTop: getScaleSize(20),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getScaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: getScaleSize(10),
  },
  cardIcon: {
    width: getScaleSize(20),
    height: getScaleSize(20),
    tintColor: COLORS._6F767E,
    resizeMode: 'contain',
  },
  cardBody: {
    padding: getScaleSize(16),
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    gap: getScaleSize(4),
  },
  formInput: {
    paddingHorizontal: 0,
    marginBottom: getScaleSize(16),
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: getScaleSize(12),
    marginBottom: getScaleSize(16),
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: 0,
  },
  vitalsLabel: {
    marginBottom: getScaleSize(8),
  },
  arrowIcon: {
    width: getScaleSize(12),
    height: getScaleSize(12),
    tintColor: COLORS._6F767E,
    resizeMode: 'contain',
  },
  footer: {
    flexDirection: 'row',
    padding: getScaleSize(20),
    backgroundColor: COLORS.white,
    gap: getScaleSize(12),
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
  },
  outlineBtn: {
    flex: 1,
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    borderWidth: 1,
    borderColor: COLORS._EFEFEF,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solidBtn: {
    flex: 1,
    height: getScaleSize(48),
    borderRadius: getScaleSize(12),
    backgroundColor: COLORS._526674,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS._EFEFEF,
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
});
