import { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const [saving, setSaving] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const saveFace = useMutation(api.faces.save);

  const handleImage = async (uri: string) => {
    setPreviewUri(uri);
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

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await handleImage(result.assets[0].uri);
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
      await handleImage(result.assets[0].uri);
    }
  };

  const showOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take selfie', 'Choose from library'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) openCamera();
          else if (index === 2) openLibrary();
        }
      );
    } else {
      Alert.alert('Update selfie', undefined, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take selfie', onPress: openCamera },
        { text: 'Choose from library', onPress: openLibrary },
      ]);
    }
  };

  if (variant === 'onboarding') {
    return (
      <View style={styles.onboardingContainer}>
        <TouchableOpacity 
          style={styles.previewCircle} 
          onPress={showOptions}
          disabled={saving}
        >
          {previewUri ? (
            <View style={styles.previewActive}>
               <Icon name="checkCircle" size={32} color={PRIMARY} solid />
               {saving && (
                 <View style={styles.savingOverlay}>
                   <ActivityIndicator color={PRIMARY} />
                 </View>
               )}
            </View>
          ) : (
            <Icon name="camera" size={32} color={G400} />
          )}
        </TouchableOpacity>
        
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={showOptions}
          loading={saving}
          disabled={saving}
          iconL="camera"
        >
          {previewUri ? 'Change Selfie' : 'Take Selfie'}
        </Button>
      </View>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="md" 
      onPress={showOptions}
      loading={saving}
      disabled={saving}
    >
      Update selfie
    </Button>
  );
}

const styles = StyleSheet.create({
  onboardingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  previewCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: G800,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  previewActive: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 240, 115, 0.1)',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
