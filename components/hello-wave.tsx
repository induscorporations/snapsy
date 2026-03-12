import Animated from 'react-native-reanimated';

import { typography } from '@/constants/tokens';

export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: typography.size['4xl'],
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
