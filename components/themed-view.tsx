import { View, type ViewProps } from 'react-native';

import { colors } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor =
    colorScheme === 'dark'
      ? (darkColor ?? colors.darkBg)
      : (lightColor ?? colors.white);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
