import type { Href } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PARK_DETAIL_SECTIONS, ParkDetailContent } from '@/components/park/park-detail-content';
import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NationalParksPictureGallery } from '@/components/park/national-parks-picture-gallery';
import { Colors } from '@/constants/theme';
import { US_STATE_NAME_BY_CODE } from '@/constants/us-states';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useSavedParks } from '@/context/saved-parks-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { fetchIndigenousContextByCoordinates } from '@/services/native-land-api';
import { fetchNationalParksGalleryImages, fetchParkOfTheDay } from '@/services/nps-api';
import type { IndigenousContextData, NpsParkImage, ParkOfTheDay } from '@/types/parks';

function formatDateWithOrdinal(isoDate: string) {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? 'st'
      : day % 10 === 2 && day % 100 !== 12
        ? 'nd'
        : day % 10 === 3 && day % 100 !== 13
          ? 'rd'
          : 'th';

  return `${month} ${day}${suffix}, ${year}`;
}

function getFeaturedStateName(stateCodes: string) {
  const firstStateCode = stateCodes
    .split(',')
    .map((value) => value.trim().toUpperCase())
    .find((value) => value.length > 0);

  if (!firstStateCode) {
    return stateCodes;
  }

  return US_STATE_NAME_BY_CODE[firstStateCode] ?? firstStateCode;
}

