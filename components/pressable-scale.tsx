import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const PRESS_SCALE = 0.97;
const DURATION_IN = 100;
const DURATION_OUT = 200;

type Props = PressableProps & {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Pressable that scales to 0.97 on press (PRD animation: button press scale).
 * Use for primary CTAs. Ease-out, fast.
 */
export function PressableScale({ children, style, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={(e) => {
        scale.value = withTiming(PRESS_SCALE, { duration: DURATION_IN });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: DURATION_OUT });
        onPressOut?.(e);
      }}
      style={style}
      {...rest}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}
