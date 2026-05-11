const API_BASE_URL = 'http://163.227.92.122:3047/';

export const IMAGE_BASE_URL = 'http://163.227.92.122:3047/';

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
};

export { API_ROUTES, API_BASE_URL, DISABLE_API_LOGS };
