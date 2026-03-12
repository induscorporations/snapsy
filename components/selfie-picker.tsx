import { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { createPlaceholderEmbedding } from '@/lib/embedding';
import { PressableScale } from '@/components/pressable-scale';
import { Colors, SPACING, RADIUS, PRIMARY, BACKGROUND_DARK, G400, G700, G800 } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';

type Props = {
  userId: string;
  onSaved?: () => void;
  variant?: 'default' | 'onboarding';
};

export function SelfiePicker({ userId, onSaved, variant = 'default' }: Props) {
  const cameraRef = useRef<CameraView | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const saveFace = useMutation(api.faces.save);

  const handleSave = async () => {
    if (!previewUri) return;
    setSaving(true);
    try {
      // In a real app, this is where we'd run face detection/embedding on-device.
      // For MVP, we simulate the processing time for a "premium" feel.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const embedding = createPlaceholderEmbedding();
      await saveFace({ userId, embedding });
      onSaved?.();
      
      if (variant !== 'onboarding') {
        Alert.alert('Done', 'Your selfie is saved. Photos of you will be matched to events you join.');
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save.');
      setPreviewUri(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || saving) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });
      if (photo?.uri) {
        setPreviewUri(photo.uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not capture photo.');
    }
  };

  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <ThemedText type="body2" darkColor={G400}>
          Allow camera access to take a selfie.
        </ThemedText>
        <Button
          variant="primary"
          size="md"
          onPress={requestPermission}
          style={{ marginTop: SPACING.md }}
        >
          Enable Camera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.cameraWrapper}>
      <View style={styles.cameraContainer}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.previewImage} />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          />
        )}
        {saving && (
          <View style={styles.cameraSavingOverlay}>
            <ActivityIndicator color={PRIMARY} />
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {!previewUri ? (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={saving}
          >
            <Icon name="camera" size={32} color={BACKGROUND_DARK} solid />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionRow}>
            <Button
              variant="ghost"
              size="md"
              onPress={() => setPreviewUri(null)}
              disabled={saving}
            >
              Retake
            </Button>
            <Button
              variant="primary"
              size="md"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            >
              Use this photo
            </Button>
          </View>
        )}

        <TouchableOpacity
          onPress={openLibrary}
          disabled={saving}
          style={styles.libraryLink}
        >
          <ThemedText type="caption" darkColor={G400}>
            Choose from library
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  cameraContainer: {
    width: '100%',
    height: '60%',
    maxHeight: 360,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: G800,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraSavingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  controls: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    width: '100%',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  libraryLink: {
    marginTop: SPACING.md,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
  },
});
