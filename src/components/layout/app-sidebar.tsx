"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Video,
  Calculator,
  ChevronDown,
  PieChart,
  Search,
  Sprout,
} from "lucide-react";
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
import { useTranslations } from "@/lib/i18n";

type MenuItem = {
  titleKey: string;
  url?: string;
  icon?: typeof Home;
  image?: string;
  subItems?: { titleKey: string; url: string }[];
};

const menuItems: MenuItem[] = [
  { titleKey: "nav.home", url: "/", icon: Home },
  { titleKey: "nav.guide", url: "/guide", icon: Sprout },
  { titleKey: "nav.party", url: "/party", icon: Search },
  { titleKey: "nav.analysis", url: "/analysis", icon: PieChart },
  { titleKey: "nav.video", url: "/video-analysis", icon: Video },
  { titleKey: "nav.arona", url: "/arona", image: "/arona.webp" },
  {
    titleKey: "nav.calculator",
    icon: Calculator,
    subItems: [{ titleKey: "nav.calculator.score", url: "/calculator/score" }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const { t } = useTranslations();

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
          <p className="text-sm text-muted-foreground">{t("site.tagline")}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.menu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const title = t(item.titleKey);
                if (item.subItems) {
                  const Icon = item.icon;
                  return (
                    <Collapsible
                      key={item.titleKey}
                      defaultOpen
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            {Icon && <Icon />}
                            <span>{title}</span>
                            <ChevronDown className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-4 mt-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuButton
                                key={subItem.titleKey}
                                asChild
                                isActive={pathname === subItem.url}
                                className="pl-8"
                              >
                                <Link
                                  href={subItem.url}
                                  onClick={handleMenuClick}
                                >
                                  <span>{t(subItem.titleKey)}</span>
                                </Link>
                              </SidebarMenuButton>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url!} onClick={handleMenuClick}>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={title}
                            width={16}
                            height={16}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          Icon && <Icon />
                        )}
                        <span>{title}</span>
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
