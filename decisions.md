# Architecture Decisions

Non-obvious choices made in this project and why. Update this file when a significant decision is made or reversed.

---

## State Management: `useState` + `useEffect` only — no Redux/Zustand

**Decision:** No global state library. All state is local to page components and passed down as props or shared through localStorage.

**Why:** The app has two independent features (Weather, Timezone) with no cross-feature shared state. Redux or Zustand would add boilerplate with no benefit at this scale. If a third feature with shared state requirements appears, revisit.

**Implication:** Do not introduce a state library unless features need to share live state across routes.

---

## Persistence: localStorage — no backend database

**Decision:** Weather watchlist and timezone list are stored in `localStorage` via `LocalStorageHelper`.

**Why:** No user authentication is in scope. Server-side persistence would require a backend, auth, and a user model — all out of scope for the current iteration. localStorage is sufficient for single-device, single-browser use.

**Implication:** Data is not shared across devices or browsers. This is acceptable until auth is introduced.

---

## No test runner configured

**Decision:** No Jest, Vitest, Playwright, or any test framework is installed.

**Why:** Early-stage project; iterating on features quickly. Tests would be added when the feature set stabilizes or before any public launch. The improvement plans note lint correctness as the current quality gate.

**Implication:** Do not add test infrastructure without discussing it first. Do not suggest "just add a test" as a fix — the environment does not support it.

---

## Analytics: Statsig

**Decision:** Statsig (`@statsig/react-bindings`, `@statsig/web-analytics`) is used for feature flags and event analytics.

**Why:** Statsig provides both feature gating and analytics in a single SDK, avoiding two separate integrations. The `useStatsigEvents()` hook in `statsig-event.jsx` is the single place to log events.

**Implication:** All user-facing events must go through `useStatsigEvents()`. Do not add raw analytics calls or a second analytics library.

---

## Weather Data: WeatherAPI (proxied via Next.js API route)

**Decision:** Weather data comes from WeatherAPI, called through a server-side Next.js API route (`/api/data/weather`), never directly from the client.

**Why:** The API key must not be exposed to the browser. The API route acts as a proxy, validates input, and applies ISR caching (300 s revalidation). The client-side `WeatherCard` also maintains a 2-minute in-memory cache to avoid redundant calls on re-render.

**Implication:** Never call WeatherAPI directly from a client component. All weather data flows through `/api/data/weather`. Do not add a second weather data provider without replacing this route.

---

## City Name Normalization: trim + lowercase everywhere

**Decision:** City names are always trimmed and lowercased before being stored in state, localStorage, or sent to the API.

**Why:** Prevents duplicates caused by capitalization differences ("London" vs "london") and trailing spaces. Applied consistently so comparison is always reliable.

**Implication:** Never store or compare a city name without normalizing it first. The API route also enforces this.

---

## Styling: Tailwind CSS v4 + shadcn patterns

**Decision:** Tailwind v4 (via `@tailwindcss/postcss`) for all styling. UI primitives follow shadcn conventions using `class-variance-authority` and are in `src/components/ui/`.

**Why:** Tailwind v4 removes the `tailwind.config.js` file and uses CSS-first configuration. shadcn components are copied in (not installed as a package) so they can be customized freely.

**Implication:** Do not import from a `shadcn` or `radix` package directly for new UI — copy the component into `src/components/ui/` and customize it. Always use `cn()` from `src/lib/utils.ts` to merge class names.

---

## SSR Safety: all localStorage access is guarded

**Decision:** Every read/write to localStorage is wrapped in a `typeof window === "undefined"` check (handled inside `LocalStorageHelper`).

**Why:** Next.js App Router renders components on the server. Accessing `localStorage` on the server throws a `ReferenceError`. `LocalStorageHelper` centralizes this guard so individual components do not need to think about it.

**Implication:** Always use `LocalStorageHelper` for persistence — never call `localStorage` directly in a component.

---

## Logger: suppress non-errors in production

**Decision:** `src/app/util/logger.ts` wraps `console.log/warn/info` and suppresses them in production. `logger.error` always logs.

**Why:** Debug logs should not appear in the production browser console. Rather than removing `console.log` calls manually, the logger centralizes the suppression logic.

**Implication:** Never use bare `console.log` or `console.warn` in any component or utility. Always use `logger.log`, `logger.warn`, or `logger.error`.

---

## Next.js App Router (not Pages Router)

**Decision:** This app uses the App Router (`src/app/`) introduced in Next.js 13+.

**Why:** App Router is the current Next.js standard. It enables React Server Components, nested layouts, and the `route.ts` API convention used by the weather proxy.

**Implication:** Do not create files under a `pages/` directory. API routes use the `route.ts` convention in `src/app/api/`. Server vs. client components must be explicitly managed — add `"use client"` when hooks or browser APIs are needed.
