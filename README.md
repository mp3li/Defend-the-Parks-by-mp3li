# Defend the Parks by mp3li

![Status](https://img.shields.io/badge/status-active%20development-aa5215?labelColor=04040c)
![Platform](https://img.shields.io/badge/platform-Expo%20React%20Native-aa5215?labelColor=04040c)
![Language](https://img.shields.io/badge/language-TypeScript-aa5215?labelColor=04040c)
![Data](https://img.shields.io/badge/data-NPS%20%2B%20Native%20Land-aa5215?labelColor=04040c)
![Focus](https://img.shields.io/badge/focus-parks%20%2B%20Indigenous%20context-aa5215?labelColor=04040c)

Defend the Parks by mp3li is a mobile app for exploring national parks and other locations maintained by the National Park Service, like historic sites, trails, memorials, battlefields, and monuments, while learning about Indigenous languages, territories, treaties, and public Native Land resources connected to those places.

The app is built with Expo React Native, Expo Router, TypeScript, the National Park Service API, Native Land API data, foreground location services, local persistence, and opt-in Journey Mode background-task source code.

## Screenshots

Screenshots will be added after final device testing.

| Area | Placeholder |
| --- | --- |
| Home | `docs/screenshots/home.png` |
| Search by State | `docs/screenshots/states.png` |
| Park Profile | `docs/screenshots/park-profile.png` |
| Where Are We? | `docs/screenshots/where-are-we.png` |
| Nearby Sovereignties | `docs/screenshots/nearby-sovereignties.png` |
| Journey Mode | `docs/screenshots/journey-mode.png` |
| Saved Parks | `docs/screenshots/saved-parks.png` |

## Core Features

- Browse all 50 states and open national parks and other locations serviced by the National Park Service for each state.
- View a Featured Park of the Day from live NPS data.
- Save and remove parks with local AsyncStorage persistence.
- Open detailed profiles with overview, structured visiting details, hours, address, contact info, fees, passes, weather, activities, topics, and stewardship links.
- View the **National Parks Picture Gallery**, ordered alphabetically by park, with expandable images, flat glass section styling, credits, captions, and full-size image viewing.
- View Native Land context on profile pages, including a Native Land overview, placename records, languages, territories, treaties, public resource links, and source links.
- Use **Where Are We?** to get the user's coordinates and retrieve Native Land records for that location.
- Use **Nearby Sovereignties** to see approximate nearby Native Land records from sampled nearby points.
- Use **Journey Mode** as an opt-in travel feature started with **Begin Journey Mode**, with persisted state, local notification support, background-location task source code, and Where Are We-style current location results.
- Use the fixed **Jump To** compass menu to navigate long pages.

## Run the App

```bash
cd learning-react-native-app
npm install
npx expo start
```

Then choose one preview option:

- scan the QR code with Expo Go on iPhone or Android;
- press `i` for iOS Simulator;
- press `a` for Android Emulator;
- press `w` for web preview.

For a clean restart after style or asset changes:

```bash
npx expo start --clear
```

## Environment Variables

Create `learning-react-native-app/.env` with your own API keys:

```bash
EXPO_PUBLIC_NPS_API_KEY=your_nps_key_here
EXPO_PUBLIC_NATIVE_LAND_API_KEY=your_native_land_key_here
```

Notes:

- NPS data requires a valid National Park Service API key for reliable live API responses.
- Native Land records require a valid Native Land API key for reliable coordinate lookups.
- The app handles missing/failed API data with user-facing messages, but final grading/testing should use valid keys.

## App Structure

```text
learning-react-native-app/
  app/
    (tabs)/
      index.tsx              Home and Featured Park
      explore.tsx            Search by State
      states/[stateCode].tsx State location list
      parks/[parkCode].tsx   Location profile
      where-are-we.tsx       Location-based Native Land lookup
      journey-mode.tsx       Journey Mode controls
      lifecycle.tsx          Saved parks
    _layout.tsx              Providers, app header, deep links
  components/                Shared UI and feature components
  constants/                 Theme, Native Land resources, state data
  context/                   Saved parks, app state, page sections
  services/                  NPS, Native Land, location, Journey Mode
  tasks/                     Background Journey Mode task
  types/                     Shared TypeScript types
docs/
  FINAL_PROJECT_REQUIREMENTS.md
  STYLE_RULES.md
  TECHNICAL_NOTES.md
  TESTING_GUIDE.md
```

Local-only note:

- API keys belong in `learning-react-native-app/.env`, which is ignored.

## Final Project Coverage

This repo includes instructor-facing documentation that maps the implementation to the final project requirements:

- [Final Project Requirements](docs/FINAL_PROJECT_REQUIREMENTS.md)
- [Technical Notes](docs/TECHNICAL_NOTES.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Style Rules](docs/STYLE_RULES.md)

Requirement summary:

- **Location and background services:** `Where Are We?` uses foreground location; Journey Mode begins from a user action, stores opt-in state, and registers a background location task in source.
- **Broadcast/system events and external APIs:** the app uses React Native `AppState`, deep-link handling, Journey Mode custom context-change state, the NPS API, and the Native Land API.
- **Displayed API data:** park data, Native Land records, nearby records, source links, and public resource links are displayed in the interface.
- **UI and animation:** the app includes tab navigation, accessible buttons, collapsible sections, flat glass section surfaces, loading states, a spinning compass, an in-app compass, a Jump To menu, and full-size image viewing.

## Platform Notes

The course TXT does not require a development build. This submission is designed to be graded from the GitHub source workflow and standard Expo startup commands.

Foreground location, Native Land lookup, NPS data, UI navigation, local persistence, AppState refresh behavior, and the documented deep-link wiring can be reviewed from the Expo workflow. Full background-location behavior depends on platform permissions, operating system behavior, and whether the app is running in Expo Go or a native build.

## Design System

The current visual system uses a campfire/night palette:

- Campfire: `#aa5215`
- Cedar: `#66310c`
- Pine: `#151e08`
- Deep Pine: `#0b1406`
- Night: `#04040c`
- Ivory support neutral: `#f7efe2`

Fonts:

- App title and headers: `LeagueSpartan-Bold.otf`
- Body and controls: `Aileron-Regular.otf`
- Emphasis: `Aileron-Italic.otf`

See [Style Rules](docs/STYLE_RULES.md) for implementation rules.

## Verification

Current static checks:

```bash
cd learning-react-native-app
npm run lint
npx tsc --noEmit
```

Manual checks are listed in [Testing Guide](docs/TESTING_GUIDE.md).

## Source Availability

This repository is source-visible for review and grading. Usage rights are governed by [LICENSE](LICENSE). Do not assume unrestricted reuse, redistribution, or commercial rights beyond that license.
