// Server-side environment validation for Weather API config

function assert(condition: never, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export type WeatherEnv = {
  BASE_URL: string;
  API_KEY: string; // expected to be formatted as "key=..."
  CURRENT: string;
  FORECAST: string;
};

export function getValidatedWeatherEnv(): WeatherEnv {
  const BASE_URL = process.env.WEATHER_API_BASE_URL;
  const API_KEY = process.env.WEATHER_API_API_KEY;
  const CURRENT = process.env.WEATHER_API_CURRENT_PATH || "current.json";
  const FORECAST = process.env.WEATHER_API_FORECAST_PATH || "forecast.json";

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  assert(BASE_URL, "Weather API configuration error: BASE_URL is missing");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  assert(API_KEY, "Weather API configuration error: API_KEY is missing");

  // Encourage trailing slash for safe path concatenation
  const normalizedBase = BASE_URL!.endsWith("/") ? BASE_URL! : `${BASE_URL!}/`;

  return {
    BASE_URL: normalizedBase,
    API_KEY: API_KEY!,
    CURRENT,
    FORECAST,
  };
}
