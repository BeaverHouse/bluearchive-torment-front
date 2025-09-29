"use client"

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

interface SearchableSelectProps extends BaseSelectProps {
  options: ImageSelectOption[]
  value: string
  onValueChange: (value: string) => void
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "학생 선택...",
  className,
  disabled = false
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find(option => option.value.toString() === value)

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
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img 
                src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${selectedOption.value}.webp`}
                alt={selectedOption.label}
                className="w-4 h-4 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/empty.webp"
                }}
              />
              <span className="truncate text-xs">{selectedOption.label}</span>
            </div>
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
                  value={`${option.label}-${option.value}`}
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
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${option.value}.webp`}
                      alt={option.label}
                      className="w-4 h-4 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/empty.webp"
                      }}
                    />
                    <span className="truncate">{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}