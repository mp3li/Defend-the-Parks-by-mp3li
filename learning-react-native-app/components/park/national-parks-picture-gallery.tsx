import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AccessibleButton } from '@/components/accessible-button';
import { CollapsiblePreviewSection } from '@/components/collapsible-preview-section';
import { ThemedText } from '@/components/themed-text';
import { Palette, SurfaceColors } from '@/constants/theme';
import type { NpsParkImage } from '@/types/parks';

const GALLERY_PAGE_SIZE = 10;

export function NationalParksPictureGallery({ images }: { images: NpsParkImage[] }) {
  const isWeb = Platform.OS === 'web';
  const [selectedImage, setSelectedImage] = useState<NpsParkImage | null>(null);
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);
  const visibleImages = isWeb
    ? images.slice(0, visibleCount)
    : images.slice(0, GALLERY_PAGE_SIZE);
  const remainingCount = isWeb ? Math.max(images.length - visibleImages.length, 0) : 0;

  useEffect(() => {
    setVisibleCount(GALLERY_PAGE_SIZE);
  }, [images]);

  return (
    <>
      <CollapsiblePreviewSection
        title="National Parks Picture Gallery"
        collapsible={images.length > 1}
        previewHeight={250}
        webAutoExpanded={false}>
        {images.length === 0 ? (
          <ThemedText>No images provided by NPS for this gallery.</ThemedText>
        ) : (
          <>
            {visibleImages.map((image, index) => (
              <Pressable
                key={`${image.url}-${index}`}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Open ${image.title || `photo ${index + 1}`} full size`}
                onPress={() => setSelectedImage(image)}>
                <View style={[styles.imageCard, isWeb && styles.webImageCard]}>
                  <Image
                    source={{ uri: image.url }}
                    style={[styles.galleryImage, isWeb && styles.webGalleryImage]}
                    contentFit="cover"
                    accessibilityLabel={image.altText || image.title || 'Park photo'}
                  />
                  <View style={[styles.imageMeta, isWeb && styles.webImageMeta]}>
                    <ThemedText type="defaultSemiBold">{image.title || `Photo ${index + 1}`}</ThemedText>
                    {!!image.credit && <ThemedText>Credit: {image.credit}</ThemedText>}
                    {!!image.caption && <ThemedText>{image.caption}</ThemedText>}
                  </View>
                </View>
              </Pressable>
            ))}

            {remainingCount > 0 ? (
              <View style={styles.loadMoreWrap}>
                <ThemedText>
                  Showing {visibleImages.length} of {images.length} images.
                </ThemedText>
                <AccessibleButton
                  label={`Load ${Math.min(GALLERY_PAGE_SIZE, remainingCount)} more images`}
                  onPress={() => setVisibleCount((current) => Math.min(current + GALLERY_PAGE_SIZE, images.length))}
                  variant="secondary"
                  size="small"
                />
              </View>
            ) : null}
          </>
        )}
      </CollapsiblePreviewSection>

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.imageModalBackdrop}>
          <Pressable
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close full size image"
            onPress={() => setSelectedImage(null)}>
            <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
              X
            </ThemedText>
          </Pressable>
          {selectedImage ? (
            <View style={styles.fullImageWrap}>
              <Image
                source={{ uri: selectedImage.url }}
                style={styles.fullImage}
                contentFit="contain"
                accessibilityLabel={selectedImage.altText || selectedImage.title || 'Full size park photo'}
              />
              <View style={styles.fullImageCredit}>
                {!!selectedImage.title && <ThemedText type="defaultSemiBold">{selectedImage.title}</ThemedText>}
                {!!selectedImage.credit && <ThemedText>Credit: {selectedImage.credit}</ThemedText>}
                {!!selectedImage.caption && <ThemedText>{selectedImage.caption}</ThemedText>}
              </View>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    borderRadius: 10,
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.campfire,
    marginBottom: 10,
    paddingTop: 10,
  },
  webImageCard: {
    minHeight: 220,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: 'rgba(170, 82, 21, 0.42)',
    padding: 10,
  },
  galleryImage: {
    width: '100%',
    height: 160,
    backgroundColor: SurfaceColors.glassLight,
  },
  webGalleryImage: {
    width: '42%',
    minWidth: 260,
    height: 220,
    borderRadius: 8,
  },
  imageMeta: {
    padding: 10,
    gap: 4,
  },
  webImageMeta: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  loadMoreWrap: {
    gap: 8,
    alignItems: 'flex-start',
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 4, 12, 0.94)',
    justifyContent: 'center',
    padding: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 18,
    zIndex: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(170, 82, 21, 0.92)',
  },
  fullImageWrap: {
    gap: 12,
  },
  fullImage: {
    width: '100%',
    height: '72%',
  },
  fullImageCredit: {
    borderRadius: 12,
    padding: 12,
    gap: 4,
    backgroundColor: 'rgba(247, 239, 226, 0.9)',
  },
});
