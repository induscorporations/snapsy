import { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, typography } from '@/constants/tokens';
import { Spinner } from '@/components/ui/Spinner';
import { ThemedText } from '@/components/ui/Typography';
import { Button } from '@/components';

export default function JoinEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const router = useRouter();
  const { isSignedIn, isLoaded, userId: clerkId } = useAuth();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const setConvexUserId = useAuthStore((s) => s.setConvexUserId);
  const getOrCreateUser = useMutation(api.users.getOrCreate);
  const joinByInvite = useMutation(api.events.joinByInvite);
  const preview = useQuery(
    api.events.getInvitePreview,
    isSignedIn && eventId ? { eventId: eventId as any } : 'skip'
  );
  const [status, setStatus] = useState<'loading' | 'preview' | 'joining' | 'joined' | 'error'>('loading');
  const [joinError, setJoinError] = useState<string | null>(null);

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
    if (preview === undefined) return;
    if (preview === null) {
      setStatus('error');
      return;
    }
    setStatus('preview');
  }, [isLoaded, isSignedIn, eventId, preview]);

  const handleJoin = async () => {
    if (!eventId) return;
    setJoinError(null);
    setStatus('joining');
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
      setJoinError('Could not join. The link may be invalid or expired.');
      setStatus('preview');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {status === 'error' ? (
        <View style={styles.content}>
          <ThemedText type="title3" darkColor={colors.white} style={styles.title}>Couldn't join event</ThemedText>
          <ThemedText type="body2" darkColor={colors.grey400} style={styles.text}>
            The invite link may be invalid or expired.
          </ThemedText>
          <Button 
            onPress={() => router.replace('/(tabs)')}
            variant="primary"
            style={styles.backButton}
          >
            Back to Home
          </Button>
        </View>
      ) : status === 'preview' && preview ? (
        <View style={styles.content}>
          <ThemedText type="title3" darkColor={colors.white} style={styles.title}>Join event</ThemedText>
          <ThemedText type="headline" darkColor={colors.white} style={styles.eventName}>{preview.name}</ThemedText>
          <ThemedText type="body2" darkColor={colors.grey400} style={styles.hostName}>
            Hosted by {preview.hostName}
          </ThemedText>
          {joinError && (
            <ThemedText type="caption" style={[styles.text, { color: colors.error, marginTop: spacing[3] }]}>
              {joinError}
            </ThemedText>
          )}
          <Button variant="primary" onPress={handleJoin} style={styles.joinButton}>
            Join
          </Button>
          <Button variant="ghost" onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
            Cancel
          </Button>
        </View>
      ) : status === 'joining' || status === 'joined' ? (
        <View style={styles.content}>
          <Spinner size={32} color={colors.primary} />
          <ThemedText type="body2" darkColor={colors.grey400} style={styles.statusText}>
            {status === 'joined' ? 'Taking you to the event…' : 'Joining event…'}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.content}>
          <Spinner size={32} color={colors.primary} />
          <ThemedText type="body2" darkColor={colors.grey400} style={styles.statusText}>
            Loading…
          </ThemedText>
        </View>
      )}
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
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    marginBottom: spacing[3],
  },
  text: {
    textAlign: 'center',
  },
  statusText: {
    marginTop: spacing[6],
  },
  backButton: {
    marginTop: spacing[6],
  },
  eventName: {
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  hostName: {
    marginBottom: spacing[6],
  },
  joinButton: {
    marginTop: spacing[2],
  },
});
