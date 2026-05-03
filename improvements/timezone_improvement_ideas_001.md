# Timezone Feature — Improvement Ideas 001

**Feature:** World Clock (`/timezone`)  
**Date:** 2026-04-25  
**Status:** Planning only — nothing implemented

---

## Current State Summary

The timezone feature lets users search and add IANA timezones, displays live clocks in a card grid, and persists the selection to localStorage. It has 4 components (`page.tsx`, `ClockCard`, `ClockList`, `TimezoneSelector`) and a static data file of 351 timezone strings.

---

## Phase 1 — Critical Fixes (Lint & Correctness)

These are blocking issues that should be resolved before any new work.

### 1.1 Fix unused `catch` variable in `ClockCard.tsx`
- **File:** `src/app/timezone/component/ClockCard.tsx:25`
- **Issue:** `catch (unusedError)` — ESLint error `@typescript-eslint/no-unused-vars`
- **Fix:** Replace with `catch (_)` or `catch` (bare catch in TS 4+)

### 1.2 Fix missing `logEvent` in `useEffect` dependency array in `page.tsx`
- **File:** `src/app/timezone/page.tsx:26`
- **Issue:** `logEvent` is called inside the effect but omitted from `[timezones]` dependency array — React Hook warning
- **Fix:** Add `logEvent` to the dependency array. Since `logEvent` is stable (wrapped in `useCallback` inside the hook), this is safe and correct.

### 1.3 Replace unguarded `console.log` calls with the logger utility
- **Files:**
  - `src/app/timezone/page.tsx:18` — `console.log('Initializing from local storage', stored)`
  - `src/components/statsig-event.jsx:9` — `console.log("Logging event: ", eventName)`
  - `src/app/providers/statsig-provider.jsx:25` — `console.log("Statsig user:", newUser)`
- **Fix:** Replace all three with `logger.log(...)` so they are suppressed in production

### 1.4 Surface errors in `ClockCard` instead of silently swallowing them
- **File:** `src/app/timezone/component/ClockCard.tsx:24-26`
- **Issue:** `catch (unusedError) { return; }` — invalid timezone errors are completely silent
- **Fix:** Log with `logger.error(...)` inside catch so bad timezone strings are traceable

---

## Phase 2 — Code Quality & Type Safety

Refactoring and cleanup that improves maintainability without changing behavior.

### 2.1 Remove the duplicate `getArrayFromLocalStorage` function
- **File:** `src/app/util/LocalStorageHelper.tsx`
- **Issue:** `getArrayFromLocalStorage<T>()` and `getFromLocalStorage<T>()` are identical; callers use both interchangeably
- **Fix:** Delete `getArrayFromLocalStorage`, update all call sites to use `getFromLocalStorage`

### 2.2 Add TypeScript types for timezone domain objects
- **Location:** Create `src/app/timezone/types/index.ts`
- **Add:**
  - `type Timezone = string` branded type or at minimum a named alias to make intent clear in function signatures
  - `interface ClockCardProps` and `interface ClockListProps` extracted to the types file
  - `interface TimezonePageState` for the page-level state shape

### 2.3 Convert `statsig-event.jsx` and `statsig-provider.jsx` to TypeScript
- **Files:** `src/components/statsig-event.jsx`, `src/app/providers/statsig-provider.jsx`
- **Issue:** These are plain `.jsx` — no type safety for event names, metadata shape, or Statsig client
- **Fix:** Rename to `.tsx`, add proper interfaces for `EventMetadata` and Statsig user shape

### 2.4 Wrap `addTimezone` and `removeTimezone` in `useCallback`
- **File:** `src/app/timezone/page.tsx`
- **Issue:** Both handlers are recreated on every render and passed down as props — causes unnecessary child re-renders
- **Fix:** Wrap both in `useCallback` with their dependencies

### 2.5 Move the `useDebounce` hook out of `TimezoneSelector.tsx`
- **File:** `src/app/timezone/component/TimezoneSelector.tsx`
- **Issue:** The hook is defined inline inside the component file — not reusable and hard to test
- **Fix:** Move to `src/app/hooks/useDebounce.ts` and import it

