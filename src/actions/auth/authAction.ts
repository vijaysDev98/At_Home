import { SHOW_TOAST, Storage } from '../../constant';
import { AppDispatch } from '../../redux/store';
import { setUserData, resetAuth } from './authSlice';
import { setLoading } from '../common/commonSlice';
import { API } from '../../api';
import NavigationService from '../../navigation/NavigationService';
import { SCREENS } from '../../navigation/routes';
import { fetchProfile } from '../profile/profileAction';
import { uploadFcmToken } from '../../utils/fcmTokenHelper';
import { Alert } from 'react-native';

const getUserDataForRedux = (user: any) => {
  if (!user) {
    return null;
  }

  // Extract user data from login response, excluding tokens
  const {
    accessToken,
    refreshToken,
    access_token,
    refresh_token,
    ...sanitizedUser
  } = user;

  return sanitizedUser;
};

const persistAuthInStorage = async (user: any) => {
  const accessToken = user?.accessToken;
  const refreshToken = user?.refreshToken;
  const roles = user?.roles || [];

  if (accessToken) {
    await Storage.save(Storage.USER_TOKEN, accessToken);
  }

  if (refreshToken) {
    await Storage.save(Storage.REFRESH_TOKEN, refreshToken);
  }

  if (roles.length > 0) {
    // Store the first role that matches our expected values
    const role = roles.includes('serviceProvider') ? 'serviceProvider' : 'doctor';
    await Storage.save(Storage.USER_ROLE, role);
  }
};

export const userLogin = (data: any) => async (dispatch: AppDispatch) => {
  try {
    data['fcm_token'] =
      (await Storage.get(Storage.FCM_TOKEN_KEY)) ?? 'no token found';

    dispatch(setLoading(true));
    const response: any = await API.Instance.post(API.API_ROUTES.login, data);

    if (response?.status) {
      const responseData = response?.data;
      const innerData = responseData?.data;

      // Handle OTP requirement
      if (innerData?.requiresOtp || innerData?.requiresOTP) {
        SHOW_TOAST(
          responseData?.message || 'OTP sent to your email. Please verify.',
          'success',
        );
        dispatch(setLoading(false));
        NavigationService.navigate(SCREENS.OTP_VERIFICATION, {
          email: innerData?.email,
        });
        return;
      }

      // If no OTP required (direct login)
      await persistAuthInStorage(innerData);
      const roles = innerData?.roles || [];
      dispatch(setUserData(getUserDataForRedux(innerData)));
      dispatch(fetchProfile());
      SHOW_TOAST(responseData?.data?.message, 'success');
      dispatch(setLoading(false));

      // Role-based navigation
      if (roles.includes('provider') || roles.includes('nurse')) {
        NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);
      } else {
        NavigationService.reset(SCREENS.DOCTOR_BOTTOM_TABS);
      }
    } else {
      console.log('Login failed:', response);
      if (response?.code === 401) {
        SHOW_TOAST(response?.message || response?.data?.message || response?.message, 'error');
      } else if (response?.code === 403) {
        SHOW_TOAST(response?.message || response?.data?.message || response?.message, 'error');
      } else {
        SHOW_TOAST(response?.message || response?.data?.message || response?.message, 'error');
      }
    }
  } catch (e) {
    console.log('login Error', e);
    SHOW_TOAST(e?.message || 'Something went wrong', 'error');
  } finally {
    dispatch(setLoading(false));
  }
};

export const userRegister = (data: any) => async (dispatch: AppDispatch) => {
  try {

    dispatch(setLoading(true));
    const response: any = await API.Instance.post(
      API.API_ROUTES.register,
      data,
    );
    dispatch(setLoading(false));

    if (response?.status && response?.code === 201) {
      SHOW_TOAST(
        response?.data?.message,
        'success',
      );

      // Upload FCM token after successful registration (before admin approval)
      // await uploadFcmToken();

      NavigationService.replace(SCREENS.REGISTER_SUCCESS);
    } else if (response?.code === 400 || response?.code === 409) {
      SHOW_TOAST(response?.data?.message || response?.message, 'error');
    } else {
      SHOW_TOAST(response?.data?.message || response?.message, 'error');
    }
  } catch (e) {
    dispatch(setLoading(false));
    console.log('Register Error', e);
    SHOW_TOAST(undefined, 'error');
  }
};

export const verifyOtp = (data: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const response: any = await API.Instance.post(
      API.API_ROUTES.verifyLoginOtp,
      data,
    );

    if (response?.status && response?.code === 200) {
      const responseData = response?.data;
      const innerData = responseData?.data;

      await persistAuthInStorage(innerData);
      dispatch(setUserData(getUserDataForRedux(innerData)));
      dispatch(fetchProfile());

      // Upload FCM token after successful OTP verification
      // await uploadFcmToken();

      dispatch(setLoading(false));

      // Role-based navigation
      const roles = innerData?.roles || [];
      if (roles.includes('serviceProvider')) {
        NavigationService.reset(SCREENS.PROVIDER_BOTTOM_TABS);
      } else {
        NavigationService.reset(SCREENS.DOCTOR_BOTTOM_TABS);
      }
    } else {
      dispatch(setLoading(false));
      if (response?.code === 400) {
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      } else if (response?.code === 401) {
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      } else {
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      }
    }
  } catch (e) {
    // SHOW_TOAST(undefined, 'error');
    dispatch(setLoading(false));
  }
};

