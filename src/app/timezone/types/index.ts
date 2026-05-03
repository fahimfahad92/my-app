import type {TimezoneEntry} from "@/app/timezone/data/TIMEZONES";

export type Timezone = string;
export type {TimezoneEntry};

export interface ClockCardProps {
  timezone: Timezone;
  onRemove: (tz: Timezone) => void;
}

export interface ClockListProps {
  timezones: Timezone[];
  onRemove: (tz: Timezone) => void;
  onReorder: (from: number, to: number) => void;
}

export interface TimezoneSelectorProps {
  options: TimezoneEntry[];
  selected: Timezone[];
  onAdd: (tz: Timezone) => void;
}

export const MAX_TIMEZONES = 12;
