// components/ui/Input.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { colors, radii, typography, TAP_TARGET } from '@/constants/tokens';

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type InputState = 'default' | 'focused' | 'error' | 'disabled';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?:              string;
  helperText?:         string;
  state?:              InputState;
  iconLeft?:           React.ReactNode;  // always linear (outline)
  iconRight?:          React.ReactNode;
  prefix?:             string;
  showPasswordToggle?: boolean;
  containerStyle?:     object;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function Input({
  label,
  helperText,
  state            = 'default',
  iconLeft,
  iconRight,
  prefix,
  showPasswordToggle,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused,    setFocused]    = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const derivedState: InputState =
    state === 'disabled' ? 'disabled' :
    state === 'error'    ? 'error'    :
    focused              ? 'focused'  : 'default';

  const borderColor = {
    default:  colors.grey200,
    focused:  colors.primary,
    error:    colors.error,
    disabled: colors.grey100,
  }[derivedState];

  const focusShadow = derivedState === 'focused' ? styles.shadowFocus :
                      derivedState === 'error'   ? styles.shadowError : undefined;

  return (
    <View style={[styles.wrapper, containerStyle]}>

      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[
        styles.field,
        { borderColor, backgroundColor: state === 'disabled' ? colors.grey50 : colors.white },
        focusShadow,
      ]}>
        {/* Left icon — linear (outline only), no fill */}
        {iconLeft && <View style={styles.sideIcon}>{iconLeft}</View>}

        {prefix && (
          <Text style={styles.prefix}>{prefix}</Text>
        )}

        <TextInput
          style={styles.input}
          editable={state !== 'disabled'}
          secureTextEntry={showPasswordToggle ? !showSecret : rest.secureTextEntry}
          placeholderTextColor={colors.grey400}
          onFocus={e => { setFocused(true);  onFocus?.(e); }}
          onBlur={e  => { setFocused(false); onBlur?.(e); }}
          selectionColor={colors.primary}
          {...rest}
        />

        {/* Password toggle */}
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setShowSecret(s => !s)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.sideIcon}
          >
            {/* Replace placeholder with Eye/EyeOff from lucide-react-native */}
            <Text style={{ color: colors.grey400, fontSize: typography.size.xs, fontFamily: typography.fontFamily.semibold }}>
              {showSecret ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Right icon — solid AlertCircle on error, custom icon otherwise */}
        {!showPasswordToggle && (
          derivedState === 'error'
            ? <View style={styles.sideIcon}>
                {/* Replace with: <AlertCircle size={16} color={colors.error} fill={colors.error} strokeWidth={0} /> */}
                <View style={styles.errorIndicator} />
              </View>
            : iconRight
            ? <View style={styles.sideIcon}>{iconRight}</View>
            : null
        )}
      </View>

      {helperText && (
        <Text style={[styles.helper, derivedState === 'error' && styles.helperError]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

// ─── OTP INPUT ───────────────────────────────────────────────────────────────
export interface OTPInputProps {
  length?:   number;
  value?:    string[];
  onChange?: (values: string[], joined: string) => void;
}

export function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const [vals, setVals] = useState<string[]>(value ?? Array(length).fill(''));
  const inputRefs = Array.from({ length }, () => useRef<TextInput>(null));

  const handleChange = (text: string, index: number) => {
    // Only keep last character typed
    const char = text.slice(-1);
    const next = [...vals];
    next[index] = char;
    setVals(next);
    onChange?.(next, next.join(''));
    if (char && index < length - 1) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !vals[index] && index > 0) {
      const next = [...vals];
      next[index - 1] = '';
      setVals(next);
      onChange?.(next, next.join(''));
      inputRefs[index - 1]?.current?.focus();
    }
  };

  return (
    <View style={otpStyles.row}>
      {Array(length).fill(0).map((_, i) => (
        <TextInput
          key={i}
          ref={inputRefs[i]}
          style={[otpStyles.cell, vals[i] ? otpStyles.cellActive : null]}
          maxLength={1}
          keyboardType="number-pad"
          value={vals[i]}
          onChangeText={text => handleChange(text, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          textAlign="center"
          selectionColor={colors.primary}
        />
      ))}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper:   { gap: 6 },
  label: {
    fontSize:   typography.size.sm,
    fontFamily: typography.fontFamily.semibold,
    color:      colors.grey600,
  },
  field: {
    flexDirection:     'row',
    alignItems:        'center',
    height:            TAP_TARGET,
    borderRadius:      radii.lg,
    borderWidth:       1.5,
    paddingHorizontal: 14,
    gap:               8,
  },
  shadowFocus: {
    shadowColor:   colors.primary,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius:  6,
    elevation:     3,
  },
  shadowError: {
    shadowColor:   colors.error,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius:  6,
    elevation:     3,
  },
  input: {
    flex:               1,
    height:             '100%',
    fontSize:           typography.size.base,
    fontFamily:         typography.fontFamily.regular,
    color:              colors.grey800,
    includeFontPadding: false,
  },
  prefix: {
    fontSize:   typography.size.sm,
    fontFamily: typography.fontFamily.medium,
    color:      colors.grey400,
    flexShrink: 0,
  },
  sideIcon:         { flexShrink: 0 },
  helper: {
    fontSize:   typography.size.xs,
    fontFamily: typography.fontFamily.medium,
    color:      colors.grey400,
  },
  helperError:      { color: colors.error },
  errorIndicator: {
    width: 8, height: 8,
    borderRadius:    4,
    backgroundColor: colors.error,
  },
});

const otpStyles = StyleSheet.create({
  row:  { flexDirection: 'row', gap: 8 },
  cell: {
    width:           44,
    height:          52,
    borderRadius:    radii.md,
    borderWidth:     1.5,
    borderColor:     colors.grey200,
    fontSize:        typography.size['2xl'],
    fontFamily:      typography.fontFamily.bold,
    color:           colors.grey800,
    backgroundColor: colors.white,
  },
  cellActive: {
    borderColor:   colors.primary,
    shadowColor:   colors.primary,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius:  6,
    elevation:     3,
  },
});
