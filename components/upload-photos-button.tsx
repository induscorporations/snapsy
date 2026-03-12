import { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@/convex/_generated/api';

import { uploadPhotoFromUri } from '@/lib/uploadPhoto';
import { useUploadStore } from '@/stores/useUploadStore';
import { Colors, SPACING, RADIUS, PRIMARY, G900 } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

type Props = {
  eventId: string;
  uploadedBy: string;
};

export function UploadPhotosButton({ eventId, uploadedBy }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const savePhoto = useMutation(api.photos.save);
  const addPending = useUploadStore((s) => s.addPending);
  const addToQueue = useUploadStore((s) => s.addToQueue);
  const setProgress = useUploadStore((s) => s.setProgress);
  const clearQueue = useUploadStore((s) => s.clearQueue);

  const pickAndUpload = async () => {
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

    // Navigate to progress screen immediately for premium feel
    router.push({
      pathname: '/upload-progress',
      params: { count: result.assets.length.toString(), eventId }
    });

    setUploading(true);
    clearQueue();
    for (const asset of result.assets) {
      addToQueue(asset.uri);
    }

    // Process uploads in background
    (async () => {
      for (const asset of result.assets) {
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
            addPending({ uri: asset.uri, eventId, uploadedBy });
            setProgress(asset.uri, 0, false, out.error);
          }
        } catch (e) {
             addPending({ uri: asset.uri, eventId, uploadedBy });
             setProgress(asset.uri, 0, false, (e as any).message);
        }
      }
      setUploading(false);
      // We don't clear immediately so progress screen can see results if needed
    })();
  };

  return (
    <View style={styles.wrap}>
      <Button 
        onPress={pickAndUpload} 
        disabled={uploading}
        loading={uploading}
        variant="primary"
        size="sm"
        iconL="upload"
      >
        Upload
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minWidth: 100,
  },
});
