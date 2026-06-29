import "next-auth";

type NexusRole = "SUPER_ADMIN" | "ADMIN" | "APPROVER" | "USER" | "VIEWER";
type NexusScope = "UNIVERSITY" | "FACULTY" | "DEPARTMENT" | "PUBLIC";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: NexusRole;
      organizationId: string;
      departmentId?: string | null;
      facultyId?: string | null;
      scope?: NexusScope;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: NexusRole;
    organizationId?: string;
    departmentId?: string | null;
    facultyId?: string | null;
    scope?: NexusScope;
  }
}
