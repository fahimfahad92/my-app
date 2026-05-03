# Weather Feature — Improvement Ideas 001

**Feature:** Weather App (`/weather`)  
**Date:** 2026-04-25  
**Status:** Planning only — nothing implemented

---

## Current State Summary

The weather feature lets users search cities, view current conditions on cards, and open a forecast dialog with an hourly temperature chart. A watchlist is persisted in localStorage. The API route (`/api/data/weather`) proxies WeatherAPI with ISR caching at 300 s. Key components: `WeatherCard`, `WeatherDetail`, `WeatherCitySearchForm`, `LineChartComponent`, `Skeletons`, plus a module-level in-memory cache with a 2-minute TTL.

---

## Phase 1 — Critical Fixes (Lint & Correctness)

These are blocking issues to resolve before any new work.

### 1.1 Fix loose equality operator in `WeatherCard.tsx`
- **File:** `src/app/weather/component/WeatherCard.tsx:116`
- **Issue:** `cityName == ""` uses loose equality — ESLint `eqeqeq` / TypeScript best practice violation
- **Fix:** Replace with `cityName === ""`

### 1.2 Fix missing `logEvent` in `useEffect` dependency array in `page.tsx`
- **File:** `src/app/weather/page.tsx:31`
- **Issue:** `logEvent` is called inside the mount effect but is absent from the `[]` dependency array — React Hook warning, same pattern as the timezone page
- **Fix:** Add `logEvent` to the dependency array; because `logEvent` is stable (wrapped in `useCallback` inside the hook) this is safe and correct

### 1.3 Replace all unguarded `console.log` calls with the logger utility
- **Files:**
  - `src/app/weather/page.tsx:87` — `console.log("City updated for " + updatedCity)`
  - `src/app/weather/component/WeatherCitySearchForm.tsx:33` — `console.log("Searched city ${val}")`
  - `src/components/statsig-event.jsx:9` — `console.log("Logging event: ", eventName)`
  - `src/app/providers/statsig-provider.jsx:25` — `console.log("Statsig user:", newUser)`
- **Fix:** Replace all four with `logger.log(...)` so they are suppressed in production

### 1.4 Remove the redundant double type cast in `route.ts`
- **File:** `src/app/api/data/weather/route.ts:75,77`
- **Issue:** `(errorResponse as ErrorResponse)?.error?.code` is cast twice on consecutive lines — redundant and noisy
- **Fix:** Assign `const errBody = errorResponse as ErrorResponse` once, then reference `errBody.error.code` and `errBody.error.message`

### 1.5 Fix the redundant `string[] | []` type annotation in `page.tsx`
- **File:** `src/app/weather/page.tsx`
- **Issue:** `useState<string[] | []>([])` — `[]` is already assignable to `string[]`; the union is meaningless and confusing
- **Fix:** Change to `useState<string[]>([])`

---

## Phase 2 — Code Quality & Type Safety

Refactoring and cleanup that improves maintainability without changing behavior.

### 2.1 Remove the duplicate `getArrayFromLocalStorage` function
- **File:** `src/app/util/LocalStorageHelper.tsx`
- **Issue:** `getArrayFromLocalStorage<T>()` and `getFromLocalStorage<T>()` are byte-for-byte identical; the weather page uses `getArrayFromLocalStorage` while the timezone page uses `getFromLocalStorage`
- **Fix:** Delete `getArrayFromLocalStorage`, update all weather call sites to use `getFromLocalStorage`

### 2.2 Extract cache TTL and ISR revalidation values into named constants
- **Files:**
  - `src/app/weather/component/WeatherCard.tsx` — `2 * 60 * 1000` is the cache TTL (magic number)
  - `src/app/api/data/weather/route.ts` — `revalidate: 300` is the ISR TTL (magic number)
- **Fix:** Add `CACHE_TTL_MS = 2 * 60 * 1000` and `ISR_REVALIDATE_SECONDS = 300` to `src/app/weather/constants/weather-constants.tsx` and reference them in both files

### 2.3 Convert `statsig-event.jsx` and `statsig-provider.jsx` to TypeScript
- **Files:** `src/components/statsig-event.jsx`, `src/app/providers/statsig-provider.jsx`
- **Issue:** Plain `.jsx` — no type safety for event names, metadata shape, or Statsig user
- **Fix:** Rename to `.tsx`, add `EventMetadata` and `StatsigUser` interfaces

