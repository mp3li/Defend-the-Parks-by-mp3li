import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PARK_DETAIL_SECTIONS, ParkDetailContent } from '@/components/park/park-detail-content';
import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer, webReadableContentStyle } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useSavedParks } from '@/context/saved-parks-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { fetchIndigenousContextByCoordinates } from '@/services/native-land-api';
import { fetchParkByCode } from '@/services/nps-api';
import type { IndigenousContextData, NpsPark } from '@/types/parks';
import { jumpToWebSection, PAGE_SCROLL_NATIVE_ID } from '@/utils/jump-to-section';

export default function ParkDetailScreen() {
  const { parkCode } = useLocalSearchParams<{ parkCode: string }>();
  const normalizedParkCode = (parkCode ?? '').toLowerCase();
  const scrollRef = useRef<ScrollView | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const { reportError, showSnackbar } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const { getResponsivePadding } = useResponsiveLayout();
  const { isParkSaved, toggleSavedPark } = useSavedParks();

  const [park, setPark] = useState<NpsPark | null>(null);
  const [indigenousContext, setIndigenousContext] = useState<IndigenousContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const padding = getResponsivePadding();

  const loadPark = useCallback(async () => {
    if (!normalizedParkCode) {
      return;
    }

    try {
      setLoading(true);
      const parkResult = await fetchParkByCode(normalizedParkCode);
      if (!parkResult) {
        setPark(null);
        setIndigenousContext(null);
        return;
      }

      setPark(parkResult);

      const indigenousResult = await fetchIndigenousContextByCoordinates(
        parkResult.latitude,
        parkResult.longitude
      );
      setIndigenousContext(indigenousResult);
    } catch (error) {
      reportError(error, 'Unable to load the selected park profile.');
    } finally {
      setLoading(false);
    }
  }, [normalizedParkCode, reportError]);

  useFocusEffect(
    useCallback(() => {
      setSections([
        { id: 'top', label: 'Park Profile' },
        ...PARK_DETAIL_SECTIONS,
      ]);
      setJumpHandler((id) => {
        if (jumpToWebSection(id)) {
          return;
        }
        scrollRef.current?.scrollTo({ y: sectionOffsets.current[id] ?? 0, animated: true });
      });
      void loadPark();
      return () => {
        setSections([]);
        setJumpHandler(null);
      };
    }, [loadPark, setJumpHandler, setSections])
  );

  const toggleSaved = useCallback(async () => {
    if (!park) {
      return;
    }

    const savedNow = await toggleSavedPark(park);
    showSnackbar(savedNow ? 'Park saved to your list.' : 'Park removed from your list.', 'info');
  }, [park, showSnackbar, toggleSavedPark]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground variant="where">
        <ResponsiveContainer style={{ paddingTop: 0, paddingBottom: padding }}>
        {loading ? (
          <ThemedView style={[styles.statusCard, glassSurfaceStyle]}>
            <ThemedText>Loading park details...</ThemedText>
          </ThemedView>
        ) : !park ? (
          <ThemedView style={[styles.statusCard, glassSurfaceStyle]}>
            <ThemedText>Park not found for code: {normalizedParkCode}</ThemedText>
            <AccessibleButton
              label="Try Reload"
              onPress={() => {
                void loadPark();
              }}
              variant="secondary"
            />
          </ThemedView>
        ) : (
          <ScrollView
            nativeID={PAGE_SCROLL_NATIVE_ID}
            ref={scrollRef}
            contentContainerStyle={[webReadableContentStyle, styles.scrollContainer, { paddingTop: padding }]}>
            <ParkDetailContent
              park={park}
              indigenousContext={indigenousContext}
              isSaved={isParkSaved(park.parkCode)}
              onToggleSave={() => {
                void toggleSaved();
              }}
              nativeLandTitle={`About Native Land Records Connected to ${park.fullName}`}
              parkNameForRecords={park.fullName}
              onSectionLayout={(id, y) => {
                sectionOffsets.current[id] = y;
              }}
            />
          </ScrollView>
        )}
        </ResponsiveContainer>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  statusCard: {
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
});
