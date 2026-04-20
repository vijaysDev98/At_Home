import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

const LOGO_URI =
  'https://storage.googleapis.com/uxpilot-auth.appspot.com/b8dc346b0e-dacb1354ad85e642c274.png';
const LOGO_BG_URI =
  "https://storage.googleapis.com/uxpilot-auth.appspot.com/FwWoWvhFRtVXodtR5CK3BVPRcSP2%2F2f63fe4a-2524-441c-b0fb-47972806c27b.png";

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const pulse = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      const isLoggedIn = false; // replace with real auth state
      if (isLoggedIn) {
        navigation.replace('Home');
      } else {
        navigation.replace('Welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [fade, navigation, pulse]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulse }] }]}>
          <Animated.Image
            source={{ uri: LOGO_URI }}
            resizeMode="contain"
            style={[styles.logo, { opacity: fade }]}
          />
          <Image
            source={{ uri: LOGO_BG_URI }}
            resizeMode="cover"
            style={styles.logoBackground}
          />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: fade }]}>At-Home</Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: fade }]}>
          Healthcare Evolved
        </Animated.Text>
      </View>

      <View style={styles.homeIndicatorContainer}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    width: 192,
    height: 192,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#526674',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#52667499',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 5,
    backgroundColor: '#52667433',
    borderRadius: 999,
  },
});

export default SplashScreen;
