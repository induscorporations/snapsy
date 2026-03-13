import { useState } from 'react';
import { View, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { Upload } from 'lucide-react-native';

import { uploadPhotoFromUri } from '@/lib/uploadPhoto';
import { useUploadStore } from '@/stores/useUploadStore';
import { Button, ProgressBar, Snackbar } from '@/components';
import { colors, spacing, iconSize } from '@/constants/tokens';

type Props = {
  eventId: string;
  uploadedBy: string;
};

export function UploadPhotosButton({ eventId, uploadedBy }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const savePhoto = useMutation(api.photos.save);
  const addPending = useUploadStore((s) => s.addPending);
  const addToQueue = useUploadStore((s) => s.addToQueue);
  const setProgress = useUploadStore((s) => s.setProgress);
  const clearQueue = useUploadStore((s) => s.clearQueue);
  const queue = useUploadStore((s) => s.queue);

  const uploadProgress =
    queue.length > 0
      ? queue.reduce((acc, q) => acc + q.progress, 0) / queue.length
      : 0;

  const runUploadWithAssets = async (assets: { uri: string }[]) => {
    if (!assets.length) return;
    router.push({
      pathname: '/upload-progress',
      params: { count: assets.length.toString(), eventId },
    });
    setUploading(true);
    setSnackbar(null);
    clearQueue();
    for (const asset of assets) {
      addToQueue(asset.uri);
    }
    (async () => {
      let hasError = false;
      for (const asset of assets) {
        try {
          const out = await uploadPhotoFromUri(asset.uri, {
            getUploadUrl: () => generateUploadUrl({ userId: uploadedBy as any }),
            savePhoto: (args) => savePhoto({ ...args, eventId: eventId as any, uploadedBy: uploadedBy as any }),
            eventId,
            uploadedBy,
          });
          if ('photoId' in out) {
            setProgress(asset.uri, 100, true);
          } else {
            hasError = true;
            addPending({ uri: asset.uri, eventId, uploadedBy });
            setProgress(asset.uri, 0, false, out.error);
          }
        } catch (e) {
          hasError = true;
          addPending({ uri: asset.uri, eventId, uploadedBy });
          setProgress(asset.uri, 0, false, (e as any).message);
        }
      }
      setSnackbar({
        type: hasError ? 'error' : 'success',
        message: hasError ? 'Upload failed' : 'Photos uploaded',
      });
      setUploading(false);
    })();
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to upload.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    runUploadWithAssets(result.assets);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    runUploadWithAssets(result.assets);
  };

  const pickFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      runUploadWithAssets(result.assets.map((a) => ({ uri: a.uri })));
    } catch (e) {
      Alert.alert('Error', 'Could not open file picker.');
    }
  };

  const showUploadSourceSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery', 'Browse files'],
          cancelButtonIndex: 0,
        },
        (i) => {
          if (i === 1) takePhoto();
          else if (i === 2) pickFromGallery();
          else if (i === 3) pickFromFiles();
        }
      );
    } else {
      Alert.alert(
        'Add photos',
        undefined,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Gallery', onPress: pickFromGallery },
          { text: 'Browse files', onPress: pickFromFiles },
        ]
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Button
        variant="primary"
        size="lg"
        onPress={showUploadSourceSheet}
        disabled={uploading}
        loading={uploading}
        iconLeft={
          <Upload
            size={iconSize.md}
            strokeWidth={1.75}
            color={colors.grey900}
          />
        }
      >
        Upload
      </Button>

      {uploading && queue.length > 0 && (
        <View style={styles.progressWrap}>
          <ProgressBar value={uploadProgress} />
        </View>
      )}

      {snackbar && (
        <Snackbar
          type={snackbar.type}
          message={snackbar.message}
          visible
          duration={3000}
          onHide={() => setSnackbar(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 100,
    gap: spacing[3],
  },
  progressWrap: {
    marginTop: spacing[2],
  },
});
