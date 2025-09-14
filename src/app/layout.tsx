"use client";

import type { Metadata } from "next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
          <SidebarProvider>
            <AppSidebar />
            <div className="flex-1">
              <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                  <SidebarTrigger />
                </div>
              </header>
              <div className="flex-1 space-y-4 p-4 pt-6">
                {children}
              </div>
            </div>
          </SidebarProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
