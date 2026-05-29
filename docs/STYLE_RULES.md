# Style Rules

These rules keep Defend the Parks by mp3li visually consistent as the app grows.

## Brand Name

- Use **Defend the Parks by mp3li** as the app name.
- Keep the fixed app title visible on every screen.
- Do not repeat the full app title as a large heading inside the first content card on Home.
- No page heading should be visually larger than the fixed app title.
- Use **Search** as the bottom navigation label for the state search flow.
- Use **Where Are We?** and **Journey Mode** for the location modes.

## Palette

Use the palette defined in `learning-react-native-app/constants/theme.ts`.

Core colors:

- Campfire: `#aa5215`
- Cedar: `#66310c`
- Pine: `#151e08`
- Deep Pine: `#0b1406`
- Night: `#04040c`
- Ivory neutral: `#f7efe2`

Rules:

- Use dark green/night colors for navigation structure.
- Use campfire/cedar as action and accent colors.
- Use Cedar `#66310c` for section headers across the app.
- Use Ivory `#f7efe2` for selected bottom navigation text/icons and app-title text.
- Use ivory only when contrast is needed for readable surfaces or text.
- Avoid returning to the previous Yosemite palette unless the theme is intentionally changed.

## Typography

Fonts:

- `LeagueSpartan-Bold.otf`: app title, page titles, section headers.
- `Aileron-Regular.otf`: body text, controls, labels.
- `Aileron-Italic.otf`: short emphasis only.

Rules:

- The fixed app title is the largest recurring text element.
- Page titles and section headers should be smaller than the app title.
- Body copy should stay compact and readable.
- Do not scale font size with viewport width.
- Preserve accessibility font scaling within the existing component limits.

## Layout

- Build mobile-first screens.
- Use `ResponsiveContainer` and `useResponsiveLayout` for spacing.
- Keep the global app header fixed at the top.
- Keep the tab bar fixed at the bottom.
- Place long-screen navigation in the **Jump To** compass menu.
- Use the Back strip only after the user leaves Home.
- Back should follow navigation history; Return to Homepage should go directly to Home.
- Keep page sections as separate glass surfaces.
- Do not put cards inside decorative cards.
- Do not put solid white subcards inside glass sections.
- Nested content inside a glass section should usually use plain `View` wrappers, spacing, dividers, and subheaders instead of additional surface backgrounds.
- Avoid large empty framed spaces at the top of screens.
- Content should scroll cleanly under the fixed header without jumpy layout changes.

## Backgrounds and Surfaces

- Use `ScreenBackground` for image backgrounds.
- Use the Maria Orlova image for the main app background.
- Use `evan-wise-2wvXI4mjYJ8-unsplash` for Where Are We?.
- Use `evan-wise-mNSSpeJsnQA-unsplash` for Journey Mode.
- Backgrounds should stay dimmed/glassy enough for text readability.
- Use shared glass surface styles from `components/screen-background.tsx`.
- Avoid section backgrounds that visually merge into the nav bars.
- Picture gallery entries should not create their own solid white card backgrounds inside the gallery section.

## Components

Use existing shared components:

- `ThemedText`
- `ThemedView`
- `AccessibleButton`
- `ResponsiveContainer`
- `ScreenBackground`
- `CollapsiblePreviewSection`
- `JourneyModePanel`
- `NationalParksPictureGallery`

Button rules:

- Primary action buttons use the same style as **Save This Park To My List**.
- Secondary actions should be visually quieter.
- Buttons need clear labels and accessibility hints when the result is not obvious.

Collapsible section rules:

- Use collapsible previews for long content sections after the featured park save button.
- National Parks Picture Gallery should show one park image in preview and more images when expanded.
- National Parks Picture Gallery should use the same flat section treatment everywhere it appears.
- Auto-collapse long sections while showing a preview.
- Do not show an expand arrow on short sections with nothing else to reveal.
- Do not measure content during scroll in a way that changes layout and causes jumps.

## Copy Tone

- Use plain, respectful language.
- Say records are "returned" or "connected to this location/profile" instead of claiming legal certainty.
- When discussing NPS results broadly, say "national parks and other locations serviced by the National Park Service, like historic sites, trails, memorials, battlefields, and monuments."
- Mention that Indigenous territories can overlap.
- Center language records first when Native Land returns them.
- Include territories and treaties when returned.
- Keep Placename Records as its own section under the Native Land overview.
- Use **Native Land Public Resources and Map Tools** for broader Native Land resource links.
- Use **Nearby Sovereignties** for nearby contextual records.
- Use **Journey Mode** for optional travel/background notifications.
- Do not imply the app tracks users without opt-in.

## Permissions

- Ask for location only when needed.
- Explain why the app needs location near the action.
- Journey Mode must remain opt-in.
- Notification and background permission requests should happen only when Journey Mode is enabled.
- Background behavior should be described honestly as platform/runtime dependent.

## Accessibility

- Interactive controls need accessibility roles.
- Links should use `accessibilityRole="link"`.
- Touch targets should follow the shared `AccessibleButton` sizing.
- Loading states must include text, not animation alone.
- Text should not overlap or clip at normal phone sizes.

## Documentation

- Keep `README.md` public-facing and instructor-friendly.
- Keep requirement proof in `docs/FINAL_PROJECT_REQUIREMENTS.md`.
- Keep implementation details in `docs/TECHNICAL_NOTES.md`.
- Keep manual verification steps in `docs/TESTING_GUIDE.md`.
- Add screenshots under `docs/screenshots/` using the placeholder filenames in README.
