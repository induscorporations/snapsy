import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BottomSheet } from '@/components/navigation/Navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { colors, spacing, typography } from '@/constants/tokens';
import { Link } from 'lucide-react-native';

export interface JoinEventSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function JoinEventSheet({ visible, onClose }: JoinEventSheetProps) {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);
  const joinByInvite = useMutation(api.events.joinByInvite);

  const [link, setLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setError(null);
    if (!link.trim()) {
      setError('Please paste your invite link.');
      return;
    }

    const match = link.match(/eventId=([^&]+)/);
    const eventId = match?.[1];

    if (!eventId) {
      setError('Invalid link');
      return;
    }

    if (!convexUserId) {
      setError('Please sign in again and try joining.');
      return;
    }

    setJoining(true);
    try {
      await joinByInvite({
        eventId: eventId as any,
        userId: convexUserId as any,
      });
      onClose();
      router.replace(`/event/${eventId}`);
    } catch {
      setError('Could not join event. It may have expired.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Join an Event"
      subtitle="Paste the invite link you received"
      snapHeight={0.4}
    >
      <View style={styles.content}>
        <Input
          label="Invite link"
          placeholder="https://snapsy.app/join?eventId=..."
          iconLeft={
            <Link size={16} strokeWidth={1.75} color={colors.grey400} />
          }
          autoCapitalize="none"
          autoCorrect={false}
          value={link}
          onChangeText={(text) => {
            setLink(text);
            if (error) setError(null);
          }}
        />

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        <View style={styles.buttonWrap}>
          <Button
            variant="primary"
            fullWidth
            loading={joining}
            onPress={handleJoin}
          >
            Join Event
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[4],
  },
  error: {
    marginTop: spacing[1],
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.error,
  },
  buttonWrap: {
    marginTop: spacing[4],
  },
});

