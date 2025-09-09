"use client";

import type { Metadata } from "next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
      },
    },
  });

  return (
    <html lang="ko">
      <head>
        <title>BA Torment</title>
        <meta name="description" content="Blue Archive Party Finder" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
