"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {LineChartComponentProps} from "../types/weather-types";

function formatHour(timeString: string): string {
  const hhmm = timeString.slice(11, 16);
  const h = parseInt(hhmm.slice(0, 2), 10);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}${period}`;
}

export default function LineChartComponent({date, chartData, unit}: LineChartComponentProps) {
  if (!chartData?.length) {
    return <div className="text-center text-gray-500 text-sm">No data available.</div>;
  }

  const tempKey = unit === "C" ? "temp" : "temp_f";
  const feelsKey = unit === "C" ? "feelslike_c" : "feelslike_f";
  const unitLabel = unit === "C" ? "°C" : "°F";

  const processedData = chartData
    .filter((_, i) => i % 3 === 0)
    .map((item) => ({
      hour: formatHour(item.hour),
      temp: unit === "C" ? item.temp : item.temp_f,
      feelslike: unit === "C" ? item.feelslike_c : item.feelslike_f,
      chance_of_rain: item.chance_of_rain,
      icon: item.icon,
    }));

  // suppress unused variable warnings — these are used as recharts dataKey strings
  void tempKey;
  void feelsKey;

  return (
    <div>
      <p className="text-base font-semibold text-gray-800 mb-1">{date} — Hourly Temperature</p>
      <div className="w-full h-56 md:h-[22rem]">
        <ResponsiveContainer>
          <ComposedChart data={processedData} margin={{top: 10, right: 10, left: -10, bottom: 5}}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(59,130,246)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="rgb(59,130,246)" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>

            <XAxis dataKey="hour" tick={{fontSize: 11}} tickMargin={6}/>
            <YAxis yAxisId="temp" tick={{fontSize: 11}} tickFormatter={(v) => `${v}${unitLabel}`} width={42}/>
            <YAxis yAxisId="rain" orientation="right" tick={{fontSize: 11}} tickFormatter={(v) => `${v}%`} domain={[0, 100]} width={36}/>

            <Tooltip
              content={({active, payload, label}) => {
                if (!active || !payload?.length) return null;
                const temp = payload.find((p) => p.dataKey === "temp")?.value;
                const feelslike = payload.find((p) => p.dataKey === "feelslike")?.value;
                const rain = payload.find((p) => p.dataKey === "chance_of_rain")?.value;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow text-xs text-gray-800 space-y-0.5">
                    <p className="font-semibold">{label}</p>
                    {temp !== undefined && <p>Temp: {temp}{unitLabel}</p>}
                    {feelslike !== undefined && <p>Feels like: {feelslike}{unitLabel}</p>}
                    {rain !== undefined && <p>Rain: {rain}%</p>}
                  </div>
                );
              }}
            />

            <Bar yAxisId="rain" dataKey="chance_of_rain" fill="rgba(59,130,246,0.25)" radius={[3, 3, 0, 0]} barSize={16}/>
            <Area yAxisId="temp" type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={2} fill="url(#tempGradient)" dot={false}/>
            <Area yAxisId="temp" type="monotone" dataKey="feelslike" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" fill="none" dot={false}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center">— Temp · - - Feels like · bars = rain chance</p>
    </div>
  );
}
