"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, CreditCard, PieChart, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
}

const routes = [
  {
    href: "/dashboard",
    label: "Painel de Controle",
    icon: BarChart3,
  },
  {
    href: "/expenses",
    label: "Despesas",
    icon: CreditCard,
  },
  {
    href: "/categories",
    label: "Categorias",
    icon: PieChart,
  },
  {
    href: "/reports",
    label: "Relatórios",
    icon: Settings,
  },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden border-r bg-background md:block transition-all duration-300",
          collapsed ? "w-[60px]" : "w-[220px]"
        )}
      >
        <div className="flex h-full flex-col">
          <div className={cn(
            "flex h-14 items-center border-b px-3",
            collapsed && "justify-center"
          )}>
            <Link href="/" className="flex items-center space-x-2">
              {!collapsed && <span className="font-bold">Vibes Expense</span>}
              {collapsed && <span className="font-bold text-xl">VE</span>}
            </Link>
          </div>
          <ScrollArea className="flex-1">
            <div className={cn(
              "space-y-1 p-2",
              collapsed && "flex flex-col items-center"
            )}>
              <TooltipProvider>
                {routes.map((route) => (
                  collapsed ? (
                    <Tooltip key={route.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={route.href}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground",
                            pathname === route.href
                              ? "bg-accent text-accent-foreground"
                              : "transparent"
                          )}
                        >
                          <route.icon className="h-5 w-5" />
                          <span className="sr-only">{route.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {route.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        pathname === route.href
                          ? "bg-accent text-accent-foreground"
                          : "transparent"
                      )}
                    >
                      <route.icon className="mr-2 h-5 w-5" />
                      {route.label}
                    </Link>
                  )
                ))}
              </TooltipProvider>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}