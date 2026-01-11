"use client";

import { useState, useCallback, useEffect } from "react";
import { useTotalAnalysis } from "@/hooks/use-total-analysis";
import { RaidUsageTable } from "./RaidUsageTable";
import { LunaticClearChart } from "./LunaticClearChart";
import { CharacterAnalysis } from "./CharacterAnalysis";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function TotalAnalysisLayout() {
  const { data, isLoading } = useTotalAnalysis();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  if (isLoading || !data) {
    return (
      <div className="w-full max-w-[1200px] mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto overflow-x-hidden flex flex-col items-center gap-6">
      <div className="w-full max-w-full md:max-w-[1200px] overflow-hidden px-2 sm:px-4 md:px-0">
        <p className="text-muted-foreground text-sm sm:text-base">
          전용무기 4성 + LUNATIC 난이도 이후의 통계에요.
        </p>
      </div>

      <div className="w-full max-w-full md:max-w-[1200px] overflow-hidden px-2 sm:px-4 md:px-0">
        <CharacterAnalysis data={data} />
      </div>

      <hr className="w-full max-w-full md:max-w-[1200px]" />

      <div className="w-full max-w-full md:max-w-[1200px] overflow-hidden px-2 sm:px-4 md:px-0">
        <LunaticClearChart data={data} />
      </div>

      <div className="w-full max-w-full md:max-w-[1200px] px-2 sm:px-12 md:px-12 overflow-hidden">
        <Carousel
          opts={{
            loop: true,
            align: "start",
          }}
          setApi={setApi}
          className="w-full max-w-full"
        >
          <CarouselContent className="-ml-2 sm:-ml-4 max-w-full">
            <CarouselItem className="pl-2 sm:pl-4 basis-full md:basis-1/2">
              <RaidUsageTable
                data={data}
                type="striker"
                title="STRIKER 사용률 TOP 5"
              />
            </CarouselItem>
            <CarouselItem className="pl-2 sm:pl-4 basis-full md:basis-1/2">
              <RaidUsageTable
                data={data}
                type="special"
                title="SPECIAL 사용률 TOP 5"
              />
            </CarouselItem>
            <CarouselItem className="pl-2 sm:pl-4 basis-full md:basis-1/2">
              <RaidUsageTable
                data={data}
                type="assist"
                title="조력자 사용률 TOP 3"
                limit={3}
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        {/* 모바일 dot indicator */}
        <div className="flex sm:hidden justify-center gap-2 mt-3">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                current === index ? "bg-primary" : "bg-muted-foreground/30"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
