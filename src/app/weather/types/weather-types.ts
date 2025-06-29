export type WeatherCitySearchFormProps = {
  cityName: string;
};

export type WeatherCitySearchProps = {
  setCityName: (data: string) => void;
};

export type TemperatureDataPoint = {
  hour: string;
  temp: number;
  icon: string;
};

export type LineChartComponentProps = {
  date: string;
  chartData: TemperatureDataPoint[];
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
    uv: number;
  };
};

export interface WeatherDetailResponse {
  location: Location;
  forecast: Forecast;
}

export interface Location {
  name: string;
  // region: string;
  country: string;
  // lat: number;
  // lon: number;
  tz_id: string;
  // localtime_epoch: number;
  localtime: string;
}

export interface Forecast {
  forecastday: ForecastDay[];
}

export interface ForecastDay {
  date: string; // format "YYYY-MM-DD"
  day: DaySummary;
  astro: Astro;
  hour: Hourly[];
  // date_epoch: number;
}

export interface DaySummary {
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  condition: Condition;
  // avgtemp_c: number;
  // avgtemp_f: number;
  // maxwind_mph: number;
  // maxwind_kph: number;
  // totalprecip_mm: number;
  // totalprecip_in: number;
  // totalsnow_cm: number;
  // avgvis_km: number;
  // avgvis_miles: number;
  // avghumidity: number;
  // daily_will_it_rain: number;
  // daily_chance_of_rain: number;
  // daily_will_it_snow: number;
  // daily_chance_of_snow: number;
  // uv: number;
}

export interface Astro {
  sunrise: string; // e.g. "05:26 AM"
  sunset: string;
  moonrise: string;
  moonset: string;
  // moon_phase: string;
  // moon_illumination: number;
}

export interface Hourly {
  time: string; // "YYYY-MM-DD HH:mm"
  temp_c: number;
  // time_epoch: number;
  // temp_f: number;
  // is_day: 0 | 1;
  condition: Condition;
  // wind_mph: number;
  // wind_kph: number;
  // wind_degree: number;
  // wind_dir: string;
  // pressure_mb: number;
  // pressure_in: number;
  // precip_mm: number;
  // precip_in: number;
  // snow_cm: number;
  // humidity: number;
  // cloud: number;
  // feelslike_c: number;
  // feelslike_f: number;
  // windchill_c: number;
  // windchill_f: number;
  // heatindex_c: number;
  // heatindex_f: number;
  // dewpoint_c: number;
  // dewpoint_f: number;
  // will_it_rain: number;
  // chance_of_rain: number;
  // will_it_snow: number;
  // chance_of_snow: number;
  // vis_km: number;
  // vis_miles: number;
  // gust_mph: number;
  // gust_kph: number;
  // uv: number;
}

export interface Condition {
  text: string;
  icon: string;
  code: number;
}
