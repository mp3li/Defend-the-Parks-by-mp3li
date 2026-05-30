<p align="center">
  <img src="docs/readme-assets/brand/compass-icon.svg" alt="Defend the Parks compass icon" width="72" />
</p>

<p align="center">
  <img src="docs/readme-assets/brand/readme-title.png" alt="Defend the Parks by mp3li" width="760" />
</p>

<p align="center">
  Defend the Parks is a mobile app for exploring National Parks and other locations maintained by the National Park Service while learning about Indigenous languages, territories, treaties, placenames, nearby sovereignty records, and public Native Land resources. The app includes <strong>'Where Are We? Mode'</strong> for GPS-based land context on where you are currently located, an in-app compass, and <strong>'Journey Mode'</strong> for travel-aware updates when a user moves into an area that returns new Native Land API information.
</p>

<p align="center">
  <img alt="National Park Data" src="https://img.shields.io/badge/National_Park_Data-NPS_API-aa5215?style=for-the-badge&labelColor=04040c" />
  <img alt="Indigenous Context Data" src="https://img.shields.io/badge/Indigenous_Context_Data-Native_Land_API-66310c?style=for-the-badge&labelColor=04040c" />
  <img alt="GPS Feature Where Are We" src="https://img.shields.io/badge/GPS_Feature-Where_Are_We%3F-151e08?style=for-the-badge&labelColor=04040c" />
  <img alt="GPS Feature Journey Mode" src="https://img.shields.io/badge/GPS_Feature-Journey_Mode-0b1406?style=for-the-badge&labelColor=04040c" />
</p>

<p align="center">
  <img alt="Framework" src="https://img.shields.io/badge/Framework-Expo_React_Native-aa5215?style=for-the-badge&labelColor=04040c" />
  <img alt="Language" src="https://img.shields.io/badge/Language-TypeScript-66310c?style=for-the-badge&labelColor=04040c" />
  <img alt="Persistence" src="https://img.shields.io/badge/Persistence-Saved_Parks-151e08?style=for-the-badge&labelColor=04040c" />
</p>

<p align="center">
  <img alt="Access" src="https://img.shields.io/badge/Access-Early_Access_Only-aa5215?style=for-the-badge&labelColor=04040c" />
  <img alt="Status" src="https://img.shields.io/badge/Status-In_Active_Development-66310c?style=for-the-badge&labelColor=04040c" />
  <img alt="License" src="https://img.shields.io/badge/License-Source_Available_Review_Only-151e08?style=for-the-badge&labelColor=04040c" />
</p>

<p align="center">
  <img src="docs/readme-assets/gifs/defend-the-parks-app-flow.gif" alt="Defend the Parks app flow preview" width="360" />
</p>

## Table of Contents

<details>
<summary>Open Table of Contents</summary>

<br />

