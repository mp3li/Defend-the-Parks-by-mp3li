# Technical Notes

This document explains the implementation choices behind the final project features.

## Architecture

The app is an Expo React Native app using Expo Router and TypeScript.

Main systems:

- `app/`: route files and screen entry points.
- `components/`: shared UI components and feature panels.
- `context/`: app state, saved parks, and page section jump menu context.
- `services/`: API, location, and Journey Mode logic.
- `tasks/`: background task registration code.
- `constants/`: theme, Native Land resource links, and U.S. state data.

The app keeps API calls in services so screens can focus on state, permissions, and rendering.
Shared visual behavior lives in reusable components so Home, Search, Park Profile, Where Are We?, and Journey Mode use the same section styling.

## Location Flow

The **Where Are We?** tab uses `expo-location`.

Flow:

1. User taps **Get My Coordinates**.
2. The app requests foreground location permission.
3. If permission is granted, the app reads current coordinates.
4. The button changes into a loaded coordinate state with the coordinate pair and refresh icon.
5. The app starts heading updates when available.
6. The app calls Native Land with the latitude and longitude.
7. The app displays records using the same section wording and structure used by park/profile Native Land sections where the record types overlap.
8. The app checks nearby sample points for Nearby Sovereignties.

If permission is denied, the app displays a message and does not continue the lookup.

## Native Land API Flow

Native Land API calls are centralized in `learning-react-native-app/services/native-land-api.ts`.

The coordinate lookup returns contextual records such as:

- placenames when available;
- languages;
- territories;
- treaties;
- source/reference links;
- name meanings when available.

The UI intentionally describes these as returned records, not legal boundary determinations. Indigenous territories can overlap, and API records should be read as educational context.

The app centers language records because Native Land's public materials currently emphasize language as a living relationship to place. Territory and treaty records are still included when returned.

## Native Land Resource Links

Placename Records are displayed as their own section when returned. Risks, renewals, listing pages, and maps are linked as Native Land public resources.

Implementation location:

- `learning-react-native-app/constants/native-land-resources.ts`

This keeps the interface honest about what the coordinate API returns while still giving users access to broader Native Land resources and map tools. Each resource link includes a short explanation of what kind of information it provides.

## Nearby Sovereignties

Nearby Sovereignties are approximate.

The app:

- checks sample points around the user's current coordinate;
- requests Native Land data for those sample points;
- deduplicates returned records;
- excludes records already returned for the exact coordinate;
- displays the approximate sample distance from the user.

This is not polygon boundary math and should not be read as a legal boundary distance. It is a contextual nearby-record feature.

Implementation location:

- `learning-react-native-app/services/location-context.ts`

## Journey Mode

Journey Mode is opt-in. In the current UI, the **Begin Journey Mode** button starts the Journey Mode permission and location flow.

When turned on:

- notification permission is requested;
- background location permission is requested when available;
- enabled state is stored in AsyncStorage;
- the current Native Land context can be stored as a baseline;
- a background location task is registered in source code;
- the task compares new returned context to the saved baseline;
- a local notification is scheduled if returned context changes.
- the Journey Mode screen displays current location results using the same general result sections as Where Are We?.
- an updating loading state appears while Journey Mode is getting current or refreshed coordinate context.

Implementation locations:

- `learning-react-native-app/components/journey-mode-panel.tsx`
- `learning-react-native-app/services/journey-mode.ts`
- `learning-react-native-app/tasks/journey-mode-task.ts`

## Notifications

Notifications use `expo-notifications`.

The app schedules local notifications only for Journey Mode context changes. Notification permission is requested only when the user turns Journey Mode on.
The notification module is lazy-loaded by the Journey Mode service so normal app startup does not import notification behavior before the user needs it.

Expo Go may warn that full notification support is limited. The source implementation remains present for review and for native-build runtimes.

## Broadcast, System Events, and Deep Links

The app uses event handling that is compatible with the Expo React Native stack.

Implemented event systems:

- React Native `AppState` system lifecycle events.
- Deep links for `soft210://where-are-we` and `soft210://journey-mode`.
- Custom Journey Mode context-change state stored for UI display.

Android note: Expo deep links map to Android intent-compatible launch behavior. This app does not include handwritten Android native broadcast receiver files because the project is maintained as an Expo source submission.

## UI System

The app uses:

- fixed global app header;
- Back strip with history-based Back and direct Return to Homepage actions;
- bottom tab navigation;
- Jump To compass menu;
- glassy background surfaces;
- flat glass section surfaces without nested solid white subcards;
- collapsible preview sections;
- National Parks Picture Gallery with full-size image modal;
- structured Visiting the Park & Park Website content with subheaders for hours, seasonal exceptions, address, contact, and website/directions;
- accessible buttons;
- responsive spacing helpers;
- custom font loading through `expo-font`.

The Search by State list uses memoized rows and FlatList render-window settings to keep state-list updates responsive.

## National Park Service Scope

The app includes national parks and other locations serviced by the National Park Service, like historic sites, trails, memorials, battlefields, and monuments.

This wording is intentional because the NPS API returns multiple designation types. Future iterations are planned to include filters so users can learn about these places and their Indigenous history by designation.

Typography:

- `LeagueSpartan-Bold.otf` for title/header text.
- `Aileron-Regular.otf` for body and controls.
- `Aileron-Italic.otf` for emphasis.

Palette:

- Campfire `#aa5215`
- Cedar `#66310c`
- Pine `#151e08`
- Deep Pine `#0b1406`
- Night `#04040c`
- Ivory neutral `#f7efe2`

## Platform Caveat

The course TXT does not require a development build. The standard Expo source workflow is enough for foreground testing and source review.

Full background-location runtime verification can depend on:

- iOS or Android permission choices;
- Expo Go versus native build runtime;
- operating system background restrictions;
- notification permission state;
- whether the device allows background updates during the test.

For grading, the source implementation locations are documented in `docs/FINAL_PROJECT_REQUIREMENTS.md`.
