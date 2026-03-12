import { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Alert,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';

import { useAuthStore } from '@/stores/useAuthStore';
import { UploadPhotosButton } from '@/components/upload-photos-button';
import { Colors, SPACING, RADIUS, BACKGROUND_DARK, G400, PRIMARY, G800, G700 } from '@/constants/theme';
import { ThemedText } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const [tab, setTab] = useState<'my' | 'all' | 'members'>('my');

  const event = useQuery(
    api.events.get,
    id ? { eventId: id as any, userId: convexUserId as any } : 'skip'
  );
  const allPhotos = useQuery(
    api.photos.listByEvent,
    id ? { eventId: id as any, userId: convexUserId as any } : 'skip'
  );
  const myPhotosWithUrls = useQuery(
    api.photoMatches.getMatchedPhotosWithUrls,
    convexUserId && id ? { userId: convexUserId as any, eventId: id as any } : 'skip'
  );
  const members = useQuery(
    (api as any).eventMembers.listByEvent,
    id ? { eventId: id as any } : 'skip'
  );

  const removeMember = useMutation((api as any).eventMembers.remove);
  const updateRole = useMutation((api as any).eventMembers.updateRole);

  const isHost = event?.hostId === convexUserId;
  const photos =
    tab === 'my' && myPhotosWithUrls
      ? myPhotosWithUrls
      : (allPhotos ?? []);

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

  const { width } = useWindowDimensions();
  const size = (width - SPACING.lg * 2 - SPACING.xs * 2) / 3;

  if (!id) return null;
  if (event === undefined) return <View style={styles.placeholder} />;
  if (!event) {
    router.replace('/(tabs)');
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <Icon name="arrowLeft" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <ThemedText type="title2" darkColor="#FFFFFF">{event.name}</ThemedText>
            <ThemedText type="small" darkColor={G400}>{event.privacy} · {event.retentionDays}d left</ThemedText>
          </View>
          {isHost && convexUserId && tab !== 'members' && (
            <UploadPhotosButton eventId={id} uploadedBy={convexUserId} />
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'my' && styles.tabActive]}
            onPress={() => setTab('my')}
            activeOpacity={0.8}
          >
            <ThemedText 
              type="caption" 
              darkColor={tab === 'my' ? G800 : G400} 
              style={tab === 'my' && styles.tabTextActive}
            >
              For You
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'all' && styles.tabActive]}
            onPress={() => setTab('all')}
            activeOpacity={0.8}
          >
            <ThemedText 
              type="caption" 
              darkColor={tab === 'all' ? G800 : G400} 
              style={tab === 'all' && styles.tabTextActive}
            >
              All Activity
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'members' && styles.tabActive]}
            onPress={() => setTab('members')}
            activeOpacity={0.8}
          >
            <ThemedText 
              type="caption" 
              darkColor={tab === 'members' ? G800 : G400} 
              style={tab === 'members' && styles.tabTextActive}
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
            <View style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <ThemedText type="headline" darkColor="#FFFFFF">{item.userName}</ThemedText>
                <ThemedText type="caption" darkColor={G400}>{item.role}</ThemedText>
              </View>
              {isHost && item.userId !== convexUserId && (
                <View style={styles.memberActions}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onPress={() => handleToggleRole(item)}
                  >
                    {item.role === 'host' ? 'Demote' : 'Promote'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onPress={() => handleRemoveMember(item._id)}
                  >
                    Remove
                  </Button>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="user" size={48} color={G700} style={{ marginBottom: 16 }} />
              <ThemedText type="body2" darkColor={G400}>No members yet.</ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="image" size={48} color={G700} style={{ marginBottom: 16 }} />
              <ThemedText type="body2" darkColor={G400}>No photos found yet.</ThemedText>
            </View>
          }
          renderItem={({ item, index }) => {
            const photo = item && typeof item === 'object' && 'url' in item ? (item as any) : { ...item, url: null as string | null };
            return (
              <Animated.View
                entering={FadeIn.delay(index * 40).duration(200)}
                style={[styles.thumb, { width: size, height: size }]}
              >
                <TouchableOpacity
                  style={styles.thumbInner}
                  onPress={() => router.push({ pathname: '/modal', params: { photoId: item._id, photoIds: photos.map((p) => p._id).join(',') } })}
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
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
  },
  placeholder: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: PRIMARY,
  },
  tabTextActive: {
    fontWeight: '700',
  },
  grid: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  thumb: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbInner: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  memberList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  memberInfo: {
    flex: 1,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
