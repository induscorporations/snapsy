import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Calendar, Upload, User } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { UploadQueueProcessor } from '@/components/upload-queue-processor';
import { colors, iconSize } from '@/constants/tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TAB_ICON_SIZE = iconSize.lg;

// Linear/solid convention: inactive = outline, active = filled
function tabIconProps(focused: boolean) {
  return focused
    ? { strokeWidth: 0, fill: colors.primaryDark, color: colors.primaryDark }
    : { strokeWidth: 1.75, fill: 'none' as const, color: colors.grey400 };
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tabBarBg = isDark ? colors.darkSurface : colors.white;
  const tabBarBorder = isDark ? colors.darkBorder : colors.grey100;
  const activeTint = colors.primaryDark;
  const inactiveTint = colors.grey400;

  return (
    <>
      <UploadQueueProcessor />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: tabBarBg,
            borderTopColor: tabBarBorder,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <Home size={TAB_ICON_SIZE} {...tabIconProps(focused)} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ focused }) => (
              <Calendar size={TAB_ICON_SIZE} {...tabIconProps(focused)} />
            ),
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: 'Upload',
            tabBarIcon: ({ focused }) => (
              <Upload size={TAB_ICON_SIZE} {...tabIconProps(focused)} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <User size={TAB_ICON_SIZE} {...tabIconProps(focused)} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
