import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import {
  WeatherCitySearchFormProps,
  WeatherCitySearchProps,
} from "../types/weather-types";

export default function WeatherCitySearchForm({
  setCityName,
}: WeatherCitySearchProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeatherCitySearchFormProps>();

  const onSubmit = (data: WeatherCitySearchFormProps) => {
    console.log(`Searched city ${data.cityName}`);
    setCityName(data.cityName);
    reset();
  };

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200 bg-white">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="cityName"
              className="text-sm font-medium text-gray-700"
            >
              Enter city name
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                id="cityName"
                {...register("cityName", { required: true })}
                placeholder="e.g. Dhaka"
                className="flex-1"
              />
              <Button type="submit" className="sm:w-auto w-full">
                Search
              </Button>
            </div>
            {errors.cityName && (
              <p className="text-sm text-red-600">City name is required</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
