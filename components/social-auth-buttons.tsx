import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ui/Typography';
import { Colors, RADIUS, SPACING } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  onSuccess: () => void;
  disabled?: boolean;
};

export function SocialAuthButtons({ onSuccess, disabled }: Props) {
  const { startSSOFlow } = useSSO();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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
      <TouchableOpacity
        style={[
          styles.button,
          { borderColor: theme.border },
          disabled && styles.disabled
        ]}
        onPress={() => runOAuth('oauth_google')}
        disabled={disabled || loading !== null}
      >
        {loading === 'google' ? (
          <ActivityIndicator size="small" color={theme.text} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color={theme.text} style={styles.icon} />
            <ThemedText style={{ fontSize: 13, color: theme.text }}>Google</ThemedText>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          { borderColor: theme.border },
          disabled && styles.disabled
        ]}
        onPress={() => runOAuth('oauth_apple')}
        disabled={disabled || loading !== null}
      >
        {loading === 'apple' ? (
          <ActivityIndicator size="small" color={theme.text} />
        ) : (
          <>
            <Ionicons name="logo-apple" size={20} color={theme.text} style={styles.icon} />
            <ThemedText style={{ fontSize: 13, color: theme.text }}>Apple</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 8,
  },
});
