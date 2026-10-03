"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n";

export interface SingleSelectOption {
  value: string;
  label: string;
  /** Short status shown as a badge after the label, in the list and in the selected value. */
  badge?: string | null;
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
  placeholder,
}: SingleSelectProps) {
  const { t } = useTranslations();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder={placeholder ?? t("ui.select.placeholder")} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.badge && <Badge variant="secondary">{option.badge}</Badge>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
