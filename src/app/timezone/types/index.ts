export type Timezone = string;

export interface ClockCardProps {
  timezone: Timezone;
  onRemove: () => void;
}

export interface ClockListProps {
  timezones: Timezone[];
  onRemove: (tz: Timezone) => void;
}

export interface TimezoneSelectorProps {
  options: Timezone[];
  selected: Timezone[];
  onAdd: (tz: Timezone) => void;
}
