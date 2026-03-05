"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Mail } from "lucide-react";

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.733 1.617 5.137 4.065 6.563l-.978 3.642a.25.25 0 0 0 .378.277L9.86 19.04A11.34 11.34 0 0 0 12 19.2c5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z" />
    </svg>
  );
}

interface SupportModalProps {
  children: React.ReactNode;
}

export function SupportModal({ children }: SupportModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>후원하기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* 안내 문구 */}
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>BA Torment는 광고 없이 운영됩니다.</li>
            <li>서버비는 사비 + 100% 자율 후원으로만 운영됩니다.</li>
            <li>오픈채팅은 기프티콘 후원용으로만 사용해 주세요.</li>
            <li className="flex items-center gap-1">
              문의는 가능하면
              <a
                href="mailto:haulrest@gmail.com"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-2 hover:text-primary"
              >
                <Mail className="w-3 h-3" />
                메일
              </a>
              로 부탁드립니다.
            </li>
          </ul>

          {/* 후원 버튼 */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href="https://buymeacoffee.com/haulrest"
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 rounded-full overflow-hidden"
              title="Buy me a coffee"
            >
              <Image
                src="/bmc-button.png"
                alt="Buy me a coffee"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </a>
            <a
              href="https://open.kakao.com/o/s8dGffci"
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 rounded-full bg-[#FEE500] hover:bg-[#F5DC00] flex items-center justify-center transition-colors"
              title="카카오 오픈채팅"
            >
              <KakaoIcon className="w-7 h-7 text-[#391B1B]" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SupportButton() {
  return (
    <SupportModal>
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
        <Heart className="w-4 h-4 text-red-500" />
        후원하기
      </Button>
    </SupportModal>
  );
}