export const userLogout = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const token = await Storage.get(Storage.USER_TOKEN);
    let data = {
      token: token,
    };
    const response: any = await API.Instance.get(API.API_ROUTES.logout, {
      params: data,
    });

    if (response?.status) {
      SHOW_TOAST(response?.data?.message, 'success');
    } else {
      // Show error toast if API logout fails, but proceed with local logout
      // SHOW_TOAST(response?.data?.message || response?.message, 'error');
    }
  } catch (e: any) {
    // SHOW_TOAST(undefined, 'error');
  } finally {
    await Storage.clear();
    dispatch({ type: 'USER_LOGOUT' });
    dispatch(resetAuth());
    dispatch(setLoading(false));
    NavigationService.reset(SCREENS.WELCOME);
  }
};

export const forgotPassword =
  (email: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        API.API_ROUTES.forgotPassword,
        { email },
      );

      if (response?.status && response?.code === 200) {
        SHOW_TOAST(response?.data?.message || response?.message, 'success');
        dispatch(setLoading(false));
        NavigationService.navigate(SCREENS.OTP_VERIFICATION, {
          email,
          isForgotPassword: true,
        });
      } else {
        dispatch(setLoading(false));
        SHOW_TOAST(response?.data?.message, 'error');
      }
    } catch (e) {
      dispatch(setLoading(false));
    }
  };

export const verifyForgotPasswordOtp =
  (data: { email: string; otp: string }) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        API.API_ROUTES.verifyForgotPasswordOTP,
        data,
      );

      if (response?.status && response?.code === 200) {
        SHOW_TOAST(response?.data?.message || response?.message, 'success');
        dispatch(setLoading(false));
        const resetToken = response?.data?.data?.resetToken || '';
        NavigationService.navigate(SCREENS.RESET_PASSWORD, {
          email: data.email,
          otp: data.otp,
          resetToken,
        });
      } else {
        dispatch(setLoading(false));
        if (response?.code === 400) {
          SHOW_TOAST(response?.data?.message || response?.message, 'error');
        } else if (response?.code === 401) {
          SHOW_TOAST(response?.data?.message || response?.message, 'error');
        } else {
          SHOW_TOAST(response?.data?.message || response?.message, 'error');
        }
      }
    } catch (e) {
      dispatch(setLoading(false));
    }
  };

export const resetPassword =
  (data: {
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    async (dispatch: AppDispatch) => {
      try {
        dispatch(setLoading(true));

        const response: any = await API.Instance.post(
          API.API_ROUTES.resetPassword,
          data,
        );

        if (response?.status && response?.code === 200) {
          SHOW_TOAST(response?.data?.message || response?.message, 'success');
          dispatch(setLoading(false));
          NavigationService.reset(SCREENS.LOGIN);
        } else {
          dispatch(setLoading(false));
          SHOW_TOAST(response?.data?.message || response?.message, 'error');
        }
      } catch (e) {
        SHOW_TOAST(undefined, 'error');
        dispatch(setLoading(false));
      }
    };

export const resendLoginOtp =
  (email: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        API.API_ROUTES.resendLoginOtp,
        { email },
      );
      if (response?.status && response?.code === 200) {
        SHOW_TOAST(response?.data?.message || response?.message, 'success');
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      }
    } catch (e) {
      SHOW_TOAST(undefined, 'error');
      dispatch(setLoading(false));
    }
  };

export const changePassword =
  (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        API.API_ROUTES.changePassword,
        data,
      );

      if (response?.status && response?.code === 200) {
        SHOW_TOAST(response?.data?.message, 'success');
        dispatch(setLoading(false));
        NavigationService.goBack();
      } else {
        dispatch(setLoading(false));
        SHOW_TOAST(response?.data?.message, 'error');
      }
    } catch (e) {
      SHOW_TOAST('error');
      dispatch(setLoading(false));
    }
  };

export const resendForgotPasswordOtp =
  (email: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setLoading(true));
      const response: any = await API.Instance.post(
        API.API_ROUTES.forgotPassword,
        { email },
      );
      if (response?.status && response?.code === 200) {
        SHOW_TOAST(response?.data?.message || response?.message, 'success');
        dispatch(setLoading(false));
      } else {
        dispatch(setLoading(false));
        SHOW_TOAST(response?.data?.message || response?.message, 'error');
      }
    } catch (e) {
      SHOW_TOAST(undefined, 'error');
      dispatch(setLoading(false));
    }
  };

