import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, typography } from '@/constants/tokens';
import { 
  PRIMARY, 
  G200, 
  G900, 
  G400, 
  G700, 
  PRIMARY_DARK
} from '@/constants/theme';
import { Icon, IconName } from './Icon';

interface ToggleProps {
  label?: string;
  defaultOn?: boolean;
  icon?: IconName;
  onValueChange?: (value: boolean) => void;
}

export function Toggle({ label, defaultOn = false, icon, onValueChange }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);
  const [anim] = useState(new Animated.Value(defaultOn ? 1 : 0));

  const toggle = () => {
    const next = !on;
    setOn(next);
    onValueChange?.(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23],
  });

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {icon && <Icon name={icon} size={18} solid={on} color={on ? PRIMARY_DARK : G400} style={{ marginRight: 10 }} />}
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggle}
        style={[
          styles.track,
          { backgroundColor: on ? PRIMARY : G200 }
        ]}
      >
        <Animated.View 
          style={[
            styles.thumb, 
            { 
              transform: [{ translateX }],
              backgroundColor: on ? G900 : colors.white
            }
          ]} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.medium,
    color: G700,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
