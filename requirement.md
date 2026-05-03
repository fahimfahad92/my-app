# Requirement

## Feature
<!-- Which feature/page does this requirement target? -->
<!-- Examples: weather, timezone, home, new feature -->
weather

## Summary
<!-- One or two sentences describing what you want to achieve overall. -->
Improve the weather cards to show more useful data and fix the empty state when no city has been searched yet.

## Requirements

### Functional Requirements
<!-- List what the feature must do. Be specific about behavior, not implementation. -->
- Each weather card must display "Feels like X°" below the main temperature
- Each weather card must display humidity percentage
- When no city has been searched, show a centered placeholder message with a weather icon instead of a blank page

### Non-Functional Requirements
<!-- Performance, accessibility, responsiveness, etc. -->
- Changes must not introduce any new ESLint errors
- UI must remain responsive on mobile (< 640 px)

### Out of Scope
<!-- Explicitly list what you do NOT want touched in this round. -->
- Do not touch the WeatherDetail dialog
- Do not change the API route

## Priority
<!-- high / medium / low -->
high

## Notes
<!-- Anything else Claude should know: constraints, related files, references, etc. -->
- Feels-like and humidity are already available in the typed API response — no new API calls needed
- See `src/app/weather/types/weather-types.ts` for the existing type definitions
