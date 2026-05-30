import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CollapsiblePreviewSection } from '@/components/collapsible-preview-section';
import { ResponsiveContainer, webReadableContentStyle } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  NATIVE_LAND_LANGUAGE_CENTERING_NOTE,
  NATIVE_LAND_RESOURCE_LINKS,
} from '@/constants/native-land-resources';
import { Fonts, Palette, SurfaceColors } from '@/constants/theme';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { setJourneyModeBaseline } from '@/services/journey-mode';
import { fetchLocationContext, fetchNearbySovereignties } from '@/services/location-context';
import type { IndigenousContextData, NearbySovereignty } from '@/types/parks';
import { getSectionNativeId, jumpToWebSection, PAGE_SCROLL_NATIVE_ID } from '@/utils/jump-to-section';
import { startWebTiltingCompass } from '@/utils/web-tilting-compass';

type UserCoordinate = {
  latitude: number;
  longitude: number;
};

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

function BulletList({ items, emptyText }: { items: string[]; emptyText: string }) {
  if (items.length === 0) {
    return <ThemedText>{emptyText}</ThemedText>;
  }

  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <ThemedText key={`${item}-${index}`}>• {item}</ThemedText>
      ))}
    </View>
  );
}

function LoadingCompass() {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingBlock} accessibilityLabel="Getting your coordinates">
      <Animated.View style={[styles.compassShell, { transform: [{ rotate }] }]}>
        <View style={styles.compassNeedle} />
        <ThemedText type="defaultSemiBold" style={styles.compassNorth}>
          N
        </ThemedText>
      </Animated.View>
      <ThemedText type="defaultSemiBold">Getting your coordinates...</ThemedText>
    </View>
  );
}

