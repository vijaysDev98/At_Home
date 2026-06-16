import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../utils';
import { DOCTOR_TAB_SCREENS, PROVIDER_TAB_SCREENS } from './routes';
import ProviderHome from '../screens/provider/home/providerhome';
import FormsScreen from '../screens/doctor/forms/FormsScreen';
import ProviderNotification from '../screens/provider/notification/ProviderNotification';
import ProviderProfile from '../screens/provider/profile/providerProfile';
import { IMAGES } from '../assets/images';
import { AppText } from '../components';
import { getScaleSize } from '../utils/scaleSize';
import AvailableRequest from '../screens/provider/request/AvailableRequest';
import { useTranslation } from 'react-i18next';
import { STRING } from '../constant';
import CreateRequest from '../screens/doctor/createRequest/createRequest';
import PatientsScreen from '../screens/doctor/patients/PatientsScreen';

export type ProviderBottomTabParamList = {
  Home: undefined;
  Requests: undefined;
  Patients: undefined;
  CreateRequest: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ProviderBottomTabParamList>();

const iconForRoute = (name: keyof ProviderBottomTabParamList) => {
  switch (name) {
    case PROVIDER_TAB_SCREENS.HOME:
      return IMAGES.tab_home;
    case DOCTOR_TAB_SCREENS.PATIENTS:
      return IMAGES.tab_patients;
    case PROVIDER_TAB_SCREENS.REQUESTS:
      return IMAGES.tab_requests2;
    case PROVIDER_TAB_SCREENS.ALERTS:
      return IMAGES.ic_notification_filled;
    case PROVIDER_TAB_SCREENS.PROFILE:
      return IMAGES.tab_profile;
    default:
      return IMAGES.tab_home;
  }
};

const ProviderBottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name={PROVIDER_TAB_SCREENS.HOME} component={ProviderHome} />

      <Tab.Screen
        name={DOCTOR_TAB_SCREENS.PATIENTS}
        component={PatientsScreen}
      />
      <Tab.Screen
        name={DOCTOR_TAB_SCREENS.CREATE_REQUEST}
        component={CreateRequest}
      />
      {/* <Tab.Screen
        name={PROVIDER_TAB_SCREENS.ALERTS}
        component={ProviderNotification}
      /> */}
      <Tab.Screen
        name={PROVIDER_TAB_SCREENS.REQUESTS}
        component={AvailableRequest}
      />
      <Tab.Screen
        name={PROVIDER_TAB_SCREENS.PROFILE}
        component={ProviderProfile}
      />
    </Tab.Navigator>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['bottom']} style={styles.barContainer}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label =
            route.name === 'Forms'
              ? 'Request'
              : descriptors[route.key]?.options?.tabBarLabel ?? route.name;
          const icon = iconForRoute(
            route.name as keyof ProviderBottomTabParamList,
          );

          if (route.name === DOCTOR_TAB_SCREENS.CREATE_REQUEST) {
            return (
              <Pressable
                key={route.key}
                style={({ pressed }) => [
                  styles.fab,
                  pressed ? styles.plusBtnPressed : null,
                  {
                    backgroundColor: isFocused
                      ? COLORS.primary
                      : COLORS._E8EDF1,
                  },
                ]}
                onPress={() =>
                  navigation.navigate(
                    DOCTOR_TAB_SCREENS.CREATE_REQUEST as never,
                  )
                }
              >
                <Image
                  source={IMAGES.new_request}
                  style={[
                    styles.icon,
                    { tintColor: isFocused ? COLORS.white : COLORS.primary },
                  ]}
                />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              onPress={onPress}
              style={styles.tab}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused ? styles.iconContainerActive : null,
                ]}
              >
                <Image
                  source={icon}
                  style={[
                    styles.icon,
                    { tintColor: isFocused ? COLORS._526674 : COLORS._6F767E },
                  ]}
                />
              </View>
              <AppText
                size={getScaleSize(11)}
                font={isFocused ? FONTS.Inter.Bold : FONTS.Inter.Medium}
                color={isFocused ? COLORS._526674 : COLORS._6F767E}
              >
                {t(label as string)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default ProviderBottomTabs;

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS._EFEFEF,
  },
  icon: {
    width: getScaleSize(32),
    height: getScaleSize(27),
    resizeMode: 'contain',
  },
  iconContainer: {
    width: getScaleSize(44),
    height: getScaleSize(44),
    borderRadius: getScaleSize(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getScaleSize(4),
    overflow: 'hidden',
  },
  fab: {
    width: getScaleSize(56),
    height: getScaleSize(56),
    borderRadius: getScaleSize(28),
    backgroundColor: COLORS._E8EDF1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    bottom: getScaleSize(8),
  },
  plusBtnPressed: {
    opacity: 0.85,
  },
  iconContainerActive: {
    backgroundColor: '#E8EDF1',
    borderRadius: getScaleSize(22),
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: getScaleSize(12),
    paddingTop: getScaleSize(12),
    backgroundColor: COLORS.white,
    paddingBottom: getScaleSize(5),
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
