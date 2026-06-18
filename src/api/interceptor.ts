import axios, { AxiosResponse } from 'axios';

// CONSTANTS
import { SHOW_TOAST, Storage, STRING } from '../constant';
import { API_BASE_URL, DISABLE_API_LOGS } from './apiRoutes';

// PACKAGES
import NetInfo from '@react-native-community/netinfo';
import store from '../redux/store';
import { isTokenExpire, refreshAccessToken } from './token';
import { getLanguageParam } from '../utils/languageHelper';
import { userLogout } from '../actions/auth/authAction';
import { resetAuth } from '../actions/auth/authSlice';
import { resetProfile } from '../actions/profile/profileSlice';
import { resetPatient } from '../actions/patient/patientSlice';
import { resetCommon } from '../actions/common/commonSlice';
import { resetLanguage } from '../actions/language/languageSlice';
import NavigationService from '../navigation/NavigationService';
import { SCREENS } from '../navigation/routes';
import i18next from 'i18next';

let hasShownNoInternetAlert = false;
let isHandlingTokenExpiration = false;

// Helper function to handle token expiration and logout
const handleTokenExpiration = async () => {
  // Prevent infinite loops
  if (isHandlingTokenExpiration) {
    console.log('Token expiration already being handled, skipping...');
    return;
  }

  isHandlingTokenExpiration = true;

  try {
    // Show toast message to user
    SHOW_TOAST(i18next.t(STRING.sessionExpired), 'error');
    // Direct logout without API call to avoid loop
    await Storage.clear();

    // Dispatch logout actions to clear Redux state
    store.dispatch({ type: 'USER_LOGOUT' });
    store.dispatch(resetAuth());
    store.dispatch(resetProfile());
    store.dispatch(resetPatient());
    store.dispatch(resetCommon());
    // store.dispatch(resetLanguage());

    // Navigate to welcome screen
    NavigationService.reset(SCREENS.WELCOME);
  } catch (error) {
    console.log('Error handling token expiration:', error);
    // Fallback: clear storage and navigate to welcome
    await Storage.clear();
    NavigationService.reset(SCREENS.WELCOME);
  } finally {
    isHandlingTokenExpiration = false;
  }
};

export const Instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    // api_key: '9f2e4a7d2b6c4f1e8d3a5c7f0b9e6d1c3a2f8b4c6d7e9f0a1b2c3d4e5f6a7b8',
    // api_secrete: 'c7a8e1f3d5b2a9c6f4e7b1d2c8a3f5b0d6e9c2a1f7b4d3e8c5f0a9b7c6d3e2f1'
  },
});

Instance.interceptors.request.use(
  async config => {
    const netState = await NetInfo.fetch();

    // if (!netState.isConnected) {
    //     // ✅ Show Alert Only Once
    //     if (!hasShownNoInternetAlert) {
    //         // hasShownNoInternetAlert = true;
    //         // Alert.alert('No Internet', 'Please check your internet connection.');
    //     }

    //     return Promise.reject({
    //         message: 'No internet connection',
    //         code: 503,
    //         status: false,
    //         data: null
    //     });
    // } else {
    //     // 🔄 Reset once internet is back
    //     if (hasShownNoInternetAlert) {
    //         hasShownNoInternetAlert = false;
    //     }
    // }
    if (!DISABLE_API_LOGS) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        headers: config.headers,
        data: config.data || undefined,
        params: config.params,
      });
    }

    const NO_AUTH_URLS = ['auth/resetPassword'];
    const isNoAuthUrl = NO_AUTH_URLS.some(url => config.url?.includes(url));

    if (!config.headers.Authorization && !isNoAuthUrl) {
      const accessToken = await Storage.get(Storage.USER_TOKEN);
      const refreshToken = await Storage.get(Storage.REFRESH_TOKEN);
      if (accessToken) {
        const isExpired = isTokenExpire(accessToken);
        if (isExpired && refreshToken) {
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            config.headers.Authorization = 'Bearer ' + `${newAccessToken}`;
          } else {
            // Token refresh failed, handle expiration
            await handleTokenExpiration();
            return Promise.reject({
              message: 'Session expired. Please log in again.',
              code: 401,
              data: null,
              status: false,
            });
          }
        } else if (isExpired && !refreshToken) {
          // No refresh token available, handle expiration
          await handleTokenExpiration();
          return Promise.reject({
            message: 'Session expired. Please log in again.',
            code: 401,
            data: null,
            status: false,
          });
        } else {
          config.headers.Authorization = 'Bearer ' + `${accessToken}`;
        }
      }
    }

    // Add language parameter to all requests
    const currentLanguage = getLanguageParam();
    if (config.params) {
      config.params.lang = currentLanguage;
    } else {
      config.params = { lang: currentLanguage };
    }

    return config;
  },
  error => {
    if (!DISABLE_API_LOGS) {
      console.log(`Config Error ${error}`);
      console.log(`Config Error Status ${error?.response?.status}`);
      console.log(`Config Error Header ${error?.response?.config?.headers}`);
      console.log(`Config Error Base URL ${error?.response?.config?.baseURL}`);
      console.log(`Config Error Data ${error?.response?.config?.data}`);
      console.log(`Config Error Details ${error?.response?.data}`);
    }

    return {
      message:
        error?.response?.data?.message ??
        error?.message ??
        'Something went wrong',
      code: error?.response?.status,
      data: error?.response?.data ?? null,
      status: false,
    };
  },
);

const responseValidator = (response: AxiosResponse<any, any>) => {
  if (!DISABLE_API_LOGS) {
    console.log(`Response Status ${response?.status}`);
    console.log(`Response Config Header ${response?.config?.headers}`);
    console.log(`Response Config Base URL ${response?.config?.baseURL}`);
    console.log(`Response Config Data ${response?.config?.data}`);
    console.log(`Response Details ${response?.data}`);
  }
  const res: any = {
    status: true,
    code: response?.status,
    data: response?.data,
  };
  return res;
};

const errorValidator = async (error: any) => {
  if (!DISABLE_API_LOGS) {
    console.log(`Error ${error}`);
    console.log(`Error Status ${error?.response?.status}`);
    console.log(`Error Config Header ${error?.response?.config?.headers}`);
    console.log(`Error Config Base URL ${error?.response?.config?.baseURL}`);
    console.log(`Error Config Data ${error?.response?.config?.data}`);
    console.log(`Error Details ${error?.response?.data}`);
  }
  if (error?.response?.status == 401) {
    console.log('401 Unauthorized - token expired or invalid', error);
    // Handle 401 Unauthorized - token expired or invalid
    await handleTokenExpiration();
    // Return a specific error to indicate logout happened
    return {
      error: error,
      message: 'Session expired. Please log in again.',
      code: 401,
      data: null,
      status: false,
      loggedOut: true,
    };
  }

  if (error?.message === 'canceled') {
    return {
      error: error,
      message: 'Request canceled',
      code: 408,
      data: null,
      status: false,
    };
  }

  return {
    error: error,
    code: error?.response?.status,
    message:
      error?.response?.data?.message ??
      error?.message,
    data: error?.response?.data ?? {},
    status: false,
  };
};

Instance.interceptors.response.use(responseValidator, errorValidator);

