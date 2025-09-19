import {
  WEATHER_API_PATHS,
  WEATHER_API_TYPE,
  WEATHER_ERROR_MESSAGES,
  WEATHER_SEARCH_PARAMS,
} from "@/app/weather/constants/weather-constants";
import { ErrorResponse } from "@/app/weather/types/weather-types";
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

  // Basic input validation for city name (letters, spaces, hyphens, periods), 1-64 chars
  const isValidCity = /^[a-zA-Z\s\-\.]{1,64}$/.test(cityName);
  if (!isValidCity) {
    return Response.json(
      { error: "Invalid city name. Use letters, spaces, hyphens, and periods only." },
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

    // Fetch and return weather data with ISR revalidation
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      const errorResponse: ErrorResponse = await res.json();
      const code = (errorResponse as ErrorResponse)?.error?.code;
      // Map known WeatherAPI error codes to friendly messages
      let friendly = (errorResponse as ErrorResponse)?.error?.message || "An error occurred";
      if (code === 1006) friendly = "No matching location found";
      if (code === 2006) friendly = "API key is invalid or missing";
      if (code === 9999) friendly = "Weather service temporary error. Please try again.";
      throw new Error(friendly);
    }

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("server error " + error);
    const errRes = Response.json(
      {
        error: (error as Error).message || "An unexpected error occurred",
      },
      { status: 500 }
    );
    return errRes;
  }
}
