import type { UserRole } from "@prisma/client";

/** Academic display names for internal RBAC roles (IBBUL). */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  SUPER_ADMIN: "System Administrator",
  ADMIN: "University Administrator",
  APPROVER: "Event Approval Officer",
  USER: "Event Creator (Lecturer/Staff)",
  VIEWER: "Student / Guest"
};

export function getRoleDisplayName(role: UserRole | string): string {
  return ROLE_DISPLAY_NAMES[role as UserRole] ?? String(role);
}
