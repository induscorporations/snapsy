import { api } from '@/convex/_generated/api';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useMutation } from 'convex/react';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/Typography';
import { SPACING, RADIUS, BACKGROUND_DARK, G400, PRIMARY, G700, G800 } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

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
  const [privacy, setPrivacy] = useState<'invite_only' | 'link_only'>('invite_only');
  const [retentionDays, setRetentionDays] = useState(30);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createEvent = useMutation(api.events.create);
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      sheetRef.current?.expand?.();
    } else {
      sheetRef.current?.close?.();
      setCreatedEventId(null);
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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.7}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: BACKGROUND_DARK }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
      snapPoints={['75%']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          {createdEventId ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="check" size={32} color={PRIMARY} solid />
              </View>
              <ThemedText type="title2" darkColor="#FFFFFF" style={styles.title}>Event Created</ThemedText>
              <ThemedText type="body2" darkColor={G400} style={styles.subtitle}>
                Your event is ready. Share the link below to invite guests.
              </ThemedText>

              <View style={styles.inviteBox}>
                <ThemedText type="small" darkColor={G400} style={styles.inviteUrl} numberOfLines={1}>
                  {inviteUrl}
                </ThemedText>
                <TouchableOpacity onPress={handleCopyLink} style={styles.copyButton}>
                  <Icon name="copy" size={18} color={PRIMARY} />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonStack}>
                <Button onPress={handleShare} variant="secondary" iconL="share" fullWidth>
                  Share Invite
                </Button>
                <Button onPress={handleGoToEvent} variant="primary" fullWidth>
                  Go to Event
                </Button>
              </View>
            </View>
          ) : (
            <>
              <ThemedText type="title2" darkColor="#FFFFFF" style={styles.title}>New Event</ThemedText>

              <Input
                label="Event Name"
                placeholder="e.g. Summer Wedding"
                value={name}
                onChangeText={setName}
              />

              <View style={styles.formSection}>
                <ThemedText type="small" darkColor={G400} style={styles.label}>PRIVACY</ThemedText>
                <View style={styles.chipRow}>
                  {PRIVACY_OPTIONS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      activeOpacity={0.8}
                      style={[
                        styles.chip,
                        privacy === p && styles.chipActive
                      ]}
                      onPress={() => setPrivacy(p)}
                    >
                      <ThemedText 
                        type="caption" 
                        darkColor={privacy === p ? G800 : G400}
                        style={privacy === p && styles.chipTextActive}
                      >
                        {p === 'invite_only' ? 'Invite Only' : 'Public Link'}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <ThemedText type="small" darkColor={G400} style={styles.label}>RETENTION (DAYS)</ThemedText>
                <View style={styles.chipRow}>
                  {RETENTION_OPTIONS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.8}
                      style={[
                        styles.chip,
                        retentionDays === d && styles.chipActive
                      ]}
                      onPress={() => setRetentionDays(d)}
                    >
                      <ThemedText 
                        type="caption" 
                        darkColor={retentionDays === d ? G800 : G400}
                        style={retentionDays === d && styles.chipTextActive}
                      >
                        {d} Days
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {error && (
                <ThemedText type="small" style={[styles.errorText, { color: Colors.dark.error }]}>
                  {error}
                </ThemedText>
              )}

              <View style={styles.footer}>
                <Button
                  onPress={handleCreate}
                  loading={isCreating}
                  disabled={!name.trim() || isCreating}
                  fullWidth
                >
                  Create Event
                </Button>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  keyboard: { flex: 1 },
  content: {
    padding: SPACING.xl,
    paddingBottom: 60,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108, 240, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  inviteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
  },
  inviteUrl: {
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
  },
  buttonStack: {
    width: '100%',
    gap: 12,
  },
  formSection: {
    marginTop: 24,
  },
  label: {
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipTextActive: {
    fontWeight: '700',
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
  },
  footer: {
    marginTop: 40,
  },
});
