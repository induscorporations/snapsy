import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Upload } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, radii, iconSize } from '@/constants/tokens';
import { Button, Card } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { PressableScale } from '@/components/pressable-scale';

export default function UploadScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);

  const hostedEvents = useQuery(
    api.events.listHostedByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );

  const hasHostedEvents = !!hostedEvents && hostedEvents.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title1" darkColor={colors.white}>
          Upload
        </ThemedText>
        <ThemedText type="body2" darkColor={colors.grey400} style={styles.subtitle}>
          Select an event to upload photos to
        </ThemedText>
      </View>

      {hasHostedEvents ? (
        <View style={styles.list}>
          {hostedEvents.map((event: any) => (
            <PressableScale
              key={event._id}
              onPress={() =>
                router.push({
                  pathname: '/event/[id]',
                  params: { id: event._id, upload: 'true' },
                })
              }
            >
              <Card variant="flat" style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <ThemedText type="headline" darkColor={colors.grey800}>
                    {event.name}
                  </ThemedText>
                </View>
                <ThemedText type="caption" darkColor={colors.grey400}>
                  {event.retentionDays}d retention · {event.privacy}
                </ThemedText>
              </Card>
            </PressableScale>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Upload
              size={iconSize['3xl']}
              strokeWidth={0}
              fill={colors.primaryDark}
              color={colors.primaryDark}
            />
          </View>
          <ThemedText type="headline" darkColor={colors.white}>
            No events to upload to
          </ThemedText>
          <ThemedText
            type="body2"
            darkColor={colors.grey400}
            style={styles.emptySubtitle}
          >
            Create an event first, then upload photos.
          </ThemedText>
          <Button
            variant="primary"
            onPress={() => router.push('/(tabs)/events')}
          >
            Create Event
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    paddingHorizontal: spacing[6],
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing[6],
  },
  subtitle: {
    marginTop: spacing[1],
  },
  list: {
    gap: spacing[3],
  },
  eventCard: {
    padding: spacing[5],
    backgroundColor: colors.white,
  },
  eventHeader: {
    marginBottom: spacing[2],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing[8],
  },
});

