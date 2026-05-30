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
Shared visual behavior lives in reusable components so Home, Search, Park Profile, Where Are We?, and Journey Mode use the same section styling while still allowing web-specific layout behavior.

## Platform Implementation and UX Preservation

The project supports three practical review contexts: Expo/iPhone testing, desktop web, and mobile web. The goal was to keep the user experience consistent while handling the limits of each runtime.

Expo/iPhone testing preserves the future native app-store path:

- mobile header and bottom navigation stay fixed like the app experience;
- foreground location, coordinate lookup, Native Land API result rendering, saved state, and Jump To navigation are testable in Expo;
- Journey Mode UI, Begin/Stop behavior, current-location result rendering, and last-update state are testable in Expo;
- native background task and local notification source remain implemented for future native runtimes in `tasks/journey-mode-task.ts` and `services/journey-mode.ts`;
- Expo Go can warn or limit full native background-location and notification behavior, so the implementation is documented in source instead of overstating Expo Go runtime coverage.

Desktop web was adjusted so the deployed app does not feel like a stretched mobile build:

- desktop web uses header navigation and hides the bottom tab bar;
- readable content width keeps the background visible and improves scanning;
- page sections are expanded by default because desktop users have more screen space;
- the image gallery remains expandable and paged to prevent huge image lists from loading all at once;
- landscape web backgrounds are used instead of mobile-shaped backgrounds;
- web icons are inline SVG paths, not browser icon fonts, so navigation does not show missing-font boxes.

Mobile web was adjusted to preserve the phone app experience:

- mobile-width web keeps the mobile-style upper header and bottom tab bar;
- mobile image sizing is used for gallery and state-result images;
- access-code modal spacing and text colors were adjusted for mobile browser viewports;
- page scrolling and background behavior were tuned so content scrolls naturally instead of requiring the pointer to be over one narrow panel.

Cloudflare Pages was added as an alternate grading/review path because a paid Apple Developer account is a financial barrier while all available physical testing devices are in the Apple ecosystem. The deployed web app demonstrates the GPS/API/Journey Mode workflow accessibly in a browser, while the native Journey Mode source remains available for review.

## Location Flow

The **Where Are We?** tab uses `expo-location`.

Flow:

1. User taps **Get My Coordinates**.
2. The app requests foreground location permission.
3. If permission is granted, the app reads current coordinates.
4. The button changes into a loaded coordinate state with the coordinate pair and refresh icon.
5. The app starts heading or web tilting/orientation updates when available.
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

## In-App Compass

The in-app compass appears on Where Are We? and Journey Mode.

The compass is built from React Native views:

- dark circular face;
- campfire-orange border;
- faint ivory vertical and horizontal crosshairs;
- orange upper needle;
- ivory lower needle.

It uses `expo-location` heading updates through `Location.watchHeadingAsync` on native runtimes. On web, the app also tries browser `DeviceOrientationEvent` tilting/orientation data after a user action. When heading data is available, the app rotates the compass by the inverse of the device heading so the needle points north.

The compass does not require NPS API or Native Land API network data. It can work without API responses if the app is already running and the device or browser provides heading or tilting sensor data. Availability still depends on platform permissions, hardware sensors, and browser/device behavior. If tilting is unavailable on web, the app keeps coordinate lookup working and displays a clear browser/device limitation message.

## Journey Mode

Journey Mode is opt-in. In the current UI, the **Begin Journey Mode** button starts the Journey Mode permission and location flow. While active, the button changes to **Stop Journey Mode**. After stopping, the screen shows **Journey Mode Ended. Begin Again?** and resets the compass/result state.

When turned on:

- notification permission is requested;
- background location permission is requested when available;
- enabled state is stored in AsyncStorage;
- last update time is stored when foreground Journey Mode checks run;
- the current Native Land context can be stored as a baseline;
- a background location task is registered in source code;
- the task compares new returned context to the saved baseline;
- a local notification is scheduled if returned context changes.
- the Journey Mode screen displays current location results using the same general result sections as Where Are We?.
- an updating loading state appears while Journey Mode is getting current or refreshed coordinate context.
- desktop web and mobile web builds check for updated Journey Mode coordinates every 5 minutes only while the tab remains open.

Implementation locations:

- `learning-react-native-app/components/journey-mode-panel.tsx`
- `learning-react-native-app/services/journey-mode.ts`
- `learning-react-native-app/tasks/journey-mode-task.ts`
- `learning-react-native-app/app/(tabs)/journey-mode.tsx`

Runtime differences:

- **Expo/iPhone testing:** foreground Journey Mode UI, permission prompts, coordinate lookup, current-location result rendering, saved enabled state, and visible last-update behavior can be tested in the Expo workflow.
- **Native app-store-style builds:** the source includes the background task and local notification path intended for native runtimes that permit background location and notifications.
- **Desktop web/mobile web:** Journey Mode uses browser geolocation while the tab is open and repeats checks every 5 minutes. Browser tabs should not be represented as equivalent to native background location after the app is closed or backgrounded.

