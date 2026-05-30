import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { glassSurfaceStyle } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, SurfaceColors } from '@/constants/theme';

export function CollapsiblePreviewSection({
  title,
  children,
  defaultExpanded = false,
  collapsible = true,
  previewHeight = 132,
  webAutoExpanded = true,
}: {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  previewHeight?: number;
  webAutoExpanded?: boolean;
}) {
  const isWeb = Platform.OS === 'web';
  const sectionCollapsible = isWeb ? !webAutoExpanded : collapsible;
  const [expanded, setExpanded] = useState(isWeb ? webAutoExpanded : defaultExpanded);

  return (
    <View style={[glassSurfaceStyle, styles.section]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
        disabled={!sectionCollapsible}
        onPress={() => {
          if (sectionCollapsible) {
            setExpanded((current) => !current);
          }
        }}
        style={styles.headerRow}>
        <ThemedText
          type="subtitle"
          style={styles.title}
          lightColor={Palette.cedar}
          darkColor={Palette.yosemiteIvory}>
          {title}
        </ThemedText>
        {sectionCollapsible ? (
          <View style={styles.chevronBadge}>
            <IconSymbol
              name={expanded ? 'chevron.up' : 'chevron.down'}
              size={24}
              color={Palette.yosemiteIvory}
            />
          </View>
        ) : null}
      </Pressable>
      <View style={[styles.content, sectionCollapsible && !expanded && { maxHeight: previewHeight, overflow: 'hidden' }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
    backgroundColor: SurfaceColors.glassLight,
    borderColor: 'rgba(170, 82, 21, 0.42)',
  },
  headerRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
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
  content: {
    gap: 10,
  },
});
