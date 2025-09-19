# My App – Weather Feature

A Next.js 15 (App Router) project using React 19, Tailwind CSS v4, shadcn/radix UI, and sonner notifications. The primary feature is a Weather app that fetches current and forecast data from WeatherAPI via a serverless route, with a client UI for search, watch list, and detailed charts.

Key UX/tech highlights:
- Debounced city search, normalized inputs, and duplicate prevention
- Weather cards with memoization, optimistic caching (client TTL), and loading skeletons
- Details dialog with hourly chart (Recharts)
- Watch list persisted to localStorage (SSR-safe) with add/remove and clear actions
- Server route validation, friendly error mapping, and explicit ISR caching


## Tech Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/radix UI components
- lucide-react icons
- sonner toasts
- Recharts

## Getting Started
1) Install dependencies
- Node.js 18+ recommended
- npm i

2) Configure environment
- Copy .env.example to .env.local
- Fill values as noted in the comments (see Environment section below)

3) Run the app
- npm run dev
- Open http://localhost:3000

4) Build for production
- npm run build && npm run start


## Environment
Environment variables for the Weather API are validated on the server at runtime. The API route expects:

- WEATHER_API_BASE_URL – include trailing slash, e.g. https://api.weatherapi.com/v1/
- WEATHER_API_API_KEY – expected format: key=YOUR_KEY (the route concatenates this string directly)
- WEATHER_API_CURRENT_PATH – default current.json
- WEATHER_API_FORECAST_PATH – default forecast.json

See .env.example for the exact format and comments. Validation is implemented in:
- src/app/weather/constants/env.ts (getValidatedWeatherEnv)


## Project Structure (relevant parts)
- src/app/page.tsx – Home landing
- src/app/layout.tsx – App shell, Sonner Toaster, Vercel analytics
- src/app/weather/page.tsx – Weather feature entry (search, grid of cards)
- src/app/weather/component/WeatherCitySearchForm.tsx – Debounced search form
- src/app/weather/component/WeatherCard.tsx – Overview card, memoized, client TTL cache
- src/app/weather/component/WeatherDetail.tsx – Detail dialog + chart
- src/app/weather/component/Skeletons.tsx – Loading skeletons
- src/app/weather/util/LocalStorageHelper.tsx – SSR-safe helpers
- src/app/weather/util/logger.ts – Lightweight logger
- src/app/api/data/weather/route.ts – Server route; validation, error mapping, ISR caching
- src/app/weather/constants/* – constants and env validation

## Scripts
- npm run dev – Start dev server (Turbopack)
- npm run build – Build production bundle
- npm run start – Start production server
- npm run lint – Lint with ESLint

## Accessibility & UX
- Icon-only buttons include aria-label and title
- Dialog and tooltip use radix primitives with proper roles and labeling
- Visible focus rings; keyboard navigation supported


## Performance & Reliability
- Client-side in-memory cache with short TTL to reduce refetching
- API route uses Next fetch revalidate=300 for upstream caching
- fetchWithRetry utility (client) with timeout/backoff for transient failures


## Development Notes
- City names are normalized (trim/lowercase) across state and storage
- Side effects (toasts/removals) are managed in effects, not during render
- Logger suppresses info logs in production; errors always logged

