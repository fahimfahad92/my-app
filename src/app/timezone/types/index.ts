export type Timezone = string;

export interface ClockCardProps {
  timezone: Timezone;
  onRemove: (tz: Timezone) => void;
}

export interface ClockListProps {
  timezones: Timezone[];
  onRemove: (tz: Timezone) => void;
  onReorder: (from: number, to: number) => void;
}

export const MAX_TIMEZONES = 12;

export interface TimezoneSelectorProps {
  options: Timezone[];
  selected: Timezone[];
  onAdd: (tz: Timezone) => void;
}
