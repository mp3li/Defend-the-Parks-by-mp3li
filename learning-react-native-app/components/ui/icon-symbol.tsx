// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import {
  OpaqueColorValue,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';

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
  const stroke = Math.max(2, size * 0.09);
  const webViewStyle = style as any;

  switch (name) {
    case 'house.fill':
      return (
        <View style={[webIconStyles.box, { width: size, height: size }, webViewStyle]}>
          <View
            style={[
              webIconStyles.homeRoof,
              {
                borderLeftWidth: size * 0.3,
                borderRightWidth: size * 0.3,
                borderBottomWidth: size * 0.27,
                borderBottomColor: iconColor,
              },
            ]}
          />
          <View
            style={[
              webIconStyles.homeBody,
              {
                width: size * 0.52,
                height: size * 0.42,
                backgroundColor: iconColor,
                borderRadius: size * 0.05,
              },
            ]}
          />
        </View>
      );
    case 'magnifyingglass':
      return (
        <View style={[webIconStyles.box, { width: size, height: size }, webViewStyle]}>
          <View
            style={[
              webIconStyles.searchCircle,
              {
                width: size * 0.52,
                height: size * 0.52,
                borderRadius: size * 0.26,
                borderWidth: stroke,
                borderColor: iconColor,
              },
            ]}
          />
          <View
            style={[
              webIconStyles.searchHandle,
              {
                width: size * 0.34,
                height: stroke,
                backgroundColor: iconColor,
                borderRadius: stroke,
                right: size * 0.14,
                bottom: size * 0.19,
              },
            ]}
          />
        </View>
      );
    case 'paperplane.fill':
    case 'location.north.fill':
      return (
        <View style={[webIconStyles.box, { width: size, height: size }, webViewStyle]}>
          <View
            style={[
              webIconStyles.plane,
              {
                borderLeftWidth: size * 0.28,
                borderRightWidth: size * 0.28,
                borderBottomWidth: size * 0.7,
                borderBottomColor: iconColor,
              },
              name === 'paperplane.fill' && webIconStyles.planeTilt,
            ]}
          />
          <View style={[webIconStyles.planeCut, { borderBottomWidth: size * 0.26 }]} />
        </View>
      );
    case 'figure.walk':
      return (
        <View style={[webIconStyles.box, { width: size, height: size }, webViewStyle]}>
          <View
            style={[
              webIconStyles.walkHead,
              {
                width: size * 0.24,
                height: size * 0.24,
                borderRadius: size * 0.12,
                backgroundColor: iconColor,
                top: size * 0.05,
              },
            ]}
          />
          {[
            { lineStyle: webIconStyles.walkBody, width: size * 0.18, height: size * 0.36, rotate: 0, top: size * 0.34 },
            { lineStyle: webIconStyles.walkArm, width: size * 0.33, height: stroke, rotate: -28, top: size * 0.36 },
            { lineStyle: webIconStyles.walkLegLeft, width: size * 0.34, height: stroke, rotate: 35, top: size * 0.62 },
            { lineStyle: webIconStyles.walkLegRight, width: size * 0.32, height: stroke, rotate: -34, top: size * 0.62 },
          ].map(({ lineStyle, width, height, rotate, top }, index) => (
            <View
              key={index}
              style={[
                lineStyle,
                {
                  width,
                  height,
                  top,
                  backgroundColor: iconColor,
                  borderRadius: stroke,
                  transform: [{ rotate: `${rotate}deg` }],
                },
              ]}
            />
          ))}
        </View>
      );
    case 'clock.fill':
      return (
        <View style={[webIconStyles.box, { width: size, height: size }, webViewStyle]}>
          <View
            style={[
              webIconStyles.clockFace,
              {
                width: size * 0.7,
                height: size * 0.7,
                borderRadius: size * 0.35,
                borderWidth: stroke,
                borderColor: iconColor,
              },
            ]}>
            <View
              style={[
                webIconStyles.clockHand,
                {
                  width: stroke,
                  height: size * 0.22,
                  backgroundColor: iconColor,
                  top: size * 0.16,
                },
              ]}
            />
            <View
              style={[
                webIconStyles.clockMinute,
                {
                  width: size * 0.2,
                  height: stroke,
                  backgroundColor: iconColor,
                  top: size * 0.32,
                  left: size * 0.34,
                },
              ]}
            />
          </View>
        </View>
      );
    case 'chevron.right':
      return <Text style={[webIconStyles.textIcon, { color: iconColor, fontSize: size }, style]}>›</Text>;
    case 'chevron.down':
      return <Text style={[webIconStyles.textIcon, { color: iconColor, fontSize: size }, style]}>⌄</Text>;
    case 'chevron.up':
      return <Text style={[webIconStyles.textIcon, { color: iconColor, fontSize: size }, style]}>⌃</Text>;
    case 'arrow.clockwise':
      return <Text style={[webIconStyles.textIcon, { color: iconColor, fontSize: size }, style]}>↻</Text>;
    case 'chevron.left.forwardslash.chevron.right':
    default:
      return <Text style={[webIconStyles.textIcon, { color: iconColor, fontSize: size * 0.72 }, style]}>{'</>'}</Text>;
  }
}

const webIconStyles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: -1,
  },
  homeBody: {},
  searchCircle: {
    position: 'absolute',
    left: '16%',
    top: '15%',
    backgroundColor: 'transparent',
  },
  searchHandle: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  plane: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  planeTilt: {
    transform: [{ rotate: '48deg' }],
  },
  planeCut: {
    position: 'absolute',
    bottom: '21%',
    width: 0,
    height: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: 'rgba(255,255,255,0.28)',
  },
  walkHead: {
    position: 'absolute',
  },
  walkBody: {
    position: 'absolute',
  },
  walkArm: {
    position: 'absolute',
  },
  walkLegLeft: {
    position: 'absolute',
  },
  walkLegRight: {
    position: 'absolute',
  },
  clockFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    position: 'absolute',
  },
  clockMinute: {
    position: 'absolute',
    borderRadius: 4,
  },
  textIcon: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
  },
});
