import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { Colors, SPACING, BACKGROUND_DARK, PRIMARY, G400, G700, G800 } from '@/constants/theme';
import { CreateEventSheet } from '@/components/create-event-sheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ThemedText } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PressableScale } from '@/components/pressable-scale';

export default function HomeScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const setCreateEventSheetOpen = useUIStore((s) => s.setCreateEventSheetOpen);
  const createEventSheetOpen = useUIStore((s) => s.createEventSheetOpen);

  const events = useQuery(
    api.events.listByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );

  const myPhotosCount = useQuery(
    api.photoMatches.countByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  ) ?? 0;

  const recentlyDownloaded = useQuery(
    api.photos.listRecentlyDownloaded,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  ) ?? [];

  const storageUsage = useQuery(
    api.users.getStorageUsage,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  ) ?? { usedBytes: 0, totalBytes: 2 * 1024 * 1024 * 1024 };

  const expirationReminders = useQuery(
    api.expirationReminders.listForUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  ) ?? [];

  const daysLeft = (expiresAt: number) => {
    const d = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return d <= 0 ? 'soon' : d === 1 ? '1 day' : `${d} days`;
  };

  const usedPercentage = Math.round((storageUsage.usedBytes / storageUsage.totalBytes) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <ThemedText type="title1" darkColor="#FFFFFF">Snapsy</ThemedText>
              <ThemedText type="body2" darkColor={G400}>Every moment, perfectly yours.</ThemedText>
            </View>
            <PressableScale onPress={() => router.push('/profile')}>
              <View style={styles.profileBtn}>
                <Icon name="user" size={24} color={PRIMARY} solid />
              </View>
            </PressableScale>
          </View>
        </View>

        <Card variant="elevated" style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Icon name="cloud" size={18} color={PRIMARY} solid />
            <ThemedText type="headline" darkColor="#FFFFFF" style={{ marginLeft: 8 }}>Storage</ThemedText>
          </View>
          <ProgressBar value={usedPercentage} />
          <View style={styles.storageFooter}>
            <ThemedText type="caption" darkColor={G400}>
              {(storageUsage.usedBytes / (1024 * 1024)).toFixed(1)} MB of 2 GB used
            </ThemedText>
          </View>
        </Card>

        {myPhotosCount > 0 && (
          <PressableScale onPress={() => router.push('/my-photos')} style={{ marginTop: SPACING.xl }}>
            <Card variant="primary" style={styles.photosPreview}>
              <View style={styles.photosIcon}>
                <Icon name="image" size={24} color={PRIMARY} solid />
              </View>
              <View style={styles.photosContent}>
                <ThemedText type="headline" darkColor="#FFFFFF">Photos of you</ThemedText>
                <ThemedText type="caption" darkColor="rgba(255,255,255,0.6)">{myPhotosCount} new matches found</ThemedText>
              </View>
              <Icon name="chevronRight" size={20} color="rgba(255,255,255,0.4)" />
            </Card>
          </PressableScale>
        )}

        {expirationReminders.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="small" darkColor={G400} style={styles.sectionTitle}>EXPIRING SOON</ThemedText>
            {expirationReminders.map((r: any) => (
              <PressableScale key={r._id} onPress={() => router.push(`/event/${r.eventId}`)}>
                <Card variant="bordered" style={styles.reminderCard}>
                  <View style={styles.reminderInfo}>
                    <ThemedText type="headline" darkColor="#FFFFFF">{r.eventName}</ThemedText>
                    <ThemedText type="caption" darkColor={G400}>
                      {r.photoCount} photos expire in {daysLeft(r.expiresAt)}
                    </ThemedText>
                  </View>
                  <Badge label="Expiring" variant="warning" dot />
                </Card>
              </PressableScale>
            ))}
          </View>
        )}

        {recentlyDownloaded.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="small" darkColor={G400} style={styles.sectionTitle}>RECENTLY DOWNLOADED</ThemedText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {recentlyDownloaded.map((p: any) => (
                <PressableScale key={p._id} onPress={() => router.push({ pathname: '/modal', params: { photoId: p._id } })}>
                  <View style={styles.downloadThumb}>
                    <Icon name="image" size={24} color={G700} />
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="small" darkColor={G400} style={styles.sectionTitle}>YOUR EVENTS</ThemedText>
            <Button variant="ghost" size="sm" iconL="plus" onPress={() => setCreateEventSheetOpen(true)}>
              Create
            </Button>
          </View>
          
          <View style={styles.eventGrid}>
            {events && events.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="calendar" size={48} color={G700} style={{ marginBottom: 16 }} />
                <ThemedText type="body2" darkColor={G400} style={{ textAlign: 'center' }}>
                  No events yet. Create one to start sharing moments.
                </ThemedText>
              </View>
            )}
            {events?.map((event) => (
              <PressableScale key={event._id} onPress={() => router.push(`/event/${event._id}`)}>
                <Card variant="flat" style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <ThemedText type="headline" darkColor={G800}>{event.name}</ThemedText>
                    <Icon name="chevronRight" size={16} color={G400} />
                  </View>
                  <View style={styles.eventMeta}>
                    <Badge label={event.privacy} variant="default" />
                    <ThemedText type="small" darkColor={G400}>
                      {event.retentionDays}d retention
                    </ThemedText>
                  </View>
                </Card>
              </PressableScale>
            ))}
          </View>
        </View>
      </ScrollView>

      <CreateEventSheet
        open={createEventSheetOpen}
        onClose={() => setCreateEventSheetOpen(false)}
        convexUserId={convexUserId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(108, 240, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 240, 115, 0.2)',
  },
  storageCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 20,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageFooter: {
    marginTop: 12,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  horizontalScroll: {
    gap: 12,
  },
  downloadThumb: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 240, 115, 0.1)',
    borderColor: 'rgba(108, 240, 115, 0.2)',
    paddingVertical: 16,
  },
  photosIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 240, 115, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  photosContent: {
    flex: 1,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  eventGrid: {
    gap: 12,
  },
  eventCard: {
    padding: 20,
    backgroundColor: '#FFFFFF',
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
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
});
