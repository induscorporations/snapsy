import { useSignUp } from '@clerk/clerk-expo';
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

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const onSignUp = async () => {
    if (!email.trim() || !password || !isLoaded || !signUp) return;
    setError('');
    setLoading(true);

    // Split full name roughly
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName,
        lastName,
      });
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });
      setPendingVerification(true);
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'errors' in e
        ? (e as { errors: Array<{ message?: string }> }).errors?.[0]?.message
        : e instanceof Error ? e.message : 'Sign up failed';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!code.trim() || !isLoaded || !signUp) return;
    setError('');
    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Verification could not be completed.');
      }
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'errors' in e
        ? (e as { errors: Array<{ message?: string }> }).errors?.[0]?.message
        : e instanceof Error ? e.message : 'Verification failed';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`Enter the code we sent to ${email}`}
      >
        <Input
          label="Verification Code"
          placeholder="123456"
          value={code}
          onChangeText={(t) => { setCode(t); setError(''); }}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
        {error ? (
          <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
        ) : null}

        <Button
          style={styles.button}
          onPress={onVerify}
          loading={loading}
          disabled={!code.trim()}
        >
          Verify
        </Button>

        <TouchableOpacity style={styles.link} onPress={() => setPendingVerification(false)}>
          <ThemedText style={[styles.linkText, { color: theme.textSecondary }]}>
            Use a different email
          </ThemedText>
        </TouchableOpacity>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register"
      subtitle="Create your account"
    >
      <Input
        label="Full Name"
        placeholder="Ferdinand Sinaga"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <Input
        label="Email"
        placeholder="ferdinand@gmail.com"
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

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
      ) : null}

      <Button
        style={styles.button}
        onPress={onSignUp}
        loading={loading}
        disabled={!email.trim() || !password}
      >
        Register
      </Button>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Or login with</ThemedText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>

      <SocialAuthButtons onSuccess={() => router.replace('/(tabs)')} disabled={loading} />

      <View style={{ marginTop: SPACING.xxl, alignItems: 'center' }}>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <ThemedText style={{ color: theme.textSecondary }}>
              I have an account? <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Log in</Text>
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
  button: {
    marginTop: SPACING.lg,
  },
  link: {
    marginTop: SPACING.lg,
    alignSelf: 'center',
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
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
