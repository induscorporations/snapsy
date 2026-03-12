import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { colors, spacing, typography } from '@/constants/tokens';

const CONVEX_WAIT_MS = 6000; // If Convex doesn't respond, proceed anyway so app isn't stuck

export default function IndexScreen() {
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
  const [checking, setChecking] = useState(true);
  const userFace = useQuery(api.faces.getUserFace, 'skip');

  useEffect(() => {
    hydrateOnboarding();
  }, [hydrateOnboarding]);

  // If Convex never connects (e.g. wrong URL or backend down), don't block the app forever
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !onboardingHydrated || userByClerk !== undefined) return;
    const t = setTimeout(() => setConvexTimedOut(true), CONVEX_WAIT_MS);
    return () => clearTimeout(t);
  }, [isLoaded, isSignedIn, onboardingHydrated, userByClerk]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setChecking(false);
      router.replace('/(auth)/sign-in');
      return;
    }

    if (!clerkId) return;

    async function ensureUser() {
      try {
        const convexUserId = await getOrCreateUser({ clerkId });
        setConvexUserId(convexUserId as unknown as string);
      } catch {
        // Convex may be unavailable (e.g. WebSocket 404)
      }
    }
    ensureUser();
  }, [isLoaded, isSignedIn, clerkId, getOrCreateUser, setConvexUserId, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !onboardingHydrated) return;
    // Wait for Convex user query, or proceed after timeout so app isn't stuck
    if (userByClerk === undefined && !convexTimedOut) return;
    // Don't navigate to tabs until we have convexUserId (so Create Event works)
    if (!convexUserId && !convexTimedOut) return;

    if (!hasCompletedOnboarding) {
      setChecking(false);
      router.replace('/onboarding');
      return;
    }

    const hasFace = !!userFace;
    if (hasCompletedOnboarding && !hasFace) {
      setChecking(false);
      router.replace('/face-setup');
      return;
    }

    setChecking(false);
    router.replace('/(tabs)');
  }, [isLoaded, isSignedIn, onboardingHydrated, hasCompletedOnboarding, userByClerk, convexUserId, userFace, convexTimedOut, router]);

  if (!isLoaded || checking) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashLogo}>Snapsy</Text>
        <Text style={styles.splashTagline}>Every moment, perfectly yours.</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing[4] }} />
      </View>
    );
  }

  // Fallback in case nothing else matched (should be rare)
  return <View style={[styles.container, { backgroundColor: colors.darkBg }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primaryDeep,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  splashLogo: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size['4xl'],
    color: colors.primary,
    marginBottom: spacing[2],
  },
  splashTagline: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.lg,
    color: colors.white,
  },
});
