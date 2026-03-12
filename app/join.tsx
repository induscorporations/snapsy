import { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { BACKGROUND_DARK, G400, PRIMARY } from '@/constants/theme';
import { Spinner } from '@/components/ui/Spinner';
import { ThemedText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

export default function JoinEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const router = useRouter();
  const { isSignedIn, isLoaded, userId: clerkId } = useAuth();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const setConvexUserId = useAuthStore((s) => s.setConvexUserId);
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const joinByInvite = useMutation(api.events.joinByInvite);
  const [status, setStatus] = useState<'loading' | 'joined' | 'error'>('loading');

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace('/(auth)/sign-in');
      return;
    }
    if (!eventId) {
      setStatus('error');
      return;
    }
    (async () => {
      try {
        let userId = convexUserId;
        if (!userId && clerkId) {
          userId = (await getOrCreateUser({ clerkId })) as unknown as string;
          setConvexUserId(userId);
        }
        if (!userId) {
          setStatus('error');
          return;
        }
        await joinByInvite({ eventId: eventId as any, userId: userId as any });
        setStatus('joined');
        router.replace(`/event/${eventId}`);
      } catch {
        setStatus('error');
      }
    })();
  }, [isLoaded, isSignedIn, eventId, convexUserId, clerkId, getOrCreateUser, setConvexUserId, joinByInvite, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {status === 'error' ? (
        <View style={styles.content}>
          <ThemedText type="title3" darkColor="#FFFFFF" style={styles.title}>Couldn't join event</ThemedText>
          <ThemedText type="body2" darkColor={G400} style={styles.text}>
            The invite link may be invalid or expired.
          </ThemedText>
          <Button 
            onPress={() => router.replace('/(tabs)')}
            variant="primary"
            style={{ marginTop: 24 }}
          >
            Back to Home
          </Button>
        </View>
      ) : (
        <View style={styles.content}>
          <Spinner size={32} color={PRIMARY} />
          <ThemedText type="body2" darkColor={G400} style={styles.statusText}>
            {status === 'joined' ? 'Taking you to the event…' : 'Joining event…'}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: 12,
  },
  text: {
    textAlign: 'center',
  },
  statusText: {
    marginTop: 24,
  },
});
