"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { useAuth } from "@/hooks/use-auth";
import { YaaLogo } from "@/components/landing/YaaLogo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Route guard: redirect to /login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-yaa-green-500 flex items-center justify-center mb-3">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
              <path d="M7 9 L11 9 L13.5 23" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M13 13 L29 13 L27 22 L15 22 Z" fill="#F7931A" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="16" cy="26" r="1.6" fill="white" />
              <circle cx="26" cy="26" r="1.6" fill="white" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect is in progress)
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden md:block flex-shrink-0">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
