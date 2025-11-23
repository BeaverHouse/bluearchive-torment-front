"use client"

import Image from "next/image"
import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ImageSelectOption, BaseSelectProps } from "@/types/ui"
import { StudentSearchData } from "@/utils/search"

interface SearchableSelectProps extends BaseSelectProps {
  options: ImageSelectOption[]
  value: string
  onValueChange: (value: string) => void
  studentSearchMap?: StudentSearchData
}

const OptionImage = ({ value, label }: { value: string | number; label: string }) => {
  const [error, setError] = React.useState(false);

  return (
    <Image
      src={error ? "/empty.webp" : `${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${value}.webp`}
      alt={label}
      width={16}
      height={16}
      className="rounded object-cover flex-shrink-0"
      onError={() => setError(true)}
    />
  );
}

const OptionContent = ({ option, textClassName }: { option: ImageSelectOption; textClassName?: string }) => (
  <div className="flex items-center gap-2 flex-1 min-w-0">
    <OptionImage value={option.value} label={option.label} />
    <span className={cn("truncate", textClassName)}>{option.label}</span>
  </div>
)

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "학생 선택...",
  className,
  disabled = false,
  studentSearchMap
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find(option => option.value.toString() === value)

  // 검색용 문자열 생성 (이름 + 동의어)
  const getSearchableValue = React.useCallback((option: ImageSelectOption) => {
    const studentData = studentSearchMap?.[option.value.toString()];
    if (studentData) {
      const keywords = studentData.searchKeywords?.join(' ') || '';
      return `${option.label}-${option.value}-${studentData.nameJa}-${keywords}`;
    }
    return `${option.label}-${option.value}`;
  }, [studentSearchMap]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <OptionContent option={selectedOption} textClassName="text-xs" />
          ) : (
            <span className="text-muted-foreground text-xs">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="학생 검색..." className="text-xs" />
          <CommandList>
            <CommandEmpty>학생을 찾을 수 없습니다.</CommandEmpty>
            <CommandGroup className="max-h-48 overflow-y-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={getSearchableValue(option)}
                  onSelect={() => {
                    onValueChange(option.value.toString())
                    setOpen(false)
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      value === option.value.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <OptionContent option={option} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}