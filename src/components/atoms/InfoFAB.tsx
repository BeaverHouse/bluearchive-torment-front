"use client";

import React from "react";
import { Info, ArrowUp } from "lucide-react";
import BuyMeACoffeeButton from "./Coffee";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const InfoFAB: React.FC = () => {
  const scrollToTop = () => {
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>BA Torment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Blue Archive copyrighted by NEXON GAMES & YOSTAR</p>
                <p>2023-2024, powered by Austin</p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://schaledb.com/" target="_blank">
                    Schale DB
                  </a>
                </Button>
                <Button variant="outline" className="w-full mb-6" asChild>
                  <a href="https://arona.ai" target="_blank">
                    ARONA.AI
                  </a>
                </Button>

                <Button className="w-full" asChild>
                  <a
                    href="https://github.com/BeaverHouse/bluearchive-torment-front"
                    target="_blank"
                  >
                    GitHub
                  </a>
                </Button>
                <Button className="w-full" asChild>
                  <a href="mailto:haulrest@gmail.com" target="_blank">
                    오류 제보 (이메일)
                  </a>
                </Button>
              </div>

              <div className="flex justify-center mt-4">
                <BuyMeACoffeeButton />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default InfoFAB;
