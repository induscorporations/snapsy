import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { colors } from '@/constants/tokens';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/splash');
  }, [router]);

  return <View style={[styles.container, { backgroundColor: colors.darkBg }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
