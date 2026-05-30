import { ImageBackground } from 'expo-image';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { Palette, SurfaceColors } from '@/constants/theme';
import { PAGE_SCROLL_NATIVE_ID } from '@/utils/jump-to-section';

type ScreenBackgroundVariant = 'main' | 'where' | 'journey';

const MOBILE_BACKGROUND_IMAGES = {
  main: require('@/assets/images/maria-orlova-3UWc-EMf0zA-unsplash.jpg'),
  where: require('@/assets/images/evan-wise-2wvXI4mjYJ8-unsplash.jpg'),
  journey: require('@/assets/images/evan-wise-mNSSpeJsnQA-unsplash.jpg'),
};

const WEB_BACKGROUND_IMAGES = {
  main: require('@/assets/images/denise-jans-XCJt9Z3_0Ks-unsplash.jpg'),
  where: require('@/assets/images/denise-jans-XCJt9Z3_0Ks-unsplash.jpg'),
  journey: require('@/assets/images/kyle-loftus-IG1m3RomhPI-unsplash.jpg'),
};

export function ScreenBackground({
  children,
  variant = 'main',
  style,
}: {
  children: ReactNode;
  variant?: ScreenBackgroundVariant;
  style?: ViewStyle;
}) {
  const source = Platform.OS === 'web' ? WEB_BACKGROUND_IMAGES[variant] : MOBILE_BACKGROUND_IMAGES[variant];
  const webWheelProps =
    Platform.OS === 'web'
      ? {
          onWheel: (event: { deltaY?: number }) => {
            if (typeof document === 'undefined') {
              return;
            }
            const scrollContainer = document.getElementById(PAGE_SCROLL_NATIVE_ID);
            if (scrollContainer && typeof event.deltaY === 'number') {
              scrollContainer.scrollTop += event.deltaY;
            }
          },
        }
      : {};

  return (
    <ImageBackground source={source} style={[styles.background, style]} contentFit="cover">
      <View {...webWheelProps} style={styles.dimLayer}>{children}</View>
    </ImageBackground>
  );
}

export const glassSurfaceStyle = {
  backgroundColor: SurfaceColors.glassLight,
  borderColor: 'rgba(170, 82, 21, 0.42)',
  borderWidth: 1,
} as const;

export const warmGlassSurfaceStyle = {
  backgroundColor: SurfaceColors.glassWarm,
  borderColor: 'rgba(170, 82, 21, 0.48)',
  borderWidth: 1,
} as const;

export const blushGlassSurfaceStyle = {
  backgroundColor: SurfaceColors.glassBlush,
  borderColor: 'rgba(102, 49, 12, 0.48)',
  borderWidth: 1,
} as const;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  dimLayer: {
    flex: 1,
    backgroundColor: `${Palette.night}8f`,
  },
});
