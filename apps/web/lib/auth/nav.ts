import type { AppRole } from "@/lib/auth/rbac";

export type NavScope = "all" | AppRole[];

export type NavItem = {
  href: string;
  label: string;
  /** Roles that can see this item. Empty = use minRole only. */
  roles?: AppRole[];
  minRole?: AppRole;
};

/** Navigation visible per role for IBBUL presentation demo. */
export function getNavItemsForRole(role: AppRole | undefined): NavItem[] {
  if (!role) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/events", label: "Events" },
      { href: "/calendar", label: "Calendar" }
    ];
  }

  const common: Record<AppRole, NavItem[]> = {
    SUPER_ADMIN: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/users", label: "User Management" },
      { href: "/departments", label: "Faculties & Departments" },
      { href: "/venues", label: "Venues" },
      { href: "/events", label: "Events" },
      { href: "/calendar", label: "Calendar" },
      { href: "/analytics", label: "Analytics" },
      { href: "/audit-logs", label: "Audit History" },
      { href: "/notifications", label: "Notifications" }
    ],
    ADMIN: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/events", label: "University Events" },
      { href: "/calendar", label: "Calendar" },
      { href: "/analytics", label: "Reports" },
      { href: "/notifications", label: "Notifications" },
      { href: "/departments", label: "Faculties" },
      { href: "/venues", label: "Venues" },
      { href: "/users", label: "Users" }
    ],
    APPROVER: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/events", label: "Pending Events" },
      { href: "/calendar", label: "Calendar" },
      { href: "/notifications", label: "Notifications" }
    ],
    USER: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/events", label: "My Events" },
      { href: "/calendar", label: "Calendar" },
      { href: "/notifications", label: "Notifications" }
    ],
    VIEWER: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/events", label: "Upcoming Events" },
      { href: "/calendar", label: "Calendar" },
      { href: "/notifications", label: "Notifications" }
    ]
  };

  return common[role];
}

export function inferScopeFromRole(role: AppRole): "UNIVERSITY" | "FACULTY" | "DEPARTMENT" | "PUBLIC" {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "UNIVERSITY";
  if (role === "APPROVER") return "FACULTY";
  if (role === "VIEWER") return "PUBLIC";
  return "DEPARTMENT";
}
