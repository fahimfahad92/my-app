# My App – Personal Dashboard

A Next.js 15 (App Router) project using React 19, Tailwind CSS v4, shadcn/radix UI, and sonner notifications. A personal dashboard featuring **Weather** and **World Clock** (timezone tracking) features.

## Features Overview

### 🌤️ Weather App (`/weather`)
Get real-time weather updates and forecasts for your favorite cities.
- Debounced city search with normalized inputs and duplicate prevention
- Weather cards with memoization, optimistic caching (client TTL), and loading skeletons
- Detailed view with hourly forecast chart (Recharts visualization)
- Watch list persisted to localStorage (SSR-safe) with add/remove and clear actions
- Server route validation, friendly error mapping, and ISR caching (300s)

### 🌍 World Clock (`/timezone`)
Track current time across multiple timezones in real-time.
- Search by country or timezone name with debounced filtering
- Add up to 12 timezones to your tracking list
- Real-time clock display for each timezone with day/night indicator
- Drag-and-drop reordering of timezones
- UTC offset display for each timezone
- Local timezone indicator for your device's timezone
- Persisted to localStorage with SSR-safe access


## Tech Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/radix UI components
- lucide-react icons
- Recharts (weather charts)
- sonner (toast notifications)
- Statsig (feature flags & analytics)

## How It Works

### Weather Feature

**City Search & Caching**
- User types a city name → debounced search (300ms default)
- City names are normalized (trim + lowercase) before API calls
- Duplicate city prevention at state level
- Client-side TTL cache in WeatherCard prevents redundant API calls on re-render

**API Route** (`/api/data/weather`)
- Accepts query params: `cityName`, `type` (`OVERVIEW` | `DETAIL`), `queryDate` (for DETAIL)
- Validates city name format: letters/spaces/hyphens/periods, 1–64 characters
- Proxies requests to WeatherAPI (configured via environment variables)
- Maps WeatherAPI error codes to user-friendly messages (e.g., 1006 = location not found)
- Uses ISR caching with revalidation every 300 seconds for improved performance

**UI Workflow**
1. User searches for a city
2. Current weather overview card displays (with skeleton while loading)
3. User can add to watch list or click to view detailed forecast
4. Detail view shows hourly temperature chart (Recharts) and forecast data
5. Watch list persists to localStorage and survives page reloads

### World Clock Feature

**Timezone Selection**
- Search by country name or timezone (e.g., "New York" → "America/New_York")
- Debounced search with regex filtering and match highlighting
- Keyboard navigation (Arrow Up/Down to navigate, Enter to select, Escape to close)
- Already-selected timezones show a checkmark

**Clock Display**
- Real-time updates aligned to minute boundaries (not every second for efficiency)
- Each clock shows:
  - Timezone name (with "Local" badge if it's your device's timezone)
  - UTC offset (e.g., UTC+5:30)
  - Current time in 24-hour format
  - Formatted date with day of week
- Day/night theming: light theme (6 AM – 6 PM) vs. dark theme (6 PM – 6 AM)

**Drag & Drop Reordering**
- Click and drag a clock card to reorder your timezone list
- Visual feedback during drag (opacity changes)
- Changes persist to localStorage

**Storage & Limits**
- Maximum 12 timezones per user (warning toast if limit reached)
- List persists to localStorage and loads on app restart

### State Management & Persistence

**No Redux/Zustand**: Uses React hooks only
- `useState` for local state
- `useEffect` with complete dependency arrays
- `LocalStorageHelper` for persistent state (guarded by `typeof window === "undefined"` for SSR safety)

**LocalStorageHelper Features**
- `getFromLocalStorage<T>(key)` – retrieves array or scalar value
- `setInLocalStorage(key, value)` – persists array or scalar value
- Prevents SSR hydration mismatches

### Analytics & Feature Flags

**Statsig Integration**
- Wraps root layout (`src/app/providers/statsig-provider.tsx`)
- Use `useStatsigEvents()` hook to log user events:
  ```typescript
  const { logEvent } = useStatsigEvents();
  logEvent("myapp_pv_weather", { page: "weather", city: "New York" });
  ```
- Events are tracked for feature usage and analytics

## Getting Started

### 1. Prerequisites
- Node.js 18+ recommended
- npm or yarn package manager

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env.local
```

Then fill in the required variables:

- **WEATHER_API_BASE_URL** – WeatherAPI base URL with trailing slash (e.g., `https://api.weatherapi.com/v1/`)
- **WEATHER_API_API_KEY** – API key in format `key=YOUR_KEY` (concatenated directly by the route)
- **WEATHER_API_CURRENT_PATH** – Endpoint for current weather (default: `current.json`)
- **WEATHER_API_FORECAST_PATH** – Endpoint for forecast data (default: `forecast.json`)
- **NEXT_PUBLIC_STATSIG_CLIENT_KEY** – Statsig public key for client-side feature flags

Environment validation occurs at runtime in `src/app/weather/constants/env.ts` using `getValidatedWeatherEnv()`.

### 4. Run the App
```bash
# Development server (Turbopack)
npm run dev

# Open http://localhost:3000 in your browser
```

### 5. Build for Production
```bash
npm run build
npm run start
```

