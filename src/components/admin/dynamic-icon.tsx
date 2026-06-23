"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

/**
 * Dynamic Lucide icon by name.
 */
export function DynamicIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) {
    return <Icons.Circle {...props} />;
  }
  return <Icon {...props} />;
}
