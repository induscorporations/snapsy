import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';
import { TopHeader } from '@/components/navigation/Navigation';
import { Card, ListItem } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/ui/Typography';
import { Bell, Shield, Clock, Download, Trash2, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { BottomSheet } from '@/components/navigation/Navigation';
import { Input } from '@/components/ui/Input';
import { version as appVersion } from '../package.json';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const deleteMyAccount = useMutation(api.users.deleteMyAccount);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!convexUserId) return;
    setDeleting(true);
    try {
      await deleteMyAccount({ userId: convexUserId as any });
      await signOut();
      useAuthStore.getState().setConvexUserId(null);
      router.replace('/(auth)/sign-in');
    } finally {
      setDeleting(false);
      setDeleteSheetOpen(false);
      setConfirmText('');
    }
  };

  const openTerms = () => {
    router.push('/(auth)/sign-in'); // placeholder if needed by navigation stack
  };

  const openPrivacy = () => {
    router.push('/(auth)/sign-in'); // placeholder if needed by navigation stack
  };

  return (
    <View style={styles.container}>
      <TopHeader title="Settings" showBack onBack={() => router.back()} transparent />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>
            ACCOUNT
          </ThemedText>
          <Card variant="flat" padding={spacing[5]}>
            <ListItem
              icon={() => <Bell size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />}
              title="Notifications"
              subtitle="Manage push alerts"
              trailing={<ChevronRight size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />}
              onPress={() => {}}
            />
            <ListItem
              icon={() => <Shield size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />}
              title="Privacy"
              subtitle="Face data, visibility"
              trailing={<ChevronRight size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />}
              onPress={() => router.push('/privacy')}
            />
            <ListItem
              icon={() => <Clock size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />}
              title="Retention"
              subtitle="Default photo retention period"
              trailing={<ChevronRight size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />}
              onPress={() => {}}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>
            DATA
          </ThemedText>
          <Card variant="flat" padding={spacing[5]}>
            <ListItem
              icon={() => <Download size={iconSize.md} strokeWidth={1.75} color={colors.grey700} />}
              title="Export my data"
              trailing={<ChevronRight size={iconSize.sm} strokeWidth={1.75} color={colors.grey400} />}
              onPress={() => {}}
            />
            <ListItem
              icon={() => <Trash2 size={iconSize.md} strokeWidth={1.75} color={colors.error} />}
              title="Delete Account"
              onPress={() => setDeleteSheetOpen(true)}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" darkColor={colors.grey400} style={styles.sectionLabel}>
            ABOUT
          </ThemedText>
          <Card variant="flat" padding={spacing[5]}>
            <ListItem
              title="Terms of Service"
              trailing={
                <ExternalLink href="https://snapsy.app/terms">
                  <Text style={styles.linkText}>Open</Text>
                </ExternalLink>
              }
              onPress={() => {}}
            />
            <ListItem
              title="Privacy Policy"
              trailing={
                <ExternalLink href="https://snapsy.app/privacy">
                  <Text style={styles.linkText}>Open</Text>
                </ExternalLink>
              }
              onPress={() => {}}
            />
            <ListItem
              title="Version"
              trailing={
                <Text style={styles.versionText}>{appVersion}</Text>
              }
            />
          </Card>
        </View>
      </ScrollView>

      <BottomSheet
        visible={deleteSheetOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteSheetOpen(false);
            setConfirmText('');
          }
        }}
        title="Delete Account"
        subtitle="This action is permanent and cannot be undone."
        snapHeight={0.55}
      >
        <View style={styles.sheetContent}>
          <Card variant="bordered" padding={spacing[4]} style={styles.warningCard}>
            <Text style={styles.warningTitle}>Everything will be permanently deleted:</Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• Your face profile and embeddings</Text>
              <Text style={styles.warningItem}>• All your photo matches</Text>
              <Text style={styles.warningItem}>• All events you've hosted</Text>
              <Text style={styles.warningItem}>• Your account and all data</Text>
            </View>
          </Card>

          <View style={styles.sheetButtons}>
            <View style={styles.confirmWrap}>
              <Input
                placeholder='Type "DELETE" to confirm'
                value={confirmText}
                onChangeText={setConfirmText}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Button
                variant="destructive"
                fullWidth
                onPress={handleDeleteAccount}
                loading={deleting}
                disabled={confirmText !== 'DELETE' || deleting}
              >
                Permanently Delete
              </Button>
            </View>

            <Button
              variant="ghost"
              fullWidth
              onPress={() => {
                if (!deleting) {
                  setDeleteSheetOpen(false);
                  setConfirmText('');
                }
              }}
            >
              Continue Using Snapsy
            </Button>
          </View>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[8],
    paddingBottom: spacing[12],
    gap: spacing[8],
  },
  section: {
    gap: spacing[3],
  },
  sectionLabel: {
    letterSpacing: 1.2,
    fontFamily: typography.fontFamily.bold,
    color: colors.grey400,
  },
  linkText: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary,
  },
  versionText: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.grey600,
  },
  sheetContent: {
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[4],
  },
  warningCard: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  warningTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.errorDark,
    marginBottom: spacing[2],
  },
  warningList: {
    gap: spacing[1],
  },
  warningItem: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.errorDark,
  },
  sheetButtons: {
    gap: spacing[3],
  },
  confirmWrap: {
    gap: spacing[2],
  },
});

