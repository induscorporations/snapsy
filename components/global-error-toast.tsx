import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '@/stores/useUIStore';
import { Snackbar } from '@/components/feedback/Feedback';

const DURATION = 4000;

export function GlobalErrorToast() {
  const insets = useSafeAreaInsets();
  const errorToast = useUIStore((s) => s.errorToast);
  const setErrorToast = useUIStore((s) => s.setErrorToast);

  useEffect(() => {
    if (!errorToast) return;
    const t = setTimeout(() => setErrorToast(null), DURATION);
    return () => clearTimeout(t);
  }, [errorToast, setErrorToast]);

  if (!errorToast) return null;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 24 }]} pointerEvents="box-none">
      <Snackbar
        type="error"
        message={errorToast}
        visible
        duration={DURATION}
        onHide={() => setErrorToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});
