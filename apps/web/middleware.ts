import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const roleRank: Record<string, number> = {
  VIEWER: 1,
  USER: 2,
  APPROVER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5
};

const protectedRoutes: Array<{ prefix: string; minRole: keyof typeof roleRank }> = [
  { prefix: "/dashboard", minRole: "VIEWER" },
  { prefix: "/events", minRole: "VIEWER" },
  { prefix: "/venues", minRole: "USER" },
  { prefix: "/departments", minRole: "ADMIN" },
  { prefix: "/users", minRole: "ADMIN" },
  { prefix: "/analytics", minRole: "ADMIN" },
  { prefix: "/audit-logs", minRole: "SUPER_ADMIN" },
  { prefix: "/calendar", minRole: "VIEWER" },
  { prefix: "/notifications", minRole: "VIEWER" },
  { prefix: "/settings", minRole: "VIEWER" }
];

export default auth((request) => {
  const isAuthenticated = Boolean(request.auth?.user);
  const pathname = request.nextUrl.pathname;

  const routeRule = protectedRoutes.find((route) => pathname.startsWith(route.prefix));
  if (!routeRule) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = request.auth?.user?.role ?? "USER";
  const userRank = roleRank[userRole] ?? 0;
  const requiredRank = roleRank[routeRule.minRole] ?? 0;
  if (userRank < requiredRank) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/events",
    "/events/:path*",
    "/venues",
    "/venues/:path*",
    "/departments",
    "/departments/:path*",
    "/users",
    "/users/:path*",
    "/analytics",
    "/analytics/:path*",
    "/audit-logs",
    "/audit-logs/:path*",
    "/calendar",
    "/calendar/:path*",
    "/notifications",
    "/notifications/:path*",
    "/settings",
    "/settings/:path*"
  ]
};
