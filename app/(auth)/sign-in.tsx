import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthLayout } from '@/components/auth-layout';
import { ExternalLink } from '@/components/external-link';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { Button, Input } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { colors, spacing, typography } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = {
    primary: colors.primary,
    error: colors.error,
    border: isDark ? colors.darkBorder : colors.grey200,
    textSecondary: colors.grey400,
  };

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
      <View style={[styles.linkWrap, { marginTop: -spacing[3], marginBottom: spacing[8] }]}>
        <Link href="/(auth)/reset-password" asChild>
          <TouchableOpacity>
            <ThemedText style={[styles.link, { color: theme.primary }]}>
              Forgot Password
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
      ) : null}

      <Text style={[styles.terms, { marginBottom: spacing[4] }]}>
        By continuing you agree to our{' '}
        <ExternalLink href="https://snapsy.app/terms">Terms of Service</ExternalLink>
        {' '}and{' '}
        <ExternalLink href="https://snapsy.app/privacy">Privacy Policy</ExternalLink>
      </Text>

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
        <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>Or login with</ThemedText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <SocialAuthButtons onSuccess={() => router.replace('/(tabs)')} disabled={loading} />

      {/* Footer Link */}
      <View style={styles.footer}>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <ThemedText style={{ color: theme.textSecondary }}>
              Don't have an account? <Text style={[styles.footerAccent, { color: theme.primary }]}>Register</Text>
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  terms: {
    fontSize: typography.size.xs,
    color: colors.grey400,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkWrap: { alignItems: 'flex-end' },
  link: {
    fontSize: typography.size.md,
    fontFamily: typography.fontFamily.semibold,
  },
  error: {
    marginBottom: spacing[4],
    fontSize: typography.size.base,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[8],
    gap: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: typography.size.sm,
  },
  footer: {
    marginTop: spacing[12],
    alignItems: 'center',
  },
  footerAccent: {
    fontFamily: typography.fontFamily.bold,
  },
});
