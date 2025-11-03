"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export function CustomSidebarTrigger() {
  return (
    <SidebarTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
      <Menu className="h-4 w-4" />
    </SidebarTrigger>
  );
}
