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
    <Card className="w-full max-w-md p-2">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="cityName">Enter city name</Label>
            <div className="flex gap-2">
              <Input
                id="cityName"
                {...register("cityName", { required: true })}
                placeholder="e.g. Dhaka"
              />
              <Button type="submit">Search</Button>
            </div>
            {errors.cityName && (
              <span className="text-red-600">City name is required</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
