import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils';
import ProviderHome from '../screens/provider/home/providerhome';
import FormsScreen from '../screens/doctor/forms/FormsScreen';
import ProviderNotification from '../screens/provider/notification/ProviderNotification';
import ProviderProfile from '../screens/provider/profile/profile';

export type ProviderBottomTabParamList = {
  Home: undefined;
  Forms: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ProviderBottomTabParamList>();

const iconForRoute = (name: keyof ProviderBottomTabParamList) => {
  switch (name) {
    case 'Home':
      return '🏠';
    case 'Forms':
      return '📄';
    case 'Alerts':
      return '🔔';
    case 'Profile':
      return '👤';
    default:
      return '•';
  }
};

const ProviderBottomTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={ProviderHome} />
      <Tab.Screen name="Forms" component={FormsScreen} />
      <Tab.Screen name="Alerts" component={ProviderNotification} />
      <Tab.Screen name="Profile" component={ProviderProfile} />
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
          const icon = iconForRoute(route.name as keyof ProviderBottomTabParamList);

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

export default ProviderBottomTabs;

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: COLORS.white,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: COLORS.white,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconText: {
    fontSize: 19,
    color: COLORS.slate400,
  },
  iconTextActive: {
    color: COLORS.primary,
  },
  label: {
    fontSize: 12,
    color: COLORS.slate500,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.primary,
  },
  fab: {
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBtnPressed: {
    opacity: 0.85,
  },
  plusIcon: {
    fontSize: 26,
    color: COLORS.white,
  },
});
