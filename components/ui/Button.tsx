import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { PressableScale } from '@/components/pressable-scale';
import { 
  Colors, 
  Fonts, 
  RADIUS, 
  SPACING, 
  PRIMARY, 
  G900, 
  PRIMARY_DARK, 
  PRIMARY_LIGHT, 
  G200, 
  G700, 
  ERROR, 
  ERROR_LIGHT 
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon, IconName } from './Icon';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  iconL?: IconName;
  iconR?: IconName;
  iconOnly?: IconName;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  iconL,
  iconR,
  iconOnly,
  style,
  textStyle,
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handlePress = () => {
    if (disabled || loading || !onPress) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: PRIMARY,
          color: G900,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: PRIMARY_LIGHT,
          color: PRIMARY_DARK,
          borderWidth: 0,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: G700,
          borderWidth: 1.5,
          borderColor: G200,
        };
      case 'destructive':
        return {
          backgroundColor: ERROR_LIGHT,
          color: ERROR,
          borderWidth: 0,
        };
    }
  };

  const vStyles = getVariantStyles();

  const h = { sm: 36, md: 44, lg: 52 }[size];
  const fs = { sm: 12, md: 14, lg: 16 }[size];
  const iconSz = { sm: 14, md: 16, lg: 18 }[size];
  const pad = iconOnly && !children ? 0 : { sm: 16, md: 20, lg: 24 }[size];

  return (
    <PressableScale
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          height: h,
          paddingHorizontal: pad,
          width: iconOnly && !children ? h : fullWidth ? '100%' : undefined,
          backgroundColor: vStyles.backgroundColor,
          borderWidth: vStyles.borderWidth,
          borderColor: vStyles.borderColor as any,
          opacity: disabled ? 0.4 : 1,
        },
        style as any,
      ]}
    >
      {loading ? (
        <Spinner size={iconSz} color={vStyles.color} />
      ) : (
        <>
          {iconL && <Icon name={iconL} size={iconSz} color={vStyles.color} style={{ marginRight: 8 }} />}
          {iconOnly && !children && <Icon name={iconOnly} size={iconSz} color={vStyles.color} />}
          {children && (
            <Text
              style={[
                styles.text,
                {
                  color: vStyles.color,
                  fontSize: fs,
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          )}
          {iconR && <Icon name={iconR} size={iconSz} color={vStyles.color} style={{ marginLeft: 8 }} />}
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  text: {
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
});