function HeadingCompass({ heading, active }: { heading: number | null; active: boolean }) {
  const rotation = heading == null ? '0deg' : `${-heading}deg`;

  return (
    <View style={styles.headingCompassBlock}>
      <View style={[styles.headingCompass, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.compassCrossVertical} />
        <View style={styles.compassCrossHorizontal} />
        <View style={styles.headingNeedle} />
        <View style={styles.headingNeedleTail} />
      </View>
      <View style={styles.headingTextBlock}>
        <ThemedText>
          {!active
            ? 'Get your Coordinates to use the in-app compass.'
            : heading == null
            ? 'Compass tilting is not available in this browser or device. Coordinates are still working.'
            : `Device heading: ${Math.round(heading)} degrees`}
        </ThemedText>
      </View>
    </View>
  );
}

function SourceLinks({ links }: { links: string[] }) {
  if (links.length === 0) {
    return <ThemedText>No source links were returned for this lookup.</ThemedText>;
  }

  return (
    <View style={styles.bulletList}>
      {links.map((link) => (
        <Pressable
          key={link}
          accessibilityRole="link"
          accessibilityLabel={`Open source link ${link}`}
          onPress={() => {
            void Linking.openURL(link);
          }}>
          <ThemedText type="link">{link}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function NativeLandResourceLinks() {
  return (
    <View style={styles.bulletList}>
      {NATIVE_LAND_RESOURCE_LINKS.map((resource) => (
        <View key={resource.label} style={styles.resourceLinkBlock}>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Open ${resource.label}`}
            onPress={() => {
              void Linking.openURL(resource.url);
            }}>
            <ThemedText type="link">{resource.label}</ThemedText>
          </Pressable>
          <ThemedText>{resource.description}</ThemedText>
        </View>
      ))}
    </View>
  );
}

function NearbySovereigntiesList({ items }: { items: NearbySovereignty[] }) {
  if (items.length === 0) {
    return (
      <ThemedText>
        No nearby records were found from the sample points around this location.
      </ThemedText>
    );
  }

  return (
    <View style={styles.nearbyList}>
      {items.map((item) => (
        <View key={`${item.category}-${item.name}`} style={styles.nearbyRow}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText>
            {item.category} record, about {formatDistance(item.approximateDistanceMeters)} from here
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

export default function WhereAreWeScreen() {
  const { reportError, showSnackbar } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();
  const borderColor = useThemeColor({ light: Palette.campfire, dark: Palette.campfire }, 'icon');
  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const [coordinate, setCoordinate] = useState<UserCoordinate | null>(null);
  const [context, setContext] = useState<IndigenousContextData | null>(null);
  const [nearbySovereignties, setNearbySovereignties] = useState<NearbySovereignty[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [heading, setHeading] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const headingSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const webHeadingCleanupRef = useRef<(() => void) | null>(null);

  const startHeadingWatch = useCallback(async () => {
    if (headingSubscriptionRef.current || webHeadingCleanupRef.current) {
      return;
    }

    try {
      if (Platform.OS === 'web') {
        webHeadingCleanupRef.current = await startWebTiltingCompass(setHeading);
        return;
      }

      headingSubscriptionRef.current = await Location.watchHeadingAsync((headingData) => {
        const nextHeading =
          headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
        setHeading(Number.isFinite(nextHeading) ? nextHeading : null);
      });
    } catch {
      setHeading(null);
    }
  }, []);

  const loadLocationContext = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        setLoading(true);
        setPermissionMessage('');

        const foregroundPermission = await Location.requestForegroundPermissionsAsync();
        if (!foregroundPermission.granted) {
          setPermissionMessage('Location permission is needed to show Where Are We? context.');
          setContext(null);
          setNearbySovereignties([]);
          return;
        }

        await startHeadingWatch();

        const nextLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const nextCoordinate = {
          latitude: nextLocation.coords.latitude,
          longitude: nextLocation.coords.longitude,
        };

        setCoordinate(nextCoordinate);

        const nextContext = await fetchLocationContext(
          nextCoordinate.latitude,
          nextCoordinate.longitude
        );
        setContext(nextContext);
        await setJourneyModeBaseline(nextContext);

        const nearby = await fetchNearbySovereignties(
          nextCoordinate.latitude,
          nextCoordinate.longitude,
          nextContext
        );
        setNearbySovereignties(nearby);

        if (!silent) {
          showSnackbar('Location context updated.', 'info');
        }
      } catch (error) {
        reportError(error, 'Unable to load location context.');
      } finally {
        setLoading(false);
      }
    },
    [reportError, showSnackbar, startHeadingWatch]
  );

  useFocusEffect(
    useCallback(() => {
    setSections([
      { id: 'compass', label: 'Compass' },
      { id: 'location', label: 'Location Context' },
      { id: 'placenames', label: 'Placename Records' },
      { id: 'languages', label: 'Languages' },
      { id: 'territories', label: 'Territories' },
      { id: 'treaties', label: 'Treaties' },
      { id: 'resources', label: 'Native Land Resources and Map Tools' },
      { id: 'nearby', label: 'Nearby Sovereignties' },
    ]);
    setJumpHandler((id) => {
      if (jumpToWebSection(id)) {
        return;
      }
      scrollRef.current?.scrollTo({ y: sectionOffsets.current[id] ?? 0, animated: true });
    });

    return () => {
      setSections([]);
      setJumpHandler(null);
    };
    }, [setJumpHandler, setSections])
  );

  useEffect(() => {
    void Location.getForegroundPermissionsAsync().then((permission) => {
      if (permission.granted) {
        void startHeadingWatch();
      }
    });

    return () => {
      headingSubscriptionRef.current?.remove();
      headingSubscriptionRef.current = null;
      webHeadingCleanupRef.current?.();
      webHeadingCleanupRef.current = null;
    };
  }, [startHeadingWatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        if (coordinate) {
          void loadLocationContext({ silent: true });
        }
      }
    });

    return () => subscription.remove();
  }, [coordinate, loadLocationContext]);

  const territories = context?.territories ?? [];
  const languages = context?.languages ?? [];
  const treaties = context?.treaties ?? [];
  const sources = context?.referenceLinks ?? [];
  const placeNames = context?.placeNames ?? [];
  const nameMeanings = context?.nameMeanings ?? [];
  const coordinateLabel = coordinate
    ? `${formatCoordinate(coordinate.latitude)}, ${formatCoordinate(coordinate.longitude)}`
    : '';

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground variant="where">
        <ResponsiveContainer style={{ gap: padding, paddingTop: 0 }}>
        <ScrollView
          nativeID={PAGE_SCROLL_NATIVE_ID}
          ref={scrollRef}
          contentContainerStyle={[webReadableContentStyle, { gap: padding, paddingTop: padding, paddingBottom: 28 }]}>
          <ThemedView
            nativeID={getSectionNativeId('intro')}
            style={[styles.card, glassSurfaceStyle, { borderColor, gap }]}>
            <ThemedText
              type="title"
              accessibilityRole="header"
              lightColor={Palette.cedar}
              darkColor={Palette.yosemiteIvory}>
              Where Are We?
            </ThemedText>
            <ThemedText>
              Whose stories involve the land you are on? When using Where Are We Mode, Defend the
              Parks app will use your device location with your permission to gather your exact
              coordinates. Then the app will compare those coordinates to the data from the Native
              Land API, so you can learn about Indigenous languages, territories, treaties, and
              nearby sovereignty records associated with the land you are currently on. Additionally,
              use Journey Mode in the main navigation to receive real-time updates and notifications
              when you have traveled into a new area that returns new information from the Native
              Land API, along with all information available for the current location.
            </ThemedText>
            <Pressable
              onPress={() => {
                void loadLocationContext();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                coordinate
                  ? `Refresh coordinates ${coordinateLabel}`
                  : 'Get My Coordinates'
              }
              accessibilityHint="Requests location permission and loads Indigenous context for your current coordinates"
              style={({ pressed }) => [
                styles.coordinateButton,
                coordinate && styles.coordinateButtonLoaded,
                pressed && styles.buttonPressed,
              ]}>
              <Text style={styles.coordinateButtonPrimaryText}>
                {coordinate ? 'Coordinates Acquired' : 'Get My Coordinates'}
              </Text>
              {coordinate ? (
                <View style={styles.coordinateButtonDetailRow}>
                  <IconSymbol name="arrow.clockwise" size={18} color={Palette.yosemiteIvory} />
                  <Text style={styles.coordinateButtonDetailText}>{coordinateLabel}</Text>
                </View>
              ) : null}
            </Pressable>
          </ThemedView>

          <ThemedView
            nativeID={getSectionNativeId('compass')}
            style={[styles.card, glassSurfaceStyle, { borderColor, gap }]}
            onLayout={(event) => {
              sectionOffsets.current.compass = event.nativeEvent.layout.y;
            }}>
            <ThemedText type="subtitle">In-App Compass</ThemedText>
            <HeadingCompass heading={heading} active={!!coordinate} />
          </ThemedView>

          <View
            nativeID={getSectionNativeId('location')}
            onLayout={(event) => {
              sectionOffsets.current.location = event.nativeEvent.layout.y;
            }}>
            <CollapsiblePreviewSection title="Location Context">
            <ThemedText>
              These records are educational and contextual. Indigenous territories can overlap, and
              API records should not be read as legal boundary determinations.
            </ThemedText>
            <ThemedText>{NATIVE_LAND_LANGUAGE_CENTERING_NOTE}</ThemedText>
            {permissionMessage ? <ThemedText>{permissionMessage}</ThemedText> : null}
            {coordinate ? (
              <ThemedText>
                Coordinates: {formatCoordinate(coordinate.latitude)}, {formatCoordinate(coordinate.longitude)}
              </ThemedText>
            ) : null}
            {loading ? <LoadingCompass /> : null}
            </CollapsiblePreviewSection>
          </View>

          {context ? (
            <>
              <View
                nativeID={getSectionNativeId('placenames')}
                onLayout={(event) => {
                  sectionOffsets.current.placenames = event.nativeEvent.layout.y;
                }}>
                <CollapsiblePreviewSection
                  title="Placename Records Returned for This Location"
                  collapsible={placeNames.length + nameMeanings.length > 4}>
                  <BulletList items={placeNames} emptyText="No placename records were returned." />
                  {nameMeanings.length > 0 ? (
                    <View style={styles.contentGroup}>
                      <ThemedText type="defaultSemiBold">Name Meanings Provided by the API</ThemedText>
                      {nameMeanings.map((entry, index) => (
                        <ThemedText key={`${entry.name}-${entry.meaning}-${index}`}>
                          • {entry.name}: {entry.meaning}
                        </ThemedText>
                      ))}
                    </View>
                  ) : null}
                </CollapsiblePreviewSection>
              </View>

              <View
                nativeID={getSectionNativeId('languages')}
                onLayout={(event) => {
                  sectionOffsets.current.languages = event.nativeEvent.layout.y;
                }}>
                <CollapsiblePreviewSection title="Languages Connected to This Location" collapsible={languages.length > 4}>
                {context.infoMessage ? <ThemedText>{context.infoMessage}</ThemedText> : null}
                {context.keyRequired ? (
                  <ThemedText>
                    Native Land requires an API key to return records. Add `EXPO_PUBLIC_NATIVE_LAND_API_KEY`
                    to continue.
                  </ThemedText>
                ) : null}
                <ThemedText>
                  Languages are listed before territories because language carries relationship to
                  place, memory, and cultural knowledge.
                </ThemedText>
                <ThemedText type="defaultSemiBold">Language records returned for this location</ThemedText>
                <BulletList items={languages} emptyText="No language records were returned." />
                </CollapsiblePreviewSection>
              </View>

              <View
                nativeID={getSectionNativeId('territories')}
                onLayout={(event) => {
                  sectionOffsets.current.territories = event.nativeEvent.layout.y;
                }}>
                <CollapsiblePreviewSection title="Territories in This Location" collapsible={territories.length > 4}>
                <BulletList items={territories} emptyText="No territory records were returned." />
                </CollapsiblePreviewSection>
              </View>

              <View
                nativeID={getSectionNativeId('treaties')}
                onLayout={(event) => {
                  sectionOffsets.current.treaties = event.nativeEvent.layout.y;
                }}>
                <CollapsiblePreviewSection title="Treaties Connected to This Location" collapsible={treaties.length > 4}>
                <ThemedText>
                  Treaty records identify agreements returned by Native Land for this location. The
                  records can point to important legal and historical relationships, but the app only
                  displays the record names returned by the API and does not interpret treaty terms.
                </ThemedText>
                <ThemedText>
                  A useful place to start your own research is Native Governance Center&apos;s treaty education
                  resources, including Why Treaties Matter: https://nativegov.org/resources/why-do-treaties-matter/
                </ThemedText>
                <ThemedText type="defaultSemiBold">Treaty records returned for this location</ThemedText>
                <BulletList items={treaties} emptyText="No treaty records were returned." />
                </CollapsiblePreviewSection>
              </View>

              <View
                nativeID={getSectionNativeId('resources')}
                onLayout={(event) => {
                  sectionOffsets.current.resources = event.nativeEvent.layout.y;
                }}>
                <CollapsiblePreviewSection title="Native Land Public Resources and Map Tools">
                <ThemedText>
                  These links open Native Land public search and map tools. They are not limited to
                  your exact coordinates or one specific people, so use them as broader research
                  tools after reviewing the records returned for this location above.
                </ThemedText>
                <NativeLandResourceLinks />
                </CollapsiblePreviewSection>
              </View>

              <View
                nativeID={getSectionNativeId('nearby')}
                onLayout={(event) => {
                  sectionOffsets.current.nearby = event.nativeEvent.layout.y;
                }}>
                <CollapsiblePreviewSection title="Nearby Sovereignties" collapsible={nearbySovereignties.length > 4}>
                <ThemedText>
                  These are approximate nearby records found by checking sample points around your
                  location.
                </ThemedText>
                <NearbySovereigntiesList items={nearbySovereignties} />
                </CollapsiblePreviewSection>
              </View>

              <CollapsiblePreviewSection title="Sources" collapsible={sources.length > 4}>
                <SourceLinks links={sources} />
              </CollapsiblePreviewSection>
            </>
          ) : null}
        </ScrollView>
        </ResponsiveContainer>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  bulletList: {
    gap: 4,
  },
  coordinateButton: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Palette.cedar,
  },
  coordinateButtonLoaded: {
    borderWidth: 1,
    borderColor: Palette.campfire,
    backgroundColor: Palette.pine,
  },
  coordinateButtonPrimaryText: {
    color: Palette.yosemiteIvory,
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  coordinateButtonDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  coordinateButtonDetailText: {
    color: Palette.yosemiteIvory,
    fontFamily: Fonts.sans,
    fontSize: 13,
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.72,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  compassShell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Palette.meadowBloom,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SurfaceColors.glassBlush,
  },
  compassNeedle: {
    position: 'absolute',
    top: 10,
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: Palette.summitBlush,
  },
  compassNorth: {
    marginTop: 18,
  },
  nearbyList: {
    gap: 8,
  },
  nearbyRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 49, 12, 0.24)',
    paddingTop: 10,
    gap: 2,
  },
  resourceLinkBlock: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 49, 12, 0.24)',
    paddingTop: 10,
    gap: 2,
  },
  contentGroup: {
    gap: 6,
  },
  headingCompassBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headingCompass: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: Palette.campfire,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.night,
  },
  compassCrossVertical: {
    position: 'absolute',
    width: 1,
    height: '78%',
    backgroundColor: 'rgba(247, 239, 226, 0.35)',
  },
  compassCrossHorizontal: {
    position: 'absolute',
    width: '78%',
    height: 1,
    backgroundColor: 'rgba(247, 239, 226, 0.35)',
  },
  headingNeedle: {
    position: 'absolute',
    top: 9,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Palette.campfire,
  },
  headingNeedleTail: {
    position: 'absolute',
    bottom: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Palette.yosemiteIvory,
  },
  headingTextBlock: {
    flex: 1,
    gap: 2,
  },
});
