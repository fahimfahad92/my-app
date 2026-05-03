# Improvement Plan — Implementation Status

Items are tracked per plan file. Update status as work is done.

**Status values:** `Not Started` · `In Progress` · `Done` · `Skipped`

---

## Weather — `weather_improvement_ideas_001.md`

### Phase 1 — Critical Fixes

| #   | Item                                                             | Status | Notes                                                                            |
|-----|------------------------------------------------------------------|--------|----------------------------------------------------------------------------------|
| 1.1 | Fix loose equality `==` in `WeatherCard.tsx:116`                 | Done   | `cityName === ""`                                                                |
| 1.2 | Add `logEvent` to `useEffect` dep array in `weather/page.tsx:31` | Done   | Added to both mount and city-add effects                                         |
| 1.3 | Replace bare `console.log` calls with `logger` in weather files  | Done   | `weather/page.tsx:87`, `WeatherCitySearchForm.tsx:33`; statsig files done before |
| 1.4 | Remove redundant double type cast in `route.ts:75,77`            | Done   | Single `errBody: ErrorResponse` then field access                                |
| 1.5 | Fix `useState<string[] \| []>` annotation in `weather/page.tsx`  | Done   | `useState<string[]>([])`                                                         |

### Phase 2 — Code Quality & Type Safety

| #   | Item                                                                      | Status | Notes                                                                                                                      |
|-----|---------------------------------------------------------------------------|--------|----------------------------------------------------------------------------------------------------------------------------|
| 2.1 | Remove duplicate `getArrayFromLocalStorage` from `LocalStorageHelper.tsx` | Done   | Shared with timezone 2.1                                                                                                   |
| 2.2 | Extract cache TTL and ISR values into named constants                     | Done   | `CACHE_TTL_MS`, `ISR_REVALIDATE_SECONDS` (and `CITY_NAME_PATTERN`) added to `weather-constants.ts`                         |
| 2.3 | Convert `statsig-event.jsx` and `statsig-provider.jsx` to TypeScript      | Done   | Shared with timezone 2.3; `EventMetadata` loosened to allow undefined; wrapper now filters undefined before Statsig call   |
| 2.4 | Add `WeatherEventMetadata` type for Statsig events                        | Done   | `WeatherEventName` + `WeatherEventMetadata` in `weather-types.ts`; used at both `logEvent` call sites in `weather/page.tsx` |
| 2.5 | Fix fragile date parsing in `WeatherDetail.tsx:41-43`                     | Done   | Switched to `localTimeEpoch` + `tzId` props; `Intl.DateTimeFormat` with `en-CA` derives `YYYY-MM-DD` in the city's timezone |
| 2.6 | Add client-side city name validation in `WeatherCitySearchForm`           | Done   | RHF `pattern` rule using shared `CITY_NAME_PATTERN`; inline error with `role="alert"`                                      |
| 2.7 | Remove commented-out `[key: string]: any` in `LineChartComponent.tsx:15`  | Done   | Removed from `CustomDotProps` in `weather-types.ts` (where the type lives)                                                 |
| 2.8 | Rename `weather-constants.tsx` → `weather-constants.ts`                   | Done   |                                                                                                                            |

### Phase 3 — Performance

| #   | Item                                                              | Status | Notes                                                                                                                               |
|-----|-------------------------------------------------------------------|--------|-------------------------------------------------------------------------------------------------------------------------------------|
| 3.1 | Add max size + eviction to `overviewCache` in `WeatherCard.tsx`   | Done   | Cap at 20; delete insertion-ordered oldest entry on overflow                                                                        |
| 3.2 | Guard Statsig page-view event with `hasFired` ref                 | Done   | Separated into its own effect with `hasFired` ref; fires exactly once                                                               |
| 3.3 | Consolidate cascading `useEffect` hooks in `weather/page.tsx`     | Done   | Init effect now has `[]` deps (no `logEvent`); Statsig event is its own effect; city-add effect unchanged                           |
| 3.4 | Fix stale `isSaved` state in `WeatherCard` when watchlist changes | Done   | `isSaved` moved to prop driven by `watchList` state in parent; `addToWatchList`/`removeFromWatchList` update state via `setWatchList` |
| 3.5 | Deduplicate in-flight requests for the same city                  | Done   | Module-level `pendingRequests` Map; second card awaits existing promise instead of firing a duplicate fetch                          |
| 3.6 | Fix timezone-unsafe time rendering in `LineChartComponent.tsx:44` | Done   | Replaced `new Date(timeString).toLocaleTimeString()` with direct `slice(11,16)` extraction — no browser-timezone conversion          |

### Phase 4 — UI / UX

