import "../global.css";
import { useColorScheme } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../utils/cache';
import { AppState, AppStateStatus } from 'react-native';
import { getAppLockSettings, AppLockSettings } from '../utils/lock-utils';
import LockOverlay from '../components/LockOverlay';
import * as SecureStore from 'expo-secure-store';


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (isSignedIn && !inTabsGroup) {
      router.replace('/(tabs)' as any);
    } else if (!isSignedIn) {
      router.replace('/(auth)/sign-in' as any);
    }
  }, [isSignedIn, isLoaded]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: true }} />
      <Stack.Screen name="new-group" options={{ headerShown: false }} />
      <Stack.Screen name="group-details" options={{ headerShown: false }} />
      <Stack.Screen name="group-info/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="oauth-callback" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="app-lock" options={{ headerShown: false }} />
      <Stack.Screen name="blocked-contacts" options={{ headerShown: false }} />
      <Stack.Screen name="select-contact" options={{ headerShown: false }} />
      <Stack.Screen name="reported-contacts" options={{ headerShown: false }} />
      <Stack.Screen name="status-privacy" options={{ headerShown: false }} />
      <Stack.Screen name="status-viewer/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="create-status" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const colorScheme = useColorScheme();

  const [lockVisible, setLockVisible] = useState(false);
  const [lockSettings, setLockSettings] = useState<AppLockSettings | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      checkInitialLock();
    }
  }, [loaded]);

  const checkInitialLock = async () => {
    const settings = await getAppLockSettings();
    setLockSettings(settings);
    if (settings.isEnabled) {
      setLockVisible(true);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [lockSettings]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      const settings = await getAppLockSettings();
      setLockSettings(settings);

      if (settings.isEnabled) {
        const lastActive = await SecureStore.getItemAsync('last_active_time');
        if (lastActive) {
          const lastActiveTime = parseInt(lastActive);
          const now = Date.now();
          const diffMinutes = (now - lastActiveTime) / 1000 / 60;

          let shouldLock = false;
          if (settings.lockTime === 'immediately') shouldLock = true;
          else if (settings.lockTime === '1min' && diffMinutes >= 1) shouldLock = true;
          else if (settings.lockTime === '30min' && diffMinutes >= 30) shouldLock = true;

          if (shouldLock) {
            setLockVisible(true);
          }
        } else {
          setLockVisible(true);
        }
      }
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      await SecureStore.setItemAsync('last_active_time', Date.now().toString());
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SafeAreaProvider>
            <InitialLayout />
            {lockVisible && lockSettings && (
              <LockOverlay
                settings={lockSettings}
                onUnlock={() => setLockVisible(false)}
              />
            )}
          </SafeAreaProvider>
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

