"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TouchProvider } from "@/components/ui/custom/hybrid-tooltip";
import { DarkModeToggle } from "@/components/layout/dark-mode-toggle";
import { CustomSidebarTrigger } from "@/components/layout/sidebar-trigger";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import NormalAnnounce from "@/components/common/normal-announce";
import { I18nProvider } from "@/lib/i18n";
import { useState } from "react";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <I18nProvider>
      <TouchProvider>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex-1 flex flex-col min-h-screen">
              <NormalAnnounce />
              <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center gap-2 px-4">
                  <CustomSidebarTrigger />
                  <div className="flex-1" />
                  <LanguageSwitcher compact />
                  <DarkModeToggle />
                </div>
              </header>
              <div id="sub-nav-mount" className="sticky top-14 z-30" />
              <main className="flex-1 space-y-4 p-4 pt-6">{children}</main>
              <Footer />
              <ScrollToTop />
            </div>
          </SidebarProvider>
        </QueryClientProvider>
      </TouchProvider>
    </I18nProvider>
  );
}
