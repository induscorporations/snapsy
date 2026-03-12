import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'expo-standard-web-crypto';

import { getClerkPublishableKey, getConvexUrl } from '@/lib/env';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(getConvexUrl());

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {}
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Satoshi (PRD) – loaded from Fonts/WEB/fonts/
      await Font.loadAsync({
        'Satoshi-Light': require('../Fonts/WEB/fonts/Satoshi-Light.ttf'),
        'Satoshi-Regular': require('../Fonts/WEB/fonts/Satoshi-Regular.ttf'),
        'Satoshi-Medium': require('../Fonts/WEB/fonts/Satoshi-Medium.ttf'),
        'Satoshi-Bold': require('../Fonts/WEB/fonts/Satoshi-Bold.ttf'),
      });
      setFontsLoaded(true);
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!appReady) {
    return null;
  }

  const clerkKey = getClerkPublishableKey();
  if (!clerkKey) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
            screenOptions={{
              contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="my-photos" options={{ headerShown: false }} />
            <Stack.Screen name="join" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
