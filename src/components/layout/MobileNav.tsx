"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, CreditCard, PieChart, Settings } from "lucide-react";

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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Vibes Expense</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {routes.map((route) => (
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
