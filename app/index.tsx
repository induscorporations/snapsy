import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { Colors } from '@/constants/theme';

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
      router.replace('/onboarding');
      return;
    }

    router.replace('/(tabs)');
  }, [isLoaded, isSignedIn, onboardingHydrated, hasCompletedOnboarding, userByClerk, convexUserId, convexTimedOut, router]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
