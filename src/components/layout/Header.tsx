"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileNav } from "@/components/layout/MobileNav";

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ toggleSidebar, sidebarCollapsed }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <header className="h-14 sm:h-16 border-b bg-background">
        <div className="flex h-full items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <div className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-1 hidden md:flex"
              aria-label="Toggle sidebar"
            >
              <div className="h-5 w-5" />
            </Button>
            <h2 className="text-base sm:text-lg font-semibold">VibesExpense</h2>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon">
              <div className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-14 sm:h-16 border-b bg-background">
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 pr-0 max-w-[280px] sm:max-w-[320px]">
              <MobileNav />
            </SheetContent>
          </Sheet>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-1 hidden md:flex"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
          <h2 className="text-base sm:text-lg font-semibold">VibesExpense</h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}