// Fallback for using MaterialIcons on Android and inline SVG on web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import React, { ComponentProps } from 'react';
import { OpaqueColorValue, Platform, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  magnifyingglass: 'search',
  'location.north.fill': 'navigation',
  'figure.walk': 'directions-walk',
  'clock.fill': 'access-time',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
  'arrow.clockwise': 'sync',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (Platform.OS === 'web') {
    return <WebIconSymbol name={name} size={size} color={color} style={style} />;
  }

  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}

function WebIconSymbol({
  name,
  size,
  color,
  style,
}: {
  name: IconSymbolName;
  size: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  const iconColor = color as string;

  switch (name) {
    case 'house.fill':
      return svgIcon(size, iconColor, style, [
        svgPath('M3 11.5 12 4l9 7.5', { fill: 'none' }),
        svgPath('M5.5 10.5V20h13v-9.5', { fill: 'none' }),
        svgPath('M9.5 20v-6h5v6', { fill: 'none' }),
      ]);
    case 'magnifyingglass':
      return svgIcon(size, iconColor, style, [
        svgCircle(10.5, 10.5, 5.75),
        svgPath('m15 15 5 5'),
      ]);
    case 'paperplane.fill':
      return svgIcon(size, iconColor, style, [
        svgPath('M21 3 3.8 10.7c-.9.4-.8 1.7.2 1.9l6.7 1.4 1.4 6.7c.2 1 1.5 1.1 1.9.2L21 3Z', {
          fill: iconColor,
          stroke: 'none',
        }),
        svgPath('M10.7 14 21 3', { stroke: 'rgba(247,239,226,0.72)', strokeWidth: 1.6 }),
      ]);
    case 'location.north.fill':
      return svgIcon(size, iconColor, style, [
        svgPath('M12 3 6.5 21 12 17.5 17.5 21 12 3Z', {
          fill: iconColor,
          stroke: 'none',
        }),
      ]);
    case 'figure.walk':
      return svgIcon(size, iconColor, style, [
        svgCircle(13, 4.5, 2),
        svgPath('M11.5 8.5 9 14l-4 2'),
        svgPath('M12 9l3 4 3 1.5'),
        svgPath('M9.2 14 13 16.5 11.5 21'),
        svgPath('M13 16.5 17 21'),
      ]);
    case 'clock.fill':
      return svgIcon(size, iconColor, style, [
        svgCircle(12, 12, 8.5),
        svgPath('M12 7.5v5l3.5 2'),
      ]);
    case 'chevron.right':
      return svgIcon(size, iconColor, style, [svgPath('m9 5 7 7-7 7')]);
    case 'chevron.down':
      return svgIcon(size, iconColor, style, [svgPath('m6 9 6 6 6-6')]);
    case 'chevron.up':
      return svgIcon(size, iconColor, style, [svgPath('m6 15 6-6 6 6')]);
    case 'arrow.clockwise':
      return svgIcon(size, iconColor, style, [
        svgPath('M20 6v5h-5'),
        svgPath('M19.2 11A7.5 7.5 0 1 1 17 5.7'),
      ]);
    case 'chevron.left.forwardslash.chevron.right':
    default:
      return svgIcon(size, iconColor, style, [
        svgPath('m9 8-4 4 4 4'),
        svgPath('m15 8 4 4-4 4'),
        svgPath('m13 6-2 12'),
      ]);
  }
}

function svgIcon(
  size: number,
  color: string,
  style: StyleProp<TextStyle> | undefined,
  children: React.ReactNode[]
) {
  return React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: 2.4,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: style as React.CSSProperties,
      'aria-hidden': true,
      focusable: false,
    },
    ...children
  );
}

function svgPath(d: string, props: Record<string, unknown> = {}) {
  return React.createElement('path', { key: d, d, ...props });
}

function svgCircle(cx: number, cy: number, r: number) {
  return React.createElement('circle', { key: `${cx}-${cy}-${r}`, cx, cy, r });
}
