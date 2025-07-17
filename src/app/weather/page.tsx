"use client";

import {
  BookmarkPlus,
  Info,
  ListCollapse,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    console.log("Initializing cities form local storage");
    setCities(getArrayFromLocalStorage<string>("watchList"));
  }, []);

  useEffect(() => {
    setCities((prevCities: string[]) => {
      const normalizedCity = cityName.toLowerCase();

      if (prevCities.includes(normalizedCity) || cityName === "") {
        return [...prevCities];
      }
      console.log("City updated for " + cityName);
      toast.success(`Got data for ${cityName}`);

      return [normalizedCity, ...prevCities];
    });
  }, [cityName]);

  const removeCity = (cityName: string) => {
    const updatedCities = cities.filter(function (currentLocation) {
      return currentLocation !== cityName;
    });
    setCities(updatedCities);
  };

  const addToWatchList = (cityName: string) => {
    const watchList = getArrayFromLocalStorage("watchList");
    if (watchList.includes(cityName)) {
      console.log(`${cityName} is already in the watch list`);
      toast.error(`${cityName} is already in the watch list`);
      return;
    }
    setItemInLocalStorageAsArray("watchList", cityName);
    console.log(`${cityName} added to watch list`);
    toast.success(`${cityName} added to watch list`);
  };

  const removefromWatchList = (cityName: string) => {
    removeItemFromLocalStorageArray("watchList", cityName);
    removeCity(cityName);
    toast.info(`${cityName} removed`);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 space-y-4">
        <h1 className="text-2xl font-semibold mb-6 text-center">Weather APP</h1>

        <div className="w-full max-w-xl flex items-center mb-6 relative">
          {/* Search Form */}
          <WeatherCitySearchForm setCityName={setCityName} />

          {/* Info Tooltip */}
          <div className="relative group ml-4">
            <Info className="w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer" />

            <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50 space-y-2">
              <p className="text-sm text-gray-800 font-medium mb-1">
                What the icons mean:
              </p>

              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <RefreshCcw className="w-4 h-4" />
                <span>Refresh weather data</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <ListCollapse className="w-4 h-4" />
                <span>Show weather details</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Trash2 className="w-4 h-4" />
                <span>Delete city</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <BookmarkPlus className="w-4 h-4" />
                <span>Add city to watch list</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl">
          {cities.map((city) =>
            city ? (
              <div key={city}>
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
    </>
  );
}
