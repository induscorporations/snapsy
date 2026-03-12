import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants/tokens';

export default function SplashScreenRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Snapsy</Text>
      <Text style={styles.tagline}>Every moment, perfectly yours.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  logo: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size['4xl'],
    color: colors.primary,
    marginBottom: spacing[2],
  },
  tagline: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.lg,
    color: colors.grey400,
  },
});
