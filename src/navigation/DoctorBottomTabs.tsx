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
import HomeScreen from '../screens/doctor/home/HomeScreen';
import PatientsScreen from '../screens/doctor/patients/PatientsScreen';
import CreateRequest from '../screens/doctor/createRequest/createRequest';
import FormsScreen from '../screens/doctor/forms/FormsScreen';
import DoctorProfile from '../screens/doctor/profile/DoctorProfile';
import { IMAGES } from '../assets/images';
import { getScaleSize } from '../utils/scaleSize';
import { COLORS, FONTS } from '../utils';
import { AppText } from '../components';
import { DOCTOR_TAB_SCREENS } from './routes';

export type BottomTabParamList = {
  Home: undefined;
  Patients: undefined;
  CreateRequest: undefined;
  Forms: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const iconForRoute = (name: keyof BottomTabParamList) => {
  switch (name) {
    case DOCTOR_TAB_SCREENS.HOME:
      return IMAGES.tab_home;
    case DOCTOR_TAB_SCREENS.PATIENTS:
      return IMAGES.tab_patients;
    case DOCTOR_TAB_SCREENS.FORMS:
      return IMAGES.tab_request;
    case DOCTOR_TAB_SCREENS.PROFILE:
      return IMAGES.tab_profile;
    default:
      return '•';
  }
};

const DoctorBottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ 
        headerShown: false ,
        tabBarStyle:{
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name={DOCTOR_TAB_SCREENS.HOME} component={HomeScreen} />
      <Tab.Screen name={DOCTOR_TAB_SCREENS.PATIENTS} component={PatientsScreen} />
      <Tab.Screen name={DOCTOR_TAB_SCREENS.CREATE_REQUEST} component={CreateRequest} />
      <Tab.Screen name={DOCTOR_TAB_SCREENS.FORMS} component={FormsScreen} />
      <Tab.Screen name={DOCTOR_TAB_SCREENS.PROFILE} component={DoctorProfile} />
    </Tab.Navigator>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
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
            route.name === DOCTOR_TAB_SCREENS.FORMS
              ? 'Request'
              : descriptors[route.key]?.options?.tabBarLabel ?? route.name;
          const icon = iconForRoute(route.name as keyof BottomTabParamList);

          if (route.name === DOCTOR_TAB_SCREENS.CREATE_REQUEST) {
            return (
              <Pressable
                key={route.key}
                style={({ pressed }) => [
                  styles.fab,
                  pressed ? styles.plusBtnPressed : null,
                ]}
                onPress={() => navigation.navigate(DOCTOR_TAB_SCREENS.CREATE_REQUEST as never)}
              >
                <Image
                  source={IMAGES.new_request}
                  style={[styles.icon, { tintColor: COLORS.primary }]}
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
                {label as string}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default DoctorBottomTabs;

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
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
  fab: {
    // bottom: getScaleSize(20),
    width: getScaleSize(56),
    height: getScaleSize(56),
    borderRadius: getScaleSize(28),
    backgroundColor: '#E8EDF1',
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
});
