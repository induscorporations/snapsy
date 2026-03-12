import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, iconSize } from '@/constants/tokens';
import { TopHeader } from '@/components/navigation/Navigation';
import { SelfiePicker } from '@/components/selfie-picker';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { User } from 'lucide-react-native';

export default function FaceSetupScreen() {
  const router = useRouter();
  const convexUserId = useAuthStore((s) => s.convexUserId);

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader title="Set Up Face Profile" showBack onBack={() => router.back()} transparent />
      <View style={styles.content}>
        <View style={styles.avatar}>
          <User size={40} strokeWidth={0} fill={colors.primaryDark} color={colors.primaryDark} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Add your selfie</Text>
          <Text style={styles.subtitle}>
            We use your face to automatically find photos of you in events you join.
          </Text>
        </View>

        <View style={styles.selfieWrap}>
          {convexUserId && (
            <SelfiePicker
              userId={convexUserId}
              onSaved={() => router.replace('/(tabs)')}
            />
          )}
        </View>

        <Button variant="ghost" onPress={() => router.replace('/(tabs)')}>
          Skip for now
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.grey50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
    gap: spacing[6],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing[2],
  },
  title: {
    fontSize: typography.size['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.grey800,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.grey400,
    textAlign: 'center',
    lineHeight: 22,
  },
  selfieWrap: {
    width: '100%',
  },
});