| #    | Item                                                           | Status | Notes                                                                                                                       |
|------|----------------------------------------------------------------|--------|-----------------------------------------------------------------------------------------------------------------------------|
| 4.1  | Add "Last updated" timestamp to `WeatherCard`                  | Done   | Live "Updated X min ago" using `last_updated_epoch`; ticks every 60 s via `setInterval`                                    |
| 4.2  | Add Retry button in `WeatherDetail` on error                   | Done   | Error state now shows message + Retry button that re-calls `fetchData()`                                                    |
| 4.3  | Show inline validation feedback in search form                 | Done   | Implemented in Phase 2.6 (RHF pattern rule + inline `role="alert"` message)                                                |
| 4.4  | Clarify "Add to Watchlist" vs "Remove from Page" distinction   | Done   | X = dismiss from page (watchlist unchanged); bookmark toggles watchlist (BookmarkPlus / BookmarkMinus); Trash2 removed       |
| 4.5  | Show weather condition description text on card                | Done   | `condition.text` shown as small label below the weather icon                                                                |
| 4.6  | Add feels-like temperature and humidity to `WeatherCard`       | Done   | Secondary stats row: feels-like \| humidity \| wind (grouped with 4.11)                                                    |
| 4.7  | Add multi-day forecast tabs to `WeatherDetail`                 | Done   | Route now passes `days=3`; dialog shows Today/Tomorrow/Day-3 tab buttons; chart + astro update per selected tab             |
| 4.8  | Add empty state with prompt when no city searched              | Done   | Centered Cloud icon + hint text when `cities.length === 0`                                                                  |
| 4.9  | Limit watchlist/active cities with user feedback               | Done   | `MAX_CITIES = 10` in constants; toast.warning shown when cap is reached                                                     |
| 4.10 | Make card highlight animation opt-out for reduced-motion users | Done   | Scale class changed to `motion-safe:scale-[1.02]`                                                                          |
| 4.11 | Show wind speed and direction on card                          | Done   | `wind_kph` + `wind_dir` added alongside feels-like and humidity in the secondary stats row                                  |
| 4.12 | Improve responsive grid layout for wide screens                | Done   | Changed to `sm:grid-cols-2 lg:grid-cols-3 max-w-5xl` — prevents cards from stretching on 2K+ screens                       |

### Phase 5 — Advanced Features & Full UI/UX Redesign

> Server-side caching across users is **already done** — `route.ts` uses Next.js ISR (`revalidate: 300 s`).
> Phase 6 ideas merged here. `weather_improvement_ideas_002.md` is superseded by this file.

| #    | Item                                                      | Status       | Notes                                                                                         |
|------|-----------------------------------------------------------|--------------|-----------------------------------------------------------------------------------------------|
| 5.1  | Geolocation auto-detection on first visit                 | Done         | `navigator.geolocation` on first visit; lat,lon passed as city query; route allows coord format |
| 5.2  | Temperature unit toggle (°C / °F)                         | Done         | Toggle pill in page header; persisted to `localStorage["tempUnit"]`; prop drills to all cards  |
| 5.3  | Weather alerts and severe condition warnings              | Skipped      | Not available on WeatherAPI free plan                                                         |
| 5.4  | Offline support / stale-while-revalidate                  | Done         | `navigator.onLine` + online/offline events; yellow banner shown when offline                  |
| 5.5  | Shareable city watchlist URL                              | Done         | `useSearchParams`/`useRouter`; cities synced to `?cities=` URL param on change                |
| 5.6  | Keyboard shortcut `/` to focus search input               | Done         | `keydown` listener on document; `inputRef` prop on `WeatherCitySearchForm`                    |
| 5.7  | Server-side watchlist persistence for authenticated users | Out of Scope | Do not re-propose                                                                             |
| 5.8  | Unified `forecast.json?days=1` for the overview card      | Done         | OVERVIEW route now uses `forecast.json?days=1`; card gets max/min + rain chance for free       |
| 5.9  | Dynamic card backgrounds based on weather condition       | Done         | New `conditionUtils.ts`; condition-code → gradient + isDark flag; night override              |
| 5.10 | Redesigned card layout (hero temp, badges, icon strip)    | Done         | Hero 5xl temp; rain badge; icon strip (Droplets/Wind/Eye); 4-button footer row                |
| 5.11 | Drag-and-drop card reordering                             | Done         | HTML5 drag API on wrapper divs in `page.tsx`; `GripVertical` icon on each card                |
| 5.12 | City search autocomplete (`/search.json`)                 | Done         | New SEARCH route; debounced dropdown; arrow-key nav; Escape to close                          |
| 5.13 | Redesigned chart — `ComposedChart` area + rain bars       | Done         | `ComposedChart` with Area (temp), Area (feels-like dashed), Bar (rain%); dual Y-axis          |
| 5.14 | Horizontal hourly scroll strip (iOS-style)                | Done         | `HourlyStrip.tsx`; scrollable row; current-hour highlight; mini rain bar                      |
| 5.15 | Detail stats section — UV gauge, visibility, wind, precip | Done         | `DayStatsSection.tsx`; UV progress bar with color bands; 2×2 stat grid                        |
| 5.16 | Moon phase + illumination in astronomy section            | Done         | Emoji mapping in `conditionUtils.ts`; moon phase + illumination % in astro grid               |

---

## Timezone — `timezone_improvement_ideas_001.md`

### Phase 1 — Critical Fixes

