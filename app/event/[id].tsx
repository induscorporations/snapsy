import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { useUploadStore } from '@/stores/useUploadStore';
import { Snackbar, EmptyState } from '@/components/feedback/Feedback';
import { BottomSheet } from '@/components/navigation/Navigation';
import { UploadPhotosButton } from '@/components/upload-photos-button';
import { colors, spacing, radii, typography } from '@/constants/tokens';
import { ThemedText } from '@/components/ui/Typography';
import { Button } from '@/components';
import * as Linking from 'expo-linking';
import { Share } from 'react-native';
import {
  ArrowLeft,
  User,
  Image,
  CheckCircle,
  Shield,
  UserMinus,
  Clock,
  ShieldOff,
  Check,
  Trash2,
  Download,
  MoreHorizontal,
} from 'lucide-react-native';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const [tab, setTab] = useState<'my' | 'all' | 'members'>('my');
  const [refreshing, setRefreshing] = useState(false);
  const uploadSuccessSnackbar = useUIStore((s) => s.uploadSuccessSnackbar);
  const setUploadSuccessSnackbar = useUIStore((s) => s.setUploadSuccessSnackbar);
  const [showUploadSnackbar, setShowUploadSnackbar] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [photoActionPhoto, setPhotoActionPhoto] = useState<any | null>(null);
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const pendingQueue = useUploadStore((s) => s.pendingQueue);
  const retryAllFailed = useUploadStore((s) => s.retryAllFailed);
  const failedCount = pendingQueue.filter((p) => p.error).length;

  const event = useQuery(
    api.events.get,
    id ? { eventId: id as any, userId: convexUserId as any } : 'skip'
  );
  const allPhotos = useQuery(
    api.photos.listByEvent,
    id ? { eventId: id as any, userId: convexUserId as any } : 'skip'
  );
  const [myPhotosCursor, setMyPhotosCursor] = useState<string | null | undefined>(undefined);
  const [myPhotosAccumulated, setMyPhotosAccumulated] = useState<any[]>([]);
  const myPhotosPaginated = useQuery(
    (api as any).photoMatches.getMatchedPhotosWithUrlsPaginated,
    convexUserId && id
      ? { userId: convexUserId as any, eventId: id as any, limit: 24, cursor: myPhotosCursor ?? undefined }
      : 'skip'
  );
  const members = useQuery(
    (api as any).eventMembers.listByEvent,
    id ? { eventId: id as any } : 'skip'
  );

  const removeMember = useMutation((api as any).eventMembers.remove);
  const updateRole = useMutation((api as any).eventMembers.updateRole);
  const deletePhotoMutation = useMutation(api.photos.deletePhoto);
  const recordDownload = useMutation(api.photos.recordDownload);

  const isHost = event?.hostId === convexUserId;
  const memberCount = (event as any)?.memberCount ?? members?.length ?? 0;
  const daysSinceCreation =
    event ? Math.floor((Date.now() - event.createdAt) / (24 * 60 * 60 * 1000)) : 0;
  const daysLeft = event
    ? Math.max(0, event.retentionDays - daysSinceCreation)
    : 0;
  const isExpired = daysLeft <= 0;
  const myPhotosLastCursorRef = useRef<string | null | undefined>(null);
  const photos =
    tab === 'my'
      ? myPhotosAccumulated
      : (allPhotos ?? []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (tab === 'my') {
      setMyPhotosCursor(undefined);
      setMyPhotosAccumulated([]);
      myPhotosLastCursorRef.current = null;
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, [tab]);

  useEffect(() => {
    if (tab !== 'all') {
      setBulkMode(false);
      setSelectedPhotoIds(new Set());
      setBulkSheetOpen(false);
    }
  }, [tab]);

  useEffect(() => {
    if (id) {
      setMyPhotosCursor(undefined);
      setMyPhotosAccumulated([]);
      myPhotosLastCursorRef.current = null;
    }
  }, [id]);

  useEffect(() => {
    if (tab !== 'my' || !myPhotosPaginated) return;
    if (myPhotosCursor === undefined || myPhotosCursor === null) {
      setMyPhotosAccumulated(myPhotosPaginated.items);
      myPhotosLastCursorRef.current = myPhotosCursor;
    } else if (myPhotosLastCursorRef.current !== myPhotosCursor) {
      setMyPhotosAccumulated((prev) => [...prev, ...myPhotosPaginated.items]);
      myPhotosLastCursorRef.current = myPhotosCursor;
    }
  }, [tab, myPhotosPaginated, myPhotosCursor]);

  useFocusEffect(
    React.useCallback(() => {
      if (uploadSuccessSnackbar) {
        setShowUploadSnackbar(true);
        setUploadSuccessSnackbar(false);
      }
    }, [uploadSuccessSnackbar, setUploadSuccessSnackbar])
  );

  const handleRemoveMember = async (membershipId: string) => {
    if (!convexUserId) return;
    try {
      await removeMember({ membershipId: membershipId as any, userId: convexUserId as any });
    } catch (e) {
      Alert.alert('Error', 'Could not remove member.');
    }
  };

  const handleToggleRole = async (member: any) => {
    if (!convexUserId) return;
    const newRole = member.role === 'host' ? 'guest' : 'host';
    try {
      await updateRole({ 
        membershipId: member._id as any, 
        role: newRole, 
        userId: convexUserId as any 
      });
    } catch (e) {
      Alert.alert('Error', 'Could not update role.');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const exitBulkMode = () => {
    setBulkMode(false);
    setSelectedPhotoIds(new Set());
    setBulkSheetOpen(false);
  };

  const handleBulkDelete = async () => {
    if (selectedPhotoIds.size === 0 || !convexUserId) return;
    setBulkActionLoading(true);
    try {
      for (const pid of selectedPhotoIds) {
        await deletePhotoMutation({ photoId: pid as any });
      }
      exitBulkMode();
    } catch (e) {
      Alert.alert('Error', 'Could not delete some photos.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedPhotoIds.size === 0 || !convexUserId) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to save photos to your device.');
      return;
    }
    setBulkActionLoading(true);
    let saved = 0;
    try {
      for (const pid of selectedPhotoIds) {
        const p = (photos as any[]).find((x) => x._id === pid);
        if (!p?.url) continue;
        const filename = `snapsy-${pid}.jpg`;
        const localUri = `${(FileSystem as any).cacheDirectory}${filename}`;
        await FileSystem.downloadAsync(p.url, localUri);
        await MediaLibrary.createAssetAsync(localUri);
        await recordDownload({ photoId: pid as any, userId: convexUserId as any });
        saved++;
      }
      exitBulkMode();
      if (saved > 0) Alert.alert('Saved', `${saved} photo${saved !== 1 ? 's' : ''} saved to your library.`);
    } catch (e) {
      Alert.alert('Download failed', e instanceof Error ? e.message : 'Could not save photos.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSinglePhotoDownload = async (item: any) => {
    if (!item?.url || !convexUserId) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to save photos to your device.');
      return;
    }
    try {
      const filename = `snapsy-${item._id}.jpg`;
      const localUri = `${(FileSystem as any).cacheDirectory}${filename}`;
      await FileSystem.downloadAsync(item.url, localUri);
      await MediaLibrary.createAssetAsync(localUri);
      await recordDownload({ photoId: item._id, userId: convexUserId });
      setPhotoActionPhoto(null);
      Alert.alert('Saved', 'Photo saved to your library.');
    } catch (e) {
      Alert.alert('Download failed', e instanceof Error ? e.message : 'Could not save photo.');
    }
  };

  const handleSinglePhotoDelete = async (item: any) => {
    if (!item?._id) return;
    Alert.alert(
      'Delete photo',
      'This will permanently delete this photo for everyone in the event. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhotoMutation({ photoId: item._id });
              setPhotoActionPhoto(null);
            } catch (e) {
              Alert.alert('Error', 'Could not delete photo.');
            }
          },
        },
      ]
    );
  };

  const { width } = useWindowDimensions();
  const size = (width - spacing[6] * 2 - spacing[2] * 2) / 3;

  if (!id) return null;
  if (event === undefined) return <View style={styles.placeholder} />;
  if (!event) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <EmptyState
          icon={
            <ShieldOff
              size={32}
              color={colors.grey400}
              fill={colors.grey400}
              strokeWidth={0}
            />
          }
          title="Access Denied"
          subtitle="You're not a member of this event."
          cta={
            <Button variant="ghost" onPress={() => router.back()}>
              Go Back
            </Button>
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="md"
          onPress={() => router.back()}
          iconOnly={<ArrowLeft size={24} strokeWidth={1.75} color={colors.white} />}
          style={styles.back}
        />
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title2" darkColor={colors.white}>{event.name}</ThemedText>
            <ThemedText type="small" darkColor={colors.grey400}>
              {memberCount} member{memberCount !== 1 ? 's' : ''} · {daysLeft}d left
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            {isHost && tab === 'all' && !isExpired && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => (bulkMode ? exitBulkMode() : setBulkMode(true))}
                style={styles.selectBtn}
              >
                {bulkMode ? 'Cancel' : 'Select'}
              </Button>
            )}
            {isHost && convexUserId && tab !== 'members' && !isExpired && (
              <UploadPhotosButton eventId={id} uploadedBy={convexUserId} />
            )}
          </View>
        </View>
      </View>

      {isExpired && (
        <View style={styles.expiredBanner}>
          <Clock size={16} color={colors.warning} strokeWidth={1.75} />
          <ThemedText
            type="caption"
            darkColor={colors.warning}
            style={styles.expiredText}
          >
            This event's photos have expired and been removed.
          </ThemedText>
          <View style={styles.expiredActions}>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {
                const url = Linking.createURL(`/join?eventId=${id}`);
                Share.share({
                  message: `Request access to "${event?.name}" on Snapsy: ${url}`,
                  url,
                  title: 'Snapsy event invite',
                }).catch(() => {});
              }}
              style={styles.expiredBtn}
            >
              Contact host
            </Button>
            <Button variant="ghost" size="sm" onPress={() => router.back()} style={styles.expiredBtn}>
              Dismiss
            </Button>
          </View>
        </View>
      )}

      {failedCount > 0 && (
        <View style={styles.retryBanner}>
          <ThemedText type="caption" darkColor={colors.white} style={styles.retryText}>
            {failedCount} upload{failedCount !== 1 ? 's' : ''} failed.
          </ThemedText>
          <Button variant="ghost" size="sm" onPress={() => retryAllFailed()} style={styles.retryBtn}>
            Retry
          </Button>
        </View>
      )}

      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'my' && styles.tabActive]}
            onPress={() => setTab('my')}
            activeOpacity={0.8}
          >
            <ThemedText 
              type="caption" 
              darkColor={tab === 'my' ? colors.grey800 : colors.grey400} 
              style={tab === 'my' ? styles.tabTextActive : undefined}
            >
              For You
            </ThemedText>
          </TouchableOpacity>
          {isHost && (
            <TouchableOpacity
              style={[styles.tab, tab === 'all' && styles.tabActive]}
              onPress={() => setTab('all')}
              activeOpacity={0.8}
            >
              <ThemedText 
                type="caption" 
                darkColor={tab === 'all' ? colors.grey800 : colors.grey400} 
                style={tab === 'all' ? styles.tabTextActive : undefined}
              >
                All Activity
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.tab, tab === 'members' && styles.tabActive]}
            onPress={() => setTab('members')}
            activeOpacity={0.8}
          >
            <ThemedText 
              type="caption" 
              darkColor={tab === 'members' ? colors.grey800 : colors.grey400} 
              style={tab === 'members' ? styles.tabTextActive : undefined}
            >
              Members
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'members' ? (
        <FlatList
          data={members}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.memberList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              activeOpacity={0.8}
              disabled={!isHost || item.userId === convexUserId}
              onPress={() => {
                if (isHost && item.userId !== convexUserId) {
                  setSelectedMember(item);
                }
              }}
            >
              <View style={styles.memberInfo}>
                <ThemedText type="headline" darkColor={colors.white}>{item.userName}</ThemedText>
                <ThemedText type="caption" darkColor={colors.grey400}>{item.role}</ThemedText>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <User size={48} strokeWidth={1.75} color={colors.grey700} style={styles.emptyIcon} />
              <ThemedText type="body2" darkColor={colors.grey400}>No members yet.</ThemedText>
            </View>
          }
        />
      ) : !isExpired ? (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          onEndReached={
            tab === 'my' && myPhotosPaginated?.nextCursor
              ? () => setMyPhotosCursor(myPhotosPaginated.nextCursor)
              : undefined
          }
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Image size={48} strokeWidth={1.75} color={colors.grey700} style={styles.emptyIcon} />
              <ThemedText type="body2" darkColor={colors.grey400}>No photos found yet.</ThemedText>
            </View>
          }
          renderItem={({ item, index }) => {
            const photo = item && typeof item === 'object' && 'url' in item ? (item as any) : { ...item, url: null as string | null };
            const isSelected = bulkMode && selectedPhotoIds.has(item._id);
            const isHostAllTab = isHost && tab === 'all';
            return (
              <Animated.View
                entering={FadeIn.delay(index * 40).duration(200)}
                style={[styles.thumb, { width: size, height: size }]}
              >
                <TouchableOpacity
                  style={styles.thumbInner}
                  onPress={() => {
                    if (bulkMode && isHostAllTab) {
                      togglePhotoSelection(item._id);
                    } else {
                      router.push({ pathname: '/modal', params: { photoId: item._id, photoIds: photos.map((p) => p._id).join(',') } });
                    }
                  }}
                  onLongPress={() => {
                    if (isHostAllTab && !bulkMode) {
                      setPhotoActionPhoto(item);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  {photo.url ? (
                    <ExpoImage 
                      source={{ uri: photo.url }} 
                      style={styles.thumbImage} 
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.thumbPlaceholder} />
                  )}
                  {bulkMode && isHostAllTab && (
                    <View style={[styles.selectOverlay, isSelected && styles.selectOverlaySelected]}>
                      {isSelected && <Check size={28} color={colors.white} strokeWidth={2.5} />}
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      ) : (
        <View style={styles.expiredPlaceholder} />
      )}

      {showUploadSnackbar && (
        <View style={styles.snackbarContainer}>
          <Snackbar
            type="success"
            message="Photos uploaded successfully"
            duration={3000}
            onHide={() => setShowUploadSnackbar(false)}
            iconLeft={
              <CheckCircle
                size={20}
                strokeWidth={0}
                fill={colors.primary}
                color={colors.primary}
              />
            }
          />
        </View>
      )}

      {bulkMode && selectedPhotoIds.size > 0 && (
        <View style={styles.bulkBar}>
          <ThemedText type="body2" darkColor={colors.white}>
            {selectedPhotoIds.size} selected
          </ThemedText>
          <View style={styles.bulkBarActions}>
            <Button variant="ghost" size="sm" onPress={() => setBulkSheetOpen(true)} style={styles.bulkBarBtn}>
              Delete
            </Button>
            <Button variant="primary" size="sm" onPress={handleBulkDownload} loading={bulkActionLoading} style={styles.bulkBarBtn}>
              Download
            </Button>
          </View>
        </View>
      )}

      {bulkSheetOpen && (
        <BottomSheet
          visible={bulkSheetOpen}
          onClose={() => setBulkSheetOpen(false)}
          title="Bulk actions"
          snapHeight={0.28}
        >
          <View style={styles.sheetList}>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setBulkSheetOpen(false);
                Alert.alert(
                  'Delete photos',
                  `Permanently delete ${selectedPhotoIds.size} photo${selectedPhotoIds.size !== 1 ? 's' : ''} for everyone in this event?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => handleBulkDelete() },
                  ]
                );
              }}
              disabled={bulkActionLoading}
            >
              <Trash2 size={18} strokeWidth={1.75} color={colors.error} />
              <ThemedText type="body1" darkColor={colors.error}>Delete {selectedPhotoIds.size} photo{selectedPhotoIds.size !== 1 ? 's' : ''}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => { setBulkSheetOpen(false); handleBulkDownload(); }}
              disabled={bulkActionLoading}
            >
              <Download size={18} strokeWidth={1.75} color={colors.primary} />
              <ThemedText type="body1" darkColor={colors.primary}>Download {selectedPhotoIds.size} photo{selectedPhotoIds.size !== 1 ? 's' : ''}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={() => setBulkSheetOpen(false)}>
              <ThemedText type="body1" darkColor={colors.grey700}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      {photoActionPhoto && (
        <BottomSheet
          visible={!!photoActionPhoto}
          onClose={() => setPhotoActionPhoto(null)}
          title="Photo"
          snapHeight={0.28}
        >
          <View style={styles.sheetList}>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                router.push({ pathname: '/modal', params: { photoId: photoActionPhoto._id, photoIds: photos.map((p: any) => p._id).join(',') } });
                setPhotoActionPhoto(null);
              }}
            >
              <ThemedText type="body1" darkColor={colors.white}>View</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => handleSinglePhotoDownload(photoActionPhoto)}
            >
              <Download size={18} strokeWidth={1.75} color={colors.primary} />
              <ThemedText type="body1" darkColor={colors.primary}>Download</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => handleSinglePhotoDelete(photoActionPhoto)}
            >
              <Trash2 size={18} strokeWidth={1.75} color={colors.error} />
              <ThemedText type="body1" darkColor={colors.error}>Delete photo</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetItem} onPress={() => setPhotoActionPhoto(null)}>
              <ThemedText type="body1" darkColor={colors.grey700}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}

      {isHost && selectedMember && selectedMember.userId !== convexUserId && (
        <BottomSheet
          visible={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={selectedMember.userName}
          snapHeight={0.3}
        >
          <View style={styles.sheetList}>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={async () => {
                try {
                  await handleToggleRole(selectedMember);
                } finally {
                  setSelectedMember(null);
                }
              }}
            >
              <Shield size={18} strokeWidth={1.75} color={colors.grey700} />
              <ThemedText type="body1" darkColor={colors.grey800}>
                {selectedMember.role === 'host' ? 'Remove Co-host' : 'Make Co-host'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetItem}
              onPress={async () => {
                try {
                  await handleRemoveMember(selectedMember._id);
                } finally {
                  setSelectedMember(null);
                }
              }}
            >
              <UserMinus size={18} strokeWidth={1.75} color={colors.error} />
              <ThemedText type="body1" darkColor={colors.error}>
                Remove from Event
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => setSelectedMember(null)}
            >
              <ThemedText type="body1" darkColor={colors.grey700}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: 60,
    paddingBottom: spacing[6],
  },
  back: {
    width: 40,
    height: 40,
    minWidth: 40,
    marginBottom: spacing[4],
    backgroundColor: colors.darkSurface2,
    borderWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing[3],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  selectBtn: {
    minWidth: 64,
  },
  bulkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.darkSurface2,
    borderTopWidth: 1,
    borderTopColor: colors.darkSurface2,
  },
  bulkBarActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  bulkBarBtn: {
    minWidth: 80,
  },
  selectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  selectOverlaySelected: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tabsContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.darkSurface2,
    padding: spacing[1],
    borderRadius: radii.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2.5],
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabTextActive: {
    fontFamily: typography.fontFamily.bold,
  },
  expiredBanner: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[2],
  },
  expiredActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginLeft: 'auto',
  },
  expiredBtn: {
    minWidth: 80,
  },
  expiredText: {
    color: colors.warning,
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    flex: 1,
  },
  retryBanner: {
    backgroundColor: colors.errorDark,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  retryText: {
    color: colors.white,
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    flex: 1,
  },
  retryBtn: {
    minWidth: 64,
  },
  grid: {
    paddingHorizontal: spacing[6],
    paddingBottom: 40,
  },
  row: {
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  thumb: {
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  thumbInner: {
    flex: 1,
    backgroundColor: colors.darkSurface2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.darkSurface2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIcon: {
    marginBottom: spacing[4],
  },
  expiredPlaceholder: {
    flex: 1,
  },
  memberList: {
    paddingHorizontal: spacing[6],
    paddingBottom: 40,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSurface2,
  },
  memberInfo: {
    flex: 1,
  },
  memberActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  snackbarContainer: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
    bottom: spacing[6],
    alignItems: 'center',
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
});