- [About the Project](#about-the-project)
- [What the App Provides](#what-the-app-provides)
- [How to Use Defend the Parks](#how-to-use-defend-the-parks)
- [Feature: Where Are We? Mode](#feature-where-are-we-mode)
- [Feature: Journey Mode](#feature-journey-mode)
- [Feature: In-App Compass](#feature-in-app-compass)
- [How It Was Built](#how-it-was-built)
- [Architecture Flow](#architecture-flow)
- [Data Sources and API Strategy](#data-sources-and-api-strategy)
- [Native Land Context Approach](#native-land-context-approach)
- [UI, Styling, and Asset Credits](#ui-styling-and-asset-credits)
- [Setup, API Keys, and Local Development](#setup-api-keys-and-local-development)
- [Testing, Grading, and Platform Notes](#testing-grading-and-platform-notes)
- [Future Deployment Direction](#future-deployment-direction)
- [Final Project Requirement Map](#final-project-requirement-map)
- [Documentation Map](#documentation-map)
- [License](#license)
- [Screenshots and Credits](#screenshots-and-credits)

</details>

## About the Project

Defend the Parks by mp3li was built as a final project for **DATA 144 - Data Structures** during my last quarter working toward my Associate Degree in **Software Development and Business Analytics**.

The app is built to feel useful first. It is not only a list of parks, and it is not only a class demo. It is a mobile field-style guide for asking better questions about place: What National Park Service locations are near or connected to a state? What does the National Park Service publish about that place? What Indigenous languages, territories, treaties, placenames, and public Native Land resources are connected to the land? What changes when I physically move somewhere else?

Under the hood, those workflows are supported by structured app state, searchable lists, saved records, API integration, local persistence, GPS-based lookup, background-task source code, and responsive mobile/web interface behavior. The project stays practical while demonstrating the final-project requirements through a real user experience.

The app intentionally avoids presenting Native Land data as fixed legal borders. Indigenous sovereignty, language, relationship to land, and public data cannot be flattened into one clean boundary. Defend the Parks presents records as educational context, centers languages when available, and links users back to public source material for further research.

## What the App Provides

- **Fixed app shell:** persistent app title, compass Jump To menu, history-aware Back strip, Return to Homepage action, mobile bottom tab navigation, and web header navigation.
- **Homepage welcome section:** app purpose, National Park Service/Native Land API explanation, and user orientation.
- **National Parks Picture Gallery:** alphabetized NPS image gallery, the only expandable section on web, paged web loading, full-size image modal, and visible image credits.
- **Featured Park of the Day:** date, selected park or NPS location name, NPS image, image credit, save button, and the same detailed content system used on profile pages.
- **About Native Land Records section:** explanation of what Native Land records are being used for and why the app centers languages while still including territories and treaties.
- **Placename Records:** placename records returned by Native Land when available.
- **Overview:** National Park Service description for the selected park or NPS-maintained location.
- **Get Involved & Defend This Park:** stewardship copy, official NPS links, volunteer links, donation links, and contact actions where available.
- **Languages Connected to This Location:** Native Land language records listed before territory records when available.
- **Territories in This Location:** Native Land territory records returned for the selected park, NPS location, or GPS coordinate.
- **Treaties Connected to This Location:** Native Land treaty records with careful wording and research-starting context.
- **Native Land Public Resources and Map Tools:** links to public Native Land map, listing, placename, risk, renewal, territory, language, and treaty tools.
- **Activities:** NPS activity records returned for a park or NPS location.
- **Topics:** NPS topic records returned for a park or NPS location.
- **Weather:** NPS weather guidance when provided.
- **Visiting the Park & Park Website:** location summary, operating hours, visitor center hours, seasonal or holiday exceptions, address, contact information, website, and directions.
- **Entrance Fees:** NPS entrance-fee records when returned.
- **Entrance Passes:** NPS pass records when returned.
- **Quick Actions:** official website, directions, phone, email, and related action buttons when data is available.
- **Search by State:** state search, state result pages, returned count, and rows for parks and other NPS-maintained locations.
- **Park and NPS-location profiles:** full profile pages for parks, historic sites, trails, memorials, battlefields, monuments, and other NPS designations returned by the API.
- **Where Are We? Mode:** foreground GPS lookup, coordinate-acquired button state, in-app compass, Location Context, placenames, languages, territories, treaties, Native Land public resources, Nearby Sovereignties, and source links for the user's current location.
- **Journey Mode:** travel-aware GPS flow with Begin/Stop Journey Mode action, in-app compass, How Journey Mode Works explanation, current location results, persisted last-update state, web tab-open polling, and background-task/notification source.
- **Saved Parks:** saved count, saved park list, open actions, remove actions, and persisted saved state.
- **Broadcast/system-event coverage:** AppState listener, deep-link handling, and Journey Mode context-change state for the coursework broadcast/system-event requirement.

## How to Use Defend the Parks

### 1. Start on the Homepage

The Homepage is the main guided entry point. It introduces the purpose of the app, explains that Defend the Parks uses National Park Service data and Native Land API data, opens the National Parks Picture Gallery, and shows the Featured Park of the Day with the same meaningful detail structure used on park pages. From the featured park, users can review Indigenous language, territory, treaty, placename, source, and map-tool records; read the National Park Service overview; open stewardship links; check activities, topics, weather, visitor information, fees, directions, and official park links; and save the park locally. Every major page also has the fixed compass **Jump To** menu, so long screens have a page-specific table of contents instead of forcing users to scroll blindly.

<p align="center">
  <img src="docs/readme-assets/gifs/home.gif" alt="Homepage flow showing welcome, gallery, featured park, Native Land context, visitor information, and quick actions" width="360" />
</p>

<details>
<summary>Homepage screenshots used in this preview</summary>

<br />

<p align="center"><img src="docs/readme-assets/screenshots/raw-5340.png" alt="Homepage welcome and gallery preview" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5341.png" alt="Expanded welcome section with app and data-source explanation" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5342.png" alt="Featured Park of the Day with save button and Native Land records beginning" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5343.png" alt="Placename records, overview, and Get Involved section" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5344.png" alt="Expanded Get Involved and Defend This Park section" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5345.png" alt="Languages, territories, and treaties returned for the featured park" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5346.png" alt="Native Land public resources and map tools" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5347.png" alt="Activities, topics, and weather sections" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5348.png" alt="Visiting the Park, fees, and quick actions" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5350.png" alt="Jump To section menu available from long pages" width="300" /></p>

</details>

### 2. Search by State

Search by State is for browsing National Park Service records geographically. Users search the state list, open a state page, review how many NPS-maintained locations were returned, and tap into a full profile page when they want the complete set of park data and Native Land context.

<p align="center">
  <img src="docs/readme-assets/gifs/search.gif" alt="Search by State flow with state list and state result pages" width="360" />
</p>

<details>
<summary>Search screenshots used in this preview</summary>

<br />

<p align="center"><img src="docs/readme-assets/screenshots/raw-5349.png" alt="Search by State screen" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5351.png" alt="Washington state result list" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5352.png" alt="New York state result list" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5353.png" alt="Montana state result list" width="300" /></p>

</details>

### 3. Where Are We? Mode

Where Are We? is the current-location mode. After the user gives permission, the app gets exact coordinates, changes the button state so the user can see the coordinates were acquired, starts heading data for the in-app compass when available, calls Native Land API with the coordinates, and displays returned placenames, languages, territories, treaties, source links, public resources, and Nearby Sovereignties.

<p align="center">
  <img src="docs/readme-assets/gifs/where.gif" alt="Where Are We mode from intro to coordinates and Native Land results" width="360" />
</p>

<details>
<summary>Where Are We screenshots used in this preview</summary>

<br />

<p align="center"><img src="docs/readme-assets/screenshots/raw-5354.png" alt="Where Are We intro with Get My Coordinates button" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5355.png" alt="Where Are We location context before coordinates" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5356.png" alt="Coordinates acquired state with compass heading" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5357.png" alt="Placename records and languages returned for current location" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5358.png" alt="Languages, territories, and treaties for current location" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5359.png" alt="Native Land resources, nearby sovereignties, and sources" width="300" /></p>

</details>

### 4. Journey Mode

Journey Mode is for road trips, moving through different areas, or any situation where the user wants updated context as they travel. The mode explains the permission model, starts from a deliberate **Begin Journey Mode** action, changes to **Stop Journey Mode** while active, and uses the same Native Land result structure as Where Are We? so users do not have to learn a second interface.

<p align="center">
  <img src="docs/readme-assets/gifs/journey.gif" alt="Journey Mode intro and current location result area" width="360" />
</p>

<details>
<summary>Journey Mode screenshots used in this preview</summary>

<br />

<p align="center"><img src="docs/readme-assets/screenshots/raw-5360.png" alt="Journey Mode introduction and Begin Journey Mode button" width="300" /></p>
<p align="center"><img src="docs/readme-assets/screenshots/raw-5361.png" alt="Journey Mode current location results area before enabling" width="300" /></p>

</details>

### 5. Save Parks

Saved Parks keeps selected places available after the user leaves the screen. The saved list shows how many places are saved, displays each saved park name, and gives direct open and remove actions.

<p align="center">
  <img src="docs/readme-assets/gifs/saved.gif" alt="Saved Parks screen with saved locations and open or remove actions" width="360" />
</p>

<details>
<summary>Saved Parks screenshot used in this preview</summary>

<br />

<p align="center"><img src="docs/readme-assets/screenshots/raw-5362.png" alt="Saved Parks screen" width="300" /></p>

</details>

## Feature: Where Are We? Mode

Where Are We? is the app's foreground GPS feature. It is designed for the moment a user wants to know what Native Land API records are associated with their current coordinates.

The mode:

- requests foreground location permission only when the user chooses to get coordinates;
- displays a loading compass while location data is being requested;
- shows coordinates directly in the button after a successful lookup;
- uses heading data to power an in-app compass when the device provides it;
- calls Native Land API with latitude and longitude;
- displays returned placenames, languages, territories, treaties, public resources, nearby records, and sources;
- keeps language and treaty wording consistent with park pages and Homepage sections.

The result is not a map replacement and not a legal boundary tool. It is a respectful coordinate-based learning mode that points users toward the records and sources available for where they are.

## Feature: Journey Mode

Journey Mode is the app's travel-aware GPS feature. It is built for movement: road trips, field visits, commutes, or any situation where a user crosses into an area that returns different Native Land API records.

The source code includes:

- Journey Mode start/stop flow;
- stored baseline context;
- background task registration with `expo-task-manager`;
- background location source with `expo-location`;
- local notification source with `expo-notifications`;
- comparison logic for changed Native Land context;
- persisted last-update state;
- web polling every 5 minutes while the tab is open;
- shared result rendering with Where Are We?.

Expo Go can show and test the foreground portions of this flow, but full background location and notification behavior is platform/build dependent. For final grading, this project documents the implemented source and can be provided as a development build so the instructor can test the native behavior that Expo Go may not fully run on iPhone.

## Feature: In-App Compass

The in-app compass appears in **Where Are We? Mode** and **Journey Mode**. It is built from React Native views, not a static image: a dark circular face, orange border, faint ivory crosshairs, orange needle, and ivory tail. The same visual language is also used for the fixed header's Jump To compass icon.

The compass uses `expo-location` heading updates through `Location.watchHeadingAsync` on native runtimes and a web-only `DeviceOrientationEvent` fallback when a browser provides tilting/orientation data. When heading data is available, the app rotates the compass by the inverse of the reported heading so the needle points north. If compass tilting is unavailable, the app says so clearly while still allowing coordinate lookups to work.

The compass does not need NPS API or Native Land API network data to calculate heading. It can work without API responses if the app is already running and the device/browser still provides heading or tilting sensor data, but support depends on platform permissions, hardware sensors, and browser/device behavior.

## How It Was Built

| Area | Implementation |
| --- | --- |
| Framework | Expo React Native with Expo Router |
| Language | TypeScript |
| Navigation | File-based tabs and dynamic routes |
| Styling | Shared theme constants, themed components, custom fonts, glass-style section surfaces |
| Fonts | League Spartan Bold for the app title, Aileron Regular and Italic for app text |
| Data | National Park Service API and Native Land API |
| GPS and compass | `expo-location` foreground location and heading data, plus web orientation fallback when available |
| Background task source | `expo-task-manager` |
| Notifications | `expo-notifications` local notification source |
| Local persistence | AsyncStorage and app context state |
| System events | React Native `AppState`, deep-link handling, and Journey Mode context-change state |

## Architecture Flow

```text
User
  -> Expo Router screens
  -> shared themed UI components
  -> service layer
  -> National Park Service API
  -> Native Land API
  -> normalized records
  -> Home, Search, park pages, Where Are We?, Journey Mode, and Saved Parks
```

```text
Where Are We?
  -> user taps Get My Coordinates
  -> app requests foreground location permission
  -> app gets latitude, longitude, and heading when available
  -> app requests Native Land coordinate data
  -> app displays records, nearby sovereignties, resource links, and source links
```

```text
Journey Mode
  -> user taps Begin Journey Mode
  -> app requests needed location/notification permissions
  -> app stores the current Native Land context as a baseline
  -> background task source checks future coordinates
  -> app compares returned context
  -> app schedules a local notification when context changes
```

## Data Sources and API Strategy

Defend the Parks uses two primary external data sources:

| Source | Used for |
| --- | --- |
| National Park Service API | Park and NPS-location records, names, designations, descriptions, images, image credits, activities, topics, weather notes, operating hours, entrance fees, passes, contacts, addresses, directions, and official URLs |
| Native Land API | Coordinate-based and place-based Indigenous language, territory, treaty, source, and available placename records |

The app currently calls these APIs from the Expo app for coursework/testing. For any public web deployment, client-side API keys should be treated as visible because static web bundles cannot keep secrets. A future backend would move protected API calls server-side and would be useful for caching responses, normalizing API data, and protecting rate limits.

## Native Land Context Approach

Native Land records can include overlapping, changing, and layered relationships to land. Defend the Parks handles that carefully:

- Records are described as returned Native Land records, not legal boundary determinations.
- Language records are shown before territories when available.
- Territories and treaties remain visible when returned.
- Placename records are their own section.
- Treaty sections identify returned agreements and link users toward further research without interpreting treaty terms.
- Native Land public resources and map tools are linked separately because they are broader tools, not always exact coordinate-returned records.
- Nearby Sovereignties are approximate and are based on sampled nearby points.

## UI, Styling, and Asset Credits

The app uses a night-forest palette:

| Token | Hex |
| --- | --- |
| Campfire Orange | `#aa5215` |
| Cedar Brown | `#66310c` |
| Pine Shadow | `#151e08` |
| Deep Pine | `#0b1406` |
| Night Black | `#04040c` |

Typography:

| Font | App use | Repo location |
| --- | --- | --- |
| League Spartan Bold | App title and README title image | `learning-react-native-app/assets/fonts/LeagueSpartan-Bold.otf` |
| Aileron Regular | Main body text | `learning-react-native-app/assets/fonts/Aileron-Regular.otf` |
| Aileron Italic | Emphasis/accent text | `learning-react-native-app/assets/fonts/Aileron-Italic.otf` |

Font license files should be kept beside the font files in `learning-react-native-app/assets/fonts/` for final submission once they are added.

Visual assets currently used by the app:

| Asset | App use |
| --- | --- |
| `maria-orlova-3UWc-EMf0zA-unsplash.jpg` | Main app background, photo by Maria Orlova on Unsplash |
| `evan-wise-2wvXI4mjYJ8-unsplash.jpg` | Where Are We? background, photo by Evan Wise on Unsplash |
| `evan-wise-mNSSpeJsnQA-unsplash.jpg` | Journey Mode background, photo by Evan Wise on Unsplash |
| `denise-jans-XCJt9Z3_0Ks-unsplash.jpg` | Web background for Home, Where Are We?, Search, state pages, park pages, and Saved Parks; photo by Denise Jans on Unsplash |
| `kyle-loftus-IG1m3RomhPI-unsplash.jpg` | Web background for Journey Mode; photo by Kyle Loftus on Unsplash |
| National Park Service API images | Park, gallery, featured-location, and profile images with NPS-provided credits shown in the app |

## Setup, API Keys, and Local Development

The Expo project lives in `learning-react-native-app`, so setup commands should run from that folder:

```bash
cd learning-react-native-app
npm install
npx expo start --clear
```

Create `learning-react-native-app/.env` with the required National Park Service and Native Land API variables used by the service layer. The variable names are defined in the API service files and should not be committed with real values.

Useful checks:

```bash
npm run lint
npx tsc --noEmit
```

## Testing, Grading, and Platform Notes

Testing so far has been focused on iPhone through the Expo workflow. That verifies the app shell, navigation, styling, NPS API display, Native Land API display, foreground coordinate lookup, heading/compass behavior when available, Saved Parks, Jump To, and manual Where Are We? results.

The Journey Mode source satisfies the implementation side of the background-location/notification requirement, but Expo Go can limit native background location and notification behavior on iPhone. For grading, the source is documented, and a development build can be provided so the instructor can test the native Journey Mode behavior outside Expo Go.

## Future Deployment Direction

The current app does not have a backend. A web version can be built from Expo and hosted as a static app on Cloudflare Pages. In that setup, the browser client can call NPS and Native Land directly, but any key included in the static client should be considered public.

Future iterations may add a backend running on a local iMac or another server. That backend would not be required for the current mobile app to function, but it would be the better architecture for protected API calls, response caching, request normalization, analytics, and future public web deployment polish.

Where Are We? and the foreground part of Journey Mode can work in a web preview when the browser grants geolocation permission. What is different is native background behavior: a browser tab can show current Journey Mode results while it is open, but it should not be described as equivalent to native mobile background tracking and local notifications after the app is backgrounded or closed.

## Final Project Requirement Map

The final project proof is documented in [`docs/FINAL_PROJECT_REQUIREMENTS.md`](docs/FINAL_PROJECT_REQUIREMENTS.md).

High-level requirement coverage:

| Requirement area | Where it is covered |
| --- | --- |
| External APIs | NPS API and Native Land API data are consumed and displayed throughout the app |
| Broadcast/system event behavior | AppState listener, deep-link route handling, and Journey Mode context-change state |
| GPS/location feature | Where Are We? and Journey Mode |
| Displayed API data | Home, Search, state pages, park pages, Where Are We?, Nearby Sovereignties, Journey Mode |
| Persistence | Saved Parks and Journey Mode stored state |
| Professional documentation | README and `/docs` folder |

## Documentation Map

| Document | Purpose |
| --- | --- |
| [`docs/FINAL_PROJECT_REQUIREMENTS.md`](docs/FINAL_PROJECT_REQUIREMENTS.md) | Instructor-facing requirement proof and grading checklist |
| [`docs/TECHNICAL_NOTES.md`](docs/TECHNICAL_NOTES.md) | Location, API, Journey Mode, notification, platform, and future deployment notes |
| [`docs/STYLE_RULES.md`](docs/STYLE_RULES.md) | App palette, typography, layout, copy tone, section styling, and asset rules |
| [`docs/TESTING_GUIDE.md`](docs/TESTING_GUIDE.md) | Manual test path for Expo/iPhone and grading review |

## License

Defend the Parks by mp3li is source-available for educational review, instructor evaluation, and early-access review only. It is not open source. Viewing and running the code locally for review is allowed with your own API keys, but copying, forking, redistributing, modifying, publishing, selling, or reusing the project without prior written permission from mp3li is not allowed. See [`LICENSE`](LICENSE).

## Screenshots and Credits

The top README GIF is built from all 23 iPhone screenshots captured during app testing. Feature GIFs are grouped by Homepage, Search, Where Are We?, Journey Mode, Saved Parks, and Jump To flows. Static README screenshots are copied into `docs/readme-assets/screenshots/` with descriptive filenames.

Park images and photo credits shown inside the app come from National Park Service API records. App background images are credited above for Maria Orlova, Evan Wise, Denise Jans, and Kyle Loftus on Unsplash.
