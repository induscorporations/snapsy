import { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Calendar, Plus, Link as LinkIcon } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { Button, Card, Badge } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { PressableScale } from '@/components/pressable-scale';
import { CreateEventSheet } from '@/components/create-event-sheet';
import { JoinEventSheet } from '@/components/join-event-sheet';

export default function EventsScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const setCreateEventSheetOpen = useUIStore((s) => s.setCreateEventSheetOpen);
  const createEventSheetOpen = useUIStore((s) => s.createEventSheetOpen);
  const [joinEventSheetOpen, setJoinEventSheetOpen] = useState(false);

  const events = useQuery(
    api.events.listByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );

  const hasEvents = !!events && events.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <ThemedText type="title1" darkColor={colors.white}>
          Events
        </ThemedText>
        <View style={styles.headerActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setJoinEventSheetOpen(true)}
            iconLeft={
              <LinkIcon
                size={iconSize.sm}
                strokeWidth={1.75}
                color={colors.grey700}
              />
            }
          >
            Join
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={() => setCreateEventSheetOpen(true)}
            style={styles.createIconButton}
            iconOnly={
              <Plus
                size={iconSize.sm}
                strokeWidth={1.75}
                color={colors.grey900}
              />
            }
          />
        </View>
      </View>

      {hasEvents ? (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PressableScale onPress={() => router.push(`/event/${item._id}`)}>
              <Card variant="flat" style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <ThemedText type="headline" darkColor={colors.grey800}>
                    {item.name}
                  </ThemedText>
                </View>
                <View style={styles.eventMeta}>
                  <Badge label={item.privacy} variant="default" />
                  <ThemedText type="small" darkColor={colors.grey400}>
                    {item.retentionDays}d retention
                  </ThemedText>
                </View>
              </Card>
            </PressableScale>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Calendar
            size={iconSize['4xl']}
            strokeWidth={1.75}
            color={colors.grey700}
            style={styles.emptyIcon}
          />
          <ThemedText
            type="body2"
            darkColor={colors.grey400}
            style={styles.emptyText}
          >
            No events yet. Create one to start sharing moments.
          </ThemedText>
          <View style={styles.emptyActions}>
            <Button
              variant="primary"
              onPress={() => setCreateEventSheetOpen(true)}
              iconLeft={
                <Plus
                  size={iconSize.sm}
                  strokeWidth={1.75}
                  color={colors.grey900}
                />
              }
            >
              Create Event
            </Button>
            <Button
              variant="ghost"
              onPress={() => setJoinEventSheetOpen(true)}
              iconLeft={
                <LinkIcon
                  size={iconSize.sm}
                  strokeWidth={1.75}
                  color={colors.grey700}
                />
              }
            >
              Join Event
            </Button>
          </View>
        </View>
      )}

      <CreateEventSheet
        open={createEventSheetOpen}
        onClose={() => setCreateEventSheetOpen(false)}
        convexUserId={convexUserId}
      />

      <JoinEventSheet
        visible={joinEventSheetOpen}
        onClose={() => setJoinEventSheetOpen(false)}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  createIconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    minWidth: 40,
  },
  listContent: {
    paddingBottom: spacing[4],
    gap: spacing[3],
  },
  eventCard: {
    padding: spacing[5],
    backgroundColor: colors.white,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  emptyIcon: {
    marginBottom: spacing[4],
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  emptyActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
});

