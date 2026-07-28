"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ContextHelpProps {
  label: string;
  title: string;
  items: string[];
  align?: "start" | "center" | "end";
}

export function ContextHelp({
  label,
  title,
  items,
  align = "end",
}: ContextHelpProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
          aria-label={label}
        >
          <CircleHelp className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        collisionPadding={16}
        className="w-[min(20rem,calc(100vw-2rem))] p-3"
      >
        <p className="text-sm font-semibold">{title}</p>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
