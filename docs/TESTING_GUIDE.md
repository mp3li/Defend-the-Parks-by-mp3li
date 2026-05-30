# Testing Guide

This guide gives practical steps for testing Defend the Parks by mp3li from the GitHub source repository.

## Setup

From the repo root:

```bash
cd learning-react-native-app
npm install
npx expo start --clear
```

Open the app in Expo Go, iOS Simulator, Android Emulator, web preview, or the deployed early-access web app. Current hands-on native-style testing has been focused on iPhone through Expo.

Deployed web URL:

```text
https://defendtheparks.mp3li.online
```

The deployed web app is early-access protected. The access code is intentionally not documented in the repo.

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

The app expects National Park Service and Native Land API variables in `learning-react-native-app/.env`. The variable names are defined in the API service files and real values should not be committed.

If keys are missing or invalid, API areas may show error or empty-state messages instead of records.

Cloudflare Pages also needs deployment variables/secrets configured outside the repo. Do not commit real values.

## Home Screen

Check:

- fixed app title is visible at the top;
- mobile bottom tab navigation is visible;
- desktop web header navigation is visible and includes Homepage, Search by State, Where Are We?, Journey Mode, and My Saved National Parks & Sites;
- mobile-width web keeps the mobile-style upper header and bottom tab navigation;
- desktop web and mobile web nav icons show as real icons, not missing-font boxes;
- Jump To compass button opens the page menu;
- mobile Welcome card preview expands and collapses;
- web Welcome content is expanded and non-collapsible;
- Featured Park of the Day loads;
- **Save This Park To My List** saves the park;
- saving changes the button state;
- Native Land records connected to the featured park appear when API data is available;
- National Parks Picture Gallery appears under the welcome card and opens full-size images;
- National Parks Picture Gallery entries use the same flat section styling, without solid white nested cards;
- mobile longer sections preview content and expand;
- web sections are expanded and non-collapsible except National Parks Picture Gallery.

Web-specific check:

- desktop web sections are readable-width instead of full-bleed, leaving the background visible;
- mobile web uses mobile image/gallery sizing instead of desktop two-column gallery sizing.

## Search by State Screen

Check:

- Search appears in mobile bottom navigation with a search icon;
- Search by State appears in web header navigation with an icon;
- search input filters states by name or abbreviation;
- state rows update smoothly while filtering;
- tapping a state opens that state's park list;
- image gallery appears under the state list;
- park rows display data returned from the NPS API;
- web state-result park rows are expanded and non-collapsible;
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
- mobile collapsible sections expand without scroll jumping;
- web profile sections are expanded and non-collapsible except the picture gallery;
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
- in-app compass area says `Get your Coordinates to use the in-app compass.` before coordinates are loaded;
- web compass area says `Compass tilting is not available in this browser or device. Coordinates are still working.` only after coordinates are active and tilting is unavailable;
- heading updates when device heading data is available;
- Journey Mode is not duplicated as a section on this screen.

## Journey Mode

Check:

- Journey Mode opens directly from the mobile bottom navigation or desktop web header navigation;
- intro card uses the same header styling as other screens;
- **Begin Journey Mode** starts the Journey Mode permission/location flow;
- active Journey Mode changes the button to **Stop Journey Mode**;
- stopping Journey Mode returns the button to **Begin Journey Mode** and shows `Journey Mode Ended. Begin Again?`;
- In-App Compass appears above How Journey Mode Works;
- in-app compass heading updates when device/browser heading data is available;
- How Journey Mode Works panel has a readable glass background;
- notification/background permission prompts appear when the runtime supports them;
- notification behavior is not imported until Journey Mode notification permissions or scheduling are needed;
- Last update displays `Journey Mode not yet enabled` before Journey Mode starts;
- Last update changes after Journey Mode starts;
- current location result sections display after coordinates are loaded;
- web Journey Mode checks every 5 minutes only while the tab remains open.

Expo Go note:

- visible Journey Mode UI and foreground coordinate behavior can be tested in Expo;
- full background-location and notification behavior is implemented in source but may not fully run inside Expo Go on iPhone.

Web note:

- desktop web and mobile web can show Journey Mode foreground results while the browser tab is open;
- desktop web and mobile web are not equivalent to native background location after the app is closed or backgrounded;
- the web build uses a 5-minute tab-open polling path to provide an accessible demonstration of the travel-aware workflow.

## Navigation

Check:

- Back strip appears after leaving Home;
- **Back** returns to the previous screen in navigation history;
- **Return to Homepage** returns directly to Home;
- mobile bottom nav selected icons/text use the ivory app-title color;
- web header nav selected icons/text use the ivory app-title color;
- desktop web uses header navigation instead of the bottom tab bar;
- mobile-width web uses bottom tabs to preserve the mobile app testing experience;
- state/profile pages visually keep Search selected in navigation.

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

## Background Behavior and Platform Caveat

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
- `learning-react-native-app/app/(tabs)/journey-mode.tsx`

Because the available physical testing devices are in the Apple ecosystem and Apple Developer account access creates a financial barrier, this submission documents the native implementation source and provides a Cloudflare Pages deployment for accessible browser-based testing. The web deployment demonstrates foreground GPS lookup, API display, Journey Mode start/stop behavior, current-location results, and tab-open polling while keeping native background-location source available for review.

## Deployed Web Behavior

The deployed web app uses:

- Cloudflare Pages connected to GitHub `main`;
- Expo web export from `learning-react-native-app`;
- Cloudflare Pages Function `functions/api/nps/[[path]].js` for NPS data loading;
- Cloudflare Pages Function `functions/api/access-code.js` for early-access validation;
- Cloudflare environment variables/secrets for private values;
- web-specific backgrounds and layout rules;
- drawn web icons in `components/ui/icon-symbol.tsx` so navigation icons do not depend on browser icon fonts.
