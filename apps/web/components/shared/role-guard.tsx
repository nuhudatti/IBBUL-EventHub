"use client";

import { useSession } from "next-auth/react";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";

interface RoleGuardProps {
  children: React.ReactNode;
  minRole?: AppRole;
  allow?: AppRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  minRole,
  allow,
  fallback = null
}: RoleGuardProps): JSX.Element {
  const { data } = useSession();
  const role = data?.user?.role;

  if (allow && !hasAnyRole(role, allow)) {
    return <>{fallback}</>;
  }

  if (minRole && !canAccess(minRole, role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
