import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { User, Cloud, Image, ChevronRight } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { Card, Badge, ProgressBar, Button } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { PressableScale } from '@/components/pressable-scale';

export default function HomeScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);

  const myPhotosCount =
    useQuery(
      api.photoMatches.countByUser,
      convexUserId ? { userId: convexUserId as any } : 'skip'
    ) ?? 0;

  const recentlyDownloaded =
    useQuery(
      api.photos.listRecentlyDownloaded,
      convexUserId ? { userId: convexUserId as any } : 'skip'
    ) ?? [];

  const storageUsage =
    useQuery(
      api.users.getStorageUsage,
      convexUserId ? { userId: convexUserId as any } : 'skip'
    ) ?? { usedBytes: 0, totalBytes: 2 * 1024 * 1024 * 1024 };

  const expirationReminders =
    useQuery(
      api.expirationReminders.listForUser,
      convexUserId ? { userId: convexUserId as any } : 'skip'
    ) ?? [];

  const daysLeft = (expiresAt: number) => {
    const d = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return d <= 0 ? 'soon' : d === 1 ? '1 day' : `${d} days`;
  };

  const usedPercentage = Math.round(
    (storageUsage.usedBytes / storageUsage.totalBytes) * 100
  );

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
              <ThemedText type="title1" darkColor={colors.white}>
                Snapsy
              </ThemedText>
              <ThemedText type="body2" darkColor={colors.grey400}>
                Every moment, perfectly yours.
              </ThemedText>
            </View>
            <Button
              variant="secondary"
              size="md"
              onPress={() => router.push('/profile')}
              style={styles.profileBtn}
              iconOnly={
                <User
                  size={iconSize.lg}
                  strokeWidth={0}
                  fill={colors.primaryDark}
                  color={colors.primaryDark}
                />
              }
            />
          </View>
        </View>

        <Card variant="elevated" style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Cloud
              size={iconSize.md}
              strokeWidth={0}
              fill={colors.primary}
              color={colors.primary}
            />
            <ThemedText
              type="headline"
              darkColor={colors.white}
              style={styles.storageTitle}
            >
              Storage
            </ThemedText>
          </View>
          <ProgressBar value={usedPercentage} />
          <View style={styles.storageFooter}>
            <ThemedText type="caption" darkColor={colors.grey400}>
              {(storageUsage.usedBytes / (1024 * 1024)).toFixed(1)} MB of 2 GB
              used
            </ThemedText>
          </View>
        </Card>

        {myPhotosCount > 0 && (
          <PressableScale
            onPress={() => router.push('/my-photos')}
            style={styles.photosPreviewWrap}
          >
            <Card variant="primary" style={styles.photosPreview}>
              <View style={styles.photosIcon}>
                <Image
                  size={iconSize['2xl']}
                  strokeWidth={0}
                  fill={colors.primary}
                  color={colors.primary}
                />
              </View>
              <View style={styles.photosContent}>
                <ThemedText type="headline" darkColor={colors.white}>
                  Photos of you
                </ThemedText>
                <ThemedText type="caption" darkColor={colors.grey400}>
                  {myPhotosCount} new matches found
                </ThemedText>
              </View>
              <ChevronRight
                size={iconSize.lg}
                strokeWidth={1.75}
                color={colors.grey400}
              />
            </Card>
          </PressableScale>
        )}

        {expirationReminders.length > 0 && (
          <View style={styles.section}>
            <ThemedText
              type="small"
              darkColor={colors.grey400}
              style={styles.sectionTitle}
            >
              EXPIRING SOON
            </ThemedText>
            {expirationReminders.map((r: any) => (
              <PressableScale
                key={r._id}
                onPress={() => router.push(`/event/${r.eventId}`)}
              >
                <Card variant="bordered" style={styles.reminderCard}>
                  <View style={styles.reminderInfo}>
                    <ThemedText type="headline" darkColor={colors.white}>
                      {r.eventName}
                    </ThemedText>
                    <ThemedText type="caption" darkColor={colors.grey400}>
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
              <ThemedText
                type="small"
                darkColor={colors.grey400}
                style={styles.sectionTitle}
              >
                RECENTLY DOWNLOADED
              </ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {recentlyDownloaded.map((p: any) => (
                <PressableScale
                  key={p._id}
                  onPress={() =>
                    router.push({
                      pathname: '/modal',
                      params: { photoId: p._id },
                    })
                  }
                >
                  <View style={styles.downloadThumb}>
                    <Image
                      size={iconSize['2xl']}
                      strokeWidth={1.75}
                      color={colors.grey700}
                    />
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing[8],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    minWidth: 44,
  },
  storageCard: {
    backgroundColor: colors.darkSurface2,
    borderColor: colors.darkBorder,
    padding: spacing[5],
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  storageTitle: {
    marginLeft: spacing[2],
  },
  storageFooter: {
    marginTop: spacing[3],
  },
  section: {
    marginTop: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    letterSpacing: 1.2,
    fontFamily: typography.fontFamily.bold,
  },
  photosPreviewWrap: {
    marginTop: spacing[8],
  },
  horizontalScroll: {
    gap: spacing[3],
  },
  downloadThumb: {
    width: 80,
    height: 80,
    borderRadius: radii.lg,
    backgroundColor: colors.darkSurface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photosPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  photosIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  photosContent: {
    flex: 1,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  reminderInfo: {
    flex: 1,
  },
});
