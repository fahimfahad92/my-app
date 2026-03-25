"use client";

import * as Select from "@radix-ui/react-select";
import {Check, ChevronDown} from "lucide-react";

type Props = {
  onAdd: (tz: string) => void;
  selected: string[];
  options: string[];
};

export default function TimezoneSelector({onAdd, selected, options}: Props) {
  return (
    <div className="w-full">
      <Select.Root
        onValueChange={(value) => {
          if (!selected.includes(value)) {
            onAdd(value);
          }
        }}
      >
        <Select.Trigger
          className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black">
          <Select.Value placeholder="Select a timezone..."/>
          <Select.Icon>
            <ChevronDown size={16}/>
          </Select.Icon>
        </Select.Trigger>
        
        <Select.Content className="z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border bg-white shadow-lg">
          <Select.Viewport className="p-2">
            {options.map((tz) => (
              <Select.Item
                key={tz}
                value={tz}
                className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
              >
                <Select.ItemText>{tz}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2">
                  <Check size={16}/>
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}