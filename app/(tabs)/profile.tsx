import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

import { useAuthStore } from '@/stores/useAuthStore';
import { SelfiePicker } from '@/components/selfie-picker';
import { PressableScale } from '@/components/pressable-scale';
import { Colors, SPACING, RADIUS, PRIMARY, BACKGROUND_DARK, G400, G700, G800 } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Typography';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const [deleting, setDeleting] = useState(false);
  const faces = useQuery(
    api.faces.listByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const hasSelfie = faces && faces.length > 0;

  const handleSignOut = async () => {
    await signOut();
    useAuthStore.getState().setConvexUserId(null);
    router.replace('/(auth)/sign-in');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your Snapsy data (faces, event memberships, photo matches). You will be signed out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my data',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteMyAccount({ userId: convexUserId as any });
              await signOut();
              useAuthStore.getState().setConvexUserId(null);
              router.replace('/(auth)/sign-in');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="largeTitle" darkColor="#FFFFFF">Profile</ThemedText>
          <ThemedText type="body2" darkColor={G400}>Manage your face & account</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={G400} style={styles.sectionLabel}>FACE PROFILE</ThemedText>
          <Card variant="bordered" style={styles.faceCard}>
            <View style={styles.faceIcon}>
              <Icon name={hasSelfie ? "checkCircle" : "user"} size={32} color={hasSelfie ? PRIMARY : G400} solid={hasSelfie} />
            </View>
            <View style={styles.faceInfo}>
              <ThemedText type="headline" darkColor="#FFFFFF">
                {hasSelfie ? 'Biometric set' : 'No selfie'}
              </ThemedText>
              <ThemedText type="caption" darkColor={G400}>
                {hasSelfie 
                  ? 'Your on-device matching profile is active.' 
                  : 'Add a selfie to find your photos automatically.'}
              </ThemedText>
            </View>
          </Card>
          
          <View style={styles.facePickerContainer}>
            {convexUserId && (
              <SelfiePicker userId={convexUserId} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={G400} style={styles.sectionLabel}>ACCOUNT</ThemedText>
          <View style={styles.actions}>
            <Button 
              variant="ghost" 
              size="lg" 
              fullWidth 
              onPress={handleSignOut}
              iconL="arrowRight"
            >
              Sign out
            </Button>
            
            <Button 
              variant="ghost" 
              size="md" 
              onPress={handleDeleteAccount}
              loading={deleting}
              disabled={deleting}
              style={styles.deleteBtn}
            >
              <ThemedText type="caption" darkColor="#FF4B4B">Delete account data</ThemedText>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_DARK,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: 40,
  },
  sectionLabel: {
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 16,
  },
  faceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  faceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  faceInfo: {
    flex: 1,
  },
  facePickerContainer: {
    marginTop: 16,
  },
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  deleteBtn: {
    marginTop: 8,
  },
});
