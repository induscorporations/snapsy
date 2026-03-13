import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';

import { TopHeader } from '@/components/navigation/Navigation';
import { ThemedText } from '@/components/ui/Typography';
import { colors, spacing, typography, iconSize } from '@/constants/tokens';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TopHeader title="Privacy" showBack onBack={() => router.back()} transparent />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconRow}>
          <Shield size={iconSize['2xl']} strokeWidth={1.75} color={colors.primary} />
        </View>
        <ThemedText type="title3" darkColor={colors.white} style={styles.title}>
          Face data & visibility
        </ThemedText>
        <ThemedText type="body2" darkColor={colors.grey400} style={styles.paragraph}>
          Your face embedding is stored securely and used only to match photos within events you join. We do not share your biometric data with third parties.
        </ThemedText>
        <ThemedText type="body2" darkColor={colors.grey400} style={styles.paragraph}>
          Matching runs on our servers for events you are a member of. Only event hosts can upload photos; guests see only photos matched to them.
        </ThemedText>
        <ThemedText type="small" darkColor={colors.grey500} style={styles.footer}>
          For more details, see our Privacy Policy in Settings → About.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[12],
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    marginBottom: spacing[4],
  },
  paragraph: {
    marginBottom: spacing[4],
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing[4],
    lineHeight: 20,
  },
});
