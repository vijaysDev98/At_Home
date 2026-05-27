import { Dispatch } from 'react';
import { setLoading } from '../../../actions/common/commonSlice';
import { serviceRequestApi } from '../../../services/serviceRequestApi';
import NavigationService from '../../../navigation/NavigationService';
import { SCREENS } from '../../../navigation/routes';
import { SHOW_TOAST, SHOW_SUCCESS_TOAST } from '../../../constant/showToast';
import moment from 'moment';
import store from '../../../redux/store';
import { Alert } from 'react-native';

export interface FormActionParams {
  dispatch: Dispatch<any>;
  state: any;
  initialData: any;
  serviceId: string;
  selectedPatient: any;
  validateForm: () => boolean;
  scrollRef?: any;
  lastFirstErrorKey?: any;
  errors?: any;
}

/**
 * Centralized action handler for form submission (create new or submit existing draft)
 * Used by: validateAndSubmit / handleSubmitRequest
 */
export const handleFormSubmit = async (params: FormActionParams) => {
  const {
    dispatch,
    state,
    initialData,
    serviceId,
    selectedPatient,
    validateForm,
    scrollRef,
    lastFirstErrorKey,
    errors = {},
  } = params;

  // Always validate first
  const ok = validateForm();
  if (!ok) {
    const firstErrorKey = lastFirstErrorKey?.current || '';
    const firstErrorMessage =
      errors[firstErrorKey] || 'Please fill all required fields';
    SHOW_TOAST(firstErrorMessage, 'error');

    if (scrollRef?.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
    return;
  }

  dispatch(setLoading(true));

  // Check if it's an existing draft
  const isExistingDraft = initialData && initialData._id;
  const requestId = isExistingDraft ? initialData._id : null;

  try {
    if (isExistingDraft && requestId) {
      // Submit existing draft for review
      const submitResponse = await serviceRequestApi.submitForReview(requestId);
      if (submitResponse.success) {
        SHOW_SUCCESS_TOAST(submitResponse.message);
        dispatch(setLoading(false));
        await serviceRequestApi.releaseFormLock(requestId);
        setTimeout(() => {
          NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
            screen: SCREENS.DOCTOR_REQUEST,
          });
        }, 500);
      } else {
        dispatch(setLoading(false));
        SHOW_TOAST(submitResponse.error, 'error');
      }
    } else {
      // Create new service request
      const payload = {
        serviceId: serviceId || '',
        patientId: selectedPatient?.id || selectedPatient?._id || '',
        // requestedDate: moment(
        //   state?.prescription_date || state?.date,
        //   'DD/MM/YYYY',
        // ).format('YYYY-MM-DD'),
        requestedDate: moment().format('YYYY-MM-DD'),
        requestedTime: moment().format('HH:mm'),
        initialNotes: '',
        formData: state,
      };

      const response = await serviceRequestApi.createServiceRequest(payload);
      dispatch(setLoading(false));

      if (response.success) {
        SHOW_SUCCESS_TOAST(response?.message);

        // Submit for review to lock the request
        const newRequestId = response.data?.data?.id;
        if (newRequestId) {
          const submitResponse = await serviceRequestApi.submitForReview(
            newRequestId,
          );
          if (submitResponse.success) {
            SHOW_SUCCESS_TOAST(submitResponse.message);
            dispatch(setLoading(false));
            setTimeout(() => {
              NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
                screen: SCREENS.DOCTOR_REQUEST,
              });
            }, 500);
          } else {
            dispatch(setLoading(false));
            SHOW_TOAST(submitResponse.error, 'error');
          }
        } else {
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
        SHOW_TOAST(response.error, 'error');
      }
    }
  } catch (error: any) {
    dispatch(setLoading(false));
    SHOW_TOAST(error.message, 'error');
  }
};

/**
 * Centralized action handler for saving as draft (create new or update existing)
 * Used by: saveAsDraft / handleSaveAsDraft
 */
