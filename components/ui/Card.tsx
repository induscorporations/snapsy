import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { G100, G200, PRIMARY_DEEP, RADIUS } from '@/constants/theme';

export type CardVariant = 'flat' | 'elevated' | 'bordered' | 'primary';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

export function Card({ variant = 'flat', children, padding = 20, style }: CardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'flat':
        return { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: G100 };
      case 'elevated':
        return { 
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4
        };
      case 'bordered':
        return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: G200 };
      case 'primary':
        return { backgroundColor: PRIMARY_DEEP, borderWidth: 0 };
    }
  };

  return (
    <View style={[styles.card, { padding }, getVariantStyles(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
});
