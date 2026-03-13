import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { colors, spacing, typography } from '@/constants/tokens';

const CONVEX_WAIT_MS = 6000;

function getEventIdFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = Linking.parse(url);
    const eventId = parsed.queryParams?.eventId ?? parsed.queryParams?.eventid;
    return typeof eventId === 'string' ? eventId : null;
  } catch {
    const match = url.match(/eventId=([^&]+)/i);
    return match ? match[1] : null;
  }
}

export default function SplashScreenRoute() {
  const router = useRouter();
  const { isSignedIn, isLoaded, userId: clerkId } = useAuth();
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const userByClerk = useQuery(
    api.users.getByClerkId,
    clerkId ? { clerkId } : 'skip'
  );
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const setConvexUserId = useAuthStore((s) => s.setConvexUserId);
  const hasCompletedOnboarding = useUIStore((s) => s.hasCompletedOnboarding);
  const onboardingHydrated = useUIStore((s) => s.onboardingHydrated);
  const hydrateOnboarding = useUIStore((s) => s.hydrateOnboarding);
  const [convexTimedOut, setConvexTimedOut] = useState(false);
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);
  const userFace = useQuery(api.faces.getUserFace, isLoaded && isSignedIn ? {} : 'skip');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = await Linking.getInitialURL();
      if (cancelled) return;
      const eventId = getEventIdFromUrl(url);
      if (eventId) {
        setDeepLinkHandled(true);
        router.replace({ pathname: '/join', params: { eventId } });
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !onboardingHydrated || userByClerk !== undefined) return;
    const t = setTimeout(() => setConvexTimedOut(true), CONVEX_WAIT_MS);
    return () => clearTimeout(t);
  }, [isLoaded, isSignedIn, onboardingHydrated, userByClerk]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (!clerkId) return;
    (async () => {
      try {
        const id = await getOrCreateUser({ clerkId });
        setConvexUserId(id as unknown as string);
      } catch {}
    })();
  }, [isLoaded, isSignedIn, clerkId, getOrCreateUser, setConvexUserId, router]);

  useEffect(() => {
    if (deepLinkHandled) return;
    if (!isLoaded || !isSignedIn || !onboardingHydrated) return;
    if (userByClerk === undefined && !convexTimedOut) return;
    if (!convexUserId && !convexTimedOut) return;
    if (!hasCompletedOnboarding) {
      router.replace('/onboarding');
      return;
    }
    const hasFace = !!userFace;
    if (hasCompletedOnboarding && !hasFace) {
      router.replace('/face-setup');
      return;
    }
    router.replace('/(tabs)');
  }, [deepLinkHandled, isLoaded, isSignedIn, onboardingHydrated, hasCompletedOnboarding, userByClerk, convexUserId, userFace, convexTimedOut, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Snapsy</Text>
      <Text style={styles.tagline}>Every moment, perfectly yours.</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  logo: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size['4xl'],
    color: colors.primary,
    marginBottom: spacing[2],
  },
  tagline: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.lg,
    color: colors.grey400,
  },
  loader: {
    marginTop: spacing[6],
  },
});
