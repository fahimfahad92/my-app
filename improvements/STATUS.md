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

| #   | Item                                                              | Status      | Notes |
|-----|-------------------------------------------------------------------|-------------|-------|
| 3.1 | Add max size + eviction to `overviewCache` in `WeatherCard.tsx`   | Not Started |       |
| 3.2 | Guard Statsig page-view event with `hasFired` ref                 | Not Started |       |
| 3.3 | Consolidate cascading `useEffect` hooks in `weather/page.tsx`     | Not Started |       |
| 3.4 | Fix stale `isSaved` state in `WeatherCard` when watchlist changes | Not Started |       |
| 3.5 | Deduplicate in-flight requests for the same city                  | Not Started |       |
| 3.6 | Fix timezone-unsafe time rendering in `LineChartComponent.tsx:44` | Not Started |       |

### Phase 4 — UI / UX

| #    | Item                                                           | Status      | Notes |
|------|----------------------------------------------------------------|-------------|-------|
| 4.1  | Add "Last updated" timestamp to `WeatherCard`                  | Not Started |       |
| 4.2  | Add Retry button in `WeatherDetail` on error                   | Not Started |       |
| 4.3  | Show inline validation feedback in search form                 | Not Started |       |
| 4.4  | Clarify "Add to Watchlist" vs "Remove from Page" distinction   | Not Started |       |
| 4.5  | Show weather condition description text on card                | Not Started |       |
| 4.6  | Add feels-like temperature and humidity to `WeatherCard`       | Not Started |       |
| 4.7  | Add multi-day forecast tabs to `WeatherDetail`                 | Not Started |       |
| 4.8  | Add empty state with prompt when no city searched              | Not Started |       |
| 4.9  | Limit watchlist/active cities with user feedback               | Not Started |       |
| 4.10 | Make card highlight animation opt-out for reduced-motion users | Not Started |       |
| 4.11 | Show wind speed and direction on card                          | Not Started |       |
| 4.12 | Improve responsive grid layout for wide screens                | Not Started |       |

### Phase 5 — Advanced Features

| #   | Item                                                      | Status      | Notes |
|-----|-----------------------------------------------------------|-------------|-------|
| 5.1 | Geolocation auto-detection on first visit                 | Not Started |       |
| 5.2 | Temperature unit toggle (°C / °F)                         | Not Started |       |
| 5.3 | Weather alerts and severe condition warnings              | Not Started |       |
| 5.4 | Offline support / stale-while-revalidate                  | Not Started |       |
| 5.5 | Shareable city watchlist URL                              | Not Started |       |
| 5.6 | Keyboard shortcut to focus search input                   | Not Started |       |
| 5.7 | Server-side watchlist persistence for authenticated users | Not Started |       |

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
