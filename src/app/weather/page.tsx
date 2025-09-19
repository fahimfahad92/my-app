"use client";

import {BookmarkPlus, Info, ListCollapse, RefreshCcw, Trash2,} from "lucide-react";
import {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import WeatherCard from "./component/WeatherCard";
import WeatherCitySearchForm from "./component/WeatherCitySearchForm";
import {
  getArrayFromLocalStorage,
  removeItemFromLocalStorageArray,
  setItemInLocalStorageAsArray,
} from "./util/LocalStorageHelper";
import HomeComponent from "@/app/weather/component/HomeComponent";


export default function WeatherApp() {
  const [cityName, setCityName] = useState("");
  const [cities, setCities] = useState<string[] | []>([]);

  useEffect(() => {
    console.log("Initializing cities form local storage");
    const stored = getArrayFromLocalStorage<string>("watchList");
    const normalized = Array.from(
      new Set((stored || []).map((c) => c?.trim().toLowerCase()).filter(Boolean))
    );
    setCities(normalized);
  }, []);
  
  useEffect(() => {
    const normalizedCity = cityName.trim().toLowerCase();
    if (!normalizedCity) return;
    
    setCities((prevCities: string[]) => {
      if (prevCities.includes(normalizedCity)) {
        toast.info(`${cityName} is already shown below`);
        return [...prevCities];
      }
      console.log("City updated for " + cityName);
      
      return [normalizedCity, ...prevCities];
    });
    setCityName("");
  }, [cityName]);

  const removeCity = useCallback((cityName: string) => {
    setCities((prev) => prev.filter((currentLocation) => currentLocation !== cityName));
  }, []);

  const addToWatchList = useCallback((cityName: string) => {
    const normalized = cityName.trim().toLowerCase();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const watchList = getArrayFromLocalStorage("watchList").map((c: string) => c.trim().toLowerCase());
    if (watchList.includes(normalized)) {
      console.log(`${cityName} is already in the watch list`);
      toast.error(`${cityName} is already in the watch list`);
      return;
    }
    setItemInLocalStorageAsArray("watchList", normalized);
    console.log(`${cityName} added to watch list`);
    toast.success(`${cityName} added to watch list`);
  }, []);

  const removefromWatchList = useCallback((cityName: string) => {
    const normalized = cityName.trim().toLowerCase();
    removeItemFromLocalStorageArray("watchList", normalized);
    removeCity(normalized);
    toast.info(`${cityName} removed`);
  }, [removeCity]);

  const fixCity = useCallback((prevCity: string, updatedCity: string) => {
    const prev = prevCity.trim().toLowerCase();
    const normalizedCity = updatedCity.trim().toLowerCase();
    if (!normalizedCity) return;

    setCities((prevCities: string[]) => {
      const withoutPrev = prevCities.filter((c) => c !== prev);
      if (withoutPrev.includes(normalizedCity)) {
        // If the corrected city already exists, just remove the previous entry
        return withoutPrev;
      }
      console.log("City updated for " + updatedCity);
      return [normalizedCity, ...withoutPrev];
    });
  }, []);

  return (
    <>
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 space-y-4">
            <div className="absolute top-4 left-40">
                <HomeComponent/>
            </div>

            <h1 className="text-2xl font-semibold mb-6 text-center">Weather APP</h1>

            <div className="w-full max-w-xl flex items-center mb-6 relative">
                {/* Search Form */}
                <WeatherCitySearchForm setCityName={setCityName}/>

                {/* Info Tooltip */}
                <div className="relative group ml-4">
                    <Info className="w-5 h-5 text-gray-500 hover:text-blue-500 cursor-pointer"/>

                    <div
                        className="absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50 space-y-2">
                        <p className="text-sm text-gray-800 font-medium mb-1">
                            What the icons mean:
                        </p>

                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <RefreshCcw className="w-4 h-4"/>
                            <span>Refresh weather data</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <ListCollapse className="w-4 h-4"/>
                            <span>Show weather details</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <Trash2 className="w-4 h-4"/>
                            <span>Delete city</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <BookmarkPlus className="w-4 h-4"/>
                            <span>Add city to watch list</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-7xl">
                {cities.map((city) =>
                    city ? (
                        <div key={city} className="p-2">
                            <WeatherCard
                                cityName={city}
                                removeCity={removeCity}
                                addToWatchList={addToWatchList}
                                removefromWatchList={removefromWatchList}
                                fixCity={fixCity}
                            />
                        </div>
                    ) : null
                )}
            </div>
        </div>
    </>
  );
}
