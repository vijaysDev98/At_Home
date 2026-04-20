import React from 'react';
import { NavigationContainer, NavigatorScreenParams } from '@react-navigation/native';
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
import ProviderBottomTabs, { ProviderBottomTabParamList } from './ProviderBottomTabs';
import ProviderAvailableRequests from '../screens/provider/home/AvailableRequest';
import NavigationService from './NavigationService';

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
  DoctorBottomTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  ProviderBottomTabs: NavigatorScreenParams<ProviderBottomTabParamList> | undefined;
  ProviderAvailableRequests: undefined;
  AddPatient: undefined;
  PatientDetail: undefined;
  SignatureForm: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  return (
    <NavigationContainer
     ref={(navigationRef) => {
        NavigationService.setTopLevelNavigator(navigationRef);
      }}
    >
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RegisterSuccess"
          component={RegisterSuccess}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OtpVerification"
          component={OtpVerification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPassword}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorNotification"
          component={DoctorNotification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateRequest"
          component={CreateRequest}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateRequestStep2"
          component={CreateRequestStep2}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateRequestStep3"
          component={CreateRequestStep3}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorBottomTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProviderBottomTabs"
          component={ProviderBottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProviderAvailableRequests"
          component={ProviderAvailableRequests}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddPatient"
          component={AddPatient}
          options={{ title: 'Add Patient' }}
        />
        <Stack.Screen
          name="PatientDetail"
          component={PatientDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignatureForm"
          component={SignatureForm}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
