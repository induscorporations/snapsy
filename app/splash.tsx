import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

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
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontFamily: Fonts.bold,
    fontSize: 36,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});
