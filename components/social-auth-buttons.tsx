import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/constants/tokens';

type Props = {
  onSuccess: () => void;
  disabled?: boolean;
};

const iconColor = colors.grey700;

export function SocialAuthButtons({ onSuccess, disabled }: Props) {
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const runOAuth = async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (disabled) return;
    setLoading(strategy === 'oauth_google' ? 'google' : 'apple');
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        onSuccess();
      }
    } catch (err) {
      console.error('OAuth error', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrap}>
        <Button
          variant="ghost"
          fullWidth
          size="lg"
          onPress={() => runOAuth('oauth_google')}
          disabled={disabled || loading !== null}
          loading={loading === 'google'}
          iconLeft={<Ionicons name="logo-google" size={20} color={iconColor} />}
        >
          Google
        </Button>
      </View>
      <View style={styles.buttonWrap}>
        <Button
          variant="ghost"
          fullWidth
          size="lg"
          onPress={() => runOAuth('oauth_apple')}
          disabled={disabled || loading !== null}
          loading={loading === 'apple'}
          iconLeft={<Ionicons name="logo-apple" size={20} color={iconColor} />}
        >
          Apple
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[6],
  },
  buttonWrap: {
    flex: 1,
  },
});
