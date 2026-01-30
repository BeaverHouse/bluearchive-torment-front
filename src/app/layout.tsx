import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ClientProviders } from "@/components/providers/client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BA Torment",
  description:
    "블루 아카이브 총력전/대결전 파티 찾기, 영상 분석, 통계 도우미. Blue Archive Raid Party Finder, Video Analysis, Statistics.",
  keywords: [
    "블루 아카이브",
    "Blue Archive",
    "총력전",
    "대결전",
    "파티",
    "공략",
    "Raid",
    "Party",
  ],
  openGraph: {
    title: "BA Torment",
    description: "블루 아카이브 총력전/대결전 도우미",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

  return (
    <html lang="ko">
      <head>
        <meta name="google-adsense-account" content="ca-pub-8498528248407607" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {/* AdSense 스크립트: 승인 후 활성화
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8498528248407607"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        */}
        <GoogleAnalytics gaId={gaId} />
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
