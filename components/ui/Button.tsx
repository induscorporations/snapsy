// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  type TouchableOpacityProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, typography, shadows, TAP_TARGET } from '@/constants/tokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize    = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  iconLeft?:  React.ReactNode;
  iconRight?: React.ReactNode;
  iconOnly?:  React.ReactNode;
  loading?:   boolean;
  fullWidth?: boolean;
  children?:  React.ReactNode;
}

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SIZE_CONFIG = {
  sm: { height: 36,        paddingH: 16, fontSize: typography.size.sm,   iconSize: 14 },
  md: { height: TAP_TARGET, paddingH: 20, fontSize: typography.size.base, iconSize: 16 },
  lg: { height: 52,        paddingH: 24, fontSize: typography.size.lg,   iconSize: 18 },
};

const VARIANT_CONFIG = {
  primary:     { bg: colors.primary,      text: colors.grey900,    border: 'transparent' },
  secondary:   { bg: colors.primaryLight, text: colors.primaryDark, border: 'transparent' },
  ghost:       { bg: 'transparent',       text: colors.grey700,    border: colors.grey200 },
  destructive: { bg: colors.errorLight,   text: colors.error,      border: 'transparent' },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function Button({
  variant   = 'primary',
  size      = 'md',
  iconLeft,
  iconRight,
  iconOnly,
  loading   = false,
  fullWidth = false,
  disabled  = false,
  children,
  onPress,
  ...rest
}: ButtonProps) {
  const scale      = useSharedValue(1);
  const sizeCfg    = SIZE_CONFIG[size];
  const variantCfg = VARIANT_CONFIG[variant];
  const isIconOnly = !!iconOnly && !children;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
      disabled={disabled || loading}
      activeOpacity={1}
      style={[
        styles.base,
        animStyle,
        {
          height:            sizeCfg.height,
          paddingHorizontal: isIconOnly ? 0 : sizeCfg.paddingH,
          width:             isIconOnly ? sizeCfg.height : fullWidth ? '100%' : undefined,
          backgroundColor:   variantCfg.bg,
          borderColor:       variantCfg.border,
          borderWidth:       variant === 'ghost' ? 1.5 : 0,
          opacity:           disabled ? 0.4 : 1,
        },
        variant === 'primary' && !disabled && shadows.primarySm,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantCfg.text} />
      ) : (
        <>
          {iconLeft  && <View style={styles.iconLeft}>{iconLeft}</View>}
          {isIconOnly && iconOnly}
          {children && (
            <Text style={[styles.label, { fontSize: sizeCfg.fontSize, color: variantCfg.text }]}>
              {children}
            </Text>
          )}
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </>
      )}
    </AnimatedTouchable>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   radii.full,
    overflow:       'hidden',
  },
  label: {
    fontFamily:         typography.fontFamily.semibold,
    includeFontPadding: false,
  },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