export default function HomeScreen() {
  const router = useRouter();
  const { reportError, showSnackbar } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const { isParkSaved, toggleSavedPark } = useSavedParks();
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const featuredDetailOffset = useRef(0);

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const [parkOfTheDay, setParkOfTheDay] = useState<ParkOfTheDay | null>(null);
  const [featuredIndigenousContext, setFeaturedIndigenousContext] =
    useState<IndigenousContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [galleryImages, setGalleryImages] = useState<NpsParkImage[]>([]);

  const loadParkOfTheDay = useCallback(async () => {
    try {
      setLoading(true);
      const nextPark = await fetchParkOfTheDay();
      setParkOfTheDay(nextPark);

      const indigenous = await fetchIndigenousContextByCoordinates(
        nextPark.park.latitude,
        nextPark.park.longitude
      );
      setFeaturedIndigenousContext(indigenous);
    } catch (error) {
      reportError(error, 'Unable to load today\'s featured park.');
    } finally {
      setLoading(false);
    }
  }, [reportError]);

  useEffect(() => {
    void loadParkOfTheDay();
  }, [loadParkOfTheDay]);

  useEffect(() => {
    void fetchNationalParksGalleryImages()
      .then(setGalleryImages)
      .catch((error) => {
        reportError(error, 'Unable to load the national parks picture gallery.');
      });
  }, [reportError]);

  useFocusEffect(
    useCallback(() => {
    setSections([
      { id: 'about', label: 'Welcome' },
      { id: 'gallery', label: 'National Parks Picture Gallery' },
      { id: 'featured', label: 'Featured Park' },
      ...PARK_DETAIL_SECTIONS,
      { id: 'quick-actions', label: 'Quick Actions' },
    ]);
    setJumpHandler((id) => {
      scrollRef.current?.scrollTo({ y: sectionOffsets.current[id] ?? 0, animated: true });
    });

    return () => {
      setSections([]);
      setJumpHandler(null);
    };
    }, [setJumpHandler, setSections])
  );

  const toggleSavedFeaturedPark = useCallback(async () => {
    if (!parkOfTheDay?.park) {
      return;
    }

    const savedNow = await toggleSavedPark(parkOfTheDay.park);
    showSnackbar(savedNow ? 'Park saved to your list.' : 'Park removed from your list.', 'info');
  }, [parkOfTheDay?.park, showSnackbar, toggleSavedPark]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground>
        <ResponsiveContainer style={{ gap: padding, paddingTop: 0 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ gap: padding, paddingTop: padding, paddingBottom: 28 }}>
          <ThemedView
            style={[styles.card, glassSurfaceStyle, { gap }]}
            onLayout={(event) => {
              sectionOffsets.current.about = event.nativeEvent.layout.y;
            }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={aboutExpanded ? 'Collapse about the app' : 'Expand about the app'}
              style={styles.expandHeader}
              onPress={() => setAboutExpanded((current) => !current)}>
              <ThemedText type="subtitle" style={styles.expandTitle} accessibilityRole="header">
                Welcome to Defend the Parks by mp3li
              </ThemedText>
              <View style={styles.chevronBadge}>
                <IconSymbol
                  name={aboutExpanded ? 'chevron.up' : 'chevron.down'}
                  size={24}
                  color={Colors.dark.text}
                />
              </View>
            </Pressable>
            <View style={!aboutExpanded && styles.aboutPreview}>
              <ThemedText>
                This app helps you explore National Parks while also learning about the deeper
                history of the land they exist on. Many of the places we now call parks have been
                home to Indigenous nations for thousands of years.
                {'\n\n'}
                With Defend the Parks, you can browse National Parks and other locations maintained
                by the National Park Service, like historic sites, trails, memorials, battlefields,
                and monuments. Alongside National Park information, you can learn about the
                Indigenous sovereignties and languages associated with the land, read about the
                history of each park, and find ways to support and protect these places for future
                generations. In upcoming iterations this app will include a filter system to further
                education about these places and their Indigenous history.
                {'\n\n'}
                The history of National Parks reaches far beyond the park system itself. Understanding
                that history is one step toward protecting these lands and respecting the people
                connected to them.
                {'\n\n'}
                Defend the Parks uses the National Park Service API for park information and the
                Native Land API for language, territory, treaty, source, and available placename
                records connected to park and user coordinates.
              </ThemedText>
            </View>
          </ThemedView>

          <View
            onLayout={(event) => {
              sectionOffsets.current.gallery = event.nativeEvent.layout.y;
            }}>
            <NationalParksPictureGallery images={galleryImages} />
          </View>

          <View
            onLayout={(event) => {
              sectionOffsets.current.featured = event.nativeEvent.layout.y;
            }}>
            <ThemedView style={[styles.card, glassSurfaceStyle, { gap }]}>
              {loading ? (
                <ThemedText>Loading featured park...</ThemedText>
              ) : parkOfTheDay ? (
                <>
                  <ThemedText style={styles.featuredDate}>
                    {formatDateWithOrdinal(parkOfTheDay.dateLabel)}
                  </ThemedText>
                  <ThemedText type="subtitle">
                    Featured Park of the Day: {parkOfTheDay.park.fullName}
                  </ThemedText>
                  {parkOfTheDay.park.images[0]?.url ? (
                    <Image
                      source={{ uri: parkOfTheDay.park.images[0].url }}
                      style={styles.featuredImage}
                      contentFit="cover"
                      accessibilityLabel={parkOfTheDay.park.images[0].altText || parkOfTheDay.park.fullName}
                    />
                  ) : null}
                  {parkOfTheDay.park.images[0]?.credit ? (
                    <ThemedText style={styles.imageCredit}>
                      Credit: {parkOfTheDay.park.images[0].credit}
                    </ThemedText>
                  ) : null}
                  <ThemedText>State: {getFeaturedStateName(parkOfTheDay.park.states)}</ThemedText>
                  <AccessibleButton
                    label={isParkSaved(parkOfTheDay.park.parkCode) ? 'Remove From My List' : 'Save This Park To My List'}
                    onPress={() => {
                      void toggleSavedFeaturedPark();
                    }}
                    variant={isParkSaved(parkOfTheDay.park.parkCode) ? 'secondary' : 'primary'}
                  />
                </>
              ) : (
                <ThemedText>No featured park is available right now.</ThemedText>
              )}
            </ThemedView>
            {parkOfTheDay ? (
              <View
                style={{ gap, marginTop: padding }}
                onLayout={(event) => {
                  featuredDetailOffset.current =
                    (sectionOffsets.current.featured ?? 0) + event.nativeEvent.layout.y;
                }}>
                <ParkDetailContent
                  park={parkOfTheDay.park}
                  indigenousContext={featuredIndigenousContext}
                  isSaved={isParkSaved(parkOfTheDay.park.parkCode)}
                  onToggleSave={() => {
                    void toggleSavedFeaturedPark();
                  }}
                  showHeroSection={false}
                  showSaveButton={false}
                  nativeLandTitle={`About Native Land Records Connected to ${parkOfTheDay.park.fullName}`}
                  parkNameForRecords={parkOfTheDay.park.fullName}
                  onSectionLayout={(id, y) => {
                    sectionOffsets.current[id] = featuredDetailOffset.current + y;
                  }}
                />
              </View>
            ) : null}
          </View>

          <ThemedView
            style={[styles.card, glassSurfaceStyle, { gap }]}
            onLayout={(event) => {
              sectionOffsets.current['quick-actions'] = event.nativeEvent.layout.y;
            }}>
            <ThemedText type="subtitle">Quick Actions</ThemedText>
            <AccessibleButton
              label="Browse All 50 States"
              onPress={() => router.push('/explore' as Href)}
              variant="secondary"
              accessibilityHint="Opens the state list and then park list by state"
            />
            <AccessibleButton
              label="Open My Saved Parks"
              onPress={() => router.push('/lifecycle' as Href)}
              variant="outline"
              accessibilityHint="Opens your saved park list"
            />
            <AccessibleButton
              label="Refresh Park of the Day"
              onPress={() => {
                void loadParkOfTheDay();
              }}
              variant="secondary"
              accessibilityHint="Loads the current featured park again from the API"
            />
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
  card: {
    borderRadius: 12,
    padding: 14,
  },
  expandHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  expandTitle: {
    flex: 1,
  },
  chevronBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    borderWidth: 1,
    borderColor: Colors.light.icon,
  },
  aboutPreview: {
    maxHeight: 116,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
  },
  featuredDate: {
    fontSize: 12,
    lineHeight: 16,
  },
  imageCredit: {
    fontSize: 12,
    lineHeight: 16,
  },
});
