import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessible-button';
import { CollapsiblePreviewSection } from '@/components/collapsible-preview-section';
import { JourneyModePanel } from '@/components/journey-mode-panel';
import { ResponsiveContainer, webReadableContentStyle } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette } from '@/constants/theme';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import {
  getJourneyModeEnabled,
  requestJourneyModePermissions,
  setJourneyModeBaseline,
  setJourneyModeEnabled,
  setJourneyModeLastCheck,
  startJourneyModeTask,
  stopJourneyModeTask,
} from '@/services/journey-mode';
import { fetchLocationContext, fetchNearbySovereignties } from '@/services/location-context';
import type { IndigenousContextData, NearbySovereignty } from '@/types/parks';
import { getSectionNativeId, jumpToWebSection, PAGE_SCROLL_NATIVE_ID } from '@/utils/jump-to-section';
import { startWebTiltingCompass } from '@/utils/web-tilting-compass';

type LoadJourneyLocationOptions = {
  silent?: boolean;
};

function formatCoordinate(value: number) {
  return value.toFixed(5);
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
            ? 'Begin Journey Mode to use the in-app compass.'
            : heading == null
            ? 'Compass tilting is not available in this browser or device. Coordinates are still working.'
            : `Device heading: ${Math.round(heading)} degrees`}
        </ThemedText>
      </View>
    </View>
  );
}

