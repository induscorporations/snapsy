import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

import { 
  Colors, 
  Fonts, 
  RADIUS, 
  SPACING, 
  G200, 
  PRIMARY, 
  ERROR, 
  G100, 
  G50, 
  G900, 
  G400, 
  G600, 
  G800 
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon, IconName } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: IconName;
  prefix?: string;
  showPasswordToggle?: boolean;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  prefix,
  showPasswordToggle,
  containerStyle,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}: InputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e as any);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e as any);
  };

  const state = props.editable === false ? 'disabled' : error ? 'error' : isFocused ? 'focused' : 'default';

  const borders = {
    default: G200,
    focused: PRIMARY,
    error: ERROR,
    disabled: G100,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: state === 'disabled' ? G50 : '#FFFFFF',
            borderColor: borders[state],
            borderWidth: isFocused || error ? 2 : 1.5,
          },
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={16}
            color={isFocused ? PRIMARY : G400}
            style={{ marginRight: 8 }}
          />
        )}
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            {
              color: G800,
            },
            style,
          ]}
          placeholderTextColor={G400}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPw}
          editable={props.editable}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.toggle}>
            <Icon name={showPw ? 'eye' : 'eyeOff'} size={16} color={G400} />
          </TouchableOpacity>
        )}
        {state === 'error' && <Icon name="alertCircle" size={16} solid color={ERROR} style={{ marginLeft: 8 }} />}
      </View>
      {(helperText || error) && (
        <View style={styles.helperRow}>
          <Icon
            name={error ? 'xCircle' : 'info'}
            size={12}
            solid={!!error}
            color={error ? ERROR : G400}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.helperText, { color: error ? ERROR : G400 }]}>
            {error || helperText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    fontWeight: '600',
    color: G600,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  prefix: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: G400,
    fontWeight: '500',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  toggle: {
    padding: 4,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  helperText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    margin: 0,
  },
});
