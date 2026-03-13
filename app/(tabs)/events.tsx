import { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Calendar, Plus, Link as LinkIcon, Share2, Trash2, ExternalLink } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { Button, Card, Badge } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { PressableScale } from '@/components/pressable-scale';
import { CreateEventSheet } from '@/components/create-event-sheet';
import { JoinEventSheet } from '@/components/join-event-sheet';
import { BottomSheet } from '@/components/navigation/Navigation';

export default function EventsScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const setCreateEventSheetOpen = useUIStore((s) => s.setCreateEventSheetOpen);
  const createEventSheetOpen = useUIStore((s) => s.createEventSheetOpen);
  const [joinEventSheetOpen, setJoinEventSheetOpen] = useState(false);
  const [quickActionEvent, setQuickActionEvent] = useState<any>(null);
  const deleteEvent = useMutation(api.events.deleteEvent);

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
          renderItem={({ item }) => {
            const isHost = item.hostId === convexUserId;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/event/${item._id}`)}
                onLongPress={() => setQuickActionEvent(item)}
              >
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
              </TouchableOpacity>
            );
          }}
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

      <BottomSheet
        visible={!!quickActionEvent}
        onClose={() => setQuickActionEvent(null)}
        title={quickActionEvent?.name ?? 'Event'}
        subtitle="Quick actions"
        snapHeight={0.4}
      >
        {quickActionEvent && (
          <View style={styles.quickSheetList}>
            <TouchableOpacity
              style={styles.quickSheetItem}
              onPress={() => {
                router.push(`/event/${quickActionEvent._id}`);
                setQuickActionEvent(null);
              }}
            >
              <ExternalLink size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />
              <ThemedText type="body1" darkColor={colors.grey800}>View Event</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSheetItem}
              onPress={async () => {
                const url = Linking.createURL(`/join?eventId=${quickActionEvent._id}`);
                try {
                  await Share.share({
                    message: `Join my event on Snapsy: ${url}`,
                    url,
                    title: 'Snapsy event invite',
                  });
                } catch {}
                setQuickActionEvent(null);
              }}
            >
              <Share2 size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />
              <ThemedText type="body1" darkColor={colors.grey800}>Share Invite</ThemedText>
            </TouchableOpacity>
            {quickActionEvent.hostId === convexUserId && (
              <TouchableOpacity
                style={[styles.quickSheetItem, styles.quickSheetItemDanger]}
                onPress={() => {
                  Alert.alert(
                    'Delete event',
                    `Permanently delete "${quickActionEvent.name}"? All photos and members will be removed.`,
                    [
                      { text: 'Cancel', style: 'cancel', onPress: () => setQuickActionEvent(null) },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteEvent({ eventId: quickActionEvent._id });
                            setQuickActionEvent(null);
                          } catch (e) {
                            Alert.alert('Error', 'Could not delete event.');
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Trash2 size={iconSize.md} strokeWidth={1.75} color={colors.error} />
                <ThemedText type="body1" darkColor={colors.error}>Delete Event</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </BottomSheet>
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
  quickSheetList: {
    gap: spacing[2],
    paddingVertical: spacing[4],
  },
  quickSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  quickSheetItemDanger: {},
});

