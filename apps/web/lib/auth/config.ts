import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { z } from "zod";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { inferScopeFromRole } from "@/lib/auth/nav";
import type { AppRole } from "@/lib/auth/rbac";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user?.password) {
          return null;
        }

        if (user.status !== "ACTIVE") {
          return null;
        }

        const isValid = await compare(parsed.data.password, user.password);
        if (!isValid) {
          return null;
        }

        const extended = user as typeof user & { facultyId?: string | null; scope?: string };

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          organizationId: user.organizationId,
          departmentId: user.departmentId,
          facultyId: extended.facultyId ?? null,
          scope: extended.scope ?? inferScopeFromRole(user.role as AppRole)
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
          role: string;
          organizationId: string;
          departmentId?: string | null;
          facultyId?: string | null;
          scope?: string;
        };
        token.role = u.role;
        token.organizationId = u.organizationId;
        token.departmentId = u.departmentId ?? null;
        token.facultyId = u.facultyId ?? null;
        token.scope = u.scope ?? inferScopeFromRole(u.role as AppRole);
        token.name = u.name ?? null;
        token.email = u.email ?? null;
        token.picture = u.image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as (typeof session.user.role) | undefined) ?? "USER";
        session.user.organizationId = (token.organizationId as string) ?? "";
        session.user.departmentId = (token.departmentId as string | null | undefined) ?? null;
        session.user.facultyId = (token.facultyId as string | null | undefined) ?? null;
        session.user.scope = (token.scope as (typeof session.user.scope) | undefined) ?? inferScopeFromRole(session.user.role as AppRole);
        if (token.email) {
          session.user.email = String(token.email);
        }
        if (token.name) {
          session.user.name = String(token.name);
        }
        {
          const raw = (token as { picture?: string | null }).picture;
          if (raw !== undefined) {
            session.user.image = raw ? String(raw) : null;
          } else if (session.user.image === undefined) {
            session.user.image = null;
          }
        }
      }
      return session;
    }
  }
} satisfies NextAuthConfig;
