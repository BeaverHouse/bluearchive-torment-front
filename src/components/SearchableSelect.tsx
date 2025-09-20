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

interface SearchableSelectProps {
  options: { code: number; name: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
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

  const selectedOption = options.find(option => option.code.toString() === value)

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
                src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${selectedOption.code}.webp`}
                alt={selectedOption.name}
                className="w-4 h-4 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/empty.webp"
                }}
              />
              <span className="truncate text-xs">{selectedOption.name}</span>
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
                  key={option.code}
                  value={`${option.name}-${option.code}`}
                  onSelect={() => {
                    onValueChange(option.code.toString())
                    setOpen(false)
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      value === option.code.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_CDN_URL || ""}/batorment/character/${option.code}.webp`}
                      alt={option.name}
                      className="w-4 h-4 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/empty.webp"
                      }}
                    />
                    <span className="truncate">{option.name}</span>
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