"use client";

import Image from "next/image";
import InfoFAB from "./info-fab";
import { Button } from "@/components/ui/button";

function ErrorPage() {
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
        <p className="text-muted-foreground">에러가 발생했어요..</p>
      </div>
      <div className="space-y-2 w-96">
        <Button className="w-full" onClick={() => window.location.reload()}>
          새로고침
        </Button>
        <Button className="w-full" asChild>
          <a href="mailto:haulrest@gmail.com" target="_blank">
            오류 제보 (이메일)
          </a>
        </Button>
      </div>
      <InfoFAB />
    </div>
  );
}

export default ErrorPage;
