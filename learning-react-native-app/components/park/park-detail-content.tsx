import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useMemo } from 'react';

import { AccessibleButton } from '@/components/accessible-button';
import { CollapsiblePreviewSection } from '@/components/collapsible-preview-section';
import { glassSurfaceStyle } from '@/components/screen-background';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  NATIVE_LAND_LANGUAGE_CENTERING_NOTE,
  NATIVE_LAND_RESOURCE_LINKS,
} from '@/constants/native-land-resources';
import { US_STATE_NAME_BY_CODE } from '@/constants/us-states';
import type { IndigenousContextData, NpsAddress, NpsPark } from '@/types/parks';
import { getSectionNativeId } from '@/utils/jump-to-section';

export const PARK_DETAIL_SECTIONS = [
  { id: 'native-land', label: 'Native Land Records' },
  { id: 'placenames', label: 'Placename Records' },
  { id: 'overview', label: 'Overview' },
  { id: 'get-involved', label: 'Get Involved' },
  { id: 'languages', label: 'Languages' },
  { id: 'territories', label: 'Territories' },
  { id: 'treaties', label: 'Treaties' },
  { id: 'native-land-resources', label: 'Native Land Resources and Map Tools' },
  { id: 'activities', label: 'Activities' },
  { id: 'topics', label: 'Topics' },
  { id: 'weather', label: 'Weather' },
  { id: 'visiting', label: 'Visiting the Park & Park Website' },
  { id: 'fees', label: 'Entrance Fees' },
  { id: 'passes', label: 'Entrance Passes' },
] as const;

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

type ParkDetailContentProps = {
  park: NpsPark;
  indigenousContext: IndigenousContextData | null;
  isSaved: boolean;
  onToggleSave: () => void;
  showHeroSection?: boolean;
  showSaveButton?: boolean;
  nativeLandTitle?: string;
  parkNameForRecords?: string;
  onSectionLayout?: (id: string, y: number) => void;
};

function getStateNamesFromCodes(codes: string) {
  return codes
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter((code) => code.length > 0)
    .map((code) => US_STATE_NAME_BY_CODE[code] ?? code)
    .join(', ');
}

function extractAddressValue(address: NpsAddress) {
  return [address.line1, address.line2, address.line3, `${address.city}, ${address.stateCode} ${address.postalCode}`]
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join('\n');
}

function LinkText({ url, label }: { url: string; label: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="link" accessibilityLabel={label}>
      <ThemedText type="link">{label}</ThemedText>
    </Pressable>
  );
}

function getPrimaryOperatingHours(park: NpsPark) {
  if (park.operatingHours.length === 0) {
    return null;
  }

  const parkName = park.name.toLowerCase();
  const matchingEntry = park.operatingHours.find((item) => item.name.toLowerCase().includes(parkName));
  return matchingEntry ?? park.operatingHours[0];
}

function getPrimaryAddress(park: NpsPark) {
  const physical = park.addresses.find((address) => address.type.toLowerCase() === 'physical');
  return physical ?? park.addresses[0] ?? null;
}

function makeGetInvolvedLinks(park: NpsPark) {
  const links: { label: string; url: string }[] = [];

  if (park.url) {
    links.push({ label: 'National Park website', url: park.url });

    try {
      const volunteerUrl = new URL('getinvolved/volunteer.htm', park.url).toString();
      const donateUrl = new URL('getinvolved/donate.htm', park.url).toString();
      links.push({ label: 'Volunteer with this park', url: volunteerUrl });
      links.push({ label: 'Support/donate for this park', url: donateUrl });
    } catch {
      // Ignore malformed URL issues and keep fallback links.
    }
  }

  if (park.contacts.emailAddresses[0]?.emailAddress) {
    links.push({
      label: 'Email park contact',
      url: `mailto:${park.contacts.emailAddresses[0].emailAddress}`,
    });
  }

  if (park.contacts.phoneNumbers[0]?.phoneNumber) {
    const cleaned = park.contacts.phoneNumbers[0].phoneNumber.replace(/[^0-9+]/g, '');
    if (cleaned) {
      links.push({
        label: 'Call park contact',
        url: `tel:${cleaned}`,
      });
    }
  }

  if (park.directionsUrl) {
    links.push({ label: 'Park directions', url: park.directionsUrl });
  }

  links.push({
    label: 'Volunteer across national parks',
    url: 'https://www.nps.gov/getinvolved/volunteer.htm',
  });
  links.push({
    label: 'Support parks through National Park Foundation',
    url: 'https://www.nationalparks.org/support',
  });

  const unique = new Map<string, string>();
  links.forEach((entry) => {
    if (!unique.has(entry.url)) {
      unique.set(entry.url, entry.label);
    }
  });

  return [...unique.entries()].map(([url, label]) => ({ url, label }));
}

