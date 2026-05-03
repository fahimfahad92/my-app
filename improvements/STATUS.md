# Improvement Plan — Implementation Status

Items are tracked per plan file. Update status as work is done.

**Status values:** `Not Started` · `In Progress` · `Done` · `Skipped`

---

## Weather — `weather_improvement_ideas_001.md`

### Phase 1 — Critical Fixes

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1.1 | Fix loose equality `==` in `WeatherCard.tsx:116` | Not Started | |
| 1.2 | Add `logEvent` to `useEffect` dep array in `weather/page.tsx:31` | Not Started | |
| 1.3 | Replace bare `console.log` calls with `logger` in weather files | Not Started | |
| 1.4 | Remove redundant double type cast in `route.ts:75,77` | Not Started | |
| 1.5 | Fix `useState<string[] \| []>` annotation in `weather/page.tsx` | Not Started | |

### Phase 2 — Code Quality & Type Safety

| # | Item | Status | Notes |
|---|------|--------|-------|
| 2.1 | Remove duplicate `getArrayFromLocalStorage` from `LocalStorageHelper.tsx` | Not Started | Shared with timezone 2.1 |
| 2.2 | Extract cache TTL and ISR values into named constants | Not Started | |
| 2.3 | Convert `statsig-event.jsx` and `statsig-provider.jsx` to TypeScript | Not Started | Shared with timezone 2.3 |
| 2.4 | Add `WeatherEventMetadata` type for Statsig events | Not Started | |
| 2.5 | Fix fragile date parsing in `WeatherDetail.tsx:41-43` | Not Started | |
| 2.6 | Add client-side city name validation in `WeatherCitySearchForm` | Not Started | |
| 2.7 | Remove commented-out `[key: string]: any` in `LineChartComponent.tsx:15` | Not Started | |
| 2.8 | Rename `weather-constants.tsx` → `weather-constants.ts` | Not Started | |

### Phase 3 — Performance

| # | Item | Status | Notes |
|---|------|--------|-------|
| 3.1 | Add max size + eviction to `overviewCache` in `WeatherCard.tsx` | Not Started | |
| 3.2 | Guard Statsig page-view event with `hasFired` ref | Not Started | |
| 3.3 | Consolidate cascading `useEffect` hooks in `weather/page.tsx` | Not Started | |
| 3.4 | Fix stale `isSaved` state in `WeatherCard` when watchlist changes | Not Started | |
| 3.5 | Deduplicate in-flight requests for the same city | Not Started | |
| 3.6 | Fix timezone-unsafe time rendering in `LineChartComponent.tsx:44` | Not Started | |

### Phase 4 — UI / UX

| # | Item | Status | Notes |
|---|------|--------|-------|
| 4.1 | Add "Last updated" timestamp to `WeatherCard` | Not Started | |
| 4.2 | Add Retry button in `WeatherDetail` on error | Not Started | |
| 4.3 | Show inline validation feedback in search form | Not Started | |
| 4.4 | Clarify "Add to Watchlist" vs "Remove from Page" distinction | Not Started | |
| 4.5 | Show weather condition description text on card | Not Started | |
| 4.6 | Add feels-like temperature and humidity to `WeatherCard` | Not Started | |
| 4.7 | Add multi-day forecast tabs to `WeatherDetail` | Not Started | |
| 4.8 | Add empty state with prompt when no city searched | Not Started | |
| 4.9 | Limit watchlist/active cities with user feedback | Not Started | |
| 4.10 | Make card highlight animation opt-out for reduced-motion users | Not Started | |
| 4.11 | Show wind speed and direction on card | Not Started | |
| 4.12 | Improve responsive grid layout for wide screens | Not Started | |

### Phase 5 — Advanced Features

| # | Item | Status | Notes |
|---|------|--------|-------|
| 5.1 | Geolocation auto-detection on first visit | Not Started | |
| 5.2 | Temperature unit toggle (°C / °F) | Not Started | |
| 5.3 | Weather alerts and severe condition warnings | Not Started | |
| 5.4 | Offline support / stale-while-revalidate | Not Started | |
| 5.5 | Shareable city watchlist URL | Not Started | |
| 5.6 | Keyboard shortcut to focus search input | Not Started | |
| 5.7 | Server-side watchlist persistence for authenticated users | Not Started | |

---

## Timezone — `timezone_improvement_ideas_001.md`

### Phase 1 — Critical Fixes

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1.1 | Fix unused `catch` variable in `ClockCard.tsx:25` | Not Started | |
| 1.2 | Add `logEvent` to `useEffect` dep array in `timezone/page.tsx:26` | Not Started | |
| 1.3 | Replace bare `console.log` calls with `logger` in timezone files | Not Started | |
| 1.4 | Log errors in `ClockCard` catch block instead of silently returning | Not Started | |

### Phase 2 — Code Quality & Type Safety

| # | Item | Status | Notes |
|---|------|--------|-------|
| 2.1 | Remove duplicate `getArrayFromLocalStorage` from `LocalStorageHelper.tsx` | Not Started | Shared with weather 2.1 |
| 2.2 | Add TypeScript types for timezone domain objects | Not Started | |
| 2.3 | Convert `statsig-event.jsx` and `statsig-provider.jsx` to TypeScript | Not Started | Shared with weather 2.3 |
| 2.4 | Wrap `addTimezone` and `removeTimezone` in `useCallback` | Not Started | |
| 2.5 | Move `useDebounce` hook out of `TimezoneSelector.tsx` | Not Started | |
| 2.6 | Rename `TIMEZONES.tsx` → `TIMEZONES.ts` | Not Started | |

### Phase 3 — Performance

| # | Item | Status | Notes |
|---|------|--------|-------|
| 3.1 | Memoize `ClockCard` with `React.memo` | Not Started | |
| 3.2 | Memoize `ClockList` with `React.memo` | Not Started | |
| 3.3 | Memoize `highlight` helper in `TimezoneSelector` | Not Started | |
| 3.4 | Change clock update interval from 60 s → 1 s | Not Started | |
| 3.5 | Guard Statsig page-view event with `hasFired` ref | Not Started | |

### Phase 4 — UI / UX

| # | Item | Status | Notes |
|---|------|--------|-------|
| 4.1 | Display date alongside time in `ClockCard` | Not Started | |
| 4.2 | Show UTC offset in `ClockCard` | Not Started | |
| 4.3 | Improve empty state UX | Not Started | |
| 4.4 | Add drag-to-reorder for clock cards | Not Started | |
| 4.5 | Animate card entry and exit | Not Started | |
| 4.6 | Replace "Remove" text button with icon button | Not Started | |
| 4.7 | Distinguish day-vs-night visually on each card | Not Started | |
| 4.8 | Highlight user's local timezone with "Local" badge | Not Started | |
| 4.9 | Add max-timezone guard with user feedback | Not Started | |
| 4.10 | Improve responsive layout for large screens | Not Started | |

### Phase 5 — Advanced Features

| # | Item | Status | Notes |
|---|------|--------|-------|
| 5.1 | Add time-difference calculator | Not Started | |
| 5.2 | Export/share timezone list via URL | Not Started | |
| 5.3 | Meeting time finder | Not Started | |
| 5.4 | Replace static `TIMEZONES.ts` with `Intl.supportedValuesOf` | Not Started | |
| 5.5 | Persist timezone order server-side | Not Started | |