export const handleSaveAsDraft = async (params: FormActionParams) => {
  const {
    dispatch,
    state,
    initialData,
    serviceId,
    selectedPatient,
    validateForm,
    scrollRef,
    lastFirstErrorKey,
    errors = {},
  } = params;

  // Always validate first
  const ok = validateForm();
  if (!ok) {
    const firstErrorKey = lastFirstErrorKey?.current || '';
    const firstErrorMessage =
      errors[firstErrorKey] || 'Please fill all required fields';
    SHOW_TOAST(firstErrorMessage, 'error');

    if (scrollRef?.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
    return;
  }

  dispatch(setLoading(true));

  // Check if it's an existing draft
  const isExistingDraft = initialData && initialData._id;
  const requestId = isExistingDraft ? initialData._id : null;

  try {
    if (isExistingDraft && requestId) {
      // Update existing draft
      const response = await serviceRequestApi.updateDraft(requestId, {
        formData: state,
      });
      dispatch(setLoading(false));
      if (response.success) {
        SHOW_SUCCESS_TOAST(response.message);
        setTimeout(() => {
          NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
            screen: SCREENS.DOCTOR_REQUEST,
          });
        }, 500);
      } else {
        SHOW_TOAST(response.error, 'error');
      }
    } else {
      // Create new service request as draft
      const payload = {
        serviceId: serviceId || '',
        patientId: selectedPatient?.id || selectedPatient?._id || '',
        // requestedDate: state?.prescription_date || state?.date
        //   ? moment(
        //     state?.prescription_date || state?.date,
        //     'DD/MM/YYYY',
        //   ).format('YYYY-MM-DD')
        //   : moment().format('YYYY-MM-DD'),
        requestedDate: moment().format('YYYY-MM-DD'),
        requestedTime: moment().format('HH:mm'),
        initialNotes: '',
        formData: state,
      };

      console.log('payload', payload);

      const response = await serviceRequestApi.createServiceRequest(payload);
      dispatch(setLoading(false));

      if (response.success) {
        SHOW_SUCCESS_TOAST(response?.message);
        setTimeout(() => {
          NavigationService.navigate(SCREENS.DOCTOR_BOTTOM_TABS, {
            screen: SCREENS.DOCTOR_REQUEST,
          });
        }, 500);
      } else {
        SHOW_TOAST(response.error, 'error');
      }
    }
  } catch (error: any) {
    dispatch(setLoading(false));
    SHOW_TOAST(error.message, 'error');
  }
};

/**
 * Centralized action handler for updating form and preparing for signing
 * Used by: updateAndSign / handleUpdateAndSign
 */
