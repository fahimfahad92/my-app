"use client";

import {memo, useEffect, useState} from "react";
import {logger} from "@/app/util/logger";
import type {ClockCardProps} from "@/app/timezone/types";

function ClockCard({timezone, onRemove}: ClockCardProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      try {
        const formatted = now.toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setTime(formatted);
      } catch (err) {
        logger.error("Invalid timezone:", timezone, err);
        return;
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div
      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-md border hover:shadow-lg transition">
      <div>
        <p className="text-sm text-gray-500">{timezone}</p>
        <p className="text-2xl font-semibold tracking-wide">{time}</p>
      </div>

      <button
        onClick={() => onRemove(timezone)}
        className="text-sm text-red-500 hover:text-red-700"
      >
        Remove
      </button>
    </div>
  );
}

export default memo(ClockCard);
