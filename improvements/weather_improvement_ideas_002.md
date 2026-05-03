# Weather Feature — UI/UX Redesign Plan 002

> **Superseded.** All items from this file have been merged into `weather_improvement_ideas_001.md` as Phase 5 items 5.8–5.16. Use that file as the single source of truth.

**Feature:** Weather App (`/weather`)
**Date:** 2026-05-03
**Status:** Superseded by weather_improvement_ideas_001.md Phase 5

---

## Available Data (WeatherAPI Free Tier)

Fields currently unused but available in the free plan that this redesign exploits:

**Current:** `gust_kph`, `pressure_mb`, `precip_mm`, `cloud`, `uv`, `dewpoint_c`, `vis_km`
**Forecast day:** `avgtemp_c`, `maxwind_kph`, `totalprecip_mm`, `avghumidity`, `avgvis_km`, `daily_chance_of_rain`, `daily_chance_of_snow`, `daily_will_it_rain`, `uv`
**Forecast hour:** `chance_of_rain`, `chance_of_snow`, `will_it_rain`, `feelslike_c`, `humidity`, `precip_mm`, `vis_km`
**Astronomy:** `moon_phase`, `moon_illumination`, `is_moon_up`, `is_sun_up`

**Not available on free plan:** weather alerts, air quality, 14-day forecast, solar irradiance.

---

## Phase 6 — Full UI/UX Redesign

### 6.1 — Merge the overview API call into `forecast.json?days=1`

- **Current:** `WeatherCard` calls `current.json` (overview); `WeatherDetail` calls `forecast.json?days=3`. Two separate data shapes.
- **Change:** Replace the card's `current.json` call with `forecast.json?days=1`. The forecast endpoint returns **both** `current` and `forecast.forecastday[0]` in a single response — so the card gets today's max/min, chance of rain, and average data for free with no extra API call.
- **Route:** Add a new route branch for this unified call, or change `OVERVIEW` to use the forecast path with `days=1`.
- **Type:** Extend `WeatherResponse` to include an optional `forecast` field.
- **Effort:** M — changes `WeatherCard`, `route.ts`, `weather-types.ts`

---

### 6.2 — Dynamic card backgrounds based on weather condition

Replace the static `bg-white` card with a gradient that reflects actual weather.

**Condition grouping** (by `current.condition.code` and `current.is_day`):

| Group | Codes | Day gradient | Text |
|-------|-------|-------------|------|
| Sunny/Clear | 1000 | `from-amber-300 to-yellow-200` | dark |
| Partly cloudy | 1003 | `from-sky-400 to-blue-200` | dark |
| Cloudy/Overcast/Mist | 1006, 1009, 1030, 1135, 1147 | `from-slate-400 to-slate-300` | dark |
| Rain (any) | 1063, 1150–1201, 1240–1246 | `from-blue-700 to-indigo-400` | white |
| Snow (any) | 1066, 1114, 1117, 1210–1225, 1255–1258 | `from-sky-200 to-slate-100` | dark |
| Sleet/Freezing | 1072, 1168, 1171, 1198, 1201, 1204, 1207, 1249, 1252 | `from-cyan-600 to-slate-400` | white |
| Thunder | 1087, 1273–1282 | `from-slate-800 to-violet-700` | white |

**Night override** (`is_day === 0`): All conditions → `from-slate-900 to-blue-950` with white text.

Card text colors (title, labels, values) invert based on dark/light background. Use a `isDarkBackground` boolean derived from condition to toggle `text-gray-900` vs `text-white`.

- **Files:** `WeatherCard.tsx`, new `conditionUtils.ts` helper
- **Effort:** S

---

### 6.3 — Redesigned card layout

Current layout: generic label/value rows in a `space-y-3` stack. New layout:

```
┌─────────────────────────────────┐
│  London             [Rain 60%]  │  ← city name + rain badge (top-right)
│  United Kingdom                 │
│                                 │
│      🌧  Moderate rain          │  ← icon (larger, 20x20) + condition text
│                                 │
│          18°C                   │  ← hero temperature
│     Feels like 15°C             │
│                                 │
│  H:22° L:14°  ··· Asia/Kolkata  │  ← max/min + tz (one line, muted)
│                                 │
│  💧42%  💨 24kph NW  👁 10km   │  ← icon-based stat strip
│                                 │
│  Updated 3 min ago              │  ← small, bottom
├─────────────────────────────────┤
│  🔄  📋  ✕  🔖               │  ← action buttons (full-width row)
└─────────────────────────────────┘
```

