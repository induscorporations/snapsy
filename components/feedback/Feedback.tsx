// components/feedback/Feedback.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated as RNAnimated,
  ActivityIndicator,
} from 'react-native';
import { colors, radii, typography, shadows } from '@/constants/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// SNACKBAR
// iconLeft: always solid (filled) — maximum contrast for feedback
// ─────────────────────────────────────────────────────────────────────────────
export type SnackbarType = 'default' | 'success' | 'error';

export interface SnackbarProps {
  message:   string;
  type?:     SnackbarType;
  visible?:  boolean;
  duration?: number;  // ms — 0 = persistent
  onHide?:   () => void;
  iconLeft?: React.ReactNode;  // pass solid (filled) icon
  action?:   { label: string; onPress: () => void };
}

const SNACK_BG: Record<SnackbarType, string> = {
  default: colors.grey800,
  success: colors.primaryDeep,
  error:   colors.errorDark,
};

export function Snackbar({ message, type = 'default', visible = true, duration = 3000, onHide, iconLeft, action }: SnackbarProps) {
  const opacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      RNAnimated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      if (duration > 0) {
        const t = setTimeout(() => {
          RNAnimated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(onHide);
        }, duration);
        return () => clearTimeout(t);
      }
    } else {
      RNAnimated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(onHide);
    }
  }, [visible]);

  return (
    <RNAnimated.View style={[snackSt.snack, { backgroundColor: SNACK_BG[type], opacity }]}>
      {iconLeft && <View style={{ flexShrink: 0 }}>{iconLeft}</View>}
      <Text style={snackSt.message}>{message}</Text>
      {action && (
        <Text onPress={action.onPress} style={snackSt.action}>{action.label}</Text>
      )}
    </RNAnimated.View>
  );
}

const snackSt = StyleSheet.create({
  snack:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 20, borderRadius: radii.xl, ...shadows.lg },
  message: { flex: 1, fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.white },
  action:  { fontSize: typography.size.sm, fontFamily: typography.fontFamily.semibold, color: colors.primary, flexShrink: 0 },
});

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
export interface ProgressBarProps {
  value:     number;   // 0–100
  label?:    string;
  color?:    string;
  height?:   number;
  animated?: boolean;
}

export function ProgressBar({ value, label, color = colors.primary, height = 6, animated = true }: ProgressBarProps) {
  const width = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(width, {
      toValue:  Math.min(100, Math.max(0, value)),
      duration: animated ? 400 : 0,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={{ gap: 8 }}>
      {label && (
        <View style={progSt.row}>
          <Text style={progSt.label}>{label}</Text>
          <Text style={[progSt.pct, { color: colors.primaryDark }]}>{Math.round(value)}%</Text>
        </View>
      )}
      <View style={[progSt.track, { height }]}>
        <RNAnimated.View style={[progSt.fill, {
          backgroundColor: color,
          height,
          width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }]} />
      </View>
    </View>
  );
}

const progSt = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.grey600 },
  pct:   { fontSize: typography.size.sm, fontFamily: typography.fontFamily.semibold },
  track: { backgroundColor: colors.grey100, borderRadius: radii.full, overflow: 'hidden' },
  fill:  { borderRadius: radii.full },
});

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// icon: pass solid (filled) icon for visual weight
// ─────────────────────────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon?:     React.ReactNode;  // solid icon — fill=colors.grey400, strokeWidth=0
  title:     string;
  subtitle?: string;
  cta?:      React.ReactNode;  // pass <Button> component
}

export function EmptyState({ icon, title, subtitle, cta }: EmptyStateProps) {
  return (
    <View style={emptySt.wrap}>
      {icon && <View style={emptySt.iconWrap}>{icon}</View>}
      <Text style={emptySt.title}>{title}</Text>
      {subtitle && <Text style={emptySt.subtitle}>{subtitle}</Text>}
      {cta && <View style={{ marginTop: 24 }}>{cta}</View>}
    </View>
  );
}

const emptySt = StyleSheet.create({
  wrap:     { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  iconWrap: { width: 72, height: 72, borderRadius: radii['2xl'], backgroundColor: colors.grey100, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title:    { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.bold, color: colors.grey700, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: typography.size.base, fontFamily: typography.fontFamily.regular, color: colors.grey400, textAlign: 'center', lineHeight: typography.size.base * typography.lineHeight.relaxed },
});

// ─────────────────────────────────────────────────────────────────────────────
// LOADING STATE
// ─────────────────────────────────────────────────────────────────────────────
export interface LoadingStateProps {
  label?:      string;
  color?:      string;
  size?:       'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingState({ label = 'Loading...', color = colors.primary, size = 'large', fullScreen = false }: LoadingStateProps) {
  return (
    <View style={[loadSt.wrap, fullScreen && StyleSheet.absoluteFillObject]}>
      <ActivityIndicator size={size} color={color} />
      {label && <Text style={loadSt.label}>{label}</Text>}
    </View>
  );
}

const loadSt = StyleSheet.create({
  wrap:  { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 16 },
  label: { fontSize: typography.size.base, fontFamily: typography.fontFamily.regular, color: colors.grey400 },
});
