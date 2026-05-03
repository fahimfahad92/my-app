export type TemperatureUnit = "C" | "F";

export type WeatherCitySearchFormProps = {
  cityName: string;
};

export type WeatherCitySearchProps = {
  setCityName: (data: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
};

export type CustomDotProps = {
  cx?: number;
  cy?: number;
  payload?: {
    icon?: string;
  };
};

export type WeatherEventName = "myapp_pv_weather";

export interface WeatherEventMetadata {
  page: string;
  city?: string;
  action?: string;
  [key: string]: string | undefined;
}

export type TemperatureDataPoint = {
  hour: string;
  temp: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  chance_of_rain: number;
  icon: string;
};

export type LineChartComponentProps = {
  date: string;
  chartData: TemperatureDataPoint[];
  unit: TemperatureUnit;
};

export type WeatherSearchResult = {
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
};

export type WeatherResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: DaySummary;
    }>;
  };
};

export interface WeatherDetailResponse {
  location: Location;
  forecast: Forecast;
}

export interface Location {
  name: string;
  country: string;
  tz_id: string;
  localtime: string;
}

export interface Forecast {
  forecastday: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  day: DaySummary;
  astro: Astro;
  hour: Hourly[];
}

export interface DaySummary {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  condition: Condition;
  maxwind_kph: number;
  totalprecip_mm: number;
  avgvis_km: number;
  avghumidity: number;
  daily_chance_of_rain: number;
  daily_chance_of_snow: number;
  uv: number;
}

export interface Astro {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: number;
}

export interface Hourly {
  time: string;
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  humidity: number;
  chance_of_rain: number;
  chance_of_snow: number;
  condition: Condition;
}

export interface Condition {
  text: string;
  icon: string;
  code: number;
}

export type ErrorResponse = {
  error: {
    code: number;
    message: string;
  };
};
