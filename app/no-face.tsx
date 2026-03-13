import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AlertCircle, User } from 'lucide-react-native';

import { colors, spacing } from '@/constants/tokens';
import { Button } from '@/components';
import { ThemedText } from '@/components/ui/Typography';
import { TopHeader } from '@/components/navigation/Navigation';

export default function NoFaceScreen() {
  const router = useRouter();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const isMultiple = reason === 'multiple_faces';

  const title = isMultiple
    ? 'Multiple faces detected'
    : 'No face detected';
  const subtitle = isMultiple
    ? 'Please take a photo with only your face in frame.'
    : "We couldn't detect a face in this photo. Please ensure your face is clearly visible and try again.";

  return (
    <View style={styles.container}>
      <TopHeader
        title={isMultiple ? 'Multiple faces' : 'No face detected'}
        showBack
        onBack={() => router.back()}
        transparent
      />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          {isMultiple ? (
            <User size={48} strokeWidth={1.5} color={colors.grey400} />
          ) : (
            <AlertCircle size={48} strokeWidth={1.5} color={colors.warning} />
          )}
        </View>
        <ThemedText type="largeTitle" darkColor={colors.white} style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="body1" darkColor={colors.grey400} style={styles.subtitle}>
          {subtitle}
        </ThemedText>
        <Button variant="primary" onPress={() => router.back()} style={styles.cta}>
          Retake photo
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.darkSurface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  cta: {
    minWidth: 160,
  },
});
