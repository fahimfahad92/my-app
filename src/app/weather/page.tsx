"use client";

import { useState } from "react";
import WeatherCitySearchForm from "./component/WeatherCitySearchForm";

export default function WeatherApp() {
  const [cityName, setCityName] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 space-y-4">
      <h1 className="text-2xl font-semibold mb-6">Weather APP</h1>

      <WeatherCitySearchForm setCityName={setCityName} />

      {cityName ? <div>You entered {cityName}</div> : null}
    </div>
  );
}
