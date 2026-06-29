import { auth } from "@/lib/auth";

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "APPROVER" | "USER" | "VIEWER";

const rank: Record<AppRole, number> = {
  VIEWER: 1,
  USER: 2,
  APPROVER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5
};

export function canAccess(required: AppRole, current: string | undefined): boolean {
  if (!current) {
    return false;
  }
  const normalized = current as AppRole;
  return rank[normalized] >= rank[required];
}

export function hasAnyRole(current: string | undefined, allowed: AppRole[]): boolean {
  if (!current) {
    return false;
  }
  return allowed.includes(current as AppRole);
}

export async function getServerRoleContext(): Promise<{
  userId: string;
  organizationId: string;
  role: AppRole;
} | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId || !session.user.role) {
    return null;
  }

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role as AppRole
  };
}
