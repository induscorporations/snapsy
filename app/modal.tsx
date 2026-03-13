import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Alert, StatusBar, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useQuery, useMutation } from 'convex/react';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { api } from '@/convex/_generated/api';
import { Image as ExpoImage } from 'expo-image';

import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, radii, iconSize } from '@/constants/tokens';
import { ThemedText } from '@/components/ui/Typography';
import { Button } from '@/components';
import { ArrowLeft, ArrowRight, AlertCircle, Download, Share2, MoreHorizontal, EyeOff, Trash2, UserMinus } from 'lucide-react-native';
import { BottomSheet } from '@/components/navigation/Navigation';

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 200;

export default function ModalScreen() {
  const { photoId, photoIds: photoIdsParam } = useLocalSearchParams<{ photoId?: string; photoIds?: string }>();
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const { width, height } = useWindowDimensions();
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const hideFromMyPhotos = useMutation(api.photoMatches.hideFromMyPhotos);
  const deletePhoto = useMutation(api.photos.deletePhoto);

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

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1, { damping: 15 });
        savedScale.value = 1;
      } else if (scale.value > 4) {
        scale.value = withSpring(4, { damping: 15 });
        savedScale.value = 4;
      } else {
        savedScale.value = scale.value;
      }
    });

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
          scale.value = withSpring(1);
          savedScale.value = 1;
        } else if (translationX > SWIPE_THRESHOLD || velocityX > VELOCITY_THRESHOLD) {
          goPrev();
          scale.value = withSpring(1);
          savedScale.value = 1;
        }
      }
    });

  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
  }, [photoId]);

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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

  const handleShare = async () => {
    if (!photo?.url) return;
    try {
      await Share.share({
        url: photo.url,
        message: 'Check out this photo from Snapsy!',
      });
    } catch (e) {
      console.error(e);
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
        <Button
          variant="ghost"
          size="md"
          onPress={() => router.back()}
          iconOnly={<ArrowLeft size={24} strokeWidth={1.75} color={colors.white} />}
          style={styles.closeButton}
        />
        <View style={styles.headerInfo}>
          <ThemedText type="small" darkColor={colors.white} style={styles.headerTitle}>
            {currentIndex >= 0 ? `${currentIndex + 1} of ${photoIds.length}` : 'Viewing Photo'}
          </ThemedText>
        </View>
        <Button
          variant="ghost"
          size="md"
          onPress={() => setSheetOpen(true)}
          iconOnly={<MoreHorizontal size={22} strokeWidth={1.75} color={colors.grey400} />}
          style={styles.moreButton}
        />
      </View>

      <GestureDetector gesture={composed}>
        <View style={styles.viewer}>
          {photo?.url ? (
            <Animated.View style={[styles.imageWrap, { width, height: height * 0.7 }, animatedImageStyle]}>
              <ExpoImage
                source={{ uri: photo.url }}
                style={[styles.image, { width, height: height * 0.7 }]}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
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
            <ArrowLeft size={24} strokeWidth={1.75} color={canGoPrev ? colors.white : colors.darkSurface2} />
          </TouchableOpacity>

          <Button
            onPress={handleDownload}
            variant="primary"
            loading={saving}
            iconLeft={<Download size={20} strokeWidth={1.75} color={colors.grey900} />}
            style={styles.downloadBtn}
          >
            Save to Device
          </Button>

          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navDisabled]}
            onPress={goNext}
            disabled={!canGoNext}
          >
            <ArrowRight size={24} strokeWidth={1.75} color={canGoNext ? colors.white : colors.darkSurface2} />
          </TouchableOpacity>
        </View>

        <Button
          variant="ghost"
          size="md"
          onPress={handleShare}
          iconLeft={<Share2 size={20} strokeWidth={1.75} color={colors.white} />}
          style={styles.shareButton}
        >
          Share
        </Button>

        {convexUserId && (
          <TouchableOpacity style={styles.notMe} onPress={handleNotMe}>
            <ThemedText type="caption" darkColor={colors.grey400}>Not me? Hide from my photos</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <BottomSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="More options"
        snapHeight={0.4}
      >
        <View style={styles.sheetList}>
          {/* Host-only actions */}
          {photo && convexUserId && (photo as any).eventHostId === convexUserId && (
            <>
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
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
                            await deletePhoto({ photoId: photoId as any });
                            setSheetOpen(false);
                            router.back();
                          } catch (e) {
                            Alert.alert('Error', 'Could not delete photo.');
                          }
                        },
                      },
                    ]
                  );
                }}
              >
                <Trash2 size={iconSize.md} strokeWidth={1.75} color={colors.error} />
                <ThemedText type="body1" darkColor={colors.error}>Delete Photo</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={async () => {
                  // Placeholder: requires matchId to remove a specific user match
                  Alert.alert('Coming soon', 'Remove from specific user is not yet implemented.');
                }}
              >
                <UserMinus size={iconSize.md} strokeWidth={1.75} color={colors.warning} />
                <ThemedText type="body1" darkColor={colors.warning}>Remove from User</ThemedText>
              </TouchableOpacity>
            </>
          )}

          {/* Guest / general actions */}
          <TouchableOpacity
            style={styles.sheetItem}
            onPress={async () => {
              await handleDownload();
              setSheetOpen(false);
            }}
          >
            <Download size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />
            <ThemedText type="body1" darkColor={colors.grey800}>Download</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sheetItem}
            onPress={async () => {
              await handleShare();
              setSheetOpen(false);
            }}
          >
            <Share2 size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />
            <ThemedText type="body1" darkColor={colors.grey800}>Share</ThemedText>
          </TouchableOpacity>

          {convexUserId && (
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={async () => {
                await handleNotMe();
                setSheetOpen(false);
              }}
            >
              <EyeOff size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />
              <ThemedText type="body1" darkColor={colors.grey800}>Hide (Not me)</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  closeButton: {
    width: 44,
    minWidth: 44,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    textAlign: 'center',
  },
  moreButton: {
    width: 44,
    minWidth: 44,
  },
  viewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: 'transparent',
  },
  placeholder: {
    backgroundColor: colors.darkSurface2,
  },
  footer: {
    paddingBottom: 50,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: radii['2xl'],
    backgroundColor: colors.darkSurface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDisabled: {
    backgroundColor: 'transparent',
  },
  downloadBtn: {
    flex: 1,
  },
  shareButton: {
    marginTop: spacing[3],
  },
  notMe: {
    marginTop: spacing[5],
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
