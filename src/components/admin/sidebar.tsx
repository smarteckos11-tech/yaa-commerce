"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DynamicIcon } from "./dynamic-icon";
import { NAV_GROUPS } from "@/lib/admin-data";

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-yaa-green-500 flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Y formed by cart handles */}
            <path d="M10 9 L18 19 L26 9" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 19 L18 22" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
            {/* Cart body */}
            <path d="M14 22 L26 22 L24.5 28 L15.5 28 Z" fill="#F7931A" stroke="white" strokeWidth="1.2" strokeLinejoin="round" />
            {/* Wheels */}
            <circle cx="16.5" cy="30.5" r="1.4" fill="white" />
            <circle cx="23.5" cy="30.5" r="1.4" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm leading-tight text-sidebar-foreground truncate">
              YAA Admin
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Commerce Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors group relative",
                      isActive
                        ? "bg-yaa-green-500 text-white"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      collapsed && "justify-center"
                    )}
                  >
                    <DynamicIcon name={item.icon} className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded",
                              item.badge.variant === "green" &&
                                "bg-yaa-green-100 text-yaa-green-700",
                              item.badge.variant === "orange" &&
                                "bg-yaa-orange-100 text-yaa-orange-700"
                            )}
                          >
                            {item.badge.text}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-yaa-orange-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-md hover:bg-sidebar-accent transition-colors cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-yaa-orange-500 text-white text-xs font-bold">
              MD
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">
                Moussa Diallo
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                Business Plan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-16 h-6 w-6 rounded-full border border-sidebar-border bg-background shadow-sm hover:bg-muted z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </Button>
    </aside>
  );
}
