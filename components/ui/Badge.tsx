import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '@/constants/tokens';
import { 
  G100, 
  G600, 
  PRIMARY_LIGHT, 
  PRIMARY_DARK, 
  SUCCESS_LIGHT, 
  SUCCESS, 
  ERROR_LIGHT, 
  ERROR, 
  WARNING_LIGHT, 
  WARNING,
} from '@/constants/theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'error' | 'warning';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ label, variant = 'default', dot = false }: BadgeProps) {
  const styles_v = {
    default: { backgroundColor: G100, color: G600 },
    primary: { backgroundColor: PRIMARY_LIGHT, color: PRIMARY_DARK },
    success: { backgroundColor: SUCCESS_LIGHT, color: SUCCESS },
    error: { backgroundColor: ERROR_LIGHT, color: ERROR },
    warning: { backgroundColor: WARNING_LIGHT, color: WARNING },
  };

  const current = styles_v[variant];

  return (
    <View style={[styles.badge, { backgroundColor: current.backgroundColor }]}>
      {dot && <View style={[styles.dot, { backgroundColor: current.color }]} />}
      <Text style={[styles.text, { color: current.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: typography.size.xs,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.2,
  },
});
