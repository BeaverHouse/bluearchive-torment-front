import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CascaderOption {
  value: number;
  label: string;
  children?: CascaderOption[];
}

interface CascaderProps {
  options: CascaderOption[];
  value?: number[][];
  onChange?: (value: number[][]) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
}

export function Cascader({
  options,
  value = [],
  onChange,
  placeholder = "선택하세요",
  className,
  multiple = false,
  allowClear = true,
  showSearch = false,
}: CascaderProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSelect = (selectedValue: number[]) => {
    if (!multiple) {
      onChange?.([selectedValue]);
      setOpen(false);
      return;
    }

    const newValue = [...value];
    const existingIndex = newValue.findIndex(
      (item) =>
        item.length === selectedValue.length &&
        item.every((val, idx) => val === selectedValue[idx])
    );

    if (existingIndex >= 0) {
      newValue.splice(existingIndex, 1);
    } else {
      newValue.push(selectedValue);
    }

    onChange?.(newValue);
  };

  const isSelected = (selectedValue: number[]) => {
    return value.some(
      (item) =>
        item.length === selectedValue.length &&
        item.every((val, idx) => val === selectedValue[idx])
    );
  };

  const removeValue = (indexToRemove: number) => {
    const newValue = [...value];
    newValue.splice(indexToRemove, 1);
    onChange?.(newValue);
  };

  const clearAll = () => {
    onChange?.([]);
  };

  const filteredOptions = React.useMemo(() => {
    if (!showSearch || !searchValue) return options;

    return options.filter((option) => {
      const parentMatch = option.label
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const childMatch = option.children?.some((child) =>
        child.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      return parentMatch || childMatch;
    });
  }, [options, searchValue, showSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex-1 text-left truncate">
            {value.length > 0 ? (
              multiple ? (
                <div className="flex flex-wrap gap-1">
                  {value.map((item, index) => {
                    const displayLabel = (() => {
                      if (item.length === 1) {
                        const parent = options.find(
                          (opt) => opt.value === item[0]
                        );
                        return parent?.label || "Unknown";
                      } else if (item.length === 2) {
                        const parent = options.find(
                          (opt) => opt.value === item[0]
                        );
                        const child = parent?.children?.find(
                          (child) => child.value === item[1]
                        );
                        return child?.label || parent?.label || "Unknown";
                      }
                      return "Unknown";
                    })();

                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs min-w-0 shrink-0"
                        title={displayLabel}
                      >
                        <span className="min-w-0">{displayLabel}</span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValue(index);
                          }}
                          className="ml-1 hover:text-blue-600 cursor-pointer flex-shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </div>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-sm">
                  {(() => {
                    const item = value[0];
                    if (item.length === 1) {
                      const parent = options.find(
                        (opt) => opt.value === item[0]
                      );
                      return parent?.label || "Unknown";
                    } else if (item.length === 2) {
                      const parent = options.find(
                        (opt) => opt.value === item[0]
                      );
                      const child = parent?.children?.find(
                        (child) => child.value === item[1]
                      );
                      return child?.label || parent?.label || "Unknown";
                    }
                    return "Unknown";
                  })()}
                </span>
              )
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {allowClear && value.length > 0 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="p-0.5 hover:text-foreground rounded-sm hover:bg-muted cursor-pointer"
              >
                <X className="h-4 w-4" />
              </div>
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
          <div className="p-2 border-b">
            <input
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="검색..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        )}
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.map((option) => (
            <div key={option.value}>
              <div
                className="flex items-center p-2 hover:bg-muted cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelect([option.value])}
              >
                <div className="flex items-center flex-1">
                  <div className="mr-2">
                    {multiple ? (
                      <div
                        className={cn(
                          "w-4 h-4 rounded border border-gray-300 flex items-center justify-center",
                          isSelected([option.value]) &&
                            "bg-blue-600 border-blue-600"
                        )}
                      >
                        {isSelected([option.value]) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    ) : (
                      <input
                        type="radio"
                        name="cascader-option"
                        checked={isSelected([option.value])}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </div>
              {option.children?.map((child, childIndex) => (
                <div
                  key={`${option.value}-${child.value}-${childIndex}`}
                  className="flex items-center p-2 pl-8 hover:bg-muted cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect([option.value, child.value])}
                >
                  <div className="mr-2">
                    {multiple ? (
                      <div
                        className={cn(
                          "w-4 h-4 rounded border border-gray-300 flex items-center justify-center",
                          isSelected([option.value, child.value]) &&
                            "bg-blue-600 border-blue-600"
                        )}
                      >
                        {isSelected([option.value, child.value]) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    ) : (
                      <input
                        type="radio"
                        name="cascader-option"
                        checked={isSelected([option.value, child.value])}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                  <span className="text-sm">{child.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {showSearch && (
          <div className="p-2 border-t text-xs text-muted-foreground">
            ※ 성급 관계없이 보고 싶다면 부모 항목을 선택하세요.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
