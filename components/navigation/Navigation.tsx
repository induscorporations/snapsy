// components/navigation/Navigation.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, typography, shadows, TAP_TARGET } from '@/constants/tokens';

const { height: SCREEN_H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// TOP HEADER
// ─────────────────────────────────────────────────────────────────────────────
export interface TopHeaderProps {
  title:        string;
  showBack?:    boolean;
  onBack?:      () => void;
  trailing?:    React.ReactNode;
  // Pass ArrowLeft icon (linear) from lucide-react-native as backIcon
  backIcon?:    React.ReactNode;
  transparent?: boolean;
}

export function TopHeader({ title, showBack, onBack, trailing, backIcon, transparent }: TopHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[headerSt.bar, { paddingTop: insets.top }, transparent && headerSt.transparent]}>
      <View style={headerSt.inner}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={headerSt.backBtn}>
            {backIcon ?? <Text style={{ color: colors.grey700, fontSize: typography.size.xl }}>←</Text>}
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={headerSt.title} numberOfLines={1}>{title}</Text>
        <View style={headerSt.trailingWrap}>
          {trailing ?? <View style={{ width: 36 }} />}
        </View>
      </View>
    </View>
  );
}

const headerSt = StyleSheet.create({
  bar:          { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.grey100 },
  transparent:  { backgroundColor: 'transparent', borderBottomWidth: 0 },
  inner:        { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  backBtn:      { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.grey100, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title:        { flex: 1, fontSize: typography.size.lg, fontFamily: typography.fontFamily.bold, color: colors.grey800, textAlign: 'center' },
  trailingWrap: { flexShrink: 0, alignItems: 'flex-end' },
});

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM TAB BAR
// icon: (active: boolean) => ReactNode
// → caller renders linear icon inactive, solid when active
// ─────────────────────────────────────────────────────────────────────────────
export interface TabItem {
  key:   string;
  label: string;
  icon:  (active: boolean) => React.ReactNode;
}

export interface BottomTabBarProps {
  tabs:          TabItem[];
  activeIndex?:  number;
  onChange?:     (index: number) => void;
  dark?:         boolean;
}

export function BottomTabBar({ tabs, activeIndex = 0, onChange, dark = false }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(activeIndex);

  useEffect(() => { setActive(activeIndex); }, [activeIndex]);

  const bg     = dark ? colors.darkSurface : colors.white;
  const border = dark ? colors.darkBorder  : colors.grey100;

  return (
    <View style={[tabSt.bar, { backgroundColor: bg, borderTopColor: border, paddingBottom: Math.max(insets.bottom, 16) }]}>
      {tabs.map((tab, i) => {
        const isActive  = active === i;
        const iconColor = isActive ? (dark ? colors.primary : colors.primaryDark) : (dark ? colors.grey600 : colors.grey400);

        return (
          <TouchableOpacity key={tab.key} activeOpacity={0.8}
            onPress={() => { setActive(i); onChange?.(i); }}
            style={tabSt.tab}>
            {tab.icon(isActive)}
            <Text style={[tabSt.label, { color: iconColor, fontFamily: isActive ? typography.fontFamily.semibold : typography.fontFamily.medium }]}>
              {tab.label}
            </Text>
            {isActive && <View style={tabSt.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabSt = StyleSheet.create({
  bar:   { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8 },
  tab:   { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 6, minHeight: TAP_TARGET, justifyContent: 'center' },
  label: { fontSize: typography.size.xs },
  dot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: -2 },
});

// ─────────────────────────────────────────────────────────────────────────────
// BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────────────────
export interface BottomSheetProps {
  visible:     boolean;
  onClose:     () => void;
  title?:      string;
  subtitle?:   string;
  snapHeight?: number;  // fraction of screen height, default 0.5
  children:    React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, subtitle, snapHeight = 0.5, children }: BottomSheetProps) {
  const insets     = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_H);
  const opacity    = useSharedValue(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withSpring(0, { damping: 20, stiffness: 180 });
      opacity.value    = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(SCREEN_H, { duration: 280 });
      opacity.value    = withTiming(0, { duration: 220 }, () => runOnJS(setMounted)(false));
    }
  }, [visible]);

  const sheetSt    = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropSt = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!mounted) return null;

  return (
    <View style={sheetStyles.overlay}>
      <Animated.View style={[sheetStyles.backdrop, backdropSt]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[
        sheetStyles.sheet,
        { paddingBottom: insets.bottom + 24, minHeight: SCREEN_H * snapHeight },
        sheetSt,
      ]}>
        <View style={sheetStyles.handleWrap}>
          <View style={sheetStyles.handle} />
        </View>
        {(title || subtitle) && (
          <View style={sheetStyles.header}>
            {title    && <Text style={sheetStyles.title}>{title}</Text>}
            {subtitle && <Text style={sheetStyles.subtitle}>{subtitle}</Text>}
          </View>
        )}
        <View style={sheetStyles.content}>{children}</View>
      </Animated.View>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  overlay:    { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 100 },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet:      { backgroundColor: colors.white, borderTopLeftRadius: radii['3xl'], borderTopRightRadius: radii['3xl'], ...shadows.xl },
  handleWrap: { alignItems: 'center', paddingVertical: 12 },
  handle:     { width: 36, height: 4, borderRadius: radii.full, backgroundColor: colors.grey200 },
  header:     { paddingHorizontal: 24, paddingBottom: 20, gap: 4 },
  title:      { fontSize: typography.size['2xl'], fontFamily: typography.fontFamily.bold, color: colors.grey800 },
  subtitle:   { fontSize: typography.size.base, fontFamily: typography.fontFamily.regular, color: colors.grey400 },
  content:    { paddingHorizontal: 24 },
});
