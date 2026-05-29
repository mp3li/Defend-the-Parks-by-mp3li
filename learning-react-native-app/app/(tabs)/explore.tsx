import type { Href } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NationalParksPictureGallery } from '@/components/park/national-parks-picture-gallery';
import { ResponsiveContainer } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Palette, SurfaceColors } from '@/constants/theme';
import { US_STATES } from '@/constants/us-states';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchNationalParksGalleryImages } from '@/services/nps-api';
import type { NpsParkImage } from '@/types/parks';

const STATE_ROW_HEIGHT = 74;

type StateListItem = (typeof US_STATES)[number];

const StateRow = React.memo(function StateRow({
  item,
  borderColor,
  onOpen,
}: {
  item: StateListItem;
  borderColor: string;
  onOpen: (code: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onOpen(item.code)}
      accessibilityRole="button"
      accessibilityLabel={`Open parks for ${item.name}`}
      style={({ pressed }) => [
        styles.stateRow,
        glassSurfaceStyle,
        {
          borderColor,
        },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
      <ThemedText>{item.code}</ThemedText>
    </Pressable>
  );
});

export default function StatesScreen() {
  const router = useRouter();
  const { reportError } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const listRef = useRef<FlatList<(typeof US_STATES)[number]> | null>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();
  const borderColor = useThemeColor({ light: Palette.campfire, dark: Palette.campfire }, 'icon');
  const textColor = useThemeColor({}, 'text');
  const inputBackground = useThemeColor(
    { light: SurfaceColors.glassLight, dark: SurfaceColors.glassDark },
    'background'
  );

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const [query, setQuery] = useState('');
  const [galleryImages, setGalleryImages] = useState<NpsParkImage[]>([]);

  useFocusEffect(
    useCallback(() => {
      setSections([
        { id: 'search', label: 'Search by State' },
        { id: 'gallery', label: 'National Parks Picture Gallery' },
        { id: 'list', label: 'State List' },
      ]);
      setJumpHandler((id) => {
        listRef.current?.scrollToOffset({ offset: sectionOffsets.current[id] ?? 0, animated: true });
      });

      return () => {
        setSections([]);
        setJumpHandler(null);
      };
    }, [setJumpHandler, setSections])
  );

  useEffect(() => {
    void fetchNationalParksGalleryImages()
      .then(setGalleryImages)
      .catch((error) => {
        reportError(error, 'Unable to load the national parks picture gallery.');
      });
  }, [reportError]);

  const filteredStates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return US_STATES;
    }

    return US_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(normalized) || state.code.toLowerCase().includes(normalized)
    );
  }, [query]);

  const openState = useCallback(
    (code: string) => {
      router.push(`/states/${code}` as Href);
    },
    [router]
  );

  const renderState = useCallback(
    ({ item }: { item: StateListItem }) => (
      <StateRow item={item} borderColor={borderColor} onOpen={openState} />
    ),
    [borderColor, openState]
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground>
        <ResponsiveContainer style={{ gap: padding, paddingTop: 0 }}>
        <FlatList
          ref={listRef}
          data={filteredStates}
          keyExtractor={(item) => item.code}
          initialNumToRender={16}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={40}
          windowSize={7}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: STATE_ROW_HEIGHT + gap,
            offset: (STATE_ROW_HEIGHT + gap) * index,
            index,
          })}
          contentContainerStyle={{ gap, paddingTop: padding, paddingBottom: 28 }}
          ListHeaderComponent={
            <View style={{ gap }}>
              <ThemedView
                style={[styles.headerCard, glassSurfaceStyle, { gap }]}
                onLayout={(event) => {
                  sectionOffsets.current.search = event.nativeEvent.layout.y;
                }}>
                <ThemedText type="title" accessibilityRole="header">
                  Search by State
                </ThemedText>
                <ThemedText>
                  Select a state to view a list of national parks and other locations serviced by
                  the National Park Service in that state.
                </ThemedText>
              </ThemedView>

              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by state name"
                placeholderTextColor="#7a8a95"
                style={[
                  styles.searchInput,
                  {
                    borderColor,
                    color: textColor,
                    backgroundColor: inputBackground,
                  },
                ]}
                accessibilityLabel="Search states"
                accessibilityHint="Filters the list of all 50 states"
              />

            </View>
          }
          renderItem={renderState}
          ListEmptyComponent={
              <ThemedView style={[styles.emptyState, glassSurfaceStyle]}>
              <ThemedText>No states match your search.</ThemedText>
            </ThemedView>
          }
          ListFooterComponent={
            <ThemedView
              style={styles.galleryWrap}
              onLayout={(event) => {
                sectionOffsets.current.gallery = event.nativeEvent.layout.y;
              }}>
              <NationalParksPictureGallery images={galleryImages} />
            </ThemedView>
          }
        />
        </ResponsiveContainer>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  headerCard: {
    borderRadius: 12,
    padding: 14,
  },
  galleryWrap: {
    backgroundColor: 'transparent',
  },
  stateRow: {
    borderWidth: 1,
    borderRadius: 10,
    minHeight: STATE_ROW_HEIGHT,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyState: {
    borderRadius: 10,
    padding: 12,
  },
});
