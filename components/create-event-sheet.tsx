import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, Check, Copy, Share2 } from 'lucide-react-native';

import { Button, Input, BottomSheet } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { colors, spacing, radii, typography, iconSize } from '@/constants/tokens';

const RETENTION_OPTIONS = [7, 14, 30, 90];
const PRIVACY_OPTIONS = ['invite_only', 'link_only'] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  convexUserId: string | null;
};

export function CreateEventSheet({ open, onClose, convexUserId }: Props) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [privacy, setPrivacy] = useState<'invite_only' | 'link_only'>('invite_only');
  const [retentionDays, setRetentionDays] = useState(30);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useMutation(api.events.create);

  useEffect(() => {
    if (!open) {
      setCreatedEventId(null);
    } else {
      setError(null);
    }
  }, [open]);

  const inviteUrl = createdEventId
    ? Linking.createURL(`/join?eventId=${createdEventId}`)
    : '';

  const handleCopyLink = async () => {
    if (inviteUrl) {
      await Clipboard.setStringAsync(inviteUrl);
      Alert.alert('Copied', 'Invite link copied to clipboard.');
    }
  };

  const handleShare = async () => {
    if (!inviteUrl) return;
    try {
      await Share.share({
        message: `Join my event on Snapsy: ${inviteUrl}`,
        url: inviteUrl,
        title: 'Snapsy event invite',
      });
    } catch { }
  };

  const handleGoToEvent = () => {
    if (createdEventId) {
      onClose();
      router.push(`/event/${createdEventId}`);
    }
    setCreatedEventId(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (!convexUserId) {
      Alert.alert(
        'Not signed in',
        'Your account is still loading. Please wait a moment and try again.'
      );
      return;
    }
    setError(null);
    setIsCreating(true);
    try {
      const eventId = await createEvent({
        name: name.trim(),
        privacy,
        retentionDays,
        hostId: convexUserId as any,
      });
      setCreatedEventId(eventId as unknown as string);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not create event. Try again.';
      setError(message);
      Alert.alert('Create event failed', message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <BottomSheet
      visible={open}
      onClose={onClose}
      title={createdEventId ? 'Event Created' : 'Create Event'}
      snapHeight={0.75}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {createdEventId ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Check size={32} strokeWidth={0} fill={colors.primary} color={colors.primary} />
              </View>
              <ThemedText type="body2" style={[styles.subtitle, { color: colors.grey600 }]}>
                Your event is ready. Share the link below to invite guests.
              </ThemedText>

              <View style={styles.inviteBox}>
                <ThemedText type="small" style={[styles.inviteUrl, { color: colors.grey500 }]} numberOfLines={1}>
                  {inviteUrl}
                </ThemedText>
                <TouchableOpacity onPress={handleCopyLink} style={styles.copyButton}>
                  <Copy size={iconSize.md} strokeWidth={1.75} color={colors.primaryDark} />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonStack}>
                <Button
                  onPress={handleShare}
                  variant="secondary"
                  fullWidth
                  iconLeft={<Share2 size={iconSize.md} strokeWidth={1.75} color={colors.primaryDark} />}
                >
                  Share Invite
                </Button>
                <Button onPress={handleGoToEvent} variant="primary" fullWidth size="lg">
                  Go to Event
                </Button>
              </View>
            </View>
          ) : (
            <>
              <Input
                label="Event name"
                placeholder="e.g. Summer Wedding"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Date"
                placeholder="Select date"
                value={date}
                onChangeText={setDate}
                iconLeft={<Calendar size={iconSize.sm} strokeWidth={1.75} color={colors.grey500} />}
              />

              <View style={styles.formSection}>
                <ThemedText type="small" style={[styles.label, { color: colors.grey500 }]}>PRIVACY</ThemedText>
                <View style={styles.chipRow}>
                  {PRIVACY_OPTIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      activeOpacity={0.8}
                      style={[styles.chip, privacy === p && styles.chipActive]}
                      onPress={() => setPrivacy(p)}
                    >
                      <ThemedText
                        type="caption"
                        style={[
                          styles.chipText,
                          {
                            color: privacy === p ? colors.grey900 : colors.grey500,
                            fontFamily: privacy === p ? typography.fontFamily.semibold : typography.fontFamily.medium,
                          },
                        ]}
                      >
                        {p === 'invite_only' ? 'Private' : 'Public'}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <ThemedText type="small" style={[styles.label, { color: colors.grey500 }]}>RETENTION (DAYS)</ThemedText>
                <View style={styles.chipRow}>
                  {RETENTION_OPTIONS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.8}
                      style={[styles.chip, retentionDays === d && styles.chipActive]}
                      onPress={() => setRetentionDays(d)}
                    >
                      <ThemedText
                        type="caption"
                        style={[
                          styles.chipText,
                          {
                            color: retentionDays === d ? colors.grey900 : colors.grey500,
                            fontFamily: retentionDays === d ? typography.fontFamily.semibold : typography.fontFamily.medium,
                          },
                        ]}
                      >
                        {d} Days
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {error && (
                <ThemedText type="small" style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </ThemedText>
              )}

              <View style={styles.footer}>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onPress={handleCreate}
                  loading={isCreating}
                  disabled={!name.trim() || isCreating}
                >
                  Create Event
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  content: {
    paddingBottom: 60,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: spacing[5],
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: radii['3xl'],
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  inviteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grey50,
    padding: spacing[4],
    borderRadius: radii.md,
    width: '100%',
    marginBottom: spacing[8],
  },
  inviteUrl: {
    flex: 1,
    marginRight: spacing[3],
  },
  copyButton: {
    padding: spacing[2],
  },
  buttonStack: {
    width: '100%',
    gap: spacing[3],
  },
  formSection: {
    marginTop: spacing[6],
  },
  label: {
    letterSpacing: 1.2,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing[3],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[4],
    borderRadius: radii.sm,
    backgroundColor: colors.grey100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: typography.fontFamily.medium,
  },
  errorText: {
    marginTop: spacing[4],
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing[10],
  },
});
