"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { getRoleDisplayName } from "@/lib/auth/role-labels";
import type { AppRole } from "@/lib/auth/rbac";

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  const s = (name?.trim() || email?.split("@")[0] || "U").slice(0, 2);
  if (s.length >= 2) return s.toUpperCase();
  return (s + s).slice(0, 2).toUpperCase();
}

export function UserMenu({ className }: { className?: string }): JSX.Element {
  const { data: session, status } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user?.image;

  if (status === "loading") {
    return <div className={cn("h-9 w-9 animate-pulse rounded-full bg-[hsl(var(--color-panel-muted))]", className)} aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] px-3 py-2 text-sm text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-panel-muted))]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex max-w-full items-center gap-2 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] py-1.5 pl-1.5 pr-2 text-left text-sm transition-colors hover:bg-[hsl(var(--color-panel-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))]",
            className
          )}
          aria-label="Account menu"
        >
          {image ? (
            <img
              src={image}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
              width={32}
              height={32}
            />
          ) : (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-primary-soft))] text-xs font-medium text-[hsl(var(--color-primary))]"
              aria-hidden
            >
              {getInitials(name, email)}
            </span>
          )}
          <div className="min-w-0 flex-1 max-sm:hidden">
            <p className="truncate text-sm font-medium leading-tight text-[hsl(var(--color-text))]">{name ?? "Account"}</p>
            <p className="truncate text-xs text-[hsl(var(--color-text-muted))]">{email ?? ""}</p>
            {role ? (
              <Badge className="mt-1" variant="neutral">
                {getRoleDisplayName(role)}
              </Badge>
            ) : null}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--color-text-muted))]" aria-hidden />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[220px] overflow-hidden rounded-[var(--radius-md)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-1 shadow-[var(--shadow-sm)] data-[side=bottom]:origin-top-right"
          sideOffset={6}
          align="end"
        >
          <div className="border-b border-[hsl(var(--color-border))] px-2 py-2 sm:hidden">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-[hsl(var(--color-text-muted))]">{email}</p>
            {role ? (
              <Badge className="mt-1" variant="neutral">
                {getRoleDisplayName(role)}
              </Badge>
            ) : null}
          </div>
          <DropdownMenu.Item
            className="cursor-default rounded-[var(--radius-sm)] px-2 py-2 text-sm text-[hsl(var(--color-text-muted))] outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-[hsl(var(--color-panel-muted))]"
            onSelect={(event) => event.preventDefault()}
            disabled
          >
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
              <span className="ml-auto text-xs">Coming soon</span>
            </span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            asChild
            className="cursor-pointer rounded-[var(--radius-sm)] px-0 py-0 text-sm outline-none data-[highlighted]:bg-[hsl(var(--color-panel-muted))]"
          >
            <Link href="/settings" className="flex items-center gap-2 px-2 py-2 text-[hsl(var(--color-text))]">
              <Settings className="h-4 w-4 text-[hsl(var(--color-text-muted))]" />
              Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[hsl(var(--color-border))]" />
          <DropdownMenu.Item
            onSelect={() => {
              void signOut({ callbackUrl: "/login" });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm text-rose-700 outline-none data-[highlighted]:bg-rose-50 dark:data-[highlighted]:bg-rose-950/30"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
