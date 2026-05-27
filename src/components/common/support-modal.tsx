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
import { useTranslations } from "@/lib/i18n";

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
  const { t } = useTranslations();
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("support.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>{t("support.line.adFree")}</li>
            <li>{t("support.line.serverCost")}</li>
            <li>{t("support.line.openChat")}</li>
            <li className="flex items-center gap-1">
              {t("support.line.contact.prefix")}
              <a
                href="mailto:haulrest@gmail.com"
                className="inline-flex items-center gap-1 text-foreground underline underline-offset-2 hover:text-primary"
              >
                <Mail className="w-3 h-3" />
                {t("support.line.contact.mail")}
              </a>
              {t("support.line.contact.suffix")}
            </li>
          </ul>

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
              title="KakaoTalk OpenChat"
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
  const { t } = useTranslations();
  return (
    <SupportModal>
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
        <Heart className="w-4 h-4 text-red-500" />
        {t("home.support")}
      </Button>
    </SupportModal>
  );
}
