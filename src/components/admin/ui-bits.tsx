"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DynamicIcon } from "./dynamic-icon";

type StatColor = "green" | "orange" | "blue" | "purple" | "red" | "rose" | "sky" | "yellow" | "emerald" | "amber";

const COLOR_MAP: Record<StatColor, { icon: string; bg: string; text: string }> = {
  green: { icon: "text-yaa-green-600 dark:text-yaa-green-400", bg: "bg-yaa-green-50 dark:bg-yaa-green-950/50", text: "text-yaa-green-600 dark:text-yaa-green-400" },
  orange: { icon: "text-yaa-orange-600 dark:text-yaa-orange-400", bg: "bg-yaa-orange-50 dark:bg-yaa-orange-950/50", text: "text-yaa-orange-600 dark:text-yaa-orange-400" },
  blue: { icon: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50", text: "text-blue-600 dark:text-blue-400" },
  purple: { icon: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/50", text: "text-purple-600 dark:text-purple-400" },
  red: { icon: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-600 dark:text-rose-400" },
  rose: { icon: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50", text: "text-rose-600 dark:text-rose-400" },
  sky: { icon: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/50", text: "text-sky-600 dark:text-sky-400" },
  yellow: { icon: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/50", text: "text-yellow-600 dark:text-yellow-400" },
  emerald: { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", text: "text-emerald-600 dark:text-emerald-400" },
  amber: { icon: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50", text: "text-amber-600 dark:text-amber-400" },
};

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  color = "green",
  icon,
  format = "number",
  suffix,
}: {
  label: string;
  value: number;
  delta?: string;
  trend?: "up" | "down";
  color?: StatColor;
  icon: string;
  format?: "number" | "fcfa" | "percent";
  suffix?: string;
}) {
  const colors = COLOR_MAP[color];
  const display = React.useMemo(() => {
    if (format === "fcfa") return value.toLocaleString("fr-FR") + " FCFA";
    if (format === "percent") return value + "%";
    return value.toLocaleString("fr-FR");
  }, [value, format]);

  return (
    <Card className="p-4 lg:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.bg)}>
          <DynamicIcon name={icon} className={cn("h-5 w-5", colors.icon)} />
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded",
              trend === "up"
                ? "text-yaa-green-700 bg-yaa-green-50 dark:bg-yaa-green-950/50 dark:text-yaa-green-400"
                : "text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta}
          </span>
        )}
      </div>
      <p className="text-2xl lg:text-3xl font-display font-bold tracking-tight">
        {display}
        {suffix && <span className="text-sm font-medium text-muted-foreground ml-1">{suffix}</span>}
      </p>
      <p className="text-xs lg:text-sm text-muted-foreground mt-1">{label}</p>
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display font-bold text-xl lg:text-2xl tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function getLoyaltyColor(value: number): string {
  if (value >= 80) return "bg-yaa-green-500";
  if (value >= 60) return "bg-yaa-orange-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-rose-500";
}
