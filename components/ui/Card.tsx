// components/ui/Card.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type ViewProps,
} from 'react-native';
import { colors, radii, typography, shadows } from '@/constants/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────────────────────────────────────
export type BadgeVariant = 'default' | 'primary' | 'success' | 'error' | 'warning';

export interface BadgeProps {
  label:    string;
  variant?: BadgeVariant;
  dot?:     boolean;
}

const BADGE = {
  default: { bg: colors.grey100,     color: colors.grey600    },
  primary: { bg: colors.primaryLight, color: colors.primaryDark },
  success: { bg: colors.successLight, color: colors.success    },
  error:   { bg: colors.errorLight,   color: colors.error      },
  warning: { bg: colors.warningLight, color: colors.warning    },
};

export function Badge({ label, variant = 'default', dot = false }: BadgeProps) {
  const cfg = BADGE[variant];
  return (
    <View style={[badgeSt.badge, { backgroundColor: cfg.bg }]}>
      {dot && <View style={[badgeSt.dot, { backgroundColor: cfg.color }]} />}
      <Text style={[badgeSt.label, { color: cfg.color }]}>{label}</Text>
    </View>
  );
}

const badgeSt = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 10, borderRadius: radii.full, alignSelf: 'flex-start' },
  dot:   { width: 5, height: 5, borderRadius: 3 },
  label: { fontSize: typography.size.xs, fontFamily: typography.fontFamily.semibold, letterSpacing: 0.02, includeFontPadding: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────────────────────
export type CardVariant = 'flat' | 'elevated' | 'bordered' | 'primary';

export interface CardProps extends ViewProps {
  variant?:  CardVariant;
  padding?:  number;
  children?: React.ReactNode;
}

const CARD = {
  flat:     { backgroundColor: colors.white,       borderWidth: 1,   borderColor: colors.grey100  },
  elevated: { backgroundColor: colors.white,       ...shadows.lg                                   },
  bordered: { backgroundColor: 'transparent',      borderWidth: 1.5, borderColor: colors.grey200  },
  primary:  { backgroundColor: colors.primaryDeep                                                  },
};

export function Card({ variant = 'flat', padding = 20, children, style, ...rest }: CardProps) {
  return (
    <View style={[cardSt.base, { padding }, CARD[variant], style]} {...rest}>
      {children}
    </View>
  );
}

const cardSt = StyleSheet.create({
  base: { borderRadius: radii['2xl'], overflow: 'hidden' },
});

// ─────────────────────────────────────────────────────────────────────────────
// LIST ITEM
// icon: (active: boolean) => ReactNode
// → caller renders linear icon when false, solid when true
// ─────────────────────────────────────────────────────────────────────────────
export interface ListItemProps {
  icon?:     (active: boolean) => React.ReactNode;
  title:     string;
  subtitle?: string;
  trailing?: React.ReactNode;
  divider?:  boolean;
  active?:   boolean;
  onPress?:  () => void;
}

export function ListItem({ icon, title, subtitle, trailing, divider = true, active = false, onPress }: ListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[listSt.row, divider && listSt.divider]}
    >
      {icon && (
        <View style={[listSt.iconWrap, active && listSt.iconWrapActive]}>
          {icon(active)}
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={listSt.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={listSt.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {trailing && <View style={{ flexShrink: 0 }}>{trailing}</View>}
    </TouchableOpacity>
  );
}

const listSt = StyleSheet.create({
  row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  divider:       { borderBottomWidth: 1, borderBottomColor: colors.grey100 },
  iconWrap:      { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.grey100, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconWrapActive: { backgroundColor: colors.primaryLight },
  title:         { fontSize: typography.size.base, fontFamily: typography.fontFamily.semibold, color: colors.grey800 },
  subtitle:      { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.grey400, marginTop: 2 },
});
