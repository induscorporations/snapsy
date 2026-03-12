import { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useQuery, useMutation } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';

import { useAuthStore } from '@/stores/useAuthStore';
import { Colors, SPACING, BACKGROUND_DARK, G400, PRIMARY, G800 } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ThemedText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 200;

export default function ModalScreen() {
  const { photoId, photoIds: photoIdsParam } = useLocalSearchParams<{ photoId?: string; photoIds?: string }>();
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const { width, height } = useWindowDimensions();
  const [saving, setSaving] = useState(false);
  const hideFromMyPhotos = useMutation(api.photoMatches.hideFromMyPhotos);

  const photoIds = photoIdsParam ? photoIdsParam.split(',').filter(Boolean) : [];
  const currentIndex = photoId && photoIds.length ? photoIds.indexOf(photoId) : -1;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < photoIds.length - 1;

  const photo = useQuery(
    api.photos.get,
    photoId ? { photoId: photoId as any, userId: convexUserId as any } : 'skip'
  );

  const goPrev = useCallback(() => {
    if (canGoPrev && photoIds[currentIndex - 1]) {
      router.setParams({ photoId: photoIds[currentIndex - 1], photoIds: photoIdsParam });
    }
  }, [canGoPrev, currentIndex, photoIds, photoIdsParam, router]);

  const goNext = useCallback(() => {
    if (canGoNext && photoIds[currentIndex + 1]) {
      router.setParams({ photoId: photoIds[currentIndex + 1], photoIds: photoIdsParam });
    }
  }, [canGoNext, currentIndex, photoIds, photoIdsParam, router]);

  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      const { translationY, velocityY, translationX, velocityX } = e;
      if (translationY > SWIPE_THRESHOLD || velocityY > VELOCITY_THRESHOLD) {
        router.back();
        return;
      }
      if (photoIds.length > 0) {
        if (translationX < -SWIPE_THRESHOLD || velocityX < -VELOCITY_THRESHOLD) {
          goNext();
        } else if (translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD) {
          goPrev();
        }
      }
    });

  const handleNotMe = async () => {
    if (!photoId || !convexUserId) return;
    try {
      await hideFromMyPhotos({ photoId: photoId as any, userId: convexUserId as any });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not hide photo.');
    }
  };

  const recordDownload = useMutation(api.photos.recordDownload);

  const handleDownload = async () => {
    if (!photo?.url || !photoId || !convexUserId) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to save photos to your device.');
        return;
      }
      const filename = `snapsy-${photoId}.jpg`;
      const localUri = `${(FileSystem as any).cacheDirectory}${filename}`;
      await FileSystem.downloadAsync(photo.url, localUri);
      await MediaLibrary.createAssetAsync(localUri);
      
      // Record the download in the backend
      await recordDownload({ photoId: photoId as any, userId: convexUserId as any });
      
      Alert.alert('Saved', 'Photo saved to your library.');
    } catch (e) {
      Alert.alert('Download failed', e instanceof Error ? e.message : 'Could not save photo.');
    } finally {
      setSaving(false);
    }
  };

  if (!photoId || photo === null) {
    if (photo === null) router.back();
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Icon name="arrowLeft" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ThemedText type="small" darkColor="#FFFFFF" style={{ textAlign: 'center' }}>
            {currentIndex >= 0 ? `${currentIndex + 1} of ${photoIds.length}` : 'Viewing Photo'}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={handleNotMe}
          activeOpacity={0.7}
        >
          <Icon name="alertCircle" size={22} color={G400} />
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.viewer}>
          {photo?.url ? (
            <ExpoImage
              source={{ uri: photo.url }}
              style={[styles.image, { width, height: height * 0.7 }]}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <View style={[styles.placeholder, { width, height: height * 0.7 }]} />
          )}
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrev && styles.navDisabled]}
            onPress={goPrev}
            disabled={!canGoPrev}
          >
            <Icon name="arrowLeft" size={24} color={canGoPrev ? "#FFFFFF" : "rgba(255,255,255,0.2)"} />
          </TouchableOpacity>

          <Button
            onPress={handleDownload}
            variant="primary"
            loading={saving}
            iconL="download"
            style={styles.downloadBtn}
          >
            Save to Device
          </Button>

          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navDisabled]}
            onPress={goNext}
            disabled={!canGoNext}
          >
            <Icon name="arrowRight" size={24} color={canGoNext ? "#FFFFFF" : "rgba(255,255,255,0.2)"} />
          </TouchableOpacity>
        </View>
        
        {convexUserId && (
          <TouchableOpacity style={styles.notMe} onPress={handleNotMe}>
            <ThemedText type="caption" darkColor={G400}>Not me? Hide from my photos</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: 'transparent',
  },
  placeholder: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDisabled: {
    backgroundColor: 'transparent',
  },
  downloadBtn: {
    flex: 1,
  },
  notMe: {
    marginTop: 20,
    alignItems: 'center',
  },
});
