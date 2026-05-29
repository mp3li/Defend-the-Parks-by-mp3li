# Testing Guide

This guide gives practical steps for testing Defend the Parks by mp3li from the GitHub source repository.

## Setup

From the repo root:

```bash
cd learning-react-native-app
npm install
npx expo start --clear
```

Open the app in Expo Go, iOS Simulator, Android Emulator, or web preview.

## Static Checks

Run:

```bash
npm run lint
npx tsc --noEmit
```

Expected result:

- lint completes without errors;
- TypeScript completes without errors.

## API Key Check

The app expects these environment variables in `learning-react-native-app/.env`:

```bash
EXPO_PUBLIC_NPS_API_KEY=your_nps_key_here
EXPO_PUBLIC_NATIVE_LAND_API_KEY=your_native_land_key_here
```

If keys are missing or invalid, API areas may show error or empty-state messages instead of records.

## Home Screen

Check:

- fixed app title is visible at the top;
- bottom tab navigation is visible;
- Jump To compass button opens the page menu;
- Welcome card preview expands and collapses;
- Featured Park of the Day loads;
- **Save This Park To My List** saves the park;
- saving changes the button state;
- Native Land records connected to the featured park appear when API data is available;
- National Parks Picture Gallery appears under the welcome card and opens full-size images;
- National Parks Picture Gallery entries use the same flat section styling, without solid white nested cards;
- longer sections preview content and expand;
- short sections do not show an expand arrow.

## Search by State Screen

Check:

- Search tab appears in the bottom navigation with a search icon;
- search input filters states by name or abbreviation;
- tapping a state opens that state's park list;
- image gallery appears under the state list;
- park rows display data returned from the NPS API;
- tapping a park opens its profile.

## Park Profile

Check:

- park title, image, designation, state, and save button display;
- overview and NPS data sections display;
- profile styling matches the Home page glass section system;
- profile sections do not show solid white nested subcards;
- park/profile pages do not show an extra native header chunk;
- Native Land records display when returned;
- Placename Records is its own section;
- placename, risk, renewal, and map resources are linked;
- Visiting the Park & Park Website uses subheaders for hours, seasonal exceptions, address, contact, and website/directions;
- collapsible sections expand without scroll jumping;
- saved state persists when navigating away and back.

## Where Are We?

Check:

- tap **Get My Coordinates**;
- the app requests foreground location permission;
- loading state shows a spinning compass and `Getting your coordinates...`;
- coordinates display after permission is granted;
- coordinate button changes style after coordinates load, shows the coordinate pair, and includes a refresh icon;
- Native Land records display when returned;
- Placename Records appears as its own section when records are returned;
- languages, territories, treaties, resource links, and source links are visible;
- treaty records include the same research-starting note used on park/profile sections;
- Nearby Sovereignties displays approximate nearby records when available;
- in-app compass area says `Get your Coordinates to use the in-app compass.` before heading data is available;
- heading updates when device heading data is available;
- Journey Mode is not duplicated as a section on this screen.

## Journey Mode

Check:

- Journey Mode tab opens directly from the bottom navigation;
- intro card uses the same header styling as other screens;
- **Begin Journey Mode** starts the Journey Mode permission/location flow;
- How Journey Mode Works panel has a readable glass background;
- notification/background permission prompts appear when the runtime supports them;
- Last update displays `Journey Mode not yet enabled` before Journey Mode starts;
- current location result sections display after coordinates are loaded.

## Navigation

Check:

- Back strip appears after leaving Home;
- **Back** returns to the previous screen in navigation history;
- **Return to Homepage** returns directly to Home;
- bottom nav selected icons/text use the ivory app-title color;
- state/profile pages visually keep Search selected in the bottom nav.

## Saved Parks

Check:

- saved parks appear after saving from Home or Park Profile;
- saved count badge updates;
- tapping **Open** returns to the park profile;
- tapping **Remove** deletes the saved park.

## Deep Links

Source support is implemented for:

- `soft210://where-are-we`
- `soft210://journey-mode`

Implementation location:

- `learning-react-native-app/app/_layout.tsx`

Runtime behavior can depend on the preview environment.

## Background Behavior Caveat

Journey Mode background-location behavior is implemented in source code, but full runtime verification may depend on:

- Expo Go limitations;
- iOS or Android permission settings;
- notification permission settings;
- whether the app is running in a native build;
- operating system background restrictions.

For source review, inspect:

- `learning-react-native-app/services/journey-mode.ts`
- `learning-react-native-app/tasks/journey-mode-task.ts`
- `learning-react-native-app/components/journey-mode-panel.tsx`