### 2.6 Rename `TIMEZONES.tsx` to `TIMEZONES.ts`
- **File:** `src/app/timezone/data/TIMEZONES.tsx`
- **Issue:** The file is a pure data constant with no JSX — using `.tsx` extension is misleading
- **Fix:** Rename to `TIMEZONES.ts`

---

## Phase 3 — Performance

Targeted optimizations to reduce unnecessary renders and improve perceived responsiveness.

### 3.1 Memoize `ClockCard` with `React.memo`
- **File:** `src/app/timezone/component/ClockCard.tsx`
- **Issue:** Every time the parent's `timezones` array changes (add/remove any card), all ClockCards re-render even if their `timezone` prop is unchanged
- **Fix:** Wrap with `React.memo` — cards only re-render when their own `timezone` or `onRemove` prop changes

### 3.2 Memoize `ClockList` with `React.memo`
- **File:** `src/app/timezone/component/ClockList.tsx`
- **Fix:** Wrap with `React.memo` — list does not need to re-render if `timezones` and `onRemove` are referentially stable

### 3.3 Memoize the `highlight` helper in `TimezoneSelector`
- **File:** `src/app/timezone/component/TimezoneSelector.tsx:55-62`
- **Issue:** `highlight()` builds a `RegExp` and splits/maps on every render for every visible option
- **Fix:** Either `useMemo` on the highlighted result list or move regex construction outside the render loop

### 3.4 Change clock update interval from 60 s to 1 s
- **File:** `src/app/timezone/component/ClockCard.tsx`
- **Issue:** 60,000 ms interval means the displayed time can be up to 1 minute stale — poor UX for a clock app
- **Fix:** Change to 1,000 ms. The performance cost per card is negligible; a `React.memo` guard (Phase 3.1) keeps the re-render isolated to the single card

### 3.5 Avoid re-running the Statsig event on initial load
- **File:** `src/app/timezone/page.tsx`
- **Issue:** The second `useEffect` (persist + log) fires on mount with the initial empty `[]`, sending a `myapp_pv_timezone` event with `timezones: ""` before the localStorage data has even loaded
- **Fix:** Use a `useRef` initialized to `false`; skip the effect on the first run (flip the ref on second run)

---

## Phase 4 — UI / UX Improvements

Visual and interaction improvements to make the feature feel polished.

### 4.1 Display date alongside time in `ClockCard`
- **Current:** Only shows time (e.g., "10:30 AM")
- **Improvement:** Add the day-of-week and date below the time (e.g., "Friday, Apr 25") using `toLocaleDateString` with the same `timeZone` option
- **Value:** Users can see if a remote location is "tomorrow" or "yesterday" at a glance

### 4.2 Show UTC offset in `ClockCard`
- **Improvement:** Show the UTC offset (e.g., "UTC +5:30") under the timezone name
- **Value:** Helps users quickly reason about time differences

### 4.3 Improve empty state UX
- **Current:** Plain text "No timezones selected"
- **Improvement:** Replace with a centered illustration/icon, a short hint ("Search above to add a city"), and a subtle border — consistent with the empty state pattern used elsewhere in the app

### 4.4 Add a drag-to-reorder interaction for clock cards
- **Current:** Cards render in insertion order with no way to reorder
- **Improvement:** Allow drag-and-drop reordering (e.g., using the HTML5 drag API or `@dnd-kit/core`)
- **Value:** Users with many timezones can arrange them by priority

### 4.5 Animate card entry and exit
- **Current:** Cards appear/disappear instantly
- **Improvement:** Use a CSS transition (Tailwind `transition`, `opacity-0 → opacity-100`, subtle slide-up) on card mount/unmount
- **Value:** Makes the UI feel alive without heavy animation libraries

### 4.6 Make the "Remove" button a small icon button instead of a text button
- **Current:** A red text button labeled "Remove" takes up card space
- **Improvement:** Replace with a small `×` or trash icon (`lucide-react` `Trash2` or `X`) in the card's top-right corner, visible on hover
- **Value:** Less visual clutter; cleaner card layout leaving more room for time/date

