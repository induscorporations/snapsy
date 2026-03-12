import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { typography } from '@/constants/tokens';
import { 
  PRIMARY, 
  G100, 
  G600, 
  PRIMARY_DARK,
} from '@/constants/theme';

interface ProgressBarProps {
  value?: number;
  label?: string;
}

export function ProgressBar({ value = 60, label }: ProgressBarProps) {
  const width = `${Math.min(100, Math.max(0, value))}%`;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}%</Text>
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.progress, { width: width as any }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    color: G600,
  },
  value: {
    fontSize: typography.size.sm,
    fontFamily: typography.fontFamily.semibold,
    color: PRIMARY_DARK,
  },
  track: {
    height: 6,
    backgroundColor: G100,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 9999,
  },
});
