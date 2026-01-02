"use client";

import { TotalAnalysisData } from "@/types/total-analysis";
import { RaidUsageTable } from "./RaidUsageTable";
import { LunaticClearChart } from "./LunaticClearChart";
import { CharacterAnalysis } from "./CharacterAnalysis";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface TotalAnalysisLayoutProps {
  data: TotalAnalysisData;
}

export function TotalAnalysisLayout({ data }: TotalAnalysisLayoutProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-[1200px]">
        <p className="text-muted-foreground">
          일본 서버 S80 시가지 호드부터의 통계에요.
          <br />이 때부터 전용무기 4성과 LUNATIC 난이도가 동시에 적용되기 때문에
          기준으로 했어요.
        </p>
      </div>

      <div className="w-full max-w-[1200px]">
        <CharacterAnalysis data={data} />
      </div>

      <hr className="w-full max-w-[1200px]" />

      <div className="w-full max-w-[1200px]">
        <LunaticClearChart data={data} />
      </div>

      <div className="w-full max-w-[1200px] px-12">
        <Carousel
          opts={{
            loop: true,
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            <CarouselItem className="pl-4 basis-full md:basis-1/2">
              <RaidUsageTable
                data={data}
                type="striker"
                title="STRIKER 사용률 TOP 5"
              />
            </CarouselItem>
            <CarouselItem className="pl-4 basis-full md:basis-1/2">
              <RaidUsageTable
                data={data}
                type="special"
                title="SPECIAL 사용률 TOP 5"
              />
            </CarouselItem>
            <CarouselItem className="pl-4 basis-full md:basis-1/2">
              <RaidUsageTable
                data={data}
                type="assist"
                title="조력자 사용률 TOP 3"
                limit={3}
              />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
