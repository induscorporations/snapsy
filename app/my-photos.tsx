import { View, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions, StatusBar } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';

import { useAuthStore } from '@/stores/useAuthStore';
import { Colors, SPACING, BACKGROUND_DARK, G400, PRIMARY, G700 } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ThemedText } from '@/components/ui/Typography';

export default function MyPhotosScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const photos = useQuery(
    api.photoMatches.getAllMatchedPhotosWithUrls,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );
  const { width } = useWindowDimensions();
  const size = (width - SPACING.lg * 2 - 16) / 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <Icon name="arrowLeft" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText type="title2" darkColor="#FFFFFF">Photos of you</ThemedText>
        <ThemedText type="small" darkColor={G400}>All matched photos across events</ThemedText>
      </View>

      {photos && photos.length === 0 && (
        <View style={styles.empty}>
          <Icon name="image" size={48} color={G700} style={{ marginBottom: 16 }} />
          <ThemedText type="body2" darkColor={G400} style={{ textAlign: 'center' }}>
            No photos of you yet. Join events and add a selfie to get matched.
          </ThemedText>
        </View>
      )}

      <FlatList
        data={photos ?? []}
        numColumns={3}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeIn.delay(index * 40).duration(200)}
            style={[styles.thumb, { width: size, height: size }]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.thumbInner}
              onPress={() => router.push({ pathname: '/modal', params: { photoId: item._id, photoIds: (photos ?? []).map((p) => p._id).join(',') } })}
            >
              {item.url ? (
                <ExpoImage 
                  source={{ uri: item.url }} 
                  style={styles.thumbImage} 
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
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
});
