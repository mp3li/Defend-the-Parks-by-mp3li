import type { Href } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccessibleButton } from '@/components/accessible-button';
import { ResponsiveContainer, webReadableContentStyle } from '@/components/responsive-layout';
import { glassSurfaceStyle, ScreenBackground } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppStateContext } from '@/context/app-state-context';
import { usePageSections } from '@/context/page-sections-context';
import { useSavedParks } from '@/context/saved-parks-context';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { PAGE_SCROLL_NATIVE_ID } from '@/utils/jump-to-section';

export default function SavedParksScreen() {
  const router = useRouter();
  const { showSnackbar } = useAppStateContext();
  const { setJumpHandler, setSections } = usePageSections();
  const { getResponsiveGap, getResponsivePadding, isTablet } = useResponsiveLayout();
  const { isHydrated, savedParks, removePark } = useSavedParks();

  const gap = getResponsiveGap();
  const padding = getResponsivePadding();

  useFocusEffect(
    useCallback(() => {
      setSections([{ id: 'saved', label: 'Saved Parks' }]);
      setJumpHandler(null);

      return () => {
        setSections([]);
        setJumpHandler(null);
      };
    }, [setJumpHandler, setSections])
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenBackground>
        <ResponsiveContainer style={{ gap: padding }}>
        <ThemedView style={[webReadableContentStyle, styles.card, glassSurfaceStyle, { gap }]}>
          <ThemedText type="title" accessibilityRole="header">
            My Saved Parks
          </ThemedText>
          <ThemedText>
            View your list of saved National Parks, view the page for each park, or delete park(s)
            from your list.
          </ThemedText>
        </ThemedView>

        {!isHydrated ? (
          <ThemedText>Loading your saved parks...</ThemedText>
        ) : (
          <FlatList
            nativeID={PAGE_SCROLL_NATIVE_ID}
            data={savedParks}
            keyExtractor={(item) => item.parkCode}
            contentContainerStyle={[webReadableContentStyle, { gap, paddingBottom: 28 }]}
            renderItem={({ item }) => (
              <ThemedView style={[styles.card, glassSurfaceStyle, { gap }]}>
                <ThemedText type="defaultSemiBold">{item.fullName}</ThemedText>
                <ThemedText>{item.designation || 'National Park Service Site'}</ThemedText>
                <ThemedText>States: {item.states}</ThemedText>
                <ThemedText>Saved: {new Date(item.savedAt).toLocaleString()}</ThemedText>

                <View style={[styles.row, { gap }]}>
                  <AccessibleButton
                    label="Open"
                    onPress={() => router.push(`/parks/${item.parkCode}` as Href)}
                    size={isTablet ? 'large' : 'medium'}
                  />
                  <AccessibleButton
                    label="Remove"
                    onPress={() => {
                      void removePark(item.parkCode);
                      showSnackbar('Removed from saved list.', 'info');
                    }}
                    variant="secondary"
                    size={isTablet ? 'large' : 'medium'}
                  />
                </View>
              </ThemedView>
            )}
            ListEmptyComponent={
              <ThemedView style={[styles.card, glassSurfaceStyle, { gap }]}>
                <ThemedText>You have not saved any parks yet.</ThemedText>
                <AccessibleButton
                  label="Browse States"
                  onPress={() => router.push('/explore' as Href)}
                  variant="outline"
                />
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
  card: {
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
