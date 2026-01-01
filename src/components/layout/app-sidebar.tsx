"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Video, Calculator, ChevronDown, PieChart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "홈",
    url: "/",
    icon: Home,
  },
  {
    title: "영상 분석",
    url: "/video-analysis",
    icon: Video,
  },
  {
    title: "종합 분석",
    url: "/total-analysis",
    icon: PieChart,
  },
  {
    title: "계산기",
    icon: Calculator,
    subItems: [
      {
        title: "점수 계산기",
        url: "/calculator/score",
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-semibold">BA Torment</h2>
          <p className="text-sm text-muted-foreground">
            블루 아카이브 파티 찾기
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.subItems) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            <item.icon />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.title}
                                asChild
                                isActive={pathname === subItem.url}
                                className="pl-8"
                              >
                                <Link
                                  href={subItem.url}
                                  onClick={handleMenuClick}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url} onClick={handleMenuClick}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
