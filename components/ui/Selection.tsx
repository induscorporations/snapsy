// components/ui/Selection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  withSpring,
} from 'react-native-reanimated';
import { colors, radii, typography, shadows } from '@/constants/tokens';

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE
// iconLeft render prop receives `active` boolean
// → caller renders linear icon when false, solid when true
// ─────────────────────────────────────────────────────────────────────────────
export interface ToggleProps {
  label?:        string;
  value?:        boolean;
  defaultValue?: boolean;
  onChange?:     (value: boolean) => void;
  iconLeft?:     (active: boolean) => React.ReactNode;
  disabled?:     boolean;
}

export function Toggle({
  label,
  value: controlled,
  defaultValue = false,
  onChange,
  iconLeft,
  disabled,
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultValue);
  const on       = controlled ?? internal;
  const progress = useSharedValue(on ? 1 : 0);

  const thumbAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(progress.value * 20, { duration: 180 }) }],
  }));
  const trackAnim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.grey200, colors.primary]),
  }));

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    progress.value = next ? 1 : 0;
    setInternal(next);
    onChange?.(next);
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      disabled={disabled}
      style={[toggleSt.row, disabled && { opacity: 0.4 }]}
    >
      <View style={toggleSt.left}>
        {iconLeft?.(on)}
        {label && <Text style={toggleSt.label}>{label}</Text>}
      </View>
      <Animated.View style={[toggleSt.track, trackAnim]}>
        <Animated.View style={[toggleSt.thumb, thumbAnim]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const toggleSt = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  left:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  label: { fontSize: typography.size.base, fontFamily: typography.fontFamily.medium, color: colors.grey700 },
  track: { width: 48, height: 28, borderRadius: radii.full, padding: 3, justifyContent: 'center' },
  thumb: { width: 22, height: 22, borderRadius: radii.full, backgroundColor: colors.grey900, ...shadows.sm },
});

// ─────────────────────────────────────────────────────────────────────────────
// CHECKBOX
// ─────────────────────────────────────────────────────────────────────────────
export interface CheckboxProps {
  label?:        string;
  value?:        boolean;
  defaultValue?: boolean;
  onChange?:     (value: boolean) => void;
  disabled?:     boolean;
}

export function Checkbox({ label, value: controlled, defaultValue = false, onChange, disabled }: CheckboxProps) {
  const [internal, setInternal] = useState(defaultValue);
  const checked  = controlled ?? internal;
  const scale    = useSharedValue(1);
  const animSt   = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const toggle = () => {
    if (disabled) return;
    scale.value = withSpring(0.85, { duration: 60 }, () => { scale.value = withSpring(1); });
    const next = !checked;
    setInternal(next);
    onChange?.(next);
  };

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.8} disabled={disabled}
      style={[checkSt.row, disabled && { opacity: 0.4 }]}>
      <Animated.View style={[
        checkSt.box, animSt,
        { borderColor: checked ? colors.primary : colors.grey300, backgroundColor: checked ? colors.primary : 'transparent' },
      ]}>
        {checked && (
          // Replace with: <Check size={13} color={colors.grey900} strokeWidth={3} />
          <View style={checkSt.checkmark} />
        )}
      </Animated.View>
      {label && <Text style={checkSt.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const checkSt = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box:      { width: 20, height: 20, borderRadius: radii.xs, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkmark: { width: 10, height: 6, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderColor: colors.grey900, transform: [{ rotate: '-45deg' }, { translateY: -1 }] },
  label:    { fontSize: typography.size.base, fontFamily: typography.fontFamily.regular, color: colors.grey700 },
});

// ─────────────────────────────────────────────────────────────────────────────
// RADIO CARD
// icon render prop: (selected: boolean) → linear when false, solid when true
// ─────────────────────────────────────────────────────────────────────────────
export interface RadioCardProps {
  label:     string;
  sublabel?: string;
  selected?: boolean;
  onPress?:  () => void;
  icon?:     (selected: boolean) => React.ReactNode;
  disabled?: boolean;
}

export function RadioCard({ label, sublabel, selected = false, onPress, icon, disabled }: RadioCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={disabled}
      style={[radioCst.card, { borderColor: selected ? colors.primary : colors.grey100, backgroundColor: selected ? colors.primaryLight : colors.white }, disabled && { opacity: 0.4 }]}>
      <View style={[radioCst.iconWrap, { backgroundColor: selected ? colors.primary : colors.grey100 }]}>
        {icon?.(selected)}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={radioCst.label}>{label}</Text>
        {sublabel && <Text style={radioCst.sublabel}>{sublabel}</Text>}
      </View>
      <View style={[radioCst.radio, { borderColor: selected ? colors.primary : colors.grey300, backgroundColor: selected ? colors.primaryLight : 'transparent' }]}>
        {selected && <View style={radioCst.dot} />}
      </View>
    </TouchableOpacity>
  );
}

