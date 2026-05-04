import React from 'react';
import {
  NavigationContainer,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/Login';
import WelcomeScreen from '../screens/auth/AuthWelcome';
import RegisterScreen from '../screens/auth/Register';
import RegisterSuccess from '../screens/auth/RegisterSuccess';
import ForgotPassword from '../screens/auth/ForgotPassword';
import OtpVerification from '../screens/auth/OtpVerification';
import ResetPassword from '../screens/auth/ResetPassword';
import SplashScreen from '../screens/SplashScreen';
import BottomTabs, { BottomTabParamList } from './DoctorBottomTabs';
import SignatureForm from '../screens/doctor/forms/SignatureForm';
import DoctorNotification from '../screens/doctor/notifications/DoctorNotification';
import CreateRequest from '../screens/doctor/createRequest/createRequest';
import CreateRequestStep2 from '../screens/doctor/createRequest/createRequestStep2';
import CreateRequestStep3 from '../screens/doctor/createRequest/createRequestStep3';
import AddPatient from '../screens/doctor/patients/AddPatient';
import PatientDetail from '../screens/doctor/patients/PatientDetail';
import ProviderBottomTabs, {
  ProviderBottomTabParamList,
} from './ProviderBottomTabs';
import ProviderAvailableRequests from '../screens/provider/request/AvailableRequest';
import ProviderForm from '../screens/provider/forms/ProviderForm';
import ServiceScreen from '../screens/provider/forms/Service';
import ServiceCompletedScreen from '../screens/provider/forms/ServiceCompleted';
import NavigationService from './NavigationService';
import { SCREENS } from './routes';
import FormsScreen from '../screens/doctor/forms/FormsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  RegisterSuccess: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email?: string } | undefined;
  ResetPassword: undefined;
  DoctorNotification: undefined;
  CreateRequest: undefined;
  CreateRequestStep2: undefined;
  CreateRequestStep3: undefined;
  FORMS_SCREEN: undefined;
  DoctorBottomTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  ProviderBottomTabs:
    | NavigatorScreenParams<ProviderBottomTabParamList>
    | undefined;
  ProviderAvailableRequests: undefined;
  AddPatient: undefined;
  PatientDetail: undefined;
  SignatureForm: undefined;
  ProviderForm: {
    mode: 'view' | 'update';
    requestStatus: string;
    formStatus: string;
  };
  ServiceScreen: {
    requestStatus?: string;
    formStatus?: string;
    patientName?: string;
    service?: string;
    requestId?: string;
  };
  ServiceCompleted: {
    patientName?: string;
    requestId?: string;
    serviceType?: string;
    duration?: string;
    doctorName?: string;
    completedDate?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <NavigationContainer
      ref={navigationRef => {
        NavigationService.setTopLevelNavigator(navigationRef);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={SCREENS.SPLASH}
      >
        <Stack.Screen
          name={SCREENS.SPLASH}
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.WELCOME}
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.LOGIN}
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.REGISTER}
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.REGISTER_SUCCESS}
          component={RegisterSuccess}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.FORGOT_PASSWORD}
          component={ForgotPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.OTP_VERIFICATION}
          component={OtpVerification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.RESET_PASSWORD}
          component={ResetPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.DOCTOR_NOTIFICATION}
          component={DoctorNotification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.CREATE_REQUEST}
          component={CreateRequest}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.FORMS_SCREEN}
          component={FormsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.CREATE_REQUEST_STEP2}
          component={CreateRequestStep2}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.CREATE_REQUEST_STEP3}
          component={CreateRequestStep3}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.DOCTOR_BOTTOM_TABS}
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.PROVIDER_BOTTOM_TABS}
          component={ProviderBottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.PROVIDER_AVAILABLE_REQUESTS}
          component={ProviderAvailableRequests}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.ADD_PATIENT}
          component={AddPatient}
          // options={{ title: 'Add Patient' }}
        />
        <Stack.Screen
          name={SCREENS.PATIENT_DETAIL}
          component={PatientDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={SCREENS.SIGNATURE_FORM}
          component={SignatureForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProviderForm"
          component={ProviderForm}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceScreen"
          component={ServiceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ServiceCompleted"
          component={ServiceCompletedScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
