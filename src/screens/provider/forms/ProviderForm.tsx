import React, { useRef, useState, useEffect } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';

import { COLORS, FONTS } from '../../../utils';
import { getScaleSize } from '../../../utils/scaleSize';
import { IMAGES } from '../../../assets/images';
import { REQUEST_STATUS } from '../../../constant/RequestStatus';
import { AppLoader, AppText } from '../../../components';
import HeaderProvider from '../../../components/HeaderProvider';
import ServiceFormRenderer from '../../doctor/forms/ServiceFormRenderer';
import { API } from '../../../api';
import { SHOW_TOAST } from '../../../constant/showToast';
import { setLoading } from '../../../actions/common/commonSlice';
import { RootState } from '../../../redux/store';

interface RouteParams {
  mode?: 'view' | 'update';
  requestStatus?: string;
  formStatus?: string;
  request?: any;
}

const SERVICE_TYPES = [
  'Wound Care',
  'Blood Draw',
  'Physical Therapy',
  'Post-Op Care',
  'Vitals Check',
];

const ProviderForm: React.FC = () => {
  const route = useRoute();
  const dispatch = useDispatch();

  const params = (route.params as RouteParams) || {};
  const request = params?.request;
  const requestId = request?.id;
  const formRef = useRef<any>(null);

  const isLoading = useSelector((state: RootState) => state.common.isLoading);

  const isUpdateMode = params.mode === 'update';

  const [requestData, setRequestData] = useState<any>(null);

  const [date, setDate] = useState(new Date('2023-10-25'));
  const [startTime, setStartTime] = useState(new Date('2023-10-25T09:00:00'));
  const [endTime, setEndTime] = useState(new Date('2023-10-25T10:30:00'));

  const [serviceType, setServiceType] = useState('Select service type');

  const [open, setOpen] = useState(false);

  const [pickerType, setPickerType] = useState<
    'date' | 'startTime' | 'endTime' | null
  >(null);

  const [servicePickerVisible, setServicePickerVisible] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchServiceRequestDetails();
    }
  }, [requestId]);

  const fetchServiceRequestDetails = async () => {
    try {
      dispatch(setLoading(true));

      const response = await API.Instance.get(`/service-requests/${requestId}`);
      console.log('fetchServiceRequestDetails => ', response?.data);

      if (response?.data?.status) {
        const data = response?.data?.data;

        console.log('provider form request data => ', data);

        setRequestData(data);
      } else {
        SHOW_TOAST('Failed to fetch service request details', 'error');
      }
    } catch (error: any) {
      console.log('fetch request details error => ', error);

      SHOW_TOAST(error?.message || 'Failed to fetch request details', 'error');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const requestStatus = requestData?.status || request?.status || '';

  const formStatus = requestData?.formStatus || request?.formStatus || '';

  const patient = requestData?.patient || {};

  const serviceId = requestData?.serviceId || request?.id || '';

  const getStatusColor = (status: string) => {
    if (!status) {
      return COLORS._6F767E;
    }

    switch (status?.toLowerCase()) {
      case REQUEST_STATUS.RETURNED:
        return COLORS.returned;

      case REQUEST_STATUS.SUBMITTED:
      case REQUEST_STATUS.SIGNED:
        return COLORS.submitted;

      case REQUEST_STATUS.IN_PROGRESS:
        return COLORS.inProgress;

      case REQUEST_STATUS.COMPLETED:
        return COLORS.completed;

      default:
        return COLORS._6F767E;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppLoader visible={isLoading} />

      <View style={styles.container}>
        <HeaderProvider
          isBack
          title={isUpdateMode ? 'Update Form' : 'View Form'}
          requestStatus={requestStatus}
          formStatus={formStatus}
          getStatusColor={getStatusColor}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!!serviceId && (
            <ServiceFormRenderer
              ref={formRef}
              serviceId={serviceId}
              initialData={requestData}
              patient={patient}
              readOnly={!isUpdateMode}
            />
          )}
        </ScrollView>

        {isUpdateMode && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS._1A1D1F}
              >
                Submit for review
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.solidBtn} activeOpacity={0.8}>
              <AppText
                size={getScaleSize(14)}
                font={FONTS.Inter.Bold}
                color={COLORS.white}
              >
                Save Progress
              </AppText>
            </TouchableOpacity>
          </View>
        )}
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: getScaleSize(120),
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

  picker: {
    width: '100%',
  },

  androidPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    backgroundColor: 'transparent',
    color: 'transparent',
    zIndex: 10,
  },
});
