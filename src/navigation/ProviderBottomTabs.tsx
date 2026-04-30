import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../utils';
import { PROVIDER_TAB_SCREENS } from './routes';
import ProviderHome from '../screens/provider/home/providerhome';
import FormsScreen from '../screens/doctor/forms/FormsScreen';
import ProviderNotification from '../screens/provider/notification/ProviderNotification';
import ProviderProfile from '../screens/provider/profile/profile';
import { IMAGES } from '../assets/images';
import { AppText } from '../components';
import { getScaleSize } from '../utils/scaleSize';

export type ProviderBottomTabParamList = {
  Home: undefined;
  Forms: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ProviderBottomTabParamList>();

const iconForRoute = (name: keyof ProviderBottomTabParamList) => {
  switch (name) {
    case PROVIDER_TAB_SCREENS.HOME:
     return IMAGES.tab_home;
    case PROVIDER_TAB_SCREENS.FORMS:
       return IMAGES.tab_request;
    case PROVIDER_TAB_SCREENS.ALERTS:
      return IMAGES.notification_icon;
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
      <Tab.Screen name={PROVIDER_TAB_SCREENS.FORMS} component={FormsScreen} />
      <Tab.Screen name={PROVIDER_TAB_SCREENS.ALERTS} component={ProviderNotification} />
      <Tab.Screen name={PROVIDER_TAB_SCREENS.PROFILE} component={ProviderProfile} />
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
          const icon = iconForRoute(
            route.name as keyof ProviderBottomTabParamList,
          );

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

export default ProviderBottomTabs;

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
});
