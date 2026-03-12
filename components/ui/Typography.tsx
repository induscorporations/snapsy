import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextType = 
  | 'largeTitle' 
  | 'title1' 
  | 'title2' 
  | 'title3' 
  | 'headline' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'small'
  | 'bold';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemedTextType;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'body1',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'largeTitle' ? styles.largeTitle : undefined,
        type === 'title1' ? styles.title1 : undefined,
        type === 'title2' ? styles.title2 : undefined,
        type === 'title3' ? styles.title3 : undefined,
        type === 'headline' ? styles.headline : undefined,
        type === 'body1' ? styles.body1 : undefined,
        type === 'body2' ? styles.body2 : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'bold' ? styles.bold : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    fontFamily: Fonts.bold,
    lineHeight: 41,
    letterSpacing: -0.4,
  },
  title1: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  title2: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  title3: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    lineHeight: 16,
  },
  small: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    lineHeight: 13,
  },
  bold: {
    fontFamily: Fonts.bold,
  },
});
