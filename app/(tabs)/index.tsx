import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';
import { User, Cloud, Image, ChevronRight, Link as LinkIcon, Calendar, Download, Share2, EyeOff, Clock } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { Card, Badge, ProgressBar, Button } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { PressableScale } from '@/components/pressable-scale';
import { JoinEventSheet } from '@/components/join-event-sheet';
import { BottomSheet } from '@/components/navigation/Navigation';
import { Snackbar } from '@/components/feedback/Feedback';
import { useUIStore } from '@/stores/useUIStore';
import { CheckCircle } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const [joinSheetOpen, setJoinSheetOpen] = useState(false);
  const [photoQuickActionPhoto, setPhotoQuickActionPhoto] = useState<any | null>(null);
  const [upgradeSheetOpen, setUpgradeSheetOpen] = useState(false);
  const [showNewPhotosSnackbar, setShowNewPhotosSnackbar] = useState(false);
  const hasShownNewPhotosIndicator = useUIStore((s) => s.hasShownNewPhotosIndicator);
  const setHasShownNewPhotosIndicator = useUIStore((s) => s.setHasShownNewPhotosIndicator);
  const hideFromMyPhotos = useMutation(api.photoMatches.hideFromMyPhotos);
  const recordDownload = useMutation(api.photos.recordDownload);

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

  const events = useQuery(
    api.events.listByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  ) ?? [];

  const daysLeft = (expiresAt: number) => {
    const d = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return d <= 0 ? 'soon' : d === 1 ? '1 day' : `${d} days`;
  };

  const usedPercentage = Math.round(
    (storageUsage.usedBytes / storageUsage.totalBytes) * 100
  );

  useEffect(() => {
    if (myPhotosCount > 0 && !hasShownNewPhotosIndicator) {
      setShowNewPhotosSnackbar(true);
      setHasShownNewPhotosIndicator(true);
    }
  }, [myPhotosCount, hasShownNewPhotosIndicator, setHasShownNewPhotosIndicator]);

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

        {expirationReminders.length > 0 && (
          <TouchableOpacity
            style={styles.expirationBanner}
            onPress={() => router.push('/(tabs)/events')}
            activeOpacity={0.8}
          >
            <Clock size={18} color={colors.warning} strokeWidth={1.75} />
            <ThemedText type="body2" darkColor={colors.warning} style={styles.expirationBannerText}>
              {expirationReminders.length} event{expirationReminders.length !== 1 ? 's' : ''} expiring soon
            </ThemedText>
            <ChevronRight size={18} strokeWidth={1.75} color={colors.warning} />
          </TouchableOpacity>
        )}

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
            {usedPercentage >= 90 && (
              <TouchableOpacity onPress={() => setUpgradeSheetOpen(true)} style={styles.upgradeLink}>
                <ThemedText type="caption" darkColor={colors.primary}>Upgrade</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {myPhotosCount > 0 ? (
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
        ) : (
          <View style={styles.photosPreviewWrap}>
            <Card variant="bordered" style={styles.noPhotosCard}>
              <View style={styles.photosIcon}>
                <Image
                  size={iconSize['2xl']}
                  strokeWidth={1.75}
                  color={colors.grey400}
                />
              </View>
              <View style={styles.photosContent}>
                <ThemedText type="headline" darkColor={colors.white}>
                  No photos of you yet
                </ThemedText>
                <ThemedText type="caption" darkColor={colors.grey400}>
                  Join events and add a selfie to get matched photos.
                </ThemedText>
              </View>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setJoinSheetOpen(true)}
                iconLeft={<LinkIcon size={iconSize.sm} strokeWidth={1.75} color={colors.primary} />}
              >
                Join Event
              </Button>
            </Card>
          </View>
        )}

        <View style={styles.homeActions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setJoinSheetOpen(true)}
            iconLeft={<LinkIcon size={iconSize.sm} strokeWidth={1.75} color={colors.grey700} />}
          >
            Join Event
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.push('/(tabs)/events')}
            iconLeft={<Calendar size={iconSize.sm} strokeWidth={1.75} color={colors.grey700} />}
          >
            Events
          </Button>
        </View>

        <JoinEventSheet visible={joinSheetOpen} onClose={() => setJoinSheetOpen(false)} />

        {events.length > 0 && (
          <View style={styles.section}>
            <ThemedText
              type="small"
              darkColor={colors.grey400}
              style={styles.sectionTitle}
            >
              YOUR EVENTS
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsScroll}
            >
              {events.map((ev: any) => (
                <PressableScale
                  key={ev._id}
                  onPress={() => router.push(`/event/${ev._id}`)}
                >
                  <Card variant="bordered" style={styles.eventChip}>
                    <Calendar size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />
                    <ThemedText type="caption" darkColor={colors.white} numberOfLines={1} style={styles.eventChipText}>
                      {ev.name}
                    </ThemedText>
                  </Card>
                </PressableScale>
              ))}
            </ScrollView>
          </View>
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
                  onPress={() => setPhotoQuickActionPhoto(p)}
                >
                  <View style={styles.downloadThumb}>
                    {p?.url ? (
                      <ExpoImage source={{ uri: p.url }} style={styles.downloadThumbImage} contentFit="cover" />
                    ) : (
                      <Image size={iconSize['2xl']} strokeWidth={1.75} color={colors.grey700} />
                    )}
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          </View>
        )}

        {photoQuickActionPhoto && (
          <BottomSheet
            visible={!!photoQuickActionPhoto}
            onClose={() => setPhotoQuickActionPhoto(null)}
            title="Photo"
            snapHeight={0.35}
          >
            <View style={styles.sheetList}>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  const ids = recentlyDownloaded.map((x: any) => x._id).join(',');
                  router.push({ pathname: '/modal', params: { photoId: photoQuickActionPhoto._id, photoIds: ids } });
                  setPhotoQuickActionPhoto(null);
                }}
              >
                <ThemedText type="body1" darkColor={colors.white}>View</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={async () => {
                  if (!photoQuickActionPhoto?.url || !convexUserId) return;
                  const { status } = await MediaLibrary.requestPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Allow access to save photos.');
                    return;
                  }
                  try {
                    const uri = `${(FileSystem as any).cacheDirectory}snapsy-${photoQuickActionPhoto._id}.jpg`;
                    await FileSystem.downloadAsync(photoQuickActionPhoto.url, uri);
                    await MediaLibrary.createAssetAsync(uri);
                    await recordDownload({ photoId: photoQuickActionPhoto._id, userId: convexUserId });
                    setPhotoQuickActionPhoto(null);
                    Alert.alert('Saved', 'Photo saved to your library.');
                  } catch (e) {
                    Alert.alert('Download failed', 'Could not save photo.');
                  }
                }}
              >
                <Download size={18} strokeWidth={1.75} color={colors.primary} />
                <ThemedText type="body1" darkColor={colors.primary}>Download</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={async () => {
                  if (!photoQuickActionPhoto?.url) return;
                  try {
                    await Share.share({ url: photoQuickActionPhoto.url, message: 'Photo from Snapsy' });
                  } catch {}
                  setPhotoQuickActionPhoto(null);
                }}
              >
                <Share2 size={18} strokeWidth={1.75} color={colors.primary} />
                <ThemedText type="body1" darkColor={colors.primary}>Share</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={async () => {
                  if (!photoQuickActionPhoto?._id || !convexUserId) return;
                  try {
                    await hideFromMyPhotos({ photoId: photoQuickActionPhoto._id, userId: convexUserId });
                    setPhotoQuickActionPhoto(null);
                  } catch {
                    Alert.alert('Error', 'Could not hide photo.');
                  }
                }}
              >
                <EyeOff size={18} strokeWidth={1.75} color={colors.grey400} />
                <ThemedText type="body1" darkColor={colors.grey400}>Hide from my photos</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetItem} onPress={() => setPhotoQuickActionPhoto(null)}>
                <ThemedText type="body1" darkColor={colors.grey500}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </BottomSheet>
        )}

        {upgradeSheetOpen && (
          <BottomSheet
            visible={upgradeSheetOpen}
            onClose={() => setUpgradeSheetOpen(false)}
            title="Upgrade"
            snapHeight={0.3}
          >
            <View style={styles.sheetList}>
              <ThemedText type="body2" darkColor={colors.grey400} style={styles.upgradeText}>
                Get more storage and premium features. Coming soon.
              </ThemedText>
              <Button variant="primary" onPress={() => setUpgradeSheetOpen(false)} style={styles.upgradeBtn}>
                OK
              </Button>
            </View>
          </BottomSheet>
        )}

        {showNewPhotosSnackbar && myPhotosCount > 0 && (
          <View style={styles.newPhotosSnackbarWrap}>
            <Snackbar
              type="success"
              message="New photos of you"
              duration={4000}
              onHide={() => setShowNewPhotosSnackbar(false)}
              iconLeft={<CheckCircle size={20} strokeWidth={0} fill={colors.primary} color={colors.primary} />}
              action={{ label: 'View', onPress: () => { setShowNewPhotosSnackbar(false); router.push('/my-photos'); } }}
            />
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
  expirationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    borderRadius: radii.lg,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  expirationBannerText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  upgradeLink: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  sheetList: {
    paddingVertical: spacing[4],
    gap: spacing[2],
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  downloadThumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  upgradeText: {
    marginBottom: spacing[4],
  },
  upgradeBtn: {
    alignSelf: 'flex-start',
  },
  newPhotosSnackbarWrap: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
    bottom: spacing[12],
    alignItems: 'center',
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
    overflow: 'hidden',
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
  noPhotosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: colors.darkSurface2,
    borderColor: colors.darkBorder,
  },
  homeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[6],
  },
  eventsScroll: {
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    minWidth: 140,
    maxWidth: 180,
    backgroundColor: colors.darkSurface2,
    borderColor: colors.darkBorder,
  },
  eventChipText: {
    marginLeft: spacing[2],
    flex: 1,
  },
});
