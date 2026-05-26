"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";

function ErrorPage() {
  const { t } = useTranslations();
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        margin: "0 auto",
      }}
    >
      <h1 className="text-3xl font-bold">BA Torment</h1>
      <div className="text-center py-8">
        <Image src="/error.png" alt="Error" width={192} height={192} className="mx-auto mb-4" />
        <p className="text-muted-foreground">{t("ui.errorPage.title")}</p>
      </div>
      <div className="space-y-2 w-96">
        <Button className="w-full" onClick={() => window.location.reload()}>
          {t("ui.errorPage.retry")}
        </Button>
        <Button className="w-full" asChild>
          <a href="mailto:haulrest@gmail.com" target="_blank">
            {t("error.title")} ({t("support.line.contact.mail")})
          </a>
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