## Notifications

Notifications use `expo-notifications`.

The app schedules local notifications only for Journey Mode context changes. Notification permission is requested only when the user turns Journey Mode on.
The notification module is lazy-loaded by the Journey Mode service so normal app startup does not import notification behavior before the user needs it.

Expo Go may warn that full notification support is limited. The source implementation remains present for review and for future native app-store runtimes.

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
- mobile bottom tab navigation;
- web header navigation with icons and text;
- desktop web header navigation that keeps page links in the top header instead of a bottom tab bar;
- mobile web navigation that keeps the mobile upper header and bottom tab bar so mobile browser testing matches the Expo mobile experience closely;
- web icons drawn in `components/ui/icon-symbol.tsx` without relying on browser icon-font rendering, preventing missing-font boxes on desktop web and mobile web;
- Jump To compass menu;
- glassy background surfaces;
- flat glass section surfaces without nested solid white subcards;
- web sections that are expanded by default and non-collapsible except for the National Parks Picture Gallery;
- mobile collapsible preview sections where long content needs a preview;
- National Parks Picture Gallery with full-size image modal;
- National Parks Picture Gallery paging on web;
- structured Visiting the Park & Park Website content with subheaders for hours, seasonal exceptions, address, contact, and website/directions;
- accessible buttons;
- responsive spacing helpers;
- custom font loading through `expo-font`.

The web layout intentionally has platform-specific refinements:

- desktop web uses wider readable content constraints so the background remains visible;
- mobile web uses mobile-sized image/gallery behavior instead of desktop two-column gallery cards;
- desktop web uses web-specific landscape background images;
- mobile native keeps the original mobile background set;
- web sections are expanded by default to reduce unnecessary tapping on desktop, while the image gallery remains the only expandable/paged section.

The Search by State list uses memoized rows and FlatList render-window settings to keep state-list updates responsive.

## National Park Service Scope

The app includes National Parks and other locations maintained by the National Park Service, like historic sites, trails, memorials, battlefields, and monuments.

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

Background assets:

- Mobile main background: `maria-orlova-3UWc-EMf0zA-unsplash.jpg`
- Mobile Where Are We? background: `evan-wise-2wvXI4mjYJ8-unsplash.jpg`
- Mobile Journey Mode background: `evan-wise-mNSSpeJsnQA-unsplash.jpg`
- Web Home/Search/State/Park/Where/Saved background: `denise-jans-XCJt9Z3_0Ks-unsplash.jpg`
- Web Journey Mode background: `kyle-loftus-IG1m3RomhPI-unsplash.jpg`

## Platform Caveat

Testing has been focused on iPhone through the Expo workflow. The standard Expo source workflow is enough for foreground testing and source review of navigation, API data display, Where Are We?, Saved Parks, AppState handling, deep-link source, and visible Journey Mode UI.

Full background-location runtime verification can depend on:

- iOS or Android permission choices;
- Expo Go versus native app-store-style runtime;
- operating system background restrictions;
- notification permission state;
- whether the device allows background updates during the test.

Because my available testing devices are in the Apple ecosystem and a paid Apple Developer account is a financial barrier, this submission does not rely on distributing an installable iOS build for grading. Instead, it documents the native implementation points in source and provides a Cloudflare Pages deployment so the instructor can test the app through a browser while reviewing the native Journey Mode source separately.

## Cloudflare Pages Deployment

The app is deployed on Cloudflare Pages at:

```text
https://defendtheparks.mp3li.online
```

The deployment is connected to the GitHub `main` branch and builds the Expo web export:

```text
Build command: cd learning-react-native-app && npm ci && npm run build:web
Build output directory: learning-react-native-app/dist
```

Cloudflare Pages Functions support selected web runtime behavior:

- `functions/api/nps/[[path]].js` proxies NPS requests through the same origin so park data loads reliably in deployed browsers.
- `functions/api/access-code.js` validates early access with a Cloudflare secret instead of a hardcoded public code.

The repo documents the existence of early access but does not publish the access code. Required API/access values should stay in local ignored environment files or Cloudflare environment variables/secrets.

A backend is not required for the current app to function, but a later backend running on a local iMac or hosted server would be useful for:

- protecting API keys;
- caching API responses;
- normalizing NPS and Native Land records;
- reducing duplicate requests;
- preparing a more public production deployment.

Where Are We? can map to browser geolocation with user permission. Journey Mode can also show current foreground results on web while the browser tab is open. Native background travel updates and local notifications after the app is backgrounded or closed should not be treated as equivalent to the static Cloudflare Pages web version.
