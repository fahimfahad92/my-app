"use client";

import {memo} from "react";
import ClockCard from "./ClockCard";
import type {ClockListProps} from "@/app/timezone/types";

function ClockList({timezones, onRemove}: ClockListProps) {
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
        <ClockCard key={tz} timezone={tz} onRemove={onRemove}/>
      ))}
    </div>
  );
}

export default memo(ClockList);
