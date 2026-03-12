import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { User, CheckCircle, LogOut, Settings } from 'lucide-react-native';

import { useAuthStore } from '@/stores/useAuthStore';
import { SelfiePicker } from '@/components/selfie-picker';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { Button, Card } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { ListItem } from '@/components/ui/Card';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const convexUserId = useAuthStore((s) => s.convexUserId);
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

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="largeTitle" darkColor={colors.white}>Profile</ThemedText>
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
});