## Available Commands
- `npm run dev` – Start development server (Turbopack)
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lint` – Run ESLint


## Project Structure

### Core
- **src/app/page.tsx** – Home/dashboard with feature cards
- **src/app/layout.tsx** – Root layout with Sonner Toaster, Statsig provider, fonts (Geist)

### Weather Feature
- **src/app/weather/page.tsx** – Weather feature entry (search, grid of cards)
- **src/app/weather/component/WeatherCitySearchForm.tsx** – Debounced city search form
- **src/app/weather/component/WeatherCard.tsx** – Overview card, memoized, client-side TTL cache
- **src/app/weather/component/WeatherDetail.tsx** – Detail dialog with hourly forecast chart
- **src/app/weather/component/LineChartComponent.tsx** – Recharts-based hourly temperature chart
- **src/app/weather/component/Skeletons.tsx** – Loading state skeletons
- **src/app/weather/types/weather-types.ts** – TypeScript types for weather data
- **src/app/weather/constants/env.ts** – WeatherAPI environment validation (runtime)
- **src/app/weather/constants/weather-constants.ts** – Weather conditions and constants
- **src/app/api/data/weather/route.ts** – Server route; proxies WeatherAPI, validates input, error mapping, ISR caching (300s)

### Timezone/World Clock Feature
- **src/app/timezone/page.tsx** – World Clock entry (timezone selection, grid of clocks)
- **src/app/timezone/component/TimezoneSelector.tsx** – Debounced timezone search dropdown with keyboard navigation
- **src/app/timezone/component/ClockList.tsx** – Grid of clock cards with drag-and-drop reordering
- **src/app/timezone/component/ClockCard.tsx** – Individual timezone clock display (real-time updates, day/night theme)
- **src/app/timezone/data/TIMEZONES.ts** – Database of timezones and countries
- **src/app/timezone/types/index.ts** – TypeScript types and MAX_TIMEZONES constant (12)

### Shared Utilities
- **src/app/util/LocalStorageHelper.tsx** – SSR-safe localStorage helpers (array and scalar operations)
- **src/app/util/logger.ts** – Lightweight logger (suppresses info/warn/log in production; always logs errors)
- **src/app/hooks/useDebounce.ts** – Debounce hook for search inputs
- **src/app/_lib/statsig-util.tsx** – Statsig user ID and device info for feature flags/analytics
- **src/components/statsig-event.tsx** – useStatsigEvents() hook for analytics event logging
- **src/lib/utils.ts** – cn() helper (clsx + tailwind-merge)

### UI Components
- **src/components/ui/** – Shadcn-style primitives (Button, Card, Dialog, Input, Label, Chart, Sonner)

## Styling & Theming

**Tailwind CSS v4** via `@tailwindcss/postcss`
- Use `cn()` from `src/lib/utils.ts` to merge class names safely
- UI components follow shadcn patterns with `class-variance-authority`
- Global styles in `src/app/globals.css`

**Color Scheme**
- Weather feature: Blue/cyan for current day, bright tones for accents
- Timezone feature: Day/night theming on each clock card
- Consistent gray palette for neutral UI elements

## Code Organization & Patterns

### Path Alias
`@/*` resolves to `./src/*`

### Component Structure
- **UI components** live in `src/components/ui/` (shadcn patterns)
- **Feature components** live in `src/app/[feature]/component/`
- **Utilities** live in `src/app/util/` (shared across features)
- **Hooks** live in `src/app/hooks/`

### Naming Conventions
- City names: Always trimmed + lowercased before storage/comparison
- Component files: PascalCase (e.g., `WeatherCard.tsx`)
- Utility files: camelCase (e.g., `useDebounce.ts`)
- Event names: `myapp_pv_[feature]` (e.g., `myapp_pv_weather`, `myapp_pv_timezone`)

### Logging
- Use `logger.log()`, `logger.warn()`, `logger.error()` from `src/app/util/logger.ts`
- No bare `console.log` or `console.warn`
- Logger suppresses info/warn logs in production; errors always logged
- Check browser devtools console (not Network tab) for logged events

## Accessibility & UX

- **Keyboard Navigation**: Weather search, timezone search, dialogs all support full keyboard navigation
  - Arrow Up/Down to navigate options
  - Enter to select
  - Escape to close/cancel
- **Screen Readers**: Icon-only buttons include `aria-label` and `title` attributes
- **Focus Management**: Visible focus rings on all interactive elements
- **Mobile-Friendly**: Responsive design tested on < 640px viewports
- **Empty States**: All empty states display helpful messaging (e.g., "No cities in watchlist")
- **Loading States**: Skeleton screens during data fetches
- **Error States**: Toast notifications for errors and validation messages

## Performance Optimizations

**Caching Strategy**
- **Client-side TTL cache** in WeatherCard: Prevents redundant API calls on re-render
- **ISR (Incremental Static Regeneration)**: API route revalidates weather every 300 seconds
- **Component memoization**: WeatherCard, ClockList use `memo()` to skip unnecessary re-renders

**Rendering Efficiency**
- Clock cards update aligned to minute boundaries (not every second), saving CPU cycles
- Timezone filtering uses `useMemo()` to avoid recalculating on every render
- Search debouncing (300ms) reduces API load from user input

**Bundle Size**
- Recharts for chart visualization (lightweight charting library)
- Shadcn UI components (tree-shakeable, modular)
- No Redux/MobX; just React hooks (minimal overhead)

## Development Best Practices

**Before committing any change:**
- Run `npm run lint` → must pass with zero new errors/warnings
- No bare `console.log`/`console.warn` → use `logger.*`
- No loose equality (`==`) → always use `===`
- All `useEffect` dependency arrays must be complete (use ESLint to verify)
- localStorage access only via `LocalStorageHelper`, never raw `localStorage`
- Prefer server components; add `"use client"` only when hooks are needed
- City names normalized (trim + lowercase) before storing/comparing
- User-facing events logged via `useStatsigEvents()`, not direct analytics calls

**Testing**
- No test runner configured in this project
- Manual testing via `npm run dev` and browser devtools
- Check mobile responsiveness via DevTools device emulation (< 640px)

**Debugging**
- Errors logged to browser console and `logger.error()`
- Use browser React DevTools to inspect component state
- Check NextJS Network tab for API calls
- localStorage can be inspected in DevTools Application > Local Storage

