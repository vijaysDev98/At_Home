import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import HomeScreen from '../screens/doctor/home/HomeScreen';
import PatientsScreen from '../screens/doctor/patients/PatientsScreen';
import CreateRequest from '../screens/doctor/createRequest/createRequest';
import FormsScreen from '../screens/doctor/forms/FormsScreen';
import DoctorProfile from '../screens/doctor/profile/DoctorProfile';

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
      return '🏠';
    case 'Patients':
      return '🧑‍⚕️';
    case 'Forms':
      return '📄';
    case 'Profile':
      return '👤';
    default:
      return '•';
  }
};

const DoctorBottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Patients" component={PatientsScreen} />
      <Tab.Screen name="CreateRequest" component={CreateRequest} />
      <Tab.Screen name="Forms" component={FormsScreen} />
      <Tab.Screen name="Profile" component={DoctorProfile} />
    </Tab.Navigator>
  );
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      edges={['bottom']}
      style={styles.barContainer}
    >
      <View style={[styles.bar, { paddingBottom: (insets.bottom || 10) + 6 }]}>
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

          const label = descriptors[route.key]?.options?.tabBarLabel ?? route.name;
          const icon = iconForRoute(route.name as keyof BottomTabParamList);

          if (route.name === 'CreateRequest') {
            return (
              <Pressable
                key={route.key}
                style={({ pressed }) => [styles.fab, pressed ? styles.plusBtnPressed : null]}
                onPress={() => navigation.navigate('CreateRequest' as never)}
              >
                <Text style={styles.plusIcon}>＋</Text>
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
              <Text style={[styles.iconText, isFocused ? styles.iconTextActive : null]}>{icon}</Text>
              <Text style={[styles.label, isFocused ? styles.labelActive : null]}>{label as string}</Text>
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
    backgroundColor: '#ffffff',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    // borderTopWidth: 1,
    // borderTopColor: '#e7e7e7',
    // shadowColor: '#000',
    // shadowOpacity: 0.04,
    // shadowRadius: 6,
    // // elevation: 2,
  },
  tab: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconText: {
    fontSize: 19,
    color: '#9ca3af',
  },
  iconTextActive: {
    color: '#526674',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  labelActive: {
    color: '#526674',
  },
  fab: {
    // position: 'absolute',
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#526674',
    alignItems: 'center',
    justifyContent: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.12,
    // shadowRadius: 10,
    // elevation: 10,
    // borderWidth: 6,
    // borderColor: '#ffffff',
    // top: -12,
  },
  plusBtnPressed: {
    opacity: 0.85,
  },
  plusIcon: {
    fontSize: 26,
    color: '#fff',
  },
});