Changes:
- Condition icon grows to `w-20 h-20`
- Today's max/min shown if data from 6.1 is available
- Rain chance badge (pill, top-right corner of card) shown if `daily_chance_of_rain >= 30`
- Icon-based stat strip (humidity, wind, visibility) using Lucide icons (`Droplets`, `Wind`, `Eye`) — no label text, just icon + value
- Footer buttons become a single horizontal row of 4 equal icon-only buttons

- **Files:** `WeatherCard.tsx`
- **Effort:** S (after 6.1 is done)

---

### 6.4 — Drag-and-drop card reordering

Same pattern as the existing `ClockList` drag-and-drop in the timezone feature.

- Add `reorderCities` callback in `weather/page.tsx` (mirrors `reorderTimezones`)
- Persist card order to a separate localStorage key `"cityOrder"` (a `string[]` of city names in display order)
- On mount, apply saved order to the loaded `cities` state
- Each `WeatherCard` wrapper gets `draggable`, `onDragStart`, `onDragOver`, `onDrop`, `onDragEnd` handlers
- A `dragOver` index state shows a blue insertion line between cards while dragging
- Add a `GripVertical` Lucide icon in the top-left corner of each card (visible on hover only, `opacity-0 group-hover:opacity-100`)

- **Files:** `weather/page.tsx`, `WeatherCard.tsx`
- **Effort:** S

---

### 6.5 — City search autocomplete using WeatherAPI `/search.json`

Replace the plain text input with an autocomplete dropdown.

- New route branch: `type=SEARCH` → calls `http://api.weatherapi.com/v1/search.json?q=...`
- Response: `[{ id, name, region, country, lat, lon }]`
- In `WeatherCitySearchForm`: debounce input (300 ms), fetch suggestions on each keystroke
- Show a dropdown below the input with up to 5 results
- Each row: `<city name>, <region>, <country>` (e.g., "London, City of London, United Kingdom")
- Clicking a result sets the city name and submits
- Keyboard navigation: arrow keys to move through results, Enter to select, Escape to close
- Empty state: "No cities found" if search returns `[]`
- Loading indicator while fetching suggestions

- **Files:** `WeatherCitySearchForm.tsx`, `route.ts` (new SEARCH branch), `weather-constants.ts`, `weather-types.ts`
- **Effort:** M

---

### 6.6 — Redesigned hourly chart: `ComposedChart` with area + precipitation bars

Replace the current `LineChart` in `LineChartComponent.tsx` with a richer `ComposedChart`.

**Layout:**
- `Area` component for temperature (smooth curve, gradient fill from blue → transparent)
- `Bar` component for `chance_of_rain` % (right Y-axis, semi-transparent blue bars behind the area)
- Two Y-axes: left = temperature (°C), right = precipitation % (0–100)
- Tooltip: shows time, temp, feels-like, rain%, wind for that hour
- Gradient fill: use Recharts `<defs><linearGradient>` — top is `rgb(59,130,246,0.6)`, bottom is transparent
- X-axis: every 3 hours labeled (not every hour, to avoid crowding)
- Grid: horizontal only, lighter color

**New props needed on `LineChartComponent`:**
- `unit: "C" | "F"` — so chart respects the global unit toggle (6.10)
- `hourlyData` type expanded to include `chance_of_rain: number`, `feelslike_c: number`

**Breaking change:** `TemperatureDataPoint` type updated to add `chance_of_rain` and `feelslike_c` fields.

- **Files:** `LineChartComponent.tsx`, `weather-types.ts`, `WeatherDetail.tsx`
- **Effort:** M

---

### 6.7 — Horizontal hourly scroll strip (iOS Weather-style)

A compact horizontally scrollable row added **above** the chart in `WeatherDetail`.

Each column (24 items, one per forecast hour):
```
  2PM
  🌧
  19°
  ▌▌▌▌ 60%   ← mini rain bar (height proportional to chance_of_rain)
```

- Built with `flex overflow-x-auto gap-3 py-2 scrollbar-hide`
- Current hour (or next hour if current is past) highlighted: `ring-2 ring-blue-400 rounded-lg`
- Tapping/clicking an hour scrolls the chart to that point (or just highlights, no chart scroll needed)
- The hours are extracted from the same `forecastday.hour` array, no extra API call

- **Files:** New `HourlyStrip.tsx`, `WeatherDetail.tsx`
- **Effort:** S

---

### 6.8 — Detail view stats section: UV index, pressure, visibility, cloud cover

