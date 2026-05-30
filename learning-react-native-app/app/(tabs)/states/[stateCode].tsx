import type { Href } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResponsiveContainer, webReadableContentStyle } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { US_STATE_NAME_BY_CODE } from '@/constants/us-states';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { fetchParksByState } from '@/services/nps-api';
import type { NpsPark } from '@/types/parks';
import { PAGE_SCROLL_NATIVE_ID } from '@/utils/jump-to-section';

function ParkResultRow({ park, onOpen }: { park: NpsPark; onOpen: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isWeb = Platform.OS === 'web';
  const rowExpanded = isWeb || expanded;

  const toggleExpanded = () => {
    if (!isWeb) {
      setExpanded((current) => !current);
    }
  };

  return (
    <ThemedView style={[styles.parkRow, glassSurfaceStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isWeb ? park.fullName : `${expanded ? 'Collapse' : 'Expand'} ${park.fullName} preview`}
        disabled={isWeb}
        onPress={toggleExpanded}
        style={styles.rowHeader}>
        <ThemedText type="subtitle" style={styles.rowTitle}>
          {park.fullName}
        </ThemedText>
        {!isWeb ? (
          <View style={styles.chevronBadge}>
            <IconSymbol
              name={expanded ? 'chevron.up' : 'chevron.down'}
              size={24}
              color="#ffffff"
            />
          </View>
        ) : null}
      </Pressable>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`Open ${park.fullName}`}
        style={({ pressed }) => [styles.openArea, pressed && styles.pressed]}>
        {itemImage(park)}
        <ThemedText>{park.designation || 'National Park Service Site'}</ThemedText>
        <ThemedText numberOfLines={rowExpanded ? undefined : 3}>{park.description}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

function itemImage(item: NpsPark) {
  if (!item.images[0]?.url) {
    return null;
  }

  return (
    <Image
      source={{ uri: item.images[0].url }}
      style={[styles.thumbnail, Platform.OS === 'web' && styles.webThumbnail]}
      contentFit="cover"
      accessibilityLabel={item.images[0].altText || item.fullName}
    />
  );
}

export default function StateParksScreen() {
  const router = useRouter();
  const { reportError } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const { getResponsiveGap, getResponsivePadding } = useResponsiveLayout();

  const { stateCode } = useLocalSearchParams<{ stateCode: string }>();
  const normalizedStateCode = (stateCode ?? '').toUpperCase();

  const [parks, setParks] = useState<NpsPark[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setSections([
        { id: 'state', label: 'State Summary' },
        { id: 'parks', label: 'Park List' },
      ]);
      setJumpHandler(null);

      return () => {
        setSections([]);
        setJumpHandler(null);
      };
    }, [setJumpHandler, setSections])
  );

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  const loadStateParks = useCallback(async () => {
    if (!normalizedStateCode) {
      return;
    }

    try {
      setLoading(true);
      const data = await fetchParksByState(normalizedStateCode);
      setParks(data);
    } catch (error) {
      reportError(error, `Unable to load parks for ${normalizedStateCode}.`);
    } finally {
      setLoading(false);
    }
  }, [normalizedStateCode, reportError]);

  useEffect(() => {
    void loadStateParks();
  }, [loadStateParks]);

  const stateDisplayName = useMemo(
    () => US_STATE_NAME_BY_CODE[normalizedStateCode] ?? normalizedStateCode,
    [normalizedStateCode]
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground variant="where">
        <ResponsiveContainer style={{ gap: padding, paddingTop: 0, paddingBottom: padding }}>
        {loading ? (
          <ThemedText>Loading parks...</ThemedText>
        ) : (
          <FlatList
            nativeID={PAGE_SCROLL_NATIVE_ID}
            data={parks}
            keyExtractor={(item) => item.parkCode}
            contentContainerStyle={[webReadableContentStyle, { gap, paddingTop: padding, paddingBottom: 28 }]}
            ListHeaderComponent={
              <ThemedView style={[styles.parkRow, glassSurfaceStyle, { gap }]}>
                <ThemedText type="title" accessibilityRole="header">
                  {stateDisplayName}
                </ThemedText>
                <ThemedText>
                  National parks and other locations serviced by the National Park Service, like
                  historic sites, trails, memorials, battlefields, and monuments, are shown below in
                  alphabetical order. In future iterations, this app will include a filter system to
                  further education about these places and their Indigenous history.
                </ThemedText>
                <ThemedText>Total sites found: {parks.length}</ThemedText>
              </ThemedView>
            }
            renderItem={({ item }) => (
              <ParkResultRow park={item} onOpen={() => router.push(`/parks/${item.parkCode}` as Href)} />
            )}
            ListEmptyComponent={
              <ThemedView style={[styles.parkRow, glassSurfaceStyle]}>
                <ThemedText>No NPS sites were returned for this state code.</ThemedText>
              </ThemedView>
            }
          />
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
  parkRow: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: '#d6e0e8',
  },
  webThumbnail: {
    height: 320,
  },
  openArea: {
    gap: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowTitle: {
    flex: 1,
  },
  chevronBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.cedar,
    borderWidth: 1,
    borderColor: Palette.campfire,
  },
});
