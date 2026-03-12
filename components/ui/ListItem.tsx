import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/tokens';
import { 
  G100, 
  G400, 
  G800, 
  PRIMARY_LIGHT, 
  PRIMARY_DARK,
  Fonts 
} from '@/constants/theme';
import { Icon, IconName } from './Icon';

interface ListItemProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  divider?: boolean;
  active?: boolean;
  onPress?: () => void;
}

export function ListItem({
  icon,
  title,
  subtitle,
  trailing,
  divider = true,
  active = false,
  onPress,
}: ListItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.container,
        divider && styles.divider,
      ]}
    >
      {icon && (
        <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
          <Icon name={icon} size={18} solid={active} color={active ? PRIMARY_DARK : G400} />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {trailing && (
        <View style={styles.trailing}>
          {typeof trailing === 'string' ? (
            <Icon name="chevronRight" size={16} color={G400} />
          ) : (
            trailing
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: G100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: G100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: PRIMARY_LIGHT,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.size.base,
    fontFamily: typography.fontFamily.bold,
    color: G800,
  },
  subtitle: {
    fontSize: typography.size.sm,
    fontFamily: Fonts.regular,
    color: G400,
    marginTop: 2,
  },
  trailing: {
    marginLeft: 12,
  },
});
