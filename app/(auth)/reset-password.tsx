import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { AuthLayout } from '@/components/auth-layout';
import { Button, Input } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { colors, spacing, typography } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = { error: colors.error };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [successfulCreation, setSuccessfulCreation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1: Request password reset code
    const onRequestReset = async () => {
        if (!email.trim() || !isLoaded) return;
        setError('');
        setLoading(true);
        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email.trim(),
            });
            setSuccessfulCreation(true);
        } catch (err: any) {
            setError(err?.errors?.[0]?.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset password with code
    const onReset = async () => {
        if (!code.trim() || !password || !isLoaded) return;
        setError('');
        setLoading(true);
        try {
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: code.trim(),
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                Alert.alert('Success', 'Your password has been reset.');
                router.replace('/(tabs)');
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err: any) {
            setError(err?.errors?.[0]?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Step 1 UI: Request Code
    if (!successfulCreation) {
        return (
            <AuthLayout
                title="Forgot Password"
                subtitle="Enter your email to receive a reset code."
            >
                <Input
                    label="Email"
                    placeholder="name@email.com"
                    value={email}
                    onChangeText={(t) => { setEmail(t); setError(''); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoFocus
                />

                {error ? (
                    <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
                ) : null}

                <Button
                    style={styles.button}
                    onPress={onRequestReset}
                    loading={loading}
                    disabled={!email.trim()}
                >
                    Send Code
                </Button>
            </AuthLayout>
        );
    }

    // Step 2 UI: New Password
    return (
        <AuthLayout
            title="Reset Password"
            subtitle={`Enter the code sent to ${email} and your new password.`}
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

            <Input
                label="New Password"
                placeholder="Min 8 characters"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry
            />

            {error ? (
                <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
            ) : null}

            <Button
                style={styles.button}
                onPress={onReset}
                loading={loading}
                disabled={!code.trim() || !password}
            >
                Set New Password
            </Button>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: spacing[8],
    },
    error: {
        marginTop: spacing[3],
        fontSize: typography.size.base,
    },
});