| #   | Item                                                                | Status | Notes                                                            |
|-----|---------------------------------------------------------------------|--------|------------------------------------------------------------------|
| 1.1 | Fix unused `catch` variable in `ClockCard.tsx:25`                   | Done   |                                                                  |
| 1.2 | Add `logEvent` to `useEffect` dep array in `timezone/page.tsx:26`   | Done   | Also guarded initial-mount fire with `hasFired` ref (covers 3.5) |
| 1.3 | Replace bare `console.log` calls with `logger` in timezone files    | Done   | Covers statsig-event and statsig-provider too                    |
| 1.4 | Log errors in `ClockCard` catch block instead of silently returning | Done   |                                                                  |

### Phase 2 — Code Quality & Type Safety

| #   | Item                                                                      | Status | Notes                                                    |
|-----|---------------------------------------------------------------------------|--------|----------------------------------------------------------|
| 2.1 | Remove duplicate `getArrayFromLocalStorage` from `LocalStorageHelper.tsx` | Done   | Updated all call sites in weather files too              |
| 2.2 | Add TypeScript types for timezone domain objects                          | Done   | Created `src/app/timezone/types/index.ts`                |
| 2.3 | Convert `statsig-event.jsx` and `statsig-provider.jsx` to TypeScript      | Done   | Renamed to `.tsx`; fixed `waitForInitialization` removal |
| 2.4 | Wrap `addTimezone` and `removeTimezone` in `useCallback`                  | Done   |                                                          |
| 2.5 | Move `useDebounce` hook out of `TimezoneSelector.tsx`                     | Done   | Extracted to `src/app/hooks/useDebounce.ts`              |
| 2.6 | Rename `TIMEZONES.tsx` → `TIMEZONES.ts`                                   | Done   |                                                          |

### Phase 3 — Performance

| #   | Item                                              | Status | Notes                                                                                 |
|-----|---------------------------------------------------|--------|---------------------------------------------------------------------------------------|
| 3.1 | Memoize `ClockCard` with `React.memo`             | Done   | Changed `onRemove` signature so the prop ref is stable across renders                 |
| 3.2 | Memoize `ClockList` with `React.memo`             | Done   |                                                                                       |
| 3.3 | Memoize `highlight` helper in `TimezoneSelector`  | Done   | Hoisted regex via `useMemo`; wrapped highlight in `useCallback`; added regex escaping |
| 3.4 | Change clock update interval from 60 s → 1 s      | Done   | Display now includes seconds, justifying the 1 s tick                                 |
| 3.5 | Guard Statsig page-view event with `hasFired` ref | Done   | Implemented during Phase 1.2                                                          |

### Phase 4 — UI / UX

| #    | Item                                               | Status            | Notes                                                                                               |
|------|----------------------------------------------------|-------------------|-----------------------------------------------------------------------------------------------------|
| 4.1  | Display date alongside time in `ClockCard`         | Done              | Weekday + month + day, in same timezone                                                             |
| 4.2  | Show UTC offset in `ClockCard`                     | Done              | Computed via `Intl.DateTimeFormat` `shortOffset`                                                    |
| 4.3  | Improve empty state UX                             | Done              | Centered Clock icon + dashed border + hint text                                                     |
| 4.4  | Add drag-to-reorder for clock cards                | Done              | Native HTML5 drag API, no extra deps; `reorderTimezones` in page.tsx                                |
| 4.5  | Animate card entry and exit                        | Done (entry only) | `tw-animate-css` fade-in + slide-in-from-bottom; exit skipped (would need state machine or library) |
| 4.6  | Replace "Remove" text button with icon button      | Done              | Lucide `X` icon, top-right, opacity-0 → 100 on hover/focus                                          |
| 4.7  | Distinguish day-vs-night visually on each card     | Done              | `bg-sky-50` for 6am–6pm, `bg-slate-800` otherwise                                                   |
| 4.8  | Highlight user's local timezone with "Local" badge | Done              | Detected via `Intl.DateTimeFormat().resolvedOptions().timeZone`                                     |
| 4.9  | Add max-timezone guard with user feedback          | Done              | Soft cap at 12; warns via Sonner toast                                                              |
| 4.10 | Improve responsive layout for large screens        | Done              | `max-w-4xl` + `sm:grid-cols-2 md:grid-cols-3`                                                       |

### Phase 5 — Advanced Features

> **Items 5.1–5.5 are Out of Scope — do not re-propose in future plans.** Only 5.6+ are active.

| #   | Item                                                        | Status       | Notes                |
|-----|-------------------------------------------------------------|--------------|----------------------|
| 5.1 | Add time-difference calculator                              | Out of Scope | Do not re-propose    |
| 5.2 | Export/share timezone list via URL                          | Out of Scope | Do not re-propose    |
| 5.3 | Meeting time finder                                         | Out of Scope | Do not re-propose    |
| 5.4 | Replace static `TIMEZONES.ts` with `Intl.supportedValuesOf` | Out of Scope | Do not re-propose    |
| 5.5 | Persist timezone order server-side                          | Out of Scope | Do not re-propose    |
| 5.6 | Search timezones by country name OR timezone string         | Done         | All UN member states |
