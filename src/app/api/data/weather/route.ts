import {
  WEATHER_API_PATHS,
  WEATHER_API_TYPE,
  WEATHER_ERROR_MESSAGES,
  WEATHER_SEARCH_PARAMS,
} from "@/app/weather/constants/weather-constants";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cityName = searchParams.get(WEATHER_SEARCH_PARAMS.CITY_NAME);
  const type = searchParams.get(WEATHER_SEARCH_PARAMS.TYPE);

  if (!cityName) {
    return Response.json(
      { error: WEATHER_ERROR_MESSAGES.CITY_REQUIRED },
      { status: 400 }
    );
  }

  // Validate environment variables
  const BASE_URL = WEATHER_API_PATHS.BASE_URL;
  const API_KEY = WEATHER_API_PATHS.API_KEY;

  if (!BASE_URL || !API_KEY) {
    return Response.json(
      { error: WEATHER_ERROR_MESSAGES.API_CONFIGURATION_ERROR },
      { status: 500 }
    );
  }

  try {
    // Build URL based on request type
    let url: string;

    if (type === WEATHER_API_TYPE.OVERVIEW) {
      const path = WEATHER_API_PATHS.CURRENT || "";
      url = `${BASE_URL}${path}?${API_KEY}&q=${encodeURIComponent(cityName)}`;
    } else {
      const path = WEATHER_API_PATHS.FORECAST || "";
      const queryDate = searchParams.get(WEATHER_SEARCH_PARAMS.QUERY_DATE);

      if (!queryDate) {
        return Response.json(
          { error: "Missing required parameter: queryDate" },
          { status: 400 }
        );
      }

      url = `${BASE_URL}${path}?${API_KEY}&q=${encodeURIComponent(
        cityName
      )}&dt=${queryDate}`;
    }

    // Fetch and return weather data
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Weather API responded with ${res.status}`);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Weather API fetch error:", error);
    return Response.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
