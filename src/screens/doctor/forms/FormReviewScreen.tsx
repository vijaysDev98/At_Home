import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useRoute } from '@react-navigation/native';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import {
  AppSafeAreaView,
  AppText,
  AppLoader,
  Header,
  FormSignature,
} from '../../../components';

import { getScaleSize } from '../../../utils/scaleSize';
import { COLORS, FONTS } from '../../../utils';
import NavigationService from '../../../navigation/NavigationService';

import { REQUEST_STATUS } from '../../../constant/RequestStatus';

import { serviceRequestApi } from '../../../services/serviceRequestApi';

import {
  ServiceInfo,
  ServiceRequest,
  ServiceRequestDetail,
} from '../../../services/serviceRequestListApi';

import FormRequestHeader from '../../../components/FormRequestHeader';
import ServiceFormRenderer from './ServiceFormRenderer';

const FormReviewScreen: React.FC = () => {
  const route = useRoute();

  const request: ServiceRequest = (route.params as any)?.request;

  const requestId = request?.id;

  const [requestData, setRequestData] = useState<ServiceRequestDetail | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const isLoading = useSelector((state: RootState) => state.common.isLoading);
  const formRef = useRef<any>(null);

  const patientData = useMemo(() => {
    return request?.patient || requestData?.patient || {};
  }, [request, requestData]);

  const isReadOnly = useMemo(() => {
    return (
      requestData?.status === REQUEST_STATUS.SUBMITTED ||
      request?.status === REQUEST_STATUS.SUBMITTED
    );
  }, [requestData, request]);

  const handleLeftButtonPress = async () => {
    NavigationService.goBack();
  };

  const service: ServiceInfo = requestData?.service || request?.service || {};

  const serviceId = service?._id || service?.id;

  const serviceName = service?.serviceName;

  useEffect(() => {
    if (requestId && !requestData?.formData) {
      fetchServiceRequestDetails();
    }
  }, [requestId]);

  const fetchServiceRequestDetails = async () => {
    try {
      setHasError(false);

      const data = await serviceRequestApi.getServiceRequestDetails(
        requestId || '',
      );

      if (data) {
        setRequestData(data);
      } else {
        setHasError(true);
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setIsFetched(true);
    }
  };
  return (
    <AppSafeAreaView edges={true}>
      <AppLoader visible={isLoading} />
      {isFetched && hasError ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <AppText color={COLORS.primary}>Something went wrong</AppText>
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <Header title="Review & Sign" isBack={true} style={styles.header} />

            <View style={styles.content}>
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <FormRequestHeader
                  fromReview={true}
                  patientData={patientData}
                  serviceName={serviceName}
                  requestData={requestData}
                />

                <View
                  style={{
                    backgroundColor: COLORS._F9FAFB,
                  }}
                >
                  <ServiceFormRenderer
                    formRef={formRef}
                    serviceId={serviceId || ''}
                    initialData={requestData}
                    patient={patientData}
                    readOnly={isReadOnly}
                  />
                </View>

                <View style={styles.signatureContainer}>
                  <FormSignature
                    readOnly={isReadOnly}
                    requestData={requestData}
                    onSignatureCompleted={fetchServiceRequestDetails}
                  />
                </View>
              </ScrollView>
            </View>

            <View style={styles.bottomBar}>
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.saveBtn}
                onPress={handleLeftButtonPress}
              >
                <AppText
                  size={getScaleSize(16)}
                  font={FONTS.Inter.Bold}
                  color={COLORS._1A1D1F}
                >
                  Edit Form
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
      <AppLoader visible={isLoading} />
    </AppSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
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
    shadowColor: COLORS.black,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  content: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS._F9FAFB,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS._F9FAFB,
  },

  scrollContent: {
    backgroundColor: COLORS._F9FAFB,
    paddingBottom: 160,
    gap: 18,
  },

  signatureContainer: {
    paddingHorizontal: getScaleSize(16),
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: getScaleSize(12),
    paddingHorizontal: getScaleSize(20),
    paddingVertical: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS._EFEFEF,
    elevation: 10,
  },

  saveBtn: {
    flex: 1,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS._E5E7EB,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitBtn: {
    flex: 1.4,
    height: getScaleSize(56),
    borderRadius: getScaleSize(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextDisabled: {
    opacity: 0.6,
  },
});

export default FormReviewScreen;
