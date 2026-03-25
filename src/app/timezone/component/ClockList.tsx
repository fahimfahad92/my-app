"use client";

import ClockCard from "./ClockCard";

export default function ClockList({
                                    timezones,
                                    onRemove,
                                  }: {
  timezones: string[];
  onRemove: (tz: string) => void;
}) {
  if (timezones.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-6">
        No timezones selected
      </p>
    );
  }
  
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {timezones.map((tz) => (
        <ClockCard key={`${tz}`} timezone={tz} onRemove={() => onRemove(tz)}/>
      ))}
    </div>
  );
}