"use client";

import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command, CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CommandItem {
  id: string;
  title: string;
  hint?: string;
  href?: string;
  action?: () => void;
  tags: string[];
}

const recentStorageKey = "nexus_recent_actions";

export function CommandPalette({ onClose }: { onClose: () => void }): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(recentStorageKey);
    setRecent(raw ? JSON.parse(raw) : []);
  }, []);

  const contextSuggestion =
    pathname === "/events"
      ? "Tip: Press Enter to quickly create a new event."
      : pathname === "/users"
        ? "Tip: Invite users directly from this palette."
        : "Tip: Use command search to jump without navigating menus.";

  const commands = useMemo<CommandItem[]>(
    () => [
      { id: "dashboard", title: "Dashboard", href: "/dashboard", tags: ["home", "control"] },
      { id: "create-event", title: "Create event", href: "/events", tags: ["event", "new"] },
      { id: "events", title: "Events", href: "/events", tags: ["events", "list"] },
      { id: "calendar", title: "Calendar", href: "/calendar", tags: ["schedule"] },
      { id: "venues", title: "Venues", href: "/venues", tags: ["venues"] },
      { id: "users", title: "Users", href: "/users", tags: ["users", "roles"] },
      { id: "analytics", title: "Analytics", href: "/analytics", tags: ["charts", "reports"] },
      { id: "notifications", title: "Notifications", href: "/notifications", tags: ["inbox"] },
      { id: "departments", title: "Departments", href: "/departments", tags: ["departments"] },
      { id: "settings", title: "Settings", href: "/settings", tags: ["settings"] }
    ],
    []
  );

  const filtered = commands.filter((item) =>
    [item.title, ...item.tags].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const runCommand = (item: CommandItem): void => {
    if (item.href) {
      router.push(item.href as Route);
    }
    item.action?.();
    const nextRecent = [item.id, ...recent.filter((entry) => entry !== item.id)].slice(0, 5);
    setRecent(nextRecent);
    window.localStorage.setItem(recentStorageKey, JSON.stringify(nextRecent));
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Enter" && filtered[selected]) {
        event.preventDefault();
        runCommand(filtered[selected]);
      }
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered, onClose, selected, recent]);

  return (
    <div className="fixed inset-0 z-[90] bg-black/20 p-4 backdrop-blur-[2px]">
      <div className="mx-auto mt-16 w-full max-w-2xl rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[hsl(var(--color-border))] p-3">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands, pages, users, events..."
          />
        </div>
        <div className="max-h-[380px] overflow-auto p-2">
          <p className="px-2 py-1 text-xs text-[hsl(var(--color-text-muted))]">{contextSuggestion}</p>
          {filtered.map((item, index) => (
            <button
              key={item.id}
              onClick={() => runCommand(item)}
              className={`mt-1 flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm ${
                selected === index
                  ? "bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary))]"
                  : "hover:bg-[hsl(var(--color-panel-muted))]"
              }`}
            >
              <span>{item.title}</span>
              <span className="text-xs text-[hsl(var(--color-text-muted))]">{item.hint ?? "Go"}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[hsl(var(--color-border))] px-3 py-2 text-xs text-[hsl(var(--color-text-muted))]">
          <span className="inline-flex items-center gap-1">
            <Command className="h-3.5 w-3.5" /> Recents: {recent.join(", ") || "none"}
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="h-3.5 w-3.5" /> Run
          </span>
        </div>
      </div>
    </div>
  );
}