export const handleUpdateAndSign = async (
  params: Omit<FormActionParams, 'serviceId' | 'selectedPatient'>,
): Promise<{ success: boolean; error?: string }> => {
  const {
    dispatch,
    state,
    initialData,
    validateForm,
    scrollRef,
    errors = {},
  } = params;

  const ok = validateForm();
  if (!ok) {
    const firstErrorKey = (params as any).lastFirstErrorKey?.current || '';
    const firstErrorMessage = errors[firstErrorKey];
    SHOW_TOAST(firstErrorMessage, 'error');
    if (scrollRef?.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
    return { success: false, error: firstErrorMessage };
  }

  const requestId = initialData?._id || initialData?.id;
  if (!requestId) {
    return { success: false, error: 'No request ID' };
  }

  try {
    dispatch(setLoading(true));
    const response = await serviceRequestApi.updateFormData(requestId, {
      formData: state,
    });
    if (response.success) {
      return { success: true };
    } else {
      SHOW_TOAST(response.error, 'error');
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    const msg = error.message;
    SHOW_TOAST(msg, 'error');
    return { success: false, error: msg };
  }
};

/**
 * Centralized action handler for provider saving progress on pre-claim form
 * Used by: saveProgress
 */
export const handleSaveProgress = async (
  params: Omit<FormActionParams, 'serviceId' | 'selectedPatient'>,
): Promise<{ success: boolean; error?: string }> => {
  const {
    dispatch,
    state,
    initialData,
    validateForm,
    scrollRef,
    errors = {},
  } = params;

  const ok = validateForm();
  if (!ok) {
    const firstErrorKey = (params as any).lastFirstErrorKey?.current || '';
    const firstErrorMessage = errors[firstErrorKey];
    SHOW_TOAST(firstErrorMessage, 'error');
    if (scrollRef?.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
    return { success: false, error: firstErrorMessage };
  }

  const requestId = initialData?._id || initialData?.id;
  if (!requestId) {
    dispatch(setLoading(false));
    return { success: false, error: 'No request ID' };
  }
  try {
    dispatch(setLoading(true));
    const roles = store.getState().profile.profileData?.roles || [];
    const isProvider = roles.includes('serviceProvider');
    let response;

    if (isProvider) {
      response = await serviceRequestApi.updateProgress(requestId, {
        formData: state,
      });
    } else {
      // Doctor flow
      response = await serviceRequestApi.updateFormData(requestId, {
        formData: state,
      });
    }
    dispatch(setLoading(false));
    if (response.success) {
      SHOW_SUCCESS_TOAST(response.message || 'Progress saved successfully');
      NavigationService.goBack();
      return { success: true };
    } else {
      SHOW_TOAST(response.error || 'Failed to save progress', 'error');
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    dispatch(setLoading(false));
    const msg = error.message;
    SHOW_TOAST(msg, 'error');
    return { success: false, error: msg };
  }
};

/**
 * Centralized action handler for editing form without navigation
 * Used by: editForm (FormReviewScreen)
 * Same as saveProgress but without calling goBack()
 */
export const handleEditForm = async (
  params: Omit<FormActionParams, 'serviceId' | 'selectedPatient'>,
): Promise<{ success: boolean; error?: string }> => {
  const {
    dispatch,
    state,
    initialData,
    validateForm,
    scrollRef,
    errors = {},
  } = params;

  const ok = validateForm();
  if (!ok) {
    const firstErrorKey = (params as any).lastFirstErrorKey?.current || '';
    const firstErrorMessage = errors[firstErrorKey];
    SHOW_TOAST(firstErrorMessage, 'error');
    if (scrollRef?.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
    return { success: false, error: firstErrorMessage };
  }

  const requestId = initialData?._id || initialData?.id;
  if (!requestId) {
    dispatch(setLoading(false));
    return { success: false, error: 'No request ID' };
  }
  try {
    dispatch(setLoading(true));

    let response = await serviceRequestApi.updateFormData(requestId, {
      formData: state,
    });

    dispatch(setLoading(false));
    if (response.success) {
      // SHOW_SUCCESS_TOAST(response.message || 'Form updated successfully');
      // NOTE: No navigation here - caller handles navigation
      return { success: true };
    } else {
      SHOW_TOAST(response.error, 'error');
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    dispatch(setLoading(false));
    const msg = error.message;
    SHOW_TOAST(msg, 'error');
    return { success: false, error: msg };
  }
};

/**
 * Centralized action handler for provider to submit form for doctor review
 * Used by: submitForReview
 */
export const handleSubmitForReview = async (
  params: Omit<FormActionParams, 'serviceId' | 'selectedPatient'>,
): Promise<{ success: boolean; error?: string }> => {
  const {
    dispatch,
    state,
    initialData,
    validateForm,
    scrollRef,
    errors = {},
  } = params;

  const ok = validateForm();
  if (!ok) {
    const firstErrorKey = (params as any).lastFirstErrorKey?.current || '';
    const firstErrorMessage = errors[firstErrorKey];
    SHOW_TOAST(firstErrorMessage, 'error');
    if (scrollRef?.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 50);
    }
    return { success: false, error: firstErrorMessage };
  }

  const requestId = initialData?._id || initialData?.id;
  if (!requestId) {
    return { success: false, error: 'No request ID' };
  }

  dispatch(setLoading(true));

  try {
    // 1. First save progress
    const saveResponse = await serviceRequestApi.updateProgress(requestId, {
      formData: state,
    });

    if (!saveResponse.success) {
      dispatch(setLoading(false));
      SHOW_TOAST(saveResponse.error || 'Failed to save progress', 'error');
      return { success: false, error: saveResponse.error };
    }

    // 2. Submit for review
    const response = await serviceRequestApi.providerSubmitForReview(requestId);
    dispatch(setLoading(false));

    if (response.success) {
      // Release form lock on successful submit-for-review
      await serviceRequestApi.releaseFormLock(requestId);
      SHOW_SUCCESS_TOAST(response.message || 'Form submitted for review');
      NavigationService.goBack();
      return { success: true };
    } else {
      SHOW_TOAST(response.error || 'Failed to submit for review', 'error');
      return { success: false, error: response.error };
    }
  } catch (error: any) {
    dispatch(setLoading(false));
    const msg = error.message;
    SHOW_TOAST(msg, 'error');
    return { success: false, error: msg };
  }
};

export const handleClaimService = async ({
  requestId,
  dispatch,
  onSuccess,
}: {
  requestId: string;
  dispatch: any;
  onSuccess?: () => Promise<void> | void;
}) => {
  if (!requestId) {
    SHOW_TOAST('Missing Request ID', 'error');
    return;
  }

  dispatch(setLoading(true));

  try {
    const response = await serviceRequestApi.claimRequest(requestId);

    if (response.success) {
      SHOW_TOAST(response.message || 'Request claimed successfully', 'success');

      // call callback here
      if (onSuccess) {
        await onSuccess();
      }

      NavigationService.goBack();
    } else {
      SHOW_TOAST(response.error || 'Failed to claim request', 'error');
    }
  } catch (error: any) {
    SHOW_TOAST(error?.message || 'Failed to claim request', 'error');
  } finally {
    dispatch(setLoading(false));
  }
};