### 2.4 Add a `WeatherEventMetadata` type for Statsig events
- **Location:** `src/app/weather/types/weather-types.ts` or a new `src/app/weather/types/events.ts`
- **Issue:** The `logEvent` call in `page.tsx` passes a plain object literal — no type check on event names or metadata shape
- **Fix:** Define `type WeatherEventName = "myapp_pv_weather"` and `interface WeatherEventMetadata { page: string; city?: string; action?: string }`, import in page.tsx

### 2.5 Tighten the fragile date parsing in `WeatherDetail.tsx`
- **File:** `src/app/weather/component/WeatherDetail.tsx:41-43`
- **Issue:** The code assumes `localDate` is either a string with a space separator or an ISO date; if the format changes, date parsing silently produces `NaN`
- **Fix:** Use a single reliable parse path — pass the `localtime_epoch` (already in `WeatherResponse`) through to `WeatherDetail` and construct the date from epoch instead of parsing a locale string

### 2.6 Add client-side city name validation in `WeatherCitySearchForm`
- **File:** `src/app/weather/component/WeatherCitySearchForm.tsx`
- **Issue:** The server regex (`/^[a-zA-Z\s\-.]{1,64}$/`) runs after a full round-trip; invalid input (numbers, special chars) causes a server error before the user gets any feedback
- **Fix:** Mirror the same regex as a `react-hook-form` `validate` rule, showing an inline error message immediately without a server call

### 2.7 Remove commented-out `[key: string]: any` prop in `LineChartComponent`
- **File:** `src/app/weather/component/LineChartComponent.tsx:15`
- **Issue:** Left-over commented-out code signals an incomplete type definition
- **Fix:** Either complete the `CustomDotProps` interface or remove the comment entirely

### 2.8 Rename `weather-constants.tsx` to `weather-constants.ts`
- **File:** `src/app/weather/constants/weather-constants.tsx`
- **Issue:** No JSX in this file — `.tsx` extension is misleading
- **Fix:** Rename to `weather-constants.ts`

---

## Phase 3 — Performance

Targeted optimizations to reduce unnecessary work and API calls.

### 3.1 Add a maximum size and automatic eviction to the `overviewCache`
- **File:** `src/app/weather/component/WeatherCard.tsx`
- **Issue:** `overviewCache` is a module-level `Map` with no size cap or eviction policy; if the user searches many cities, stale entries accumulate in memory indefinitely
- **Fix:** Cap the cache at N entries (e.g., 20); on insertion, if the map is at capacity, delete the oldest entry (insertion-ordered Map makes this O(1))

### 3.2 Skip the Statsig page-view event on re-renders caused by localStorage load
- **File:** `src/app/weather/page.tsx`
- **Issue:** `logEvent("myapp_pv_weather", ...)` fires inside the mount effect, which also sets city state — both fire in the same effect, meaning the event fires before watchlist data is ready
- **Fix:** Separate the localStorage load into a dedicated mount effect; fire the Statsig event in a separate effect with an `hasFired` ref guard, matching the pattern recommended for the timezone page (Phase 3.5 in timezone plan)

### 3.3 Consolidate cascading `useEffect` hooks in `page.tsx`
- **File:** `src/app/weather/page.tsx`
- **Issue:** There are 3+ `useEffect` hooks whose dependency chains overlap, causing unnecessary sequential renders on mount
- **Fix:** Audit all effects; consolidate where side effects are logically coupled; use a single load effect for initialization

### 3.4 Guard the watchlist status check against stale closure in `WeatherCard`
- **File:** `src/app/weather/component/WeatherCard.tsx:100`
- **Issue:** The `isSaved` state is computed in a `useEffect` that only re-runs on `cityName` change; if the parent adds or removes the city from the watchlist while the card is mounted, the card's save icon does not update
- **Fix:** Add a custom event or callback prop (`onWatchlistChange`) to allow the parent to notify cards when the watchlist changes, or derive `isSaved` directly from a prop passed down from page state

### 3.5 Deduplicate in-flight requests for the same city
- **File:** `src/app/weather/component/WeatherCard.tsx`
- **Issue:** If two `WeatherCard` instances for the same city mount simultaneously (e.g., on page refresh), both can fire API requests before either populates the cache
- **Fix:** Add a pending-requests `Map<string, Promise>` alongside the cache; if a request for a city is already in-flight, await the existing Promise rather than starting a new one

