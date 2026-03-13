import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff } from 'lucide-react-native';
import 'react-native-reanimated';
import 'expo-standard-web-crypto';

import { getClerkPublishableKey, getConvexUrl } from '@/lib/env';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { colors, typography } from '@/constants/tokens';
import { GlobalErrorToast } from '@/components/global-error-toast';

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

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function prepare() {
      // Load Plus Jakarta Sans font family from /Fonts (see tokens.ts)
      await Font.loadAsync({
        'PlusJakartaSans-Light': require('../Fonts/PlusJakartaSans-Light.ttf'),
        'PlusJakartaSans-Regular': require('../Fonts/PlusJakartaSans-Regular.ttf'),
        'PlusJakartaSans-Medium': require('../Fonts/PlusJakartaSans-Medium.ttf'),
        'PlusJakartaSans-SemiBold': require('../Fonts/PlusJakartaSans-SemiBold.ttf'),
        'PlusJakartaSans-Bold': require('../Fonts/PlusJakartaSans-Bold.ttf'),
        'PlusJakartaSans-ExtraBold': require('../Fonts/PlusJakartaSans-ExtraBold.ttf'),
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

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { eventId?: string; screen?: string };
      const eventId = data?.eventId;
      if (eventId && typeof eventId === 'string') {
        router.push(`/event/${eventId}`);
      }
    });
    return () => sub.remove();
  }, []);

  if (!appReady) {
    return null;
  }

  const clerkKey = getClerkPublishableKey();
  if (!clerkKey) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {!isConnected && (
          <View
            style={{
              position: 'absolute',
              top: insets.top,
              left: 0,
              right: 0,
              zIndex: 999,
              backgroundColor: colors.grey800,
              paddingVertical: 8,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <WifiOff size={14} color={colors.white} strokeWidth={1.75} />
            <Text
              style={{
                color: colors.white,
                fontSize: typography.size.sm,
                fontFamily: typography.fontFamily.medium,
              }}
            >
              No internet connection
            </Text>
          </View>
        )}
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
            {!isConnected && (
              <View
                style={{
                  position: 'absolute',
                  top: insets.top,
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  backgroundColor: colors.grey800,
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <WifiOff size={14} color={colors.white} strokeWidth={1.75} />
                <Text
                  style={{
                    color: colors.white,
                    fontSize: typography.size.sm,
                    fontFamily: typography.fontFamily.medium,
                  }}
                >
                  No internet connection
                </Text>
              </View>
            )}
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
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="face-setup" options={{ headerShown: false }} />
            <Stack.Screen name="no-face" options={{ headerShown: false }} />
          </Stack>
            <GlobalErrorToast />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
