const API_BASE_URL = 
// 'https://at-home-api-prod.prometteur.in/';
 'http://163.227.92.122:3047/';

export const IMAGE_BASE_URL = 
// 'https://at-home-api-prod.prometteur.in/';
'http://163.227.92.122:3047/';

export const PRIVACY_POLICY_URL =
  'https://doubtful-olive-hvnl1qwe9z.edgeone.app/';
export const PRIVACY_POLICY_URL_FR =
  'https://artistic-aqua-vhsehjxx.edgeone.app/';
export const TERMS_OF_SERVICE_URL =
  'https://stirring-griffin-0c1a24.netlify.app/';
export const TERMS_OF_SERVICE_URL_FR =
  'https://intermediate-amethyst-df9wpkwi.edgeone.app/';

export const getPrivacyPolicy = (lang: string) => {
  if (lang === 'en') {
    return PRIVACY_POLICY_URL;
  } else {
    return PRIVACY_POLICY_URL_FR;
  }
};

export const getTermsOfService = (lang: string) => {
  if (lang === 'en') {
    return TERMS_OF_SERVICE_URL;
  } else {
    return TERMS_OF_SERVICE_URL_FR;
  }
};

const DISABLE_API_LOGS = false;

const API_ROUTES = {
  login: 'auth/login',
  register: 'auth/register',
  getRefreshToken: 'auth/refresh',
  verifyLoginOtp: 'auth/verifyLoginOtp',
  logout: 'auth/logout',
  forgotPassword: 'auth/forgotPassword',
  verifyForgotPasswordOTP: 'auth/verifyForgotPasswordOTP',
  resetPassword: 'auth/resetPassword',
  getProfile: 'user/profile',
  updateProfile: 'user/profile',
  changePassword: 'user/changePassword',
  deleteAccount: 'user/delete',
  uploadFile: 'common/file/upload',
  getPresignedUrl: 'common/file/getPresignedUrl',
  addPatient: 'patients',
  getPatients: 'patients',
  getPatientDetails: 'patients',
  getServices: 'services',
  createServiceRequest: 'service-requests',
  getServiceRequests: 'service-requests',
  getServiceRequestDetails: 'service-requests',
  updateServiceRequest: 'service-requests',
  listServiceRequests: 'service-requests',
  listAvailableRequests: 'service-requests/available',
  listProviderInitiatedRequests: 'service-requests/provider/initiated',
  resendLoginOtp: 'auth/resendLoginOtp',
  notifications: 'notifications',
  updateFcm: 'auth/update-fcm',
  getDoctors: 'providers/doctors',
  getProviders: 'doctors/providers',
};

export { API_ROUTES, API_BASE_URL, DISABLE_API_LOGS };
