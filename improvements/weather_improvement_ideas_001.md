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

## Phase 5 — Advanced / Future Features

Larger scope items to consider after the above phases are stable.

### 5.1 Geolocation auto-detection on first visit
- Prompt the user for location permission; if granted, auto-search their current city using the browser's Geolocation API and the WeatherAPI reverse-geocode endpoint
- Show a dismissible banner: "Showing weather for your current location"

### 5.2 Temperature unit toggle (°C / °F)
- Add a global toggle (stored in localStorage) that switches all displayed temperatures between Celsius and Fahrenheit
- WeatherAPI returns both; conversion is client-side only — no extra API calls needed

### 5.3 Weather alerts and severe condition warnings
- WeatherAPI provides alert data; surface active alerts as a dismissible banner or badge on the card
- Highlight the card border in red/amber when an active alert exists for that city

### 5.4 Offline support / stale-while-revalidate
- Cache the last-known API response per city in localStorage with a timestamp
- If the user is offline, display the cached data with a "Showing cached data from X ago" notice instead of an error

### 5.5 Shareable city watchlist URL
- Encode the active city list as a URL query string so users can share their configured weather dashboard with others (e.g., `/weather?cities=dhaka,london,new-york`)

### 5.6 Keyboard shortcut to focus the search input
- Press `/` anywhere on the page to focus the city search input, consistent with search UX patterns in tools like GitHub and Linear

### 5.7 Server-side watchlist persistence for authenticated users
- Sync the watchlist to a backend (or Statsig user properties) so the configuration is consistent across devices and browsers

---

## Summary Table

| Phase | Category           | Items | Effort  | Priority |
|-------|--------------------|-------|---------|----------|
| 1     | Lint / Correctness | 5     | XS      | Highest  |
| 2     | Code Quality       | 8     | S–M     | High     |
| 3     | Performance        | 6     | S–M     | High     |
| 4     | UI / UX            | 12    | S–L     | Medium   |
| 5     | Advanced Features  | 7     | L–XL    | Low      |

**Effort key:** XS < 30 min · S < 2 h · M < 1 day · L < 3 days · XL = spike needed
