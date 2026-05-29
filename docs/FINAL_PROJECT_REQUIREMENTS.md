# Final Project Requirements

This document maps the Mobile Application Development final project requirements to the implemented Defend the Parks by mp3li source code.

## Requirement 1: Location and Background Services

Implemented through **Where Are We?** and **Journey Mode**.

What is implemented:

- Requests foreground location permission with `expo-location`.
- Reads the user's current latitude and longitude.
- Displays the coordinates in the interface.
- Uses those coordinates to request Native Land API records.
- Starts heading updates when location permission is available.
- Displays an in-app compass when heading data is available.
- Provides Journey Mode as an opt-in travel feature started by the **Begin Journey Mode** button.
- Displays Journey Mode current-location results with the same result structure used by Where Are We?.
- Stores Journey Mode enabled state, last check time, baseline context, and last context-change event with AsyncStorage.
- Registers a background location task in source code with `expo-task-manager`.
- Compares new returned territory context to the saved baseline when background updates are available.
- Schedules a local notification when Journey Mode detects changed returned context.

Implementation locations:

- `learning-react-native-app/app/(tabs)/where-are-we.tsx`
- `learning-react-native-app/app/(tabs)/journey-mode.tsx`
- `learning-react-native-app/components/journey-mode-panel.tsx`
- `learning-react-native-app/services/location-context.ts`
- `learning-react-native-app/services/journey-mode.ts`
- `learning-react-native-app/tasks/journey-mode-task.ts`

## Requirement 2: Broadcast Intents and External APIs

The requirement says the app must utilize broadcast intents to interact with system events or external APIs, listen for at least one broadcast event, consume external API data, and display that data.

What is implemented:

- React Native `AppState` listens for system lifecycle events.
- Where Are We? refreshes location context when the app returns active and a coordinate baseline exists.
- Deep links are handled in the root layout:
  - `soft210://where-are-we`
  - `soft210://journey-mode`
- Android note: the Expo deep-link setup maps to intent-compatible app launching without handwritten native Android receiver code.
- Journey Mode stores a custom app event when returned context changes.
- The app consumes the National Park Service API.
- The app consumes the Native Land API.
- Retrieved API data is displayed in Home, Search, state location lists, profile pages, Where Are We?, Nearby Sovereignties, and Journey Mode result surfaces.

Implementation locations:

- `learning-react-native-app/app/_layout.tsx`
- `learning-react-native-app/app/(tabs)/where-are-we.tsx`
- `learning-react-native-app/services/nps-api.ts`
- `learning-react-native-app/services/native-land-api.ts`
- `learning-react-native-app/services/journey-mode.ts`

## Requirement 3: Display Retrieved API Data

External API data is displayed throughout the interface.

NPS API data displayed:

- Featured Park of the Day.
- State lists of national parks and other locations serviced by the National Park Service.
- Profile overview.
- Park images.
- Activities and topics.
- Weather guidance.
- Operating hours.
- Addresses and contact information.
- Fees and passes.
- Official park links.

Native Land API data displayed:

- Native Land overview text.
- Placename records.
- Languages.
- Territories.
- Treaties.
- Source/reference links.
- Name meanings when returned.
- Contextual notes about overlapping records and non-legal boundary use.
- Native Land public resources and map tools.

Native Land public resources linked:

- Maps.
- Lists.
- Placenames.
- Risk resources.
- Renewal resources.

Implementation locations:

- `learning-react-native-app/app/(tabs)/index.tsx`
- `learning-react-native-app/app/(tabs)/explore.tsx`
- `learning-react-native-app/app/(tabs)/states/[stateCode].tsx`
- `learning-react-native-app/app/(tabs)/parks/[parkCode].tsx`
- `learning-react-native-app/app/(tabs)/where-are-we.tsx`
- `learning-react-native-app/components/park/park-detail-content.tsx`
- `learning-react-native-app/constants/native-land-resources.ts`

## Requirement 4: User Interface and Animation

What is implemented:

- Fixed app title on every screen.
- Bottom tab navigation.
- Jump To compass menu for long screens.
- Accessible buttons.
- Collapsible preview sections that start partially visible.
- Section arrows only where expansion is available.
- Spinning compass loading animation while checking coordinates.
- Where Are We-style Journey Mode result loading and current context surfaces.
- In-app compass on Where Are We?.
- Full-size image modal for gallery images.
- Back strip with Back and Return to Homepage actions.
- Glassy/dimmed background image system.
- Theme-aware typography and colors.
- Flat glass section styling without nested solid white subcards.

Implementation locations:

- `learning-react-native-app/components/app-header.tsx`
- `learning-react-native-app/components/collapsible-preview-section.tsx`
- `learning-react-native-app/components/screen-background.tsx`
- `learning-react-native-app/components/accessible-button.tsx`
- `learning-react-native-app/components/themed-text.tsx`
- `learning-react-native-app/app/(tabs)/_layout.tsx`
- `learning-react-native-app/app/(tabs)/where-are-we.tsx`

## Instructor Testing Checklist

Use this checklist for grading:

- Run `npm install` inside `learning-react-native-app/`.
- Run `npx expo start`.
- Confirm Home loads with the fixed app title and bottom navigation.
- Confirm the Jump To compass menu opens.
- Confirm Featured Park of the Day loads from the NPS API.
- Confirm the save/remove park button persists saved state.
- Open Search and search/select a state.
- Open a profile and review API content sections.
- Confirm state pages explain that results include national parks and other locations serviced by the National Park Service.
- Confirm the National Parks Picture Gallery uses the same section styling as the rest of the app and opens full-size images.
- Confirm Native Land records or empty/failure messages display on profiles.
- Open Where Are We?.
- Tap **Get My Coordinates**.
- Confirm location permission is requested.
- Confirm coordinates display after permission is granted.
- Confirm the **Get My Coordinates** button changes after coordinates load, shows the coordinate pair, and includes a refresh icon.
- Confirm the loading compass appears while coordinates are loading.
- Confirm Placename Records, Languages, Territories, Treaties, Native Land Public Resources and Map Tools, Nearby Sovereignties, and Sources match the current shared section style.
- Confirm languages, territories, treaties, source links, and resource links display when returned.
- Confirm Nearby Sovereignties displays approximate nearby records when available.
- Confirm the in-app compass copy says `Get your Coordinates to use the in-app compass.` before heading data is available.
- Open Journey Mode.
- Tap **Begin Journey Mode**.
- Confirm Journey Mode state persists after navigating away and returning.
- Confirm Journey Mode displays current location results with the same general structure as Where Are We? after coordinates load.
- Review `tasks/journey-mode-task.ts` for background task source.
- Review `app/_layout.tsx` for deep-link handling.
- Review `where-are-we.tsx` for AppState lifecycle handling.

## Testing Caveat

The course TXT does not require a development build. This repo includes the background-location implementation in source code, but full background-location runtime behavior can depend on:

- Expo Go versus native build runtime;
- platform permissions;
- operating system background-location rules;
- notification permission choices;
- whether the operating system allows background updates at that moment.

Foreground location lookup, external API display, UI animation, AppState handling, deep-link source, local persistence, and source-level Journey Mode implementation are all available for review through the standard GitHub and Expo workflow.
