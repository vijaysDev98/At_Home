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
    case 'Home':
      return IMAGES.tab_home;
    case 'Patients':
      return IMAGES.tab_patients;
    case 'Forms':
      return IMAGES.tab_request;
    case 'Profile':
      return IMAGES.tab_profile;
    default:
      return '•';
  }
};

const DoctorBottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Patients" component={PatientsScreen} />
      <Tab.Screen name="CreateRequest" component={CreateRequest} />
      <Tab.Screen name="Forms" component={FormsScreen} />
      <Tab.Screen name="Profile" component={DoctorProfile} />
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
            route.name === 'Forms'
              ? 'Request'
              : descriptors[route.key]?.options?.tabBarLabel ?? route.name;
          const icon = iconForRoute(route.name as keyof BottomTabParamList);

          if (route.name === 'CreateRequest') {
            return (
              <Pressable
                key={route.key}
                style={({ pressed }) => [
                  styles.fab,
                  pressed ? styles.plusBtnPressed : null,
                ]}
                onPress={() => navigation.navigate('CreateRequest' as never)}
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
    borderRadius: getScaleSize(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getScaleSize(4),
  },
  iconContainerActive: {
    backgroundColor: '#E8EDF1',
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
  },
  plusBtnPressed: {
    opacity: 0.85,
  },
});
