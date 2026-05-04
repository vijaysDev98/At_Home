export const SCREENS = {
  SPLASH: 'Splash',
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',
  REGISTER_SUCCESS: 'RegisterSuccess',
  FORGOT_PASSWORD: 'ForgotPassword',
  OTP_VERIFICATION: 'OtpVerification',
  RESET_PASSWORD: 'ResetPassword',
  DOCTOR_NOTIFICATION: 'DoctorNotification',
  CREATE_REQUEST: 'CreateRequest',
  CREATE_REQUEST_STEP2: 'CreateRequestStep2',
  CREATE_REQUEST_STEP3: 'CreateRequestStep3',
  DOCTOR_BOTTOM_TABS: 'DoctorBottomTabs',
  PROVIDER_BOTTOM_TABS: 'ProviderBottomTabs',
  PROVIDER_AVAILABLE_REQUESTS: 'ProviderAvailableRequests',
  ADD_PATIENT: 'AddPatient',
  PATIENT_DETAIL: 'PatientDetail',
  SIGNATURE_FORM: 'SignatureForm',
  PROVIDER_FORM: 'ProviderForm',
  SERVICE_COMPLETED: 'ServiceCompleted',
  SERVICE_SCREEN: 'ServiceScreen',
} as const;

// Doctor Bottom Tab Screen Names
export const DOCTOR_TAB_SCREENS = {
  HOME: 'Home',
  PATIENTS: 'Patients',
  CREATE_REQUEST: 'CreateRequest',
  FORMS: 'Forms',
  PROFILE: 'Profile',
} as const;

// Provider Bottom Tab Screen Names
export const PROVIDER_TAB_SCREENS = {
  HOME: 'Home',
  FORMS: 'Forms',
  ALERTS: 'Alerts',
  PROFILE: 'Profile',
} as const;