const radioCst = StyleSheet.create({
  card:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radii.xl, borderWidth: 2 },
  iconWrap: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  label:    { fontSize: typography.size.base, fontFamily: typography.fontFamily.semibold, color: colors.grey800 },
  sublabel: { fontSize: typography.size.sm, fontFamily: typography.fontFamily.regular, color: colors.grey400, marginTop: 2 },
  radio:    { width: 18, height: 18, borderRadius: radii.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dot:      { width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.primaryDark },
});

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENTED CONTROL
// icon render prop: (active: boolean) → linear inactive, solid active
// ─────────────────────────────────────────────────────────────────────────────
export interface SegmentOption {
  label: string;
  value: string;
  icon?: (active: boolean) => React.ReactNode;
}

export interface SegmentedControlProps {
  options:   SegmentOption[];
  value?:    string;
  onChange?: (value: string) => void;
}

export function SegmentedControl({ options, value: controlled, onChange }: SegmentedControlProps) {
  const [internal, setInternal] = useState(options[0]?.value ?? '');
  const active = controlled ?? internal;

  return (
    <View style={segSt.track}>
      {options.map(opt => {
        const isActive = opt.value === active;
        return (
          <TouchableOpacity key={opt.value} activeOpacity={0.8}
            onPress={() => { setInternal(opt.value); onChange?.(opt.value); }}
            style={[segSt.seg, isActive && segSt.segActive]}>
            {opt.icon?.(isActive)}
            <Text style={[segSt.label, isActive && segSt.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const segSt = StyleSheet.create({
  track:       { flexDirection: 'row', backgroundColor: colors.grey100, borderRadius: radii.lg, padding: 3, gap: 2 },
  seg:         { flex: 1, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: radii.md },
  segActive:   { backgroundColor: colors.white, ...shadows.sm },
  label:       { fontSize: typography.size.sm, fontFamily: typography.fontFamily.medium, color: colors.grey500 },
  labelActive: { fontFamily: typography.fontFamily.semibold, color: colors.grey800 },
});

// ─────────────────────────────────────────────────────────────────────────────
// TAG CHIP
// ─────────────────────────────────────────────────────────────────────────────
export interface TagChipProps {
  label:     string;
  selected?: boolean;
  onToggle?: () => void;
}

export function TagChip({ label, selected = false, onToggle }: TagChipProps) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}
      style={[chipSt.chip, { backgroundColor: selected ? colors.primary : colors.grey100 }]}>
      {selected && (
        // Replace with: <Check size={13} color={colors.grey900} strokeWidth={2.5} />
        <View style={chipSt.dot} />
      )}
      <Text style={[chipSt.label, selected && chipSt.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const chipSt = StyleSheet.create({
  chip:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 14, borderRadius: radii.full },
  dot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.grey900 },
  label:         { fontSize: typography.size.sm, fontFamily: typography.fontFamily.semibold, color: colors.grey500 },
  labelSelected: { color: colors.grey900 },
});
