"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const routes = [
  {
    href: "/dashboard",
    label: "Painel de Controle",
  },
  {
    href: "/expenses",
    label: "Despesas",
  },
  {
    href: "/categories",
    label: "Categorias",
  },
  {
    href: "/reports",
    label: "Relatórios",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <MobileNav />
        </SheetContent>
      </Sheet>
      <div className="hidden border-r bg-background md:block">
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
                  {route.label}
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

function MobileNav() {
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
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 