export default function JourneyModeScreen() {
  const { reportError, showSnackbar } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const { getResponsivePadding } = useResponsiveLayout();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const padding = getResponsivePadding();
  const [coordinate, setCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [context, setContext] = useState<IndigenousContextData | null>(null);
  const [nearby, setNearby] = useState<NearbySovereignty[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [heading, setHeading] = useState<number | null>(null);
  const [journeyModeEnabled, setJourneyModeEnabledState] = useState(false);
  const [journeyStatusRefreshKey, setJourneyStatusRefreshKey] = useState(0);
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

  useEffect(() => {
    return () => {
      headingSubscriptionRef.current?.remove();
      headingSubscriptionRef.current = null;
      webHeadingCleanupRef.current?.();
      webHeadingCleanupRef.current = null;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getJourneyModeEnabled().then(setJourneyModeEnabledState);
      setSections([
        { id: 'overview', label: 'Overview' },
        { id: 'compass', label: 'In-App Compass' },
        { id: 'journey', label: 'How Journey Mode Works' },
        { id: 'results', label: 'Current Location Results' },
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

  const endJourneyMode = useCallback(async () => {
    try {
      setLoadingLocation(true);
      await setJourneyModeEnabled(false);
      if (Platform.OS !== 'web') {
        await stopJourneyModeTask();
      }
      setJourneyModeEnabledState(false);
      setCoordinate(null);
      setContext(null);
      setNearby([]);
      setHeading(null);
      webHeadingCleanupRef.current?.();
      webHeadingCleanupRef.current = null;
      headingSubscriptionRef.current?.remove();
      headingSubscriptionRef.current = null;
      setPermissionMessage('Journey Mode Ended. Begin Again?');
      setJourneyStatusRefreshKey((current) => current + 1);
      showSnackbar('Journey Mode Ended. Begin Again?', 'info');
    } catch (error) {
      reportError(error, 'Unable to end Journey Mode.');
    } finally {
      setLoadingLocation(false);
    }
  }, [reportError, showSnackbar]);

  const loadJourneyLocation = useCallback(async (options: LoadJourneyLocationOptions = {}) => {
    try {
      if (!options.silent) {
        setLoadingLocation(true);
        setPermissionMessage('');
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setPermissionMessage('Location permission is needed to get Journey Mode coordinates.');
        return;
      }
      if (!options.silent) {
        await requestJourneyModePermissions();
      }

      const nextLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoordinate = {
        latitude: nextLocation.coords.latitude,
        longitude: nextLocation.coords.longitude,
      };
      setCoordinate(nextCoordinate);
      await startHeadingWatch();
      const nextContext = await fetchLocationContext(nextCoordinate.latitude, nextCoordinate.longitude);
      setContext(nextContext);
      await setJourneyModeBaseline(nextContext);
      await setJourneyModeEnabled(true);
      setJourneyModeEnabledState(true);
      await setJourneyModeLastCheck(new Date().toISOString());
      try {
        await startJourneyModeTask();
      } catch {
        setPermissionMessage(
          'Journey Mode is enabled. Background updates run differently on this web build vs the future iteration official app-store builds. In this web build, Defend the Parks will check every 5 minutes to see if your location has changed, only if you keep this tab open.'
        );
      }
      setNearby(await fetchNearbySovereignties(nextCoordinate.latitude, nextCoordinate.longitude, nextContext));
      if (!options.silent) {
        showSnackbar('Journey Mode location context updated.', 'info');
      }
      setJourneyStatusRefreshKey((current) => current + 1);
    } catch (error) {
      reportError(error, 'Unable to load Journey Mode location context.');
    } finally {
      if (!options.silent) {
        setLoadingLocation(false);
      }
    }
  }, [reportError, showSnackbar, startHeadingWatch]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !coordinate || !journeyModeEnabled) {
      return;
    }

    const interval = setInterval(() => {
      void loadJourneyLocation({ silent: true });
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [coordinate, journeyModeEnabled, loadJourneyLocation]);

  const languages = context?.languages ?? [];
  const territories = context?.territories ?? [];
  const treaties = context?.treaties ?? [];

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground variant="journey">
        <ResponsiveContainer style={{ gap: padding, paddingTop: 0 }}>
        <ScrollView
          nativeID={PAGE_SCROLL_NATIVE_ID}
          ref={scrollRef}
          contentContainerStyle={[webReadableContentStyle, { gap: padding, paddingTop: padding, paddingBottom: 28 }]}>
          <ThemedView
            nativeID={getSectionNativeId('overview')}
            style={[styles.noteCard, glassSurfaceStyle, { gap: 10 }]}
            onLayout={(event) => {
              sectionOffsets.current.overview = event.nativeEvent.layout.y;
            }}>
            <ThemedText
              type="title"
              accessibilityRole="header"
              lightColor={Palette.cedar}
              darkColor={Palette.yosemiteIvory}>
              Journey Mode
            </ThemedText>
            <ThemedText>
              Use Journey Mode to receive real-time updates and notifications when you have traveled
              into a new area that returns new information from the Native Land API. Defend the Parks
              app can use your device location with your permission to gather your exact coordinates.
              Then the app will compare those coordinates to the data from the Native Land API, so you
              can learn about Indigenous languages, territories, treaties, and nearby sovereignty
              records associated with the land you are currently on, as you go on a journey.
            </ThemedText>
            <AccessibleButton
              label={journeyModeEnabled ? 'Stop Journey Mode' : 'Begin Journey Mode'}
              onPress={() => {
                if (journeyModeEnabled) {
                  void endJourneyMode();
                } else {
                  void loadJourneyLocation();
                }
              }}
              variant={journeyModeEnabled ? 'secondary' : 'primary'}
              accessibilityHint={
                journeyModeEnabled
                  ? 'Stops Journey Mode location checks'
                  : 'Requests location permission and loads Native Land context for Journey Mode'
              }
            />
            {permissionMessage ? <ThemedText>{permissionMessage}</ThemedText> : null}
            {coordinate ? (
              <ThemedText>
                Coordinates: {formatCoordinate(coordinate.latitude)}, {formatCoordinate(coordinate.longitude)}
              </ThemedText>
            ) : null}
          </ThemedView>

          <ThemedView
            nativeID={getSectionNativeId('compass')}
            style={[styles.noteCard, glassSurfaceStyle]}
            onLayout={(event) => {
              sectionOffsets.current.compass = event.nativeEvent.layout.y;
            }}>
            <ThemedText type="subtitle">In-App Compass</ThemedText>
            <HeadingCompass heading={heading} active={journeyModeEnabled} />
          </ThemedView>

          <ThemedView
            nativeID={getSectionNativeId('journey')}
            style={styles.transparentWrap}
            onLayout={(event) => {
              sectionOffsets.current.journey = event.nativeEvent.layout.y;
            }}>
            <JourneyModePanel
              title="How Journey Mode Works"
              currentContext={context}
              showToggle={false}
              statusRefreshKey={journeyStatusRefreshKey}
              description="With your permission, this app can run a background service checking your location similar to how navigation apps use your location as you go on a drive and give you directions. Instead of directions, you will receive real-time updates and notifications when you have traveled into a new area that returns new information from the Native Land API, along with all available information for the current location."
            />
          </ThemedView>

          <ThemedView
            nativeID={getSectionNativeId('results')}
            style={[styles.noteCard, glassSurfaceStyle]}
            onLayout={(event) => {
              sectionOffsets.current.results = event.nativeEvent.layout.y;
            }}>
            <ThemedText type="subtitle">Current Location Results</ThemedText>
            {loadingLocation ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Palette.campfire} />
                <ThemedText>Getting updated Journey Mode results...</ThemedText>
              </View>
            ) : null}
            {context ? (
              <View style={styles.resultsStack}>
                <CollapsiblePreviewSection title="Languages Returned Here" collapsible={languages.length > 4}>
                  <BulletList items={languages} emptyText="No language records were returned." />
                </CollapsiblePreviewSection>
                <CollapsiblePreviewSection title="Territories Returned Here" collapsible={territories.length > 4}>
                  <BulletList items={territories} emptyText="No territory records were returned." />
                </CollapsiblePreviewSection>
                <CollapsiblePreviewSection title="Treaties Returned Here" collapsible={treaties.length > 4}>
                  <BulletList items={treaties} emptyText="No treaty records were returned." />
                </CollapsiblePreviewSection>
                <CollapsiblePreviewSection title="Nearby Sovereignties" collapsible={nearby.length > 4}>
                  <BulletList
                    items={nearby.map((item) => `${item.name} (${item.category})`)}
                    emptyText="No nearby records were returned."
                  />
                </CollapsiblePreviewSection>
              </View>
            ) : (
              <ThemedText>Use Begin Journey Mode to load the current Journey Mode context.</ThemedText>
            )}
          </ThemedView>
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
  noteCard: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  transparentWrap: {
    backgroundColor: 'transparent',
  },
  bulletList: {
    gap: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultsStack: {
    gap: 10,
    backgroundColor: 'transparent',
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
