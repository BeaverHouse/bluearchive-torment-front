import * as React from "react";
import { Check, ChevronDown, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MultiSelectOption, BaseSelectProps } from "@/types/ui";
import { matchesStudentSearch, StudentSearchData } from "@/utils/search";

interface MultiSelectProps extends BaseSelectProps {
  options: MultiSelectOption[];
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  studentSearchMap?: StudentSearchData;
}

export const MultiSelect = React.memo(function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "선택하세요",
  className,
  allowClear = true,
  showSearch = false,
  studentSearchMap,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSelect = React.useCallback(
    (selectedValue: string | number) => {
      const newValue = [...value];
      const existingIndex = newValue.findIndex((item) => item === selectedValue);

      if (existingIndex >= 0) {
        newValue.splice(existingIndex, 1);
      } else {
        newValue.push(selectedValue);
      }

      onChange?.(newValue);
    },
    [value, onChange]
  );

  const isSelected = React.useCallback(
    (selectedValue: string | number) => {
      return value.includes(selectedValue);
    },
    [value]
  );

  const removeValue = React.useCallback(
    (valueToRemove: string | number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = value.filter((item) => item !== valueToRemove);
      onChange?.(newValue);
    },
    [value, onChange]
  );

  const clearAll = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.([]);
    },
    [onChange]
  );

  const filteredOptions = React.useMemo(() => {
    if (!showSearch || !searchValue) return options;

    return options.filter((option) =>
      studentSearchMap
        ? matchesStudentSearch(option.value.toString(), searchValue, studentSearchMap)
        : option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue, showSearch, studentSearchMap]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-10", value.length > 0 ? "h-auto" : "", className)}
        >
          <div className={cn("flex-1 text-left", value.length > 0 ? "" : "truncate")}>
            {value.length > 0 ? (
              <div className="flex flex-wrap gap-1 py-1">
                {value.map((item, index) => {
                  const option = options.find((opt) => opt.value === item);
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs min-w-0 shrink-0"
                      title={option?.label || item?.toString()}
                    >
                      <span className="min-w-0">{option?.label || item}</span>
                      <div
                        onClick={(e) => removeValue(item, e)}
                        className="ml-1 hover:text-red-600 cursor-pointer flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </div>
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {allowClear && value.length > 0 && (
              <button
                onClick={clearAll}
                className="p-0.5 hover:text-foreground rounded-sm hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-none p-0"
        align="start"
      >
        {showSearch && (
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="검색..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        )}
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isOptionSelected = isSelected(option.value);
              return (
                <div
                  key={option.value}
                  className="flex items-center p-2 hover:bg-muted cursor-pointer rounded-sm"
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="mr-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded border border-gray-300 flex items-center justify-center",
                        isOptionSelected && "bg-blue-600 border-blue-600"
                      )}
                    >
                      {isOptionSelected && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm">{option.label}</span>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});