### 4.7 Distinguish day-vs-night visually on each card
- **Improvement:** Detect whether it is daytime or nighttime at the card's timezone (based on local hour) and apply a subtle background tint (light blue for day, dark navy for night)
- **Value:** Instantly communicates "is this person awake?" at a glance

### 4.8 Highlight the user's local timezone
- **Improvement:** Auto-detect the browser's timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` and mark that card with a "Local" badge
- **Value:** Makes the reference point obvious when comparing multiple zones

### 4.9 Add a max-timezone guard with user feedback
- **Current:** Users can add unlimited timezones; with many cards the grid becomes unwieldy
- **Improvement:** Enforce a soft limit (e.g., 12) and show a toast/inline message when reached, explaining why
- **Value:** Keeps the UI usable; consistent with production-grade feature design

### 4.10 Improve responsive layout for large screens
- **Current:** Grid is `sm:grid-cols-2`, max-width `max-w-xl` — looks narrow on wide monitors
- **Improvement:** Expand to `md:grid-cols-3` with a wider max-width (e.g., `max-w-4xl`)

---

## Phase 5 — Advanced / Future Features

> **OUT OF SCOPE — Items 5.1–5.5 below are intentionally not pursued and should not be re-proposed in future improvement plans for this feature.** They are kept here as historical record only. Only new items added under Phase 5 (5.6+) are in scope.

### 5.1 Add a time-difference calculator — Out of Scope
- A small UI that, given two selected timezones, shows "City A is X hours ahead/behind City B"

### 5.2 Export/share timezone list — Out of Scope
- Generate a shareable URL (query params or hash) so a user can send their clock configuration to someone else

### 5.3 Meeting time finder — Out of Scope
- Input a desired meeting time in one timezone, see what time it is in all selected timezones — highlight "reasonable" hours (9 AM–6 PM) in green

### 5.4 Replace static `TIMEZONES.ts` list with Intl-derived data — Out of Scope
- Use `Intl.supportedValuesOf('timeZone')` (available in modern browsers and Node 18+) to generate the list at runtime or build time, ensuring it is always up-to-date without manual maintenance

### 5.5 Persist timezone order server-side — Out of Scope
- For authenticated users, sync timezone preferences to a backend (or Statsig user properties) so the list is consistent across devices

### 5.6 Search timezones by country name OR timezone string
- **File:** `src/app/timezone/data/TIMEZONES.ts`, `src/app/timezone/component/TimezoneSelector.tsx`, `src/app/timezone/types/index.ts`
- **Goal:** Typing `"japan"` finds `Asia/Tokyo`. Typing `"germany"` finds `Europe/Berlin`. Typing `"asia"` still works.
- **Approach:** Replace the flat `TIMEZONES` string array with a `TIMEZONE_ENTRIES: {timezone, country}[]` covering all UN member states (Israel intentionally excluded), Vatican City, Palestine, Kosovo, and select territories with their own IANA zones (Hong Kong, Macau, Puerto Rico, Greenland, etc.). `TIMEZONES` stays exported as a derived `Array.from(new Set(...))` so existing validation in `page.tsx` keeps working.
- **Selector:** Filter matches on either `entry.country` or `entry.timezone`. Dropdown shows two lines per row (country on top, timezone below). Highlight applies to either field.
- **Constraint:** No timezone or country related to Israel — verified via grep on the data file (only doc comments reference the exclusion).

---

## Summary Table

| Phase | Category          | Items | Effort  | Priority |
|-------|-------------------|-------|---------|----------|
| 1     | Lint / Correctness | 4    | XS      | Highest  |
| 2     | Code Quality       | 6    | S–M     | High     |
| 3     | Performance        | 5    | S       | High     |
| 4     | UI / UX            | 10   | S–L     | Medium   |
| 5     | Advanced Features  | 6 (5 out of scope, 1 active) | L–XL    | Low      |

**Effort key:** XS < 30 min · S < 2 h · M < 1 day · L < 3 days · XL = spike needed
