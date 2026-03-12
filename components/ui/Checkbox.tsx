import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  PRIMARY, 
  G300, 
  G700, 
  G900,
  Fonts 
} from '@/constants/theme';
import { Icon } from './Icon';

interface CheckboxProps {
  label?: string;
  defaultChecked?: boolean;
  onValueChange?: (value: boolean) => void;
}

export function Checkbox({ label, defaultChecked = false, onValueChange }: CheckboxProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    onValueChange?.(next);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggle}
      style={styles.container}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? PRIMARY : G300,
            backgroundColor: checked ? PRIMARY : 'transparent',
          }
        ]}
      >
        {checked && <Icon name="check" size={13} solid color={G900} strokeWidth={3} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: G700,
  },
});
