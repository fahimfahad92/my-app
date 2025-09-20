export const WEATHER_API_PATHS = {
  BASE_URL: process.env.WEATHER_API_BASE_URL,
  API_KEY: process.env.WEATHER_API_API_KEY,
  CURRENT: process.env.WEATHER_API_CURRENT_PATH || "current.json",
  FORECAST: process.env.WEATHER_API_FORECAST_PATH || "forecast.json",
};

export const WEATHER_API_CONSTANT = {
  BASE_ROUTE_URL: "/api/data/weather",
};

export const WEATHER_ERROR_MESSAGES = {
  CITY_REQUIRED: "City name is required",
  INVALID_CITY_NAME: "Invalid city name. Use letters, spaces, hyphens, and periods only.",
  QUERY_DATE_REQUIRED: "Missing required parameter: queryDate",
  API_FAILURE: "Failed to fetch weather data",
  API_CONFIGURATION_ERROR: "Weather API configuration error",
};

export const WEATHER_SEARCH_PARAMS = {
  CITY_NAME: "cityName",
  TYPE: "type",
  QUERY_DATE: "queryDate",
};

export enum WEATHER_API_TYPE {
  OVERVIEW = "OVERVIEW",
  DETAIL = "DETAIL",
}
