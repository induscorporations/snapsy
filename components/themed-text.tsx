import { StyleSheet, Text, type TextProps } from 'react-native';

import { typography, colors } from '@/constants/tokens';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
  },
  defaultSemiBold: {
    fontSize: typography.size.lg,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
    fontFamily: typography.fontFamily.semibold,
  },
  title: {
    fontSize: typography.size['5xl'],
    fontFamily: typography.fontFamily.bold,
    lineHeight: typography.size['5xl'],
  },
  subtitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.fontFamily.bold,
  },
  link: {
    fontSize: typography.size.lg,
    lineHeight: 30,
    color: colors.info,
  },
});
