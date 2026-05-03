# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

No test runner is configured.

## Architecture

Next.js 15 App Router app with two main features: **Weather** (`/weather`) and **World Clock** (`/timezone`).

```
src/
  app/
    page.tsx                  # Home/dashboard
    layout.tsx                # Root layout: Geist fonts, StatsigProviderWrapper, Sonner Toaster
    _lib/statsig-util.tsx     # Browser user ID + device info for Statsig
    util/
      logger.ts               # Suppresses info/warn/log in production; always logs errors
      LocalStorageHelper.tsx  # SSR-safe localStorage helpers (array and scalar ops)
    api/data/weather/         # GET route: proxies WeatherAPI, validates input, ISR 300s
    weather/
      constants/env.ts        # getValidatedWeatherEnv() — validates required env vars at runtime
      types/                  # TypeScript types for weather data
    timezone/
  components/
    ui/                       # Shadcn-style primitives (Button, Card, Dialog, Input, Chart…)
    statsig-event.jsx         # useStatsigEvents() hook for analytics event logging
  lib/utils.ts                # cn() — clsx + tailwind-merge
```

## Key Patterns

**State management:** No Redux/Zustand. `useState` + `useEffect` only. Persistent state (weather watchlist, timezone list) uses `LocalStorageHelper`. All localStorage access is guarded by `typeof window === "undefined"` for SSR safety.

**City name normalization:** Trim + lowercase everywhere — in state, storage, and API calls.

**Client-side cache:** `WeatherCard` keeps a short-TTL in-memory cache to avoid redundant API calls on re-render.

**Weather API route** (`/api/data/weather`):
- Required query params: `cityName`, `type` (`OVERVIEW` | `DETAIL`), `queryDate` (for DETAIL)
- Validates `cityName` format (letters/spaces/hyphens/periods, 1–64 chars)
- Maps WeatherAPI error codes to user-friendly messages (e.g., 1006 = location not found)

**Feature flags & analytics:** Statsig (`@statsig/react-bindings`, `@statsig/web-analytics`) wraps the root layout. Use `useStatsigEvents()` from `src/components/statsig-event.jsx` to log events.

## Environment Variables

Copy `.env.example` to `.env.local` before running locally:

```
WEATHER_API_BASE_URL=           # e.g. https://api.weatherapi.com/v1/
WEATHER_API_API_KEY=            # e.g. key=YOUR_KEY
WEATHER_API_CURRENT_PATH=       # current.json
WEATHER_API_FORECAST_PATH=      # forecast.json
NEXT_PUBLIC_STATSIG_CLIENT_KEY= # public key for client-side Statsig
```

## Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Use `cn()` from `src/lib/utils.ts` to merge class names. UI components follow shadcn patterns with `class-variance-authority`.

## Path Alias

`@/*` resolves to `./src/*`.

## Definition of Done

Before marking any task complete, verify all of the following:

**Correctness**
- [ ] `npm run lint` passes with zero new errors or warnings
- [ ] No bare `console.log` / `console.warn` — use `logger.log` / `logger.warn` / `logger.error`
- [ ] No loose equality (`==`) — use `===` everywhere
- [ ] All `useEffect` dependency arrays are complete (no missing deps)

**SSR & Storage**
- [ ] Any new localStorage access goes through `LocalStorageHelper`, not raw `localStorage`
- [ ] No new `"use client"` added unnecessarily — prefer server components where hooks are not needed

**Patterns**
- [ ] City names are normalized (trimmed + lowercased) before storing or comparing
- [ ] New user-facing events use `useStatsigEvents()` — no direct analytics calls
- [ ] New UI primitives follow shadcn conventions and live in `src/components/ui/`
- [ ] Class names use `cn()` from `src/lib/utils.ts`

**UI**
- [ ] Feature works on mobile (< 640 px) — check in browser devtools
- [ ] Empty states are handled (no blank pages or layout breaks)
- [ ] Loading and error states are handled where data is fetched

**Improvement Plan**
- [ ] Mark completed items as `Done` in `improvements/STATUS.md`
