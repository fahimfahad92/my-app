"use client";

import { useEffect, useState } from "react";
import WeatherCard from "./component/WeatherCard";
import WeatherCitySearchForm from "./component/WeatherCitySearchForm";
import {
  getArrayFromLocalStorage,
  removeItemFromLocalStorageArray,
  setItemInLocalStorageAsArray,
} from "./util/LocalStorageHelper";

export default function WeatherApp() {
  const [cityName, setCityName] = useState("");
  const [cities, setCities] = useState<string[] | []>([]);

  useEffect(() => {
    console.log("initializing cities form local storage");
    setCities(getArrayFromLocalStorage<string>("watchList"));
  }, []);

  useEffect(() => {
    setCities((prevCities: string[]) => {
      const normalizedCity = cityName.toLowerCase();

      if (prevCities.includes(normalizedCity) || cityName === "") {
        return [...prevCities];
      }
      console.log("City updated for " + cityName);

      return [...prevCities, normalizedCity];
    });
  }, [cityName]);

  const removeCity = (cityName: string) => {
    const updatedCities = cities.filter(function (currentLocation) {
      return currentLocation !== cityName;
    });
    setCities(updatedCities);
  };

  const addToWatchList = (city: string) => {
    const watchList = getArrayFromLocalStorage("watchList");
    if (watchList.includes(city)) {
      alert(`${city} is already in the watch list`);
      return;
    }
    setItemInLocalStorageAsArray("watchList", city);
    alert(`${city} added to watch list`);
  };

  const removefromWatchList = (city: string) => {
    removeItemFromLocalStorageArray("watchList", city);
    removeCity(city);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 space-y-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Weather APP</h1>

      <WeatherCitySearchForm setCityName={setCityName} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 w-full max-w-7xl">
        {cities.map((city) =>
          city ? (
            <div key={city} className="flex justify-center">
              <WeatherCard
                cityName={city}
                removeCity={removeCity}
                addToWatchList={addToWatchList}
                removefromWatchList={removefromWatchList}
              />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