function BulletList({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) {
    return <ThemedText>No {label.toLowerCase()} listed.</ThemedText>;
  }

  return (
    <View style={styles.bulletContainer}>
      {items.map((item, index) => (
        <ThemedText key={`${item}-${index}`}>• {item}</ThemedText>
      ))}
    </View>
  );
}

function NativeLandResourceLinks() {
  return (
    <View style={styles.bulletContainer}>
      {NATIVE_LAND_RESOURCE_LINKS.map((resource) => (
        <View key={resource.label} style={styles.resourceLinkBlock}>
          <LinkText url={resource.url} label={resource.label} />
          <ThemedText>{resource.description}</ThemedText>
        </View>
      ))}
    </View>
  );
}

export function ParkDetailContent({
  park,
  indigenousContext,
  isSaved,
  onToggleSave,
  showHeroSection = true,
  showSaveButton = true,
  nativeLandTitle,
  parkNameForRecords,
  onSectionLayout,
}: ParkDetailContentProps) {
  const stateNames = getStateNamesFromCodes(park.states);
  const primaryImage = park.images[0];
  const visitingHours = getPrimaryOperatingHours(park);
  const primaryAddress = getPrimaryAddress(park);

  const activityNames = useMemo(() => park.activities.map((activity) => activity.name), [park.activities]);
  const topicNames = useMemo(() => park.topics.map((topic) => topic.name), [park.topics]);
  const getInvolvedLinks = useMemo(() => makeGetInvolvedLinks(park), [park]);

  const indigenousNames = indigenousContext?.placeNames ?? [];
  const nameMeanings = indigenousContext?.nameMeanings ?? [];
  const territories = indigenousContext?.territories ?? [];
  const languages = indigenousContext?.languages ?? [];
  const treaties = indigenousContext?.treaties ?? [];
  const recordPlaceName = parkNameForRecords ?? park.fullName;
  const sectionLayout = (id: string) => (event: LayoutChangeEvent) => {
    onSectionLayout?.(id, event.nativeEvent.layout.y);
  };

  return (
    <View style={styles.container}>
      {showHeroSection ? (
        <ThemedView nativeID={getSectionNativeId('top')} style={[styles.heroCard, glassSurfaceStyle]}>
          {primaryImage?.url ? (
            <Image
              source={{ uri: primaryImage.url }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityLabel={primaryImage.altText || park.fullName}
            />
          ) : null}

          <View style={styles.heroTextBlock}>
            <ThemedText type="title" accessibilityRole="header" style={styles.parkTitle}>
              {park.fullName}
            </ThemedText>
            <ThemedText>{park.designation || 'National Park Service Site'}</ThemedText>
            <ThemedText>{stateNames || park.states}</ThemedText>
          </View>

          {showSaveButton ? (
            <AccessibleButton
              label={isSaved ? 'Remove From My List' : 'Save This Park To My List'}
              onPress={onToggleSave}
              variant={isSaved ? 'secondary' : 'primary'}
              accessibilityHint="Adds or removes this park from your saved list"
            />
          ) : null}
        </ThemedView>
      ) : null}

      <View nativeID={getSectionNativeId('native-land')} onLayout={sectionLayout('native-land')}>
      <CollapsiblePreviewSection
        title={nativeLandTitle ?? 'About Native Land Records Connected to this Area'}
        collapsible={indigenousNames.length + nameMeanings.length > 4}>
        <ThemedText>
          Defend the Parks uses the Native Land API for language, territory, treaty, source, and
          available placename records connected to park coordinates.
        </ThemedText>
        <ThemedText>
          This app centers the importance of languages, and also educates about territories and treaties.
        </ThemedText>
        <ThemedText>{NATIVE_LAND_LANGUAGE_CENTERING_NOTE}</ThemedText>
        {indigenousContext?.infoMessage ? <ThemedText>{indigenousContext.infoMessage}</ThemedText> : null}
        {indigenousContext?.keyRequired ? (
          <ThemedText>
            Native Land requires an API key to return records. Add `EXPO_PUBLIC_NATIVE_LAND_API_KEY` to continue.
          </ThemedText>
        ) : null}
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('placenames')} onLayout={sectionLayout('placenames')}>
      <CollapsiblePreviewSection
        title={`Placename Records Returned for ${recordPlaceName}`}
        collapsible={indigenousNames.length + nameMeanings.length > 4}>
        <BulletList items={indigenousNames} label="placename records" />
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

      <View nativeID={getSectionNativeId('overview')} onLayout={sectionLayout('overview')}>
      <CollapsiblePreviewSection title="Overview">
        <ThemedText>{park.description || 'No overview was provided by the NPS API.'}</ThemedText>
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('get-involved')} onLayout={sectionLayout('get-involved')}>
      <CollapsiblePreviewSection title="Get Involved and Defend this Park">
        <ThemedText>
          National parks are protected so that future generations can experience these landscapes,
          wildlife, and stories. Protecting these places is a shared responsibility. By learning about
          the land, respecting the communities connected to it, and supporting conservation efforts,
          visitors can help ensure that parks remain healthy and accessible for years to come.
        </ThemedText>
        <ThemedText>
          There are many ways to get involved. You can volunteer with park programs, support
          organizations that help protect public lands, participate in stewardship projects, or simply
          practice responsible recreation when visiting. Even small actions, like staying on trails,
          respecting wildlife, and packing out trash, make a real difference.
        </ThemedText>
        <ThemedText>
          Explore the resources below to learn how you can help protect and support this park.
        </ThemedText>

        {getInvolvedLinks.map((link, index) => (
          <LinkText key={`${link.url}-${index}`} url={link.url} label={link.label} />
        ))}
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('languages')} onLayout={sectionLayout('languages')}>
      <CollapsiblePreviewSection title={`Languages Connected to ${recordPlaceName}`} collapsible={languages.length > 4}>
        <ThemedText>
          Languages are listed before territories because language carries relationship to place,
          memory, and cultural knowledge.
        </ThemedText>
        <ThemedText type="defaultSemiBold">Language records returned for {recordPlaceName}</ThemedText>
        <BulletList items={languages} label="language records" />
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('territories')} onLayout={sectionLayout('territories')}>
      <CollapsiblePreviewSection title={`Territories in ${recordPlaceName}`} collapsible={territories.length > 4}>
        <BulletList items={territories} label="territory records" />
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('treaties')} onLayout={sectionLayout('treaties')}>
      <CollapsiblePreviewSection title={`Treaties Connected to ${recordPlaceName}`} collapsible={treaties.length > 4}>
        <ThemedText>
          Treaty records identify agreements returned by Native Land for {recordPlaceName}. They can point
          to important legal and historical relationships, but the app only displays the record names
          returned by the API and does not interpret treaty terms.
        </ThemedText>
        <ThemedText>
          A useful place to start your own research is Native Governance Center&apos;s treaty education
          resources, including Why Treaties Matter: https://nativegov.org/resources/why-do-treaties-matter/
        </ThemedText>
        <ThemedText type="defaultSemiBold">Treaty records returned for {recordPlaceName}</ThemedText>
        <BulletList items={treaties} label="treaty records" />
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('native-land-resources')} onLayout={sectionLayout('native-land-resources')}>
      <CollapsiblePreviewSection title="Native Land Public Resources and Map Tools">
        <ThemedText>
          These links open Native Land public search and map tools. They are not limited to this
          exact park or one specific people, so use them as broader research tools after reviewing
          the records returned for this park above.
        </ThemedText>
        <NativeLandResourceLinks />
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('activities')} onLayout={sectionLayout('activities')}>
      <CollapsiblePreviewSection
        title={`Activities Listed on the National Park Website for ${park.fullName}:`}
        collapsible={activityNames.length > 4}>
        <BulletList items={activityNames} label="activities" />
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('topics')} onLayout={sectionLayout('topics')}>
      <CollapsiblePreviewSection
        title={`Topics Listed by the National Park Service for ${park.fullName}:`}
        collapsible={topicNames.length > 4}>
        <BulletList items={topicNames} label="topics" />
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('weather')} onLayout={sectionLayout('weather')}>
      <CollapsiblePreviewSection title="Weather" collapsible={false}>
        <ThemedText>{park.weatherInfo || 'No weather guidance provided.'}</ThemedText>
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('visiting')} onLayout={sectionLayout('visiting')}>
      <CollapsiblePreviewSection title="Visiting the Park & Park Website">
        {primaryAddress ? (
          <ThemedText>
            {park.fullName} is located at {extractAddressValue(primaryAddress).replace(/\n/g, ', ')}.
          </ThemedText>
        ) : null}
        {visitingHours ? (
          <View style={styles.contentGroup}>
            <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
              Operating Hours & Visitor Center Hours
            </ThemedText>
            <ThemedText type="defaultSemiBold">{visitingHours.name}</ThemedText>
            {!!visitingHours.description && <ThemedText>{visitingHours.description}</ThemedText>}
            <View style={styles.bulletContainer}>
            {DAY_ORDER.map((day) => {
              const dayValue = visitingHours.standardHours?.[day];
              if (!dayValue) {
                return null;
              }
              return (
                <ThemedText key={`${visitingHours.name}-${day}`}>
                  {day[0].toUpperCase() + day.slice(1)}: {dayValue}
                </ThemedText>
              );
            })}
            </View>
            {visitingHours.exceptions?.length > 0 ? (
              <View style={styles.contentGroup}>
                <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
                  Seasonal / Holiday Exceptions
                </ThemedText>
                {visitingHours.exceptions.slice(0, 6).map((exception, index) => (
                  <ThemedText key={`${exception.name}-${exception.startDate}-${index}`}>
                    • {exception.name}: {exception.startDate} to {exception.endDate}
                  </ThemedText>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <ThemedText>No operating hours were listed for this park.</ThemedText>
        )}

        <View style={styles.contentGroup}>
          <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
            Park Address
          </ThemedText>
          {primaryAddress ? (
            <ThemedText>{extractAddressValue(primaryAddress)}</ThemedText>
          ) : (
            <ThemedText>No park address was listed.</ThemedText>
          )}
        </View>

        <View style={styles.contentGroup}>
          <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
            Park Contact Information
          </ThemedText>
          {park.contacts.phoneNumbers.length === 0 ? (
            <ThemedText>No phone numbers listed.</ThemedText>
          ) : (
            park.contacts.phoneNumbers.map((phone, index) => (
              <ThemedText key={`${phone.phoneNumber}-${index}`}>
                • {phone.type || 'Phone'}: {phone.phoneNumber}
                {phone.extension ? ` ext. ${phone.extension}` : ''}
              </ThemedText>
            ))
          )}
          {park.contacts.emailAddresses.length === 0 ? (
            <ThemedText>No email addresses listed.</ThemedText>
          ) : (
            park.contacts.emailAddresses.map((email, index) => (
              <ThemedText key={`${email.emailAddress}-${index}`}>• {email.emailAddress}</ThemedText>
            ))
          )}
        </View>

        <View style={styles.contentGroup}>
          <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
            Park Website & Directions
          </ThemedText>
          {!!park.directionsInfo && <ThemedText>{park.directionsInfo}</ThemedText>}
          {!!park.url && <LinkText url={park.url} label="Open official park website" />}
          {!!park.directionsUrl && <LinkText url={park.directionsUrl} label="Open park directions" />}
        </View>
      </CollapsiblePreviewSection>
      </View>

      <View nativeID={getSectionNativeId('fees')} onLayout={sectionLayout('fees')}>
      <CollapsiblePreviewSection title="Entrance Fees" collapsible={park.entranceFees.length > 1}>
        {park.entranceFees.length === 0 ? (
          <ThemedText>No entrance fee data listed for this park.</ThemedText>
        ) : (
          park.entranceFees.map((fee, index) => (
            <View key={`${fee.title}-${fee.cost}-${index}`} style={styles.listItem}>
              <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
                {fee.title || 'Untitled fee'}
              </ThemedText>
              <ThemedText>{fee.cost ? `$${fee.cost}` : 'No cost listed'}</ThemedText>
              {!!fee.description && <ThemedText>{fee.description}</ThemedText>}
            </View>
          ))
        )}
      </CollapsiblePreviewSection>
      </View>

      {park.entrancePasses.length > 0 ? (
        <View nativeID={getSectionNativeId('passes')} onLayout={sectionLayout('passes')}>
        <CollapsiblePreviewSection title="Entrance Passes" collapsible={park.entrancePasses.length > 1}>
          {park.entrancePasses.map((pass, index) => (
            <View key={`${pass.title}-${pass.cost}-${index}`} style={styles.listItem}>
              <ThemedText type="defaultSemiBold" style={styles.contentSubheader}>
                {pass.title || 'Untitled pass'}
              </ThemedText>
              <ThemedText>{pass.cost ? `$${pass.cost}` : 'No cost listed'}</ThemedText>
              {!!pass.description && <ThemedText>{pass.description}</ThemedText>}
            </View>
          ))}
        </CollapsiblePreviewSection>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 14,
    overflow: 'hidden',
    padding: 12,
    gap: 12,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#dde4ea',
  },
  heroTextBlock: {
    gap: 6,
  },
  parkTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  section: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 49, 12, 0.24)',
    paddingTop: 10,
    gap: 6,
  },
  contentGroup: {
    gap: 6,
  },
  contentSubheader: {
    color: '#66310c',
    fontSize: 15,
    lineHeight: 20,
  },
  exceptionBlock: {
    borderRadius: 8,
    padding: 8,
    gap: 4,
  },
  bulletContainer: {
    gap: 6,
  },
  resourceLinkBlock: {
    gap: 2,
  },
});
