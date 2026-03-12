import React, { useEffect } from 'react';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS } from './Icon';

interface SpinnerProps {
  size?: number;
  color?: string;
}

export function Spinner({ size = 16, color = 'currentColor' }: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 700,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const paths = ICON_PATHS.loader;

  return (
    <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
        {paths.map((d, i) => (
          <Path key={i} d={d} opacity={i < 4 ? 1 : 0.3} />
        ))}
      </Svg>
    </Animated.View>
  );
}