### 3.6 Use `date-fns` or `Temporal` API for timezone-safe time rendering in `LineChartComponent`
- **File:** `src/app/weather/component/LineChartComponent.tsx:44`
- **Issue:** `new Date(timeString)` parses the forecast hour string using the browser's local timezone, not the city's timezone — if the user is in a different timezone, chart labels can be off by hours
- **Fix:** Pass the city's `tz_id` into the chart and use `toLocaleTimeString` with `{ timeZone: tz_id }` for formatting, or use a timezone-aware parsing library

---

## Phase 4 — UI / UX Improvements

Visual and interaction improvements to make the feature feel polished.

### 4.1 Add a "Last updated" timestamp to each `WeatherCard`
- **Current:** No indication of data freshness; users cannot tell if the displayed conditions are current
- **Improvement:** Show a small "Updated X min ago" line using the `localtime_epoch` from the API response, updated every minute via a `setInterval`
- **Value:** Builds user trust and communicates the 2-minute client cache behavior transparently

### 4.2 Add a Retry button in `WeatherDetail` on error
- **Current:** If the forecast fetch fails, the dialog shows no recovery path
- **Improvement:** Display an error message with a "Retry" button that re-triggers `fetchData()`
- **Value:** Users can recover from transient network errors without closing and reopening the dialog

### 4.3 Add client-side input validation feedback in the search form
- **Current:** Invalid city names (numbers, emoji, long strings) fail silently or return a server error
- **Improvement:** Show an inline validation message below the input field immediately, using the same regex as the server (`/^[a-zA-Z\s\-.]{1,64}$/`)
- **Value:** Faster feedback loop, fewer wasted API calls (covered at code level in Phase 2.6, but the UI message is the user-facing part)

### 4.4 Clarify the "Add to Watchlist" vs "Remove from Page" button distinction
- **Current:** Each card has both a trash icon (removes from page) and a bookmark/star (adds to watchlist) — the difference between "remove from current view" and "save to watchlist" is not immediately obvious
- **Improvement:** Add tooltip labels on hover (`title` attribute or a Tooltip primitive); add visual differentiation (bookmark icon for watchlist, X for dismiss)
- **Value:** Reduces user confusion about data persistence

### 4.5 Show a weather condition description on the card
- **Current:** `WeatherCard` shows the weather icon but not the condition text (e.g., "Partly cloudy")
- **Improvement:** Display `current.condition.text` as a small label below the icon
- **Value:** Accessible and useful when icons are ambiguous (many weather icons look similar)

### 4.6 Add feels-like temperature and humidity to `WeatherCard`
- **Current:** Only `temp_c` is shown; `feelslike_c` and `humidity` are available in the API response and already typed in `weather-types.ts` (currently commented-out)
- **Improvement:** Show "Feels like X°" and humidity % in a secondary row beneath the main temperature
- **Value:** These are the two most commonly requested weather data points after current temperature

### 4.7 Add a multi-day forecast tab to `WeatherDetail`
- **Current:** The detail dialog shows only today's hourly chart; the WeatherAPI `forecast.json` endpoint already returns up to 3 forecast days (depending on plan)
- **Improvement:** Add tabs ("Today / Tomorrow / Day 3") at the top of the dialog; each tab shows that day's hourly chart, max/min, and astro data
- **Value:** Significantly increases the utility of the detail view

### 4.8 Add an empty state with a prompt when no city has been searched yet
- **Current:** The page loads to a blank grid with no guidance
- **Improvement:** Show a centered placeholder ("Search for a city above to see its current weather") with a weather icon, similar to the timezone empty state
- **Value:** Orients new users; consistent pattern across both features

### 4.9 Limit watchlist/active cities with user feedback
- **Current:** Users can add unlimited cities; with many cards the page becomes unwieldy and the number of concurrent API requests grows
- **Improvement:** Enforce a soft cap (e.g., 10 cities) with a toast notification explaining the limit
- **Value:** Keeps the UI usable; protects against excessive parallel fetches

