"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type PropsWithChildren } from "react";
import {
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  MapPin,
  ScrollText,
  Search,
  UserCog,
  Workflow
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { CommandPalette } from "@/components/ux/command-palette";
import { UserMenu } from "@/components/layout/user-menu";
import { getNavItemsForRole } from "@/lib/auth/nav";
import type { AppRole } from "@/lib/auth/rbac";

const iconByHref: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/events": Workflow,
  "/calendar": CalendarDays,
  "/venues": MapPin,
  "/departments": Building2,
  "/users": UserCog,
  "/analytics": ChartNoAxesCombined,
  "/audit-logs": ScrollText,
  "/notifications": Inbox
};

export function AppShell({ children }: PropsWithChildren): JSX.Element {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const nav = getNavItemsForRole(role).map((item) => ({
    ...item,
    icon: iconByHref[item.href] ?? ClipboardList
  }));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text))]">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[auto_1fr]">
        <aside
          className={cn(
            "border-r border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-3 transition-all duration-[var(--motion-default)]",
            collapsed ? "w-[84px]" : "w-[260px]"
          )}
        >
          <div className={cn("mb-6 flex gap-2 px-1 py-1", collapsed ? "flex-col items-center" : "items-center justify-between")}>
            <Link href="/dashboard" className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}>
              <Image
                src="/branding/ibbul-logo.png"
                alt="IBBUL"
                width={collapsed ? 40 : 44}
                height={collapsed ? 40 : 44}
                className="shrink-0 object-contain"
              />
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold tracking-tight text-[hsl(var(--color-text))]">IBBUL Events</p>
                  <p className="truncate text-[11px] text-[hsl(var(--color-text-muted))]">Learning for Service</p>
                </div>
              ) : null}
            </Link>
            <button
              aria-label="Toggle sidebar"
              onClick={() => setCollapsed((value) => !value)}
              className="shrink-0 rounded-[var(--radius-sm)] p-2 hover:bg-[hsl(var(--color-panel-muted))]"
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          </div>
          <nav className="space-y-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href as Route}
                className={cn(
                  "flex items-center rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-[var(--motion-fast)]",
                  collapsed ? "justify-center" : "gap-3",
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary))]"
                    : "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-panel-muted))] hover:text-[hsl(var(--color-text))]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? label : null}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="p-4 md:p-6">
          <header className="mb-6 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-4 py-3 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex h-10 w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] px-3 text-left text-sm text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-panel-muted))] sm:max-w-md"
            >
              <Search className="h-4 w-4 shrink-0" />
              Search events, venues, users...
            </button>
            <div className="flex items-center justify-end gap-2">
              <Link
                href="/notifications"
                aria-label="Open notifications"
                className="rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] p-2 hover:bg-[hsl(var(--color-panel-muted))]"
              >
                <Bell className="h-4 w-4" />
              </Link>
              <UserMenu className="shrink-0" />
            </div>
          </header>
          {children}
        </main>
      </div>
      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  );
}