Add a dedicated stats grid in the detail dialog (between the astro section and the chart).

**UV Index — color-coded pill:**
```
UV 7  [████████──]  High
```
Color bands: 0-2 green, 3-5 yellow, 6-7 orange, 8-10 red, 11+ violet.
Value from `forecastday.day.uv`.

**Other stats in a 2×2 grid:**
| Stat | Icon | Source |
|------|------|--------|
| Avg Humidity | `Droplets` | `day.avghumidity` |
| Avg Visibility | `Eye` | `day.avgvis_km` |
| Max Wind | `Wind` | `day.maxwind_kph` |
| Total Precip | `CloudRain` | `day.totalprecip_mm` |

- **Files:** New `DayStatsSection.tsx`, `WeatherDetail.tsx`, `weather-types.ts` (uncomment commented fields)
- **Effort:** S

---

### 6.9 — Moon phase and illumination in astronomy section

The current astronomy section shows sunrise/sunset/moonrise/moonset. Extend it:

- Add `moon_phase` (text name, e.g., "Waxing Crescent") — with a matching Unicode emoji or SVG icon
- Add `moon_illumination` as a percentage with a small progress arc
- Moon phase → emoji mapping (🌑 New Moon, 🌒 Waxing Crescent, 🌓 First Quarter, 🌔 Waxing Gibbous, 🌕 Full Moon, 🌖 Waning Gibbous, 🌗 Last Quarter, 🌘 Waning Crescent)

- **Files:** `WeatherDetail.tsx`, `weather-types.ts` (uncomment `moon_phase`, `moon_illumination`)
- **Effort:** XS

---

### 6.10 — Global °C / °F temperature unit toggle

- Add a `TemperatureUnit = "C" | "F"` context or localStorage-persisted state in `weather/page.tsx`
- Small toggle pill in the page header (`°C · °F`) — clicking switches and persists to localStorage key `"tempUnit"`
- Pass `unit` prop down to `WeatherCard`, `WeatherDetail`, `LineChartComponent`
- Each component reads `unit` to pick `temp_c` vs `temp_f` (both always returned by the API)
- No re-fetch required

- **Files:** `weather/page.tsx`, `WeatherCard.tsx`, `WeatherDetail.tsx`, `LineChartComponent.tsx`
- **Effort:** S

---

### 6.11 — Keyboard shortcut `/` to focus the search input

- In `WeatherCitySearchForm`, expose an `inputRef` (or accept a `ref` prop) for the text input
- In `weather/page.tsx`, attach a `keydown` listener on `document`: when `event.key === "/"` and the active element is not an input/textarea, call `event.preventDefault()` and focus the search input
- Show a subtle `⌨ /` hint label in the search form placeholder or as a pill badge at the right edge of the input

- **Files:** `weather/page.tsx`, `WeatherCitySearchForm.tsx`
- **Effort:** XS

---

## Summary Table

| # | Item | Effort | Depends on |
|---|------|--------|------------|
| 6.1 | Unified `forecast.json?days=1` overview call | M | — |
| 6.2 | Dynamic card backgrounds | S | — |
| 6.3 | Redesigned card layout (max/min, badges, icon strip) | S | 6.1 |
| 6.4 | Drag-and-drop card reordering | S | — |
| 6.5 | City search autocomplete | M | — |
| 6.6 | ComposedChart: area temp + precipitation bars | M | — |
| 6.7 | Horizontal hourly scroll strip | S | — |
| 6.8 | Detail stats: UV gauge, visibility, wind, precip | S | — |
| 6.9 | Moon phase + illumination in astronomy section | XS | — |
| 6.10 | Global °C/°F unit toggle | S | — |
| 6.11 | Keyboard shortcut `/` to focus search | XS | — |

**Effort key:** XS < 30 min · S < 2 h · M < 1 day

**Note:** Items 6.10 (temp toggle) and 6.11 (keyboard shortcut) supersede Phase 5 items 5.2 and 5.6.

---

## Implementation Order (Recommended)

1. **6.2 + 6.4** — quick visual wins, independent of everything else
2. **6.1 → 6.3** — API refactor first, then card layout using the new data
3. **6.9** — trivial, just uncomment type fields and render
4. **6.10** — add unit toggle before chart work so charts respect it from the start
5. **6.6 → 6.7** — chart redesign + hourly strip (related, do together)
6. **6.8** — detail stats section
7. **6.5** — autocomplete (most complex frontend change, best done last)
8. **6.11** — keyboard shortcut (trivial, add anytime)
