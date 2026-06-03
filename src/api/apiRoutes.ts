const API_BASE_URL = 'http://163.227.92.122:3047/';

export const IMAGE_BASE_URL = 'http://163.227.92.122:3047/';

export const PRIVACY_POLICY_URL = 'https://doubtful-olive-hvnl1qwe9z.edgeone.app/';
export const TERMS_OF_SERVICE_URL = 'https://stirring-griffin-0c1a24.netlify.app/';

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
  uploadFile: 'common/file/upload',
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
  resendLoginOtp: 'auth/resendLoginOtp',
  notifications: 'notifications',
  updateFcm: 'auth/update-fcm'
};

export { API_ROUTES, API_BASE_URL, DISABLE_API_LOGS };
