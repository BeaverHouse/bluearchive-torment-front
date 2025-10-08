"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SingleSelectOption {
  value: string;
  label: string;
}

export interface SingleSelectProps {
  options: SingleSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SingleSelect({
  options,
  value,
  onChange,
  placeholder = "선택하세요",
}: SingleSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