### 4.10 Make the card highlight animation opt-out for reduced-motion users
- **File:** `src/app/weather/component/WeatherCard.tsx`
- **Current:** New card entry triggers a 2-second scale/color highlight animation unconditionally
- **Improvement:** Wrap the animation in a `prefers-reduced-motion` media query check (via the `useReducedMotion` pattern or Tailwind's `motion-safe:` variant)
- **Value:** Accessibility compliance; follows WCAG 2.1 guideline 2.3

### 4.11 Show wind speed and direction on the card (expandable)
- **Current:** Wind data is available in the API response (`wind_kph`, `wind_dir`) but not displayed
- **Improvement:** Add a collapsible "more info" row or a second face on the card with wind + UV index
- **Value:** Rounds out the card as a useful at-a-glance weather summary

### 4.12 Improve responsive grid layout
- **Current:** The grid uses `lg:grid-cols-3`; on very wide screens (2 K+) cards stretch to fill large columns
- **Improvement:** Set a max card width (`max-w-sm` per card) and use `auto-fill` with `minmax` in the grid instead of fixed column count, so cards stay a reasonable size on all screen widths

---

## Phase 5 — Advanced Features & Full UI/UX Redesign

Merged from the original Phase 5 and the Phase 6 redesign plan. Items are ordered by recommended implementation sequence.

> **Server-side caching is already implemented.** `route.ts` uses Next.js ISR (`{next: {revalidate: 300}}`), which caches each upstream WeatherAPI response at the server for 5 minutes. Any two users fetching the same city within that window share the cached response — no extra work needed.

---

### 5.1 Geolocation auto-detection on first visit
- Prompt for location permission via the browser Geolocation API; if granted, auto-search the user's current city
- Show a dismissible banner: "Showing weather for your current location"
- **Effort:** M

### 5.2 Temperature unit toggle (°C / °F)
- Small toggle pill in the page header (`°C · °F`), persisted to localStorage key `"tempUnit"`
- Pass `unit: "C" | "F"` prop down to `WeatherCard`, `WeatherDetail`, `LineChartComponent`; each picks `temp_c` vs `temp_f` — both are always returned by the API, no re-fetch needed
- **Files:** `weather/page.tsx`, `WeatherCard.tsx`, `WeatherDetail.tsx`, `LineChartComponent.tsx`
- **Effort:** S

### 5.3 Weather alerts and severe condition warnings
- WeatherAPI's `/alerts.json` endpoint returns active weather alerts by region
- Surface alerts as a dismissible banner or a red/amber badge on the card border
- **Note:** Free-plan alert coverage is limited; verify availability before implementing and skip if unavailable
- **Effort:** M

### 5.4 Offline support / stale-while-revalidate
- Cache the last-known API response per city in localStorage with a timestamp
- If the user is offline, show the cached data with a "Showing cached data from X ago" notice instead of an error
- **Effort:** M

### 5.5 Shareable city watchlist URL
- Encode the active city list as a query string (e.g. `/weather?cities=dhaka,london,new-york`)
- On load, if the param exists, initialize `cities` from it (merged with or in place of localStorage)
- **Effort:** S

### 5.6 Keyboard shortcut `/` to focus the search input
- Attach a `keydown` listener on `document` in `weather/page.tsx`; when `event.key === "/"` and the focused element is not an input/textarea, call `event.preventDefault()` and focus the search input ref
- Show a subtle `/` hint pill at the right edge of the input
- **Files:** `weather/page.tsx`, `WeatherCitySearchForm.tsx`
- **Effort:** XS

### 5.7 Server-side watchlist persistence for authenticated users
> **Out of Scope — do not re-propose.**

---

### 5.8 Unified `forecast.json?days=1` for the overview card

- **Problem:** `WeatherCard` currently calls `current.json`, which has no forecast data — today's max/min temp, chance of rain, and UV index are unavailable on the card.
- **Fix:** Change the `OVERVIEW` route branch to call `forecast.json?days=1` instead of `current.json`. This endpoint returns **both** `current` (identical to `current.json`) and `forecast.forecastday[0]` in a single response — giving the card today's forecast for free with no extra call.
- Extend `WeatherResponse` type to include an optional `forecast` field containing today's `ForecastDay`.
- **Files:** `route.ts`, `weather-constants.ts`, `weather-types.ts`, `WeatherCard.tsx`
- **Effort:** M

### 5.9 Dynamic card backgrounds based on weather condition

Replace static white cards with condition-aware gradients from `current.condition.code` + `current.is_day`.

| Group | Codes | Day gradient | Text |
|-------|-------|-------------|------|
| Sunny / Clear | 1000 | `from-amber-300 to-yellow-200` | dark |
| Partly cloudy | 1003 | `from-sky-400 to-blue-200` | dark |
| Cloudy / Overcast / Mist | 1006, 1009, 1030, 1135, 1147 | `from-slate-400 to-slate-300` | dark |
| Rain (all variants) | 1063, 1150–1201, 1240–1246 | `from-blue-700 to-indigo-400` | white |
| Snow (all variants) | 1066, 1114, 1117, 1210–1225, 1255–1258 | `from-sky-200 to-slate-100` | dark |
| Sleet / Freezing rain | 1072, 1168, 1171, 1204, 1207, 1249, 1252 | `from-cyan-600 to-slate-400` | white |
| Thunder | 1087, 1273–1282 | `from-slate-800 to-violet-700` | white |

Night override (`is_day === 0`): all conditions → `from-slate-900 to-blue-950`, white text.

Extract a `getConditionStyle(code: number, isDay: number): { gradient: string; isDark: boolean }` helper to `src/app/weather/utils/conditionUtils.ts`. Card text colours (`text-gray-900` vs `text-white`) toggle on `isDark`.

- **Files:** `WeatherCard.tsx`, new `src/app/weather/utils/conditionUtils.ts`
- **Effort:** S

### 5.10 Redesigned card layout

Replaces the current generic label/value stack. Requires 5.8 for max/min and rain badge.

```
┌─────────────────────────────────────┐
│  London                  [🌧 60%]  │  ← city name + rain-chance badge (shown if ≥30%)
│  United Kingdom                     │
│                                     │
│         🌧  Moderate rain           │  ← icon w-20 h-20, condition text
│                                     │
│             18°C                    │  ← hero temperature (text-5xl)
│        Feels like 15°C              │
│                                     │
│   H:22°  L:14°  ·  Asia/Kolkata     │  ← daily max/min + timezone (one muted line)
│                                     │
│   💧42%    💨24 NW    👁10km        │  ← icon-row: Droplets · Wind · Eye (value only)
│                                     │
│   Updated 3 min ago                 │
├─────────────────────────────────────┤
│    🔄       📋       ✕      🔖     │  ← 4 buttons, equal-width row
└─────────────────────────────────────┘
```

Key changes vs current:
- Weather icon `w-14` → `w-20 h-20`
- Temperature `text-3xl` → `text-5xl`
- Stat strip uses Lucide `Droplets`, `Wind`, `Eye` — icon + value, no label text
- Rain-chance badge (pill, top-right) when `daily_chance_of_rain >= 30`
- Daily max/min from 5.8 data
- **Files:** `WeatherCard.tsx`
- **Effort:** S (after 5.8)

### 5.11 Drag-and-drop card reordering

HTML5 drag-API pattern — same implementation as `ClockList.tsx` in the timezone feature.

- Add `reorderCities(from: number, to: number)` in `weather/page.tsx`
- Persist display order to localStorage key `"cityOrder"` (applied on mount after loading watchlist)
- Each card wrapper: `draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd`
- A `dragOverIndex` state renders a 2 px blue insertion line between cards while dragging
- `GripVertical` Lucide icon, top-left of each card, `opacity-0 group-hover:opacity-100`
- **Files:** `weather/page.tsx`, `WeatherCard.tsx`
- **Effort:** S

### 5.12 City search autocomplete using WeatherAPI `/search.json`

Replace the plain text input with a live autocomplete dropdown.

- New route branch: `type=SEARCH` → calls `search.json?q=<input>` upstream
- Response type: `SearchResult[] = { id, name, region, country, lat, lon }`
- In `WeatherCitySearchForm`: debounce 300 ms, fetch on each keystroke, show ≤5 results in a dropdown
- Each row: `<name>, <region>, <country>` — click or Enter to select
- Keyboard: ↑↓ to navigate list, Escape to close
- Empty state: "No cities found" when API returns `[]`
- Retain existing RHF pattern validation as fallback for free-typed (no-selection) submit
- **Files:** `WeatherCitySearchForm.tsx`, `route.ts`, `weather-constants.ts`, `weather-types.ts`
- **Effort:** M

### 5.13 Redesigned hourly chart — `ComposedChart` with area + precipitation bars

Replace `LineChart` in `LineChartComponent.tsx` with a richer `ComposedChart` from recharts.

- `Area` for temperature — smooth curve with `<linearGradient>` fill (`rgba(59,130,246,0.6)` → transparent)
- `Bar` for `chance_of_rain` % — semi-transparent blue, right Y-axis (0–100%), hidden when 0
- Two `YAxis`: left = temperature, right = rain probability
- X-axis labels every 3rd hour to avoid crowding
- Richer tooltip: time · temp · feels-like · rain % · wind speed
- Accepts `unit: "C" | "F"` prop (from 5.2) to pick the correct temperature field
- `TemperatureDataPoint` type gains `chance_of_rain: number` and `feelslike_c: number`
- **Files:** `LineChartComponent.tsx`, `weather-types.ts`, `WeatherDetail.tsx`
- **Effort:** M

### 5.14 Horizontal hourly scroll strip (iOS Weather-style)

A compact scrollable row placed **above** the chart inside `WeatherDetail`, showing all 24 hours at a glance.

Each column shows:
```
  2PM
  🌧
  19°
  ████  60%   ← bar height proportional to chance_of_rain
```

- `flex overflow-x-auto gap-2 py-2` — no extra dependencies
- Current hour highlighted: `ring-2 ring-blue-400 rounded-lg bg-blue-50`
- Data from the same `forecastday.hour` array already fetched — zero extra API calls
- **Files:** new `HourlyStrip.tsx`, `WeatherDetail.tsx`
- **Effort:** S

### 5.15 Detail view stats section — UV index, day summary, visibility

Adds a stats grid between the astronomy section and the hourly chart.

**UV index — colour-coded progress bar:**
```
UV 7  ████████──  High
```
Bands: 0–2 green · 3–5 yellow · 6–7 orange · 8–10 red · 11+ violet. Source: `forecastday.day.uv`.

**Day summary 2×2 grid:**
| Stat | Icon | Field |
|------|------|-------|
| Avg Humidity | `Droplets` | `day.avghumidity` |
| Avg Visibility | `Eye` | `day.avgvis_km` km |
| Max Wind | `Wind` | `day.maxwind_kph` kph |
| Total Precip | `CloudRain` | `day.totalprecip_mm` mm |

Uncomment the corresponding fields in the `DaySummary` type in `weather-types.ts`.

- **Files:** new `DayStatsSection.tsx`, `WeatherDetail.tsx`, `weather-types.ts`
- **Effort:** S

### 5.16 Moon phase and illumination in the astronomy section

Extends the existing sunrise/sunset/moonrise/moonset grid with two new rows.

- `moon_phase` (e.g. "Waxing Crescent") displayed with a matching emoji:
  🌑 New Moon · 🌒 Waxing Crescent · 🌓 First Quarter · 🌔 Waxing Gibbous · 🌕 Full Moon · 🌖 Waning Gibbous · 🌗 Last Quarter · 🌘 Waning Crescent
- `moon_illumination` shown as `XX% illuminated`
- Uncomment `moon_phase` and `moon_illumination` in the `Astro` type in `weather-types.ts`
- **Files:** `WeatherDetail.tsx`, `weather-types.ts`
- **Effort:** XS

---

## Summary Table

| Phase | Category                      | Items | Effort | Priority |
|-------|-------------------------------|-------|--------|----------|
| 1     | Lint / Correctness            | 5     | XS     | Highest  |
| 2     | Code Quality                  | 8     | S–M    | High     |
| 3     | Performance                   | 6     | S–M    | High     |
| 4     | UI / UX                       | 12    | S–L    | Medium   |
| 5     | Advanced Features & Redesign  | 16    | S–M    | Medium   |

**Effort key:** XS < 30 min · S < 2 h · M < 1 day · L < 3 days

**Recommended order within Phase 5:**
1. **5.11** — drag-and-drop (independent, quick win)
2. **5.2** — °C/°F toggle (do before chart work so it applies everywhere)
3. **5.8 → 5.9 → 5.10** — API unification first, then visual redesign using the new data
4. **5.16** — moon phase (trivial, just uncomment types + render)
5. **5.15** — UV/day stats section
6. **5.13 + 5.14** — chart redesign and hourly strip together (shared data shape)
7. **5.12** — autocomplete (most complex)
8. **5.6 · 5.1 · 5.4 · 5.5** — remaining UX items, any order
