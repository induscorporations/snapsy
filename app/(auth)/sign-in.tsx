import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthLayout } from '@/components/auth-layout';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemedText } from '@/components/ui/Typography';
import { Colors, SPACING } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!email.trim() || !password || !isLoaded || !signIn) return;
    setError('');
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: email.trim(), password });
      if (res.status === 'complete' && res.createdSessionId) {
        await setActive({ session: res.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Sign-in could not be completed. Try again.');
      }
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'errors' in e
        ? (e as { errors: Array<{ message?: string }> }).errors?.[0]?.message
        : e instanceof Error ? e.message : 'Sign in failed';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your Account"
      subtitle="Sign in to Account" // Matches the mock subtitle
      showBackButton={false}
    >
      <Input
        label="Email"
        placeholder="name@email.com"
        value={email}
        onChangeText={(t) => { setEmail(t); setError(''); }}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={(t) => { setPassword(t); setError(''); }}
        secureTextEntry
      />

      {/* Forgot Password Link - Aligned Right */}
      <View style={{ alignItems: 'flex-end', marginTop: -SPACING.sm, marginBottom: SPACING.xl }}>
        <Link href="/(auth)/reset-password" asChild>
          <TouchableOpacity>
            <ThemedText style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>
              Forgot Password
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
      ) : null}

      <Button
        onPress={onSignIn}
        loading={loading}
        disabled={!email.trim() || !password}
      >
        Login
      </Button>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Or login with</ThemedText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <SocialAuthButtons onSuccess={() => router.replace('/(tabs)')} disabled={loading} />

      {/* Footer Link */}
      <View style={{ marginTop: SPACING.xxl, alignItems: 'center' }}>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <ThemedText style={{ color: theme.textSecondary }}>
              Don't have an account? <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Register</Text>
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  error: {
    marginBottom: SPACING.md,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
});
