import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Palette, SurfaceColors } from '@/constants/theme';
import { useSavedParks } from '@/context/saved-parks-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { savedParks } = useSavedParks();
  const savedCount = savedParks.length;
  const searchSelected = pathname.startsWith('/states/') || pathname.startsWith('/parks/');
  const showMobileTabBar = Platform.OS !== 'web' || width < 900;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.yosemiteIvory,
        tabBarInactiveTintColor: Palette.campfire,
        tabBarStyle: {
          display: showMobileTabBar ? 'flex' : 'none',
          backgroundColor: SurfaceColors.navLight,
          borderTopColor: Palette.summitBlush,
          ...Platform.select({
            web: {
              boxShadow: `0 -2px 8px ${Palette.campfire}4d`,
            },
            default: {
              shadowColor: Palette.campfire,
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: -2 },
            },
          }),
        },
        headerShown: false,
        sceneStyle: {
          backgroundColor: Palette.night,
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Search by State',
          tabBarLabel: 'Search',
          tabBarAccessibilityLabel: 'Search tab',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="magnifyingglass"
              color={searchSelected ? Palette.yosemiteIvory : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="where-are-we"
        options={{
          title: 'Where Are We?',
          tabBarLabel: 'Where Are We?',
          tabBarAccessibilityLabel: 'Where Are We tab',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="paperplane.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journey-mode"
        options={{
          title: 'Journey Mode',
          tabBarLabel: 'Journey',
          tabBarAccessibilityLabel: 'Journey Mode tab',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="figure.walk"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lifecycle"
        options={{
          title: 'Saved Parks',
          tabBarLabel: 'Saved Parks',
          tabBarAccessibilityLabel: 'Saved parks tab',
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            color: colorScheme === 'dark' ? Palette.graniteShadows : '#ffffff',
          },
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="clock.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="states/[stateCode]"
        options={{
          href: null,
          headerShown: false,
          title: 'States',
        }}
      />
      <Tabs.Screen
        name="parks/[parkCode]"
        options={{
          href: null,
          headerShown: false,
          title: 'Park Profile',
        }}
      />
    </Tabs>
  );
}
