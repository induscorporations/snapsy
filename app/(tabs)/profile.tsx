import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { User, CheckCircle, LogOut, Settings, Trash2, Cloud, Calendar, ChevronRight } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { SelfiePicker } from '@/components/selfie-picker';
import { BottomSheet } from '@/components/navigation/Navigation';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { Button, Card, ProgressBar } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { ListItem } from '@/components/ui/Card';
import { PressableScale } from '@/components/pressable-scale';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useClerk();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const avatarLetter = user?.firstName?.charAt(0)?.toUpperCase()
    ?? user?.fullName?.charAt(0)?.toUpperCase()
    ?? '';
  const faces = useQuery(
    api.faces.listByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const deleteMyFaces = useMutation(api.faces.deleteMyFaces);
  const hasSelfie = faces && faces.length > 0;
  const [deleteFaceSheetOpen, setDeleteFaceSheetOpen] = useState(false);
  const [deletingFace, setDeletingFace] = useState(false);

  const events = useQuery(
    api.events.listByUser,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );
  const storageUsage = useQuery(
    api.users.getStorageUsage,
    convexUserId ? { userId: convexUserId as any } : 'skip'
  );
  const eventCount = events?.length ?? 0;
  const usedBytes = storageUsage?.usedBytes ?? 0;
  const totalBytes = storageUsage?.totalBytes ?? 2 * 1024 * 1024 * 1024;
  const usedPct = totalBytes ? Math.round((usedBytes / totalBytes) * 100) : 0;

  const handleSignOut = async () => {
    await signOut();
    useAuthStore.getState().setConvexUserId(null);
    router.replace('/(auth)/sign-in');
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
          <View style={styles.avatarCircle}>
            {avatarLetter ? (
              <ThemedText type="title1" darkColor={colors.white} style={styles.avatarLetter}>
                {avatarLetter}
              </ThemedText>
            ) : (
              <User size={iconSize['2xl']} strokeWidth={1.75} color={colors.white} />
            )}
          </View>
          <ThemedText type="largeTitle" darkColor={colors.white} style={styles.headerTitle}>Profile</ThemedText>
          <ThemedText type="body2" darkColor={colors.grey400}>Manage your face & account</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>FACE PROFILE</ThemedText>
          <Card variant="bordered" style={styles.faceCard}>
            <View style={styles.faceIcon}>
              {hasSelfie ? (
                <CheckCircle size={iconSize['3xl']} strokeWidth={0} fill={colors.primaryDark} color={colors.primaryDark} />
              ) : (
                <User size={iconSize['3xl']} strokeWidth={1.75} color={colors.grey400} />
              )}
            </View>
            <View style={styles.faceInfo}>
              <ThemedText type="headline" darkColor={colors.white}>
                {hasSelfie ? 'Biometric set' : 'No selfie'}
              </ThemedText>
              <ThemedText type="caption" darkColor={colors.grey400}>
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
          {hasSelfie && (
            <Button
              variant="ghost"
              size="md"
              onPress={() => setDeleteFaceSheetOpen(true)}
              iconLeft={<Trash2 size={iconSize.md} strokeWidth={1.75} color={colors.error} />}
              style={styles.deleteFaceBtn}
            >
              Delete face profile
            </Button>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>JOINED EVENTS</ThemedText>
          <PressableScale onPress={() => router.push('/(tabs)/events')}>
            <Card variant="bordered" style={styles.eventCountCard}>
              <Calendar size={iconSize.lg} strokeWidth={1.75} color={colors.grey400} />
              <View style={styles.eventCountInfo}>
                <ThemedText type="headline" darkColor={colors.white}>
                  {eventCount} event{eventCount !== 1 ? 's' : ''}
                </ThemedText>
                <ThemedText type="caption" darkColor={colors.grey400}>
                  Tap to view and manage
                </ThemedText>
              </View>
              <ChevronRight size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />
            </Card>
          </PressableScale>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>STORAGE</ThemedText>
          <Card variant="bordered" style={styles.storageCard}>
            <View style={styles.storageRow}>
              <Cloud size={iconSize.md} strokeWidth={1.75} color={colors.grey400} />
              <ThemedText type="caption" darkColor={colors.grey400}>
                {(usedBytes / (1024 * 1024)).toFixed(1)} MB of {(totalBytes / (1024 * 1024 * 1024)).toFixed(0)} GB used
              </ThemedText>
            </View>
            <ProgressBar value={usedPct} />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>ACCOUNT</ThemedText>
          <View style={styles.actions}>
            <Button 
              variant="ghost" 
              size="lg" 
              fullWidth 
              onPress={handleSignOut}
              iconRight={<LogOut size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />}
            >
              Sign out
            </Button>

            <Card variant="flat" padding={spacing[5]} style={styles.settingsCard}>
              <ListItem
                icon={() => <Settings size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />}
                title="Settings"
                trailing={<Settings size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />}
                onPress={() => router.push('/settings')}
              />
            </Card>
          </View>
        </View>
      </ScrollView>

      <BottomSheet
        visible={deleteFaceSheetOpen}
        onClose={() => setDeleteFaceSheetOpen(false)}
        title="Delete face profile"
        subtitle="Your face embedding will be removed. You can add a new selfie anytime."
        snapHeight={0.35}
      >
        <View style={styles.sheetActions}>
          <Button
            variant="destructive"
            fullWidth
            onPress={async () => {
              setDeletingFace(true);
              try {
                await deleteMyFaces({});
                setDeleteFaceSheetOpen(false);
              } catch (e) {
                Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete.');
              } finally {
                setDeletingFace(false);
              }
            }}
            loading={deletingFace}
            disabled={deletingFace}
          >
            Delete
          </Button>
          <Button variant="ghost" fullWidth onPress={() => setDeleteFaceSheetOpen(false)}>
            Cancel
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: 80,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing[8],
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  avatarLetter: {
    fontFamily: typography.fontFamily.bold,
  },
  headerTitle: {
    marginBottom: spacing[1],
  },
  section: {
    marginBottom: 40,
  },
  sectionLabel: {
    letterSpacing: 1.2,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing[4],
  },
  faceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: colors.darkSurface2,
    borderColor: colors.darkBorder,
  },
  faceIcon: {
    width: 64,
    height: 64,
    borderRadius: radii['3xl'],
    backgroundColor: colors.darkSurface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  faceInfo: {
    flex: 1,
  },
  facePickerContainer: {
    marginTop: spacing[4],
  },
  actions: {
    gap: spacing[4],
    alignItems: 'center',
  },
  settingsCard: {
    alignSelf: 'stretch',
  },
  deleteFaceBtn: {
    marginTop: spacing[3],
    alignSelf: 'flex-start',
  },
  sheetActions: {
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  eventCountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[5],
    backgroundColor: colors.darkSurface2,
    borderColor: colors.darkBorder,
  },
  eventCountInfo: {
    flex: 1,
    marginLeft: spacing[4],
  },
  storageCard: {
    padding: spacing[5],
    backgroundColor: colors.darkSurface2,
    borderColor: colors.darkBorder,
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
});
