import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/ui/Typography';
import { Colors, SPACING } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    showBackButton?: boolean;
};

export function AuthLayout({ title, subtitle, children, showBackButton = true }: Props) {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        {showBackButton && (
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={[styles.backButton, { borderColor: theme.border }]}
                            >
                                <IconSymbol name="chevron.left" size={24} color={theme.text} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.titleContainer}>
                        <ThemedText type="display" style={{ color: theme.text, marginBottom: 8 }}>
                            {title}
                        </ThemedText>
                        <ThemedText type="default" style={{ color: theme.textSecondary }}>
                            {subtitle}
                        </ThemedText>
                    </View>

                    <View style={styles.content}>
                        {children}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    header: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
        alignItems: 'flex-start',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginBottom: SPACING.xl,
    },
    content: {
        flex: 1,
    },
});
