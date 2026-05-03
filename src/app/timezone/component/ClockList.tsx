"use client";

import {memo, useState} from "react";
import {Clock} from "lucide-react";
import ClockCard from "./ClockCard";
import {cn} from "@/lib/utils";
import type {ClockListProps} from "@/app/timezone/types";

function ClockList({timezones, onRemove, onReorder}: ClockListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (timezones.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6">
        <Clock className="text-gray-300 mb-4" size={48}/>
        <p className="text-gray-600 font-medium">No timezones yet</p>
        <p className="text-gray-400 text-sm mt-2">
          Search above to add a city
        </p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    onReorder(draggedIndex, idx);
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {timezones.map((tz, idx) => (
        <div
          key={tz}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
          className={cn(
            "cursor-grab active:cursor-grabbing transition-opacity",
            draggedIndex === idx && "opacity-40"
          )}
        >
          <ClockCard timezone={tz} onRemove={onRemove}/>
        </div>
      ))}
    </div>
  );
}

export default memo(ClockList);
