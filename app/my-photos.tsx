import { View, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions, StatusBar } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, radii } from '@/constants/tokens';
import { ThemedText } from '@/components/ui/Typography';
import { ArrowLeft, Image } from 'lucide-react-native';
import { Button } from '@/components';

export default function MyPhotosScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const photos = useQuery(
    api.photoMatches.getAllMatchedPhotosWithUrls,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );
  const { width } = useWindowDimensions();
  const size = (width - spacing[6] * 2 - spacing[4]) / 3;

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
        <ThemedText type="title2" darkColor={colors.white}>Photos of you</ThemedText>
        <ThemedText type="small" darkColor={colors.grey400}>All matched photos across events</ThemedText>
      </View>

      {photos && photos.length === 0 && (
        <View style={styles.empty}>
          <Image size={48} strokeWidth={1.75} color={colors.grey700} style={styles.emptyIcon} />
          <ThemedText type="body2" darkColor={colors.grey400} style={styles.emptyText}>
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
    backgroundColor: colors.darkBg,
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: 60,
    paddingBottom: spacing[6],
  },
  back: {
    width: 40,
    minWidth: 40,
    marginBottom: spacing[4],
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
  },
  emptyIcon: {
    marginBottom: spacing[4],
  },
  emptyText: {
    textAlign: 'center',
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
});